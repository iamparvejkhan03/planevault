import { model, Schema } from "mongoose";
import mongoose from 'mongoose';
import agendaService from "../services/agendaService.js";

const auctionSchema = new Schema({
    // Basic Auction Info
    title: {
        type: String,
        required: true,
        trim: true
    },
    specifications: {
        type: Map,
        of: String,
        default: new Map()
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Aircraft', 'Engines & Parts', 'Memorabilia']
    },
    location: {
        type: String,
        trim: true
    },
    videoLink: {
        type: String,
        trim: true
    },

    // Seller Information
    seller: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sellerUsername: {
        type: String,
        required: true
    },

    // Pricing & Bidding
    startPrice: {
        type: Number,
        required: true,
        min: 0
    },
    currentPrice: {
        type: Number,
        default: function () { return this.startPrice; }
    },
    bidIncrement: {
        type: Number,
        required: true,
        min: 0
    },
    reservePrice: {
        type: Number,
        min: 0
    },
    auctionType: {
        type: String,
        enum: ['standard', 'reserve'],
        required: true
    },

    // Timing
    startDate: {
        type: Date,
        required: false
    },
    endDate: {
        type: Date,
        required: false
    },

    // Media
    photos: [{
        url: String,
        publicId: String, // For cloudinary or similar service
        filename: String
    }],
    documents: [{
        url: String,
        publicId: String,
        filename: String,
        originalName: String
    }],

    // Bidding
    bids: [{
        bidder: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        bidderUsername: String,
        amount: Number,
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    currentBidder: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    bidCount: {
        type: Number,
        default: 0
    },

    // Status
    status: {
        type: String,
        enum: ['draft', 'active', 'approved', 'ended', 'cancelled', 'sold', 'reserve_not_met'],
        default: 'draft'
    },
    winner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    finalPrice: {
        type: Number
    },

    commissionAmount: {
        type: Number,
        default: 0
    },
    bidPaymentRequired: {
        type: Boolean,
        default: true
    },

    // Metadata
    views: {
        type: Number,
        default: 0
    },
    watchlistCount: {
        type: Number,
        default: 0
    },

    // Stripe Integration for Payment Processing
    stripeProductId: String,
    stripePriceId: String,

    // Auto-extend auction if bids near end time
    autoExtend: {
        type: Boolean,
        default: true
    },
    lastBidTime: Date,
    notifications: {
        ending30min: { type: Boolean, default: false },
        ending2hour: { type: Boolean, default: false },
        ending24hour: { type: Boolean, default: false },
        ending30minSentAt: Date,
        ending2hourSentAt: Date,
        ending24hourSentAt: Date
    }

}, {
    timestamps: true
});

// Indexes for better performance
auctionSchema.index({ status: 1, endDate: 1 });
auctionSchema.index({ seller: 1, createdAt: -1 });
auctionSchema.index({ category: 1, status: 1 });
auctionSchema.index({ startDate: 1, endDate: 1 });

// Virtual for time remaining
auctionSchema.virtual('timeRemaining').get(function () {
    if (this.status !== 'active') return 0;
    return Math.max(0, this.endDate - new Date());
});

// In your controller - check if auction is about to end
auctionSchema.methods.isEndingSoon = function () {
    return this.timeRemaining < 5 * 60 * 1000; // Less than 5 minutes
};

// Send notifications for ending auctions
auctionSchema.statics.getEndingSoonAuctions = function () {
    return this.find({
        status: 'active',
        endDate: { $gt: new Date() },
        timeRemaining: { $lt: 15 * 60 * 1000 } // Less than 15 minutes
    });
}

auctionSchema.virtual('timeRemainingFormatted').get(function () {
    if (!this.isActive) return 'Auction ended';

    const ms = this.timeRemaining;
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
});

// Virtual for isActive
auctionSchema.virtual('isActive').get(function () {
    return this.status === 'active' && new Date() < this.endDate;
});

// Method to place a bid
auctionSchema.methods.placeBid = async function (bidderId, bidderUsername, amount) {
    const now = new Date();

    // Safety net: if agenda job missed activation, activate now
    if (this.status === 'draft' && now >= this.startDate && now < this.endDate) {
        this.status = 'active';
        // console.log(`🔄 Safety net: Auto-activated auction ${this._id} on first bid`);

        // Reschedule the end job since we're activating now
        await agendaService.scheduleAuctionEnd(this._id, this.endDate);
    }

    if (this.status !== 'active') {
        throw new Error('Auction is not active');
    }

    if (now >= this.endDate) {
        throw new Error('Auction has ended');
    }

    if (amount <= this.currentPrice && this.bidCount > 0) {
        throw new Error(`Bid must be higher than current price: $${this.currentPrice}`);
    }

    // if (amount <= this.currentPrice) {
    //     throw new Error(`Bid must be higher than current price: $${this.currentPrice}`);
    // }

    // Check bid increment
    // const minBid = this.currentPrice + this.bidIncrement;
    // if (amount < minBid) {
    //     throw new Error(`Bid must be at least $${minBid}`);
    // }

    const minBid = this.bidCount === 0 ? this.currentPrice : this.currentPrice + this.bidIncrement;
    if (amount < minBid) {
        throw new Error(`Bid must be at least $${minBid}`);
    }

    // Add bid
    this.bids.push({
        bidder: bidderId,
        bidderUsername,
        amount,
        timestamp: now
    });

    this.currentPrice = amount;
    this.currentBidder = bidderId;
    this.bidCount += 1;
    this.lastBidTime = now;

    // Auto-extend if bidding near end time (last 5 minutes)
    if (this.autoExtend) {
        const timeRemaining = this.endDate - now;
        if (timeRemaining < 2 * 60 * 1000) { // 5 minutes
            // const newEndDate = new Date(this.endDate.getTime() + 2 * 60 * 1000);
            const newEndDate = new Date(this.endDate.getTime() + 2 * 60 * 1000);
            this.endDate = newEndDate;

            // Reschedule the end job with new time
            await agendaService.cancelAuctionJobs(this._id);
            await agendaService.scheduleAuctionEnd(this._id, newEndDate);
        }
    }

    return this.save();
};

// Method to check if reserve is met
auctionSchema.methods.isReserveMet = function () {
    if (this.auctionType !== 'reserve') return true;
    return this.currentPrice >= this.reservePrice;
};

// Method to end auction
// auctionSchema.methods.endAuction = function () {
//     if (this.status !== 'active') return;

//     this.status = 'ended';

//     if (this.bidCount > 0 && this.isReserveMet()) {
//         this.status = 'sold';
//         this.winner = this.currentBidder;
//         this.finalPrice = this.currentPrice;
//     } else if (this.auctionType === 'reserve' && !this.isReserveMet()) {
//         this.status = 'reserve_not_met';
//     }

//     return this.save();
// };

auctionSchema.methods.endAuction = function () {
    if (this.status !== 'active') return;

    this.status = 'ended';

    // For standard auctions OR reserve auctions that met reserve
    if (this.bidCount > 0 && (this.auctionType === 'standard' || this.isReserveMet())) {
        this.status = 'sold';
        this.winner = this.currentBidder;
        this.finalPrice = this.currentPrice;
    } else if (this.auctionType === 'reserve' && !this.isReserveMet()) {
        this.status = 'reserve_not_met';
    }

    return this.save();
};

// Static method to get active auctions
auctionSchema.statics.getActiveAuctions = function () {
    return this.find({
        status: 'active',
        endDate: { $gt: new Date() }
    }).populate('seller', 'username firstName lastName');
};

// Pre-save middleware
auctionSchema.pre('save', function (next) {
    // Ensure current price is at least start price
    if (this.currentPrice < this.startPrice) {
        this.currentPrice = this.startPrice;
    }

    // Validate end date is after start date
    if (this.endDate <= this.startDate) {
        return next(new Error('End date must be after start date'));
    }

    next();
});

// models/auction.model.js - Add pre-remove middleware
auctionSchema.pre('remove', async function (next) {
    try {
        await agendaService.cancelAuctionJobs(this._id);
        next();
    } catch (error) {
        next(error);
    }
});

// Update when auction dates change
auctionSchema.pre('save', async function (next) {
    if (this.isModified('startDate') || this.isModified('endDate')) {
        try {
            // Cancel existing jobs
            await agendaService.cancelAuctionJobs(this._id);

            // Schedule new jobs if auction is still draft/active
            if (this.status === 'draft') {
                await agendaService.scheduleAuctionActivation(this._id, this.startDate);
            }
            if (this.status === 'draft' || this.status === 'active') {
                await agendaService.scheduleAuctionEnd(this._id, this.endDate);
            }
        } catch (error) {
            console.error('Error rescheduling agenda jobs:', error);
        }
    }
    next();
});

const Auction = model('Auction', auctionSchema);

export default Auction;
import { Schema, model } from 'mongoose';

const bidPaymentSchema = new Schema({
    auction: {
        type: Schema.Types.ObjectId,
        ref: 'Auction',
        required: true
    },
    bidder: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    bidAmount: {
        type: Number,
        required: true
    },
    commissionAmount: {
        type: Number,
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
    paymentIntentId: {
        type: String,
        required: true
    },
    clientSecret: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['created', 'succeeded', 'requires_capture', 'canceled', 'processing_failed'],
        default: 'created'
    },
    chargeAttempted: {
        type: Boolean,
        default: false
    },
    chargeSucceeded: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Index for efficient queries
bidPaymentSchema.index({ auction: 1, bidder: 1 });
bidPaymentSchema.index({ paymentIntentId: 1 });
bidPaymentSchema.index({ status: 1 });

const BidPayment = model('BidPayment', bidPaymentSchema);

export default BidPayment;
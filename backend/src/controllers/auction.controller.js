import Auction from '../models/auction.model.js';
import User from '../models/user.model.js';
import {
    uploadImageToCloudinary,
    uploadDocumentToCloudinary,
    deleteFromCloudinary
} from '../utils/cloudinary.js';
import agendaService from '../services/agendaService.js';

// Create New Auction
export const createAuction = async (req, res) => {
    try {
        const seller = req.user;

        // Check if user is a seller
        if (seller.userType !== 'seller') {
            return res.status(403).json({
                success: false,
                message: 'Only sellers can create auctions'
            });
        }

        const {
            title,
            category,
            description,
            specifications, // This is coming as a JSON string
            location,
            videoLink,
            startPrice,
            bidIncrement,
            auctionType,
            reservePrice,
            startDate,
            endDate
        } = req.body;

        // Basic validation
        if (!title || !category || !description || !startPrice || !bidIncrement || !auctionType || !startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'All required fields must be provided'
            });
        }

        // Parse specifications from JSON string to object
        let parsedSpecifications = {};
        if (specifications) {
            try {
                parsedSpecifications = JSON.parse(specifications);
            } catch (parseError) {
                console.error('Error parsing specifications:', parseError);
                return res.status(400).json({
                    success: false,
                    message: 'Invalid specifications format'
                });
            }
        }

        // Validate dates
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (end <= start) {
            return res.status(400).json({
                success: false,
                message: 'End date must be after start date'
            });
        }

        // Validate start date is in future
        if (start <= new Date()) {
            return res.status(400).json({
                success: false,
                message: 'Start date must be in the future'
            });
        }

        // Validate reserve price for reserve auctions
        if (auctionType === 'reserve' && (!reservePrice || reservePrice < startPrice)) {
            return res.status(400).json({
                success: false,
                message: 'Reserve price must be provided and greater than start price'
            });
        }

        // Handle file uploads
        let uploadedPhotos = [];
        let uploadedDocuments = [];

        // Upload photos (images)
        if (req.files && req.files.photos) {
            for (const photo of req.files.photos) {
                try {
                    const result = await uploadImageToCloudinary(photo.buffer, 'auction-photos');
                    uploadedPhotos.push({
                        url: result.secure_url,
                        publicId: result.public_id,
                        filename: photo.originalname,
                        resourceType: 'image'
                    });
                } catch (uploadError) {
                    console.error('Photo upload error:', uploadError);
                    return res.status(400).json({
                        success: false,
                        message: `Failed to upload photo: ${photo.originalname}`
                    });
                }
            }
        }

        // Upload documents (all file types)
        if (req.files && req.files.documents) {
            for (const doc of req.files.documents) {
                try {
                    const result = await uploadDocumentToCloudinary(doc.buffer, doc.originalname, 'auction-documents');
                    uploadedDocuments.push({
                        url: result.secure_url,
                        publicId: result.public_id,
                        filename: doc.originalname,
                        originalName: doc.originalname,
                        resourceType: 'raw'
                    });
                } catch (uploadError) {
                    console.error('Document upload error:', uploadError);
                    return res.status(400).json({
                        success: false,
                        message: `Failed to upload document: ${doc.originalname}`
                    });
                }
            }
        }

        // Create auction
        const auctionData = {
            title,
            category,
            description,
            specifications: parsedSpecifications, // Use the parsed object
            location,
            videoLink,
            startPrice: parseFloat(startPrice),
            bidIncrement: parseFloat(bidIncrement),
            auctionType,
            startDate: start,
            endDate: end,
            seller: seller._id,
            sellerUsername: seller.username,
            photos: uploadedPhotos,
            documents: uploadedDocuments,
            status: 'draft'
        };

        // Add reserve price if applicable
        if (auctionType === 'reserve') {
            auctionData.reservePrice = parseFloat(reservePrice);
        }

        const auction = await Auction.create(auctionData);

        // Schedule activation and ending jobs
        await agendaService.scheduleAuctionActivation(auction._id, auction.startDate);
        await agendaService.scheduleAuctionEnd(auction._id, auction.endDate);

        // Populate seller info for response
        await auction.populate('seller', 'username firstName lastName');

        res.status(201).json({
            success: true,
            message: 'Auction created successfully',
            data: {
                auction
            }
        });

    } catch (error) {
        console.error('Create auction error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while creating auction'
        });
    }
};

// Get All Auctions (with filtering and pagination)
export const getAuctions = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 12,
            category,
            status,
            search,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            // Add specifications filters
            make,
            model,
            yearMin,
            yearMax,
            fuelType,
            engineType,
            seatingCapacityMin,
            seatingCapacityMax,
            // Price filters
            priceMin,
            priceMax,
            location
        } = req.query;

        // Build filter object
        const filter = {};

        if (category) filter.category = category;
        if (status) filter.status = status;

        // Price filtering
        if (priceMin || priceMax) {
            filter.currentPrice = {};
            if (priceMin) filter.currentPrice.$gte = parseFloat(priceMin);
            if (priceMax) filter.currentPrice.$lte = parseFloat(priceMax);
        }

        // Search in title and description
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Location filtering
        if (location) {
            filter.location = { $regex: location, $options: 'i' };
        }

        // Specifications filtering
        const specsFilter = {};
        if (make) specsFilter['specifications.make'] = { $regex: make, $options: 'i' };
        if (model) specsFilter['specifications.model'] = { $regex: model, $options: 'i' };
        if (fuelType) specsFilter['specifications.fuelType'] = fuelType;
        if (engineType) specsFilter['specifications.engineType'] = engineType;
        
        // Year range filtering
        if (yearMin || yearMax) {
            specsFilter['specifications.year'] = {};
            if (yearMin) specsFilter['specifications.year'].$gte = parseInt(yearMin);
            if (yearMax) specsFilter['specifications.year'].$lte = parseInt(yearMax);
        }

        // Seating capacity filtering
        if (seatingCapacityMin || seatingCapacityMax) {
            specsFilter['specifications.seatingCapacity'] = {};
            if (seatingCapacityMin) specsFilter['specifications.seatingCapacity'].$gte = parseInt(seatingCapacityMin);
            if (seatingCapacityMax) specsFilter['specifications.seatingCapacity'].$lte = parseInt(seatingCapacityMax);
        }

        // Combine specifications filter with main filter
        if (Object.keys(specsFilter).length > 0) {
            filter.$and = filter.$and || [];
            filter.$and.push(specsFilter);
        }

        // Sort options
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const auctions = await Auction.find(filter)
            .populate('seller', 'username firstName lastName')
            .populate('currentBidder', 'username')
            .populate('winner', 'username firstName lastName')
            .sort(sortOptions)
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Auction.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: {
                auctions,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalAuctions: total
                }
            }
        });

    } catch (error) {
        console.error('Get auctions error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching auctions'
        });
    }
};

// Get Single Auction
export const getAuction = async (req, res) => {
    try {
        const { id } = req.params;

        const auction = await Auction.findById(id)
            .populate('seller', 'username firstName lastName countryName')
            .populate('currentBidder', 'username firstName')
            .populate('winner', 'username firstName lastName')
            .populate('bids.bidder', 'username firstName');

        if (!auction) {
            return res.status(404).json({
                success: false,
                message: 'Auction not found'
            });
        }

        // Increment views
        auction.views += 1;
        await auction.save();

        res.status(200).json({
            success: true,
            data: { auction }
        });

    } catch (error) {
        console.error('Get auction error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching auction'
        });
    }
};

// Update Auction
export const updateAuction = async (req, res) => {
    try {
        const { id } = req.params;
        const seller = req.user;

        const auction = await Auction.findById(id);

        if (!auction) {
            return res.status(404).json({
                success: false,
                message: 'Auction not found'
            });
        }

        // Check if user owns the auction
        if (auction.seller.toString() !== seller._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only update your own auctions'
            });
        }

        // Check if auction can be modified (only draft auctions can be modified)
        if (auction.status !== 'draft') {
            return res.status(400).json({
                success: false,
                message: 'Only draft auctions can be modified'
            });
        }

        const updates = { ...req.body };

        // Handle date updates
        if (updates.startDate) updates.startDate = new Date(updates.startDate);
        if (updates.endDate) updates.endDate = new Date(updates.endDate);

        // Validate dates if both are provided
        if (updates.startDate && updates.endDate && updates.endDate <= updates.startDate) {
            return res.status(400).json({
                success: false,
                message: 'End date must be after start date'
            });
        }

        const updatedAuction = await Auction.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        ).populate('seller', 'username firstName lastName');

        res.status(200).json({
            success: true,
            message: 'Auction updated successfully',
            data: { auction: updatedAuction }
        });

    } catch (error) {
        console.error('Update auction error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while updating auction'
        });
    }
};

// Delete Auction
export const deleteAuction = async (req, res) => {
    try {
        const { id } = req.params;
        const seller = req.user;

        const auction = await Auction.findById(id);

        if (!auction) {
            return res.status(404).json({
                success: false,
                message: 'Auction not found'
            });
        }

        // Check if user owns the auction
        if (auction.seller.toString() !== seller._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only delete your own auctions'
            });
        }

        // Only allow deletion of draft or cancelled auctions
        if (!['draft', 'cancelled'].includes(auction.status)) {
            return res.status(400).json({
                success: false,
                message: 'Only draft or cancelled auctions can be deleted'
            });
        }

        // Delete uploaded files from cloudinary
        for (const photo of auction.photos) {
            await deleteFromCloudinary(photo.publicId);
        }

        for (const doc of auction.documents) {
            await deleteFromCloudinary(doc.publicId);
        }

        await Auction.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Auction deleted successfully'
        });

    } catch (error) {
        console.error('Delete auction error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while deleting auction'
        });
    }
};

// Place Bid
export const placeBid = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount } = req.body;
        const bidder = req.user;

        // Check if user is a bidder
        if (bidder.userType !== 'bidder') {
            return res.status(403).json({
                success: false,
                message: 'Only bidders can place bids'
            });
        }

        const auction = await Auction.findById(id);

        if (!auction) {
            return res.status(404).json({
                success: false,
                message: 'Auction not found'
            });
        }

        // Place bid using the model method
        await auction.placeBid(bidder._id, bidder.username, parseFloat(amount));

        // Populate the updated auction
        await auction.populate('currentBidder', 'username firstName');

        res.status(200).json({
            success: true,
            message: 'Bid placed successfully',
            data: { auction }
        });

    } catch (error) {
        console.error('Place bid error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get User's Auctions
export const getUserAuctions = async (req, res) => {
    try {
        const user = req.user;
        const { status, page = 1, limit = 10 } = req.query;

        const filter = { seller: user._id };
        if (status) filter.status = status;

        const auctions = await Auction.find(filter)
            .populate('currentBidder', 'username firstName')
            .populate('winner', 'username firstName lastName')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Auction.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: {
                auctions,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalAuctions: total
                }
            }
        });

    } catch (error) {
        console.error('Get user auctions error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching user auctions'
        });
    }
};

// Detailed bidding stats
export const getBiddingStats = async (req, res) => {
    try {
        const userId = req.user._id;
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        // Basic counts - FIXED: Remove userId from these queries
        const activeAuctions = await Auction.countDocuments({
            status: 'active',
            endDate: { $gt: now }
        });

        const endingSoon = await Auction.countDocuments({
            status: 'active',
            endDate: { 
                $gt: now,
                $lt: new Date(now.getTime() + 24 * 60 * 60 * 1000)
            }
        });

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const newToday = await Auction.countDocuments({
            status: 'active',
            createdAt: { $gte: today }
        });

        const totalBidders = await User.countDocuments({ userType: 'bidder' });

        // Bidder-specific analytics - FIXED: Proper aggregation
        const myTotalBidsResult = await Auction.aggregate([
            { 
                $match: { 
                    'bids.bidder': userId 
                } 
            },
            { 
                $project: {
                    userBids: {
                        $filter: {
                            input: '$bids',
                            as: 'bid',
                            cond: { $eq: ['$$bid.bidder', userId] }
                        }
                    }
                }
            },
            {
                $project: {
                    bidCount: { $size: '$userBids' }
                }
            },
            {
                $group: {
                    _id: null,
                    totalBids: { $sum: '$bidCount' }
                }
            }
        ]);

        const myWinningAuctions = await Auction.countDocuments({
            winner: userId,
            status: 'sold'
        });

        const myActiveBids = await Auction.countDocuments({
            'bids.bidder': userId,
            status: 'active',
            endDate: { $gt: now }
        });

        // Recent activity (last 30 days) - FIXED: Proper aggregation
        const recentBids = await Auction.aggregate([
            { 
                $match: { 
                    'bids.bidder': userId,
                    'bids.timestamp': { $gte: thirtyDaysAgo }
                } 
            },
            { $unwind: '$bids' },
            { 
                $match: { 
                    'bids.bidder': userId,
                    'bids.timestamp': { $gte: thirtyDaysAgo }
                } 
            },
            { 
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$bids.timestamp" }
                    },
                    bidsCount: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const myTotalBids = myTotalBidsResult[0]?.totalBids || 0;
        const bidSuccessRate = myTotalBids > 0 ? 
            ((myWinningAuctions / myTotalBids) * 100).toFixed(1) : 0;

        res.status(200).json({
            success: true,
            data: {
                // Basic stats
                activeAuctions,
                newToday,
                endingSoon,
                totalBidders,
                
                // Bidder personal stats
                myTotalBids,
                myWinningAuctions,
                myActiveBids,
                
                // Analytics
                bidSuccessRate: parseFloat(bidSuccessRate),
                
                // Recent activity
                recentBiddingActivity: recentBids,
                
                lastUpdated: new Date()
            }
        });

    } catch (error) {
        console.error('Get bidding stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching bidding stats'
        });
    }
};

// Get user's won auctions
export const getWonAuctions = async (req, res) => {
    try {
        const userId = req.user._id;
        const { page = 1, limit = 12, status, search } = req.query;

        // Build filter for auctions won by user
        const filter = {
            winner: userId,
            status: { $in: ['sold', 'ended'] } // Include both sold and ended auctions where user won
        };

        // Add status filter if provided
        if (status && status !== 'all') {
            // Map frontend status to backend status
            const statusMap = {
                'payment_pending': 'sold',
                'paid': 'sold',
                'shipped': 'sold',
                'delivered': 'sold'
            };
            filter.status = statusMap[status] || status;
        }

        // Add search filter
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } }
            ];
        }

        const auctions = await Auction.find(filter)
            .populate('seller', 'username firstName lastName rating reviews memberSince')
            .populate('winner', 'username firstName lastName')
            .populate('currentBidder', 'username firstName')
            .sort({ endDate: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Auction.countDocuments(filter);

        // Transform data to match frontend structure
        const transformedAuctions = auctions.map(auction => ({
            id: auction._id.toString(),
            auctionId: `AU${auction._id.toString().slice(-6).toUpperCase()}`,
            title: auction.title,
            description: auction.description,
            category: auction.category,
            finalBid: auction.finalPrice || auction.currentPrice,
            startingBid: auction.startPrice,
            yourMaxBid: getMaxBidForUser(auction.bids, userId),
            winningBid: auction.finalPrice || auction.currentPrice,
            bids: auction.bidCount,
            watchers: auction.watchlistCount,
            endTime: auction.endDate,
            winTime: auction.endDate, // Use end date as win time
            image: auction.photos.length > 0 ? auction.photos[0].url : '/api/placeholder/400/300',
            location: auction.location,
            seller: {
                name: auction.seller.firstName && auction.seller.lastName 
                    ? `${auction.seller.firstName} ${auction.seller.lastName}`
                    : auction.seller.username,
                rating: auction.seller.rating || 4.5,
                reviews: auction.seller.reviews || 0,
                memberSince: auction.seller.memberSince || '2020'
            },
            condition: auction.specifications.get('condition') || 'Good',
            shipping: {
                cost: calculateShippingCost(auction),
                estimatedDelivery: '5-7 business days',
                insurance: true
            },
            status: getAuctionStatus(auction),
            congratulatoryMessage: generateCongratulatoryMessage(auction)
        }));

        // Calculate statistics
        const totalWon = total;
        const totalSpent = auctions.reduce((sum, auction) => sum + (auction.finalPrice || auction.currentPrice), 0);
        const averageSavings = auctions.length > 0 ? 
            auctions.reduce((sum, auction) => sum + (auction.startPrice / (auction.finalPrice || auction.currentPrice)), 0) / auctions.length : 0;
        
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const recentWins = auctions.filter(auction => new Date(auction.endDate) > weekAgo).length;

        res.status(200).json({
            success: true,
            data: {
                auctions: transformedAuctions,
                statistics: {
                    totalWon,
                    totalSpent,
                    averageSavings,
                    recentWins
                },
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalAuctions: total
                }
            }
        });

    } catch (error) {
        console.error('Get won auctions error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching won auctions'
        });
    }
};

// Helper function to get user's max bid
const getMaxBidForUser = (bids, userId) => {
    const userBids = bids.filter(bid => bid.bidder.toString() === userId.toString());
    if (userBids.length === 0) return 0;
    return Math.max(...userBids.map(bid => bid.amount));
};

// Helper function to calculate shipping cost
const calculateShippingCost = (auction) => {
    // Simple shipping calculation based on category and price
    const baseCosts = {
        'Aircraft': 5000,
        'Engines & Parts': 1200,
        'Aviation Memorabilia': 45
    };
    
    const baseCost = baseCosts[auction.category] || 100;
    const priceMultiplier = (auction.finalPrice || auction.currentPrice) / 10000;
    
    return Math.round(baseCost * Math.max(1, priceMultiplier));
};

// Helper function to determine auction status for frontend
const getAuctionStatus = (auction) => {
    // This would need to be enhanced based on your payment and shipping tracking
    // For now, using a simple logic based on time since auction ended
    const endDate = new Date(auction.endDate);
    const daysSinceEnd = (Date.now() - endDate) / (1000 * 60 * 60 * 24);
    
    if (daysSinceEnd < 1) return 'payment_pending';
    if (daysSinceEnd < 3) return 'paid';
    if (daysSinceEnd < 7) return 'shipped';
    return 'delivered';
};

// Helper function to generate congratulatory messages
const generateCongratulatoryMessage = (auction) => {
    const messages = {
        'Aircraft': 'Congratulations on winning this magnificent aircraft!',
        'Engines & Parts': 'Outstanding win! This engine is a fantastic addition to any collection.',
        'Aviation Memorabilia': 'Fantastic win! This piece is in impeccable condition and holds great historical value.'
    };
    
    return messages[auction.category] || 'Congratulations on your winning bid!';
};

// Update auction status (for payment, shipping updates)
export const updateAuctionStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, trackingNumber, deliveredDate } = req.body;
        const userId = req.user._id;

        const auction = await Auction.findOne({
            _id: id,
            winner: userId
        });

        if (!auction) {
            return res.status(404).json({
                success: false,
                message: 'Auction not found or you are not the winner'
            });
        }

        // Update custom status fields
        const updateData = {};
        if (status) updateData.wonStatus = status;
        if (trackingNumber) updateData.trackingNumber = trackingNumber;
        if (deliveredDate) updateData.deliveredDate = deliveredDate;

        await Auction.findByIdAndUpdate(id, updateData);

        res.status(200).json({
            success: true,
            message: 'Auction status updated successfully'
        });

    } catch (error) {
        console.error('Update auction status error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while updating auction status'
        });
    }
};
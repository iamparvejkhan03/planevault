import { StripeService } from '../services/stripeService.js';
import User from '../models/user.model.js';
import Auction from '../models/auction.model.js';

export const chargeWinningBidder = async (req, res) => {
    try {
        const { userId, amount, auctionId, description } = req.body;

        // Find user and verify they have payment method
        const user = await User.findById(userId);
        if (!user || !user.stripeCustomerId || !user.isPaymentVerified) {
            return res.status(400).json({
                success: false,
                message: 'User payment method not available'
            });
        }

        // Charge the customer automatically
        const chargeResult = await StripeService.chargeCustomer(
            user.stripeCustomerId,
            amount,
            description || `Winning bid for auction ${auctionId}`
        );

        if (chargeResult.success) {
            // Update your database - mark auction as paid, etc.
            await Auction.findByIdAndUpdate(auctionId, {
                status: 'paid',
                paymentIntentId: chargeResult.paymentIntent.id,
                paidAt: new Date()
            });

            return res.status(200).json({
                success: true,
                message: 'Payment processed successfully',
                data: {
                    paymentIntentId: chargeResult.paymentIntent.id,
                    amount: amount
                }
            });
        }

    } catch (error) {
        console.error('Charge error:', error);
        return res.status(400).json({
            success: false,
            message: `Payment failed: ${error.message}`
        });
    }
};

// Optional: Pre-authorize bid amount when user places bid
export const authorizeBidAmount = async (req, res) => {
    try {
        const { userId, amount, auctionId } = req.body;

        const user = await User.findById(userId);
        if (!user || !user.stripeCustomerId) {
            return res.status(400).json({
                success: false,
                message: 'User payment method not available'
            });
        }

        // Create payment intent (but don't capture yet)
        const paymentIntent = await StripeService.createBidPaymentIntent(
            user.stripeCustomerId,
            amount,
            `Bid authorization for auction ${auctionId}`
        );

        return res.status(200).json({
            success: true,
            message: 'Bid authorized',
            data: {
                paymentIntentId: paymentIntent.id,
                clientSecret: paymentIntent.client_secret
            }
        });

    } catch (error) {
        console.error('Bid authorization error:', error);
        return res.status(400).json({
            success: false,
            message: `Bid authorization failed: ${error.message}`
        });
    }
};

// Test charge controller (create a temporary route for testing)
export const testCharge = async (req, res) => {
    try {
        const userId = '68d3c193ff8daa10eed9f0f5';
        const amount = 10.00; // $10 test charge

        const user = await User.findById(userId);

        const chargeResult = await StripeService.chargeCustomer(
            user.stripeCustomerId,
            amount,
            'Test auction win charge'
        );

        res.json({ success: true, chargeResult });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// Get user's bidding activity
export const getMyBids = async (req, res) => {
    try {
        const userId = req.user._id;
        const { page = 1, limit = 12, status, search, sortBy = 'recent' } = req.query;

        // Build base query for all user bids
        const baseQuery = {
            'bids.bidder': userId
        };

        // Get total count
        const total = await Auction.countDocuments(baseQuery);

        // Get paginated auctions for display
        const auctions = await Auction.find(baseQuery)
            .populate('seller', 'username firstName lastName')
            .populate('currentBidder', 'username firstName')
            .populate('winner', 'username firstName lastName')
            .sort({ 'bids.timestamp': -1 })
            // .limit(limit * 1)
            // .skip((page - 1) * limit);

        // CALCULATE STATISTICS USING AGGREGATION PIPELINE
        const statsPipeline = [
            { $match: { 'bids.bidder': userId } },
            {
                $facet: {
                    // Total auctions user has bid on
                    totalAuctions: [
                        { $count: 'count' }
                    ],
                    // Active bids (winning + outbid)
                    activeBids: [
                        { 
                            $match: { 
                                status: 'active',
                                'bids.bidder': userId 
                            } 
                        },
                        {
                            $project: {
                                isWinning: {
                                    $eq: ['$currentBidder', userId]
                                }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                totalWinning: {
                                    $sum: { $cond: ['$isWinning', 1, 0] }
                                },
                                totalOutbid: {
                                    $sum: { $cond: ['$isWinning', 0, 1] }
                                }
                            }
                        }
                    ],
                    // Won auctions and their total amount
                    wonAuctions: [
                        { 
                            $match: { 
                                winner: userId,
                                status: { $in: ['sold', 'ended'] }
                            } 
                        },
                        {
                            $group: {
                                _id: null,
                                count: { $sum: 1 },
                                totalAmount: { $sum: '$finalPrice' }
                            }
                        }
                    ],
                    // Lost auctions count
                    lostAuctions: [
                        { 
                            $match: { 
                                winner: { $ne: userId },
                                status: { $in: ['sold', 'ended', 'reserve_not_met'] },
                                'bids.bidder': userId
                            } 
                        },
                        { $count: 'count' }
                    ]
                }
            }
        ];

        const statsResult = await Auction.aggregate(statsPipeline);
        const stats = statsResult[0];

        // Extract values from aggregation results
        const totalBids = stats.totalAuctions[0]?.count || 0;
        const totalActiveBids = (stats.activeBids[0]?.totalWinning || 0) + (stats.activeBids[0]?.totalOutbid || 0);
        const totalWinning = stats.activeBids[0]?.totalWinning || 0;
        const totalWon = stats.wonAuctions[0]?.count || 0;
        const totalWonAmount = stats.wonAuctions[0]?.totalAmount || 0; // This is the winning amounts total
        const totalLost = stats.lostAuctions[0]?.count || 0;

        // Success rate
        const completedAuctions = totalWon + totalLost;
        const successRate = completedAuctions > 0 ? 
            Math.round((totalWon / completedAuctions) * 100) : 0;

        // Transform paginated data for response
        const transformedBids = auctions.map(auction => {
            const userBids = auction.bids.filter(bid => 
                bid.bidder.toString() === userId.toString()
            );
            const latestUserBid = userBids.reduce((latest, bid) => 
                bid.timestamp > latest.timestamp ? bid : latest, userBids[0]
            );

            // Determine bid status
            let status = 'outbid';
            
            if (auction.status === 'sold' || auction.status === 'ended') {
                if (auction.winner && auction.winner?._id.toString() === userId.toString()) {
                    status = 'won';
                } else {
                    status = 'lost';
                }
            } else if (auction.status === 'active') {
                if (auction.currentBidder && auction.currentBidder?._id.toString() === userId.toString()) {
                    status = 'winning';
                } else {
                    status = 'outbid';
                }
            } else if (auction.status === 'reserve_not_met') {
                status = 'lost';
            }

            const nextMinBid = auction.status === 'active' ? 
                auction.currentPrice + auction.bidIncrement : null;

            return {
                id: auction?._id.toString(),
                auctionId: `AU${auction?._id.toString().slice(-6).toUpperCase()}`,
                title: auction.title,
                description: auction.description,
                category: auction.category,
                myBidAmount: latestUserBid.amount,
                currentBid: auction.currentPrice,
                startingBid: auction.startPrice,
                status: status,
                bidTime: latestUserBid.timestamp,
                endTime: auction.endDate,
                bids: auction.bidCount,
                watchers: auction.watchlistCount,
                image: auction.photos.length > 0 ? auction.photos[0].url : '/api/placeholder/400/300',
                location: auction.location,
                sellerRating: 4.5,
                timeLeft: calculateTimeLeft(auction.endDate),
                bidIncrement: auction.bidIncrement,
                nextMinBid: nextMinBid,
                auctionStatus: auction.status,
                winnerInfo: auction.winner ? {
                    id: auction.winner?._id.toString(),
                    name: auction.winner.firstName + ' ' + auction.winner.lastName
                } : null,
                currentBidderInfo: auction.currentBidder ? {
                    id: auction.currentBidder._id.toString(),
                    name: auction.currentBidder.firstName
                } : null
            };
        });

        // Apply filtering and sorting to paginated results
        let filteredBids = transformedBids.filter(bid => {
            const matchesStatus = !status || status === 'all' || bid.status === status;
            const matchesSearch = !search || 
                bid.title.toLowerCase().includes(search.toLowerCase()) ||
                bid.description.toLowerCase().includes(search.toLowerCase());
            return matchesStatus && matchesSearch;
        });

        filteredBids.sort((a, b) => {
            switch(sortBy) {
                case 'recent':
                    return new Date(b.bidTime) - new Date(a.bidTime);
                case 'ending_soon':
                    return new Date(a.endTime) - new Date(b.endTime);
                case 'bid_amount':
                    return b.myBidAmount - a.myBidAmount;
                case 'auction_value':
                    return b.currentBid - a.currentBid;
                default:
                    return new Date(b.bidTime) - new Date(a.bidTime);
            }
        });

        res.status(200).json({
            success: true,
            data: {
                bids: filteredBids,
                statistics: {
                    totalBids: totalBids,
                    totalActiveBids: totalActiveBids,
                    totalWinning: totalWinning,
                    totalWon: totalWon,
                    totalLost: totalLost,
                    totalWonAmount: totalWonAmount, // Total amount of won auctions
                    successRate: successRate,
                    avgWinAmount: totalWon > 0 ? Math.round(totalWonAmount / totalWon) : 0
                },
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalBids: total
                }
            }
        });

    } catch (error) {
        console.error('Get my bids error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching bids'
        });
    }
};

// Get bid statistics for dashboard
export const getBidStats = async (req, res) => {
    try {
        const userId = req.user._id;
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        // Total bids placed
        const totalBidsResult = await Auction.aggregate([
            { $match: { 'bids.bidder': userId } },
            { $unwind: '$bids' },
            { $match: { 'bids.bidder': userId } },
            { $group: { _id: null, total: { $sum: 1 } } }
        ]);

        // Active bids (bids on active auctions)
        const activeBids = await Auction.countDocuments({
            'bids.bidder': userId,
            status: 'active',
            endDate: { $gt: new Date() }
        });

        // Winning bids
        const winningBids = await Auction.countDocuments({
            'bids.bidder': userId,
            'currentBidder': userId,
            status: 'active',
            endDate: { $gt: new Date() }
        });

        // Won auctions
        const wonAuctions = await Auction.countDocuments({
            winner: userId,
            status: 'sold'
        });

        // Recent bidding activity (last 30 days)
        const recentActivity = await Auction.aggregate([
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
                    bidsCount: { $sum: 1 },
                    totalAmount: { $sum: "$bids.amount" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const totalBids = totalBidsResult[0]?.total || 0;
        const successRate = totalBids > 0 ? Math.round((wonAuctions / totalBids) * 100) : 0;

        res.status(200).json({
            success: true,
            data: {
                totalBids,
                activeBids,
                winningBids,
                wonAuctions,
                successRate,
                recentActivity,
                lastUpdated: new Date()
            }
        });

    } catch (error) {
        console.error('Get bid stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching bid statistics'
        });
    }
};

// Helper function to calculate time left
const calculateTimeLeft = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diffMs = end - now;

    if (diffMs <= 0) return 'Ended';

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
};

// Get detailed bid history for seller's auctions
export const getSellerBidHistory = async (req, res) => {
    try {
        const sellerId = req.user._id;
        const { auctionId, page = 1, limit = 50 } = req.query;

        let filter = { seller: sellerId };
        
        // Filter by specific auction if provided
        if (auctionId) {
            filter._id = auctionId;
        }

        const auctions = await Auction.find(filter)
            .populate('bids.bidder', 'username firstName lastName email company')
            .populate('winner', 'username firstName lastName email company')
            .sort({ endDate: -1 })
            // .limit(limit * 1)
            // .skip((page - 1) * limit);

        res.status(200).json({
            success: true,
            data: { auctions }
        });

    } catch (error) {
        console.error('Get seller bid history error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching bid history'
        });
    }
};

export const getAdminBidHistory = async (req, res) => {
    try {
        const { page = 1, limit = 12, status, search, category, seller, sortBy = 'recent' } = req.query;

        // Build filter object
        const filter = {};
        
        // Status filter
        if (status && status !== 'all') {
            filter.status = status;
        }
        
        // Category filter
        if (category && category !== 'all') {
            filter.category = category;
        }
        
        // Seller filter
        if (seller && seller !== 'all') {
            filter.seller = seller;
        }
        
        // Search filter
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { 'bids.bidderUsername': { $regex: search, $options: 'i' } }
            ];
        }

        // Find auctions with bids
        const auctions = await Auction.find({
            ...filter,
            'bids.0': { $exists: true } // Only auctions with at least one bid
        })
        .populate('seller', 'username firstName lastName email company')
        .populate('currentBidder', 'username firstName lastName email')
        .populate('winner', 'username firstName lastName email')
        .populate('bids.bidder', 'username firstName lastName email company')
        .sort({ createdAt: -1 })
        // .limit(limit * 1)
        // .skip((page - 1) * limit);

        // Transform data for admin view
        const transformedAuctions = auctions.map(auction => {
            // Sort bids by amount (highest first) and then by time
            const sortedBids = [...auction.bids].sort((a, b) => {
                if (b.amount !== a.amount) {
                    return b.amount - a.amount;
                }
                return new Date(b.timestamp) - new Date(a.timestamp);
            });

            const bidsWithStatus = sortedBids.map((bid, index) => {
                let status = "Outbid";
                
                if (auction.status === 'active') {
                    if (index === 0) {
                        status = "Winning";
                    }
                } else if (auction.status === 'sold' || auction.status === 'ended') {
                    if (auction.winner && auction.winner?._id.toString() === bid.bidder?._id.toString() && index === 0) {
                        status = "Winner";
                    }
                } else if (auction.status === 'reserve_not_met') {
                    status = "Reserve Not Met";
                }

                return {
                    id: bid?._id.toString(),
                    bidder: {
                        id: bid.bidder?._id.toString(),
                        name: `${bid.bidder?.firstName} ${bid.bidder?.lastName}`.trim() || bid.bidder?.username,
                        username: bid.bidder?.username,
                        email: bid.bidder?.email,
                        company: bid.bidder?.company || 'N/A'
                    },
                    amount: bid.amount,
                    time: bid.timestamp,
                    status: status,
                    isHighest: index === 0
                };
            });

            return {
                id: auction?._id.toString(),
                auctionId: `AU${auction?._id.toString().slice(-6).toUpperCase()}`,
                title: auction.title,
                description: auction.description,
                category: auction.category,
                auctionType: auction.auctionType === 'reserve' ? 'Reserve Auction' : 'Standard Auction',
                startTime: auction.startDate,
                endTime: auction.endDate,
                startingBid: auction.startPrice,
                reservePrice: auction.reservePrice || 0,
                currentPrice: auction.currentPrice,
                winningBid: sortedBids[0]?.amount || auction.currentPrice,
                status: auction.status,
                seller: {
                    id: auction.seller?._id.toString(),
                    name: `${auction.seller?.firstName} ${auction.seller?.lastName}`.trim() || auction.seller?.username,
                    username: auction.seller?.username,
                    email: auction.seller?.email,
                    company: auction.seller?.company || 'N/A',
                    rating: 0
                },
                winner: auction.winner ? {
                    id: auction.winner?._id.toString(),
                    name: `${auction.winner.firstName} ${auction.winner.lastName}`.trim() || auction.winner.username
                } : null,
                totalBids: auction.bidCount,
                uniqueBidders: new Set(auction.bids.map(bid => bid.bidder?._id.toString())).size,
                bids: bidsWithStatus,
                commissionAmount: auction.commissionAmount || 0,
                finalPrice: auction.finalPrice || 0,
                createdAt: auction.createdAt
            };
        });

        // Apply additional sorting
        transformedAuctions.sort((a, b) => {
            switch(sortBy) {
                case 'recent':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'ending_soon':
                    return new Date(a.endTime) - new Date(b.endTime);
                case 'most_bids':
                    return b.totalBids - a.totalBids;
                case 'highest_bid':
                    return b.winningBid - a.winningBid;
                case 'seller_name':
                    return a.seller?.name.localeCompare(b.seller?.name);
                default:
                    return new Date(b.createdAt) - new Date(a.createdAt);
            }
        });

        // Calculate admin statistics
        const totalAuctionsWithBids = await Auction.countDocuments({
            'bids.0': { $exists: true },
            ...filter
        });

        const totalBidsAll = await Auction.aggregate([
            { $match: { 'bids.0': { $exists: true } } },
            { $unwind: '$bids' },
            { $count: 'totalBids' }
        ]);

        const totalRevenue = await Auction.aggregate([
            { $match: { status: 'sold' } },
            { $group: { _id: null, total: { $sum: '$commissionAmount' } } }
        ]);

        const activeAuctionsWithBids = await Auction.countDocuments({
            status: 'active',
            'bids.0': { $exists: true }
        });

        const statistics = {
            totalAuctionsWithBids,
            totalBids: totalBidsAll[0]?.totalBids || 0,
            totalRevenue: totalRevenue[0]?.total || 0,
            activeAuctionsWithBids,
            averageBidsPerAuction: totalAuctionsWithBids > 0 ? 
                Math.round((totalBidsAll[0]?.totalBids || 0) / totalAuctionsWithBids) : 0
        };

        // Get unique categories and sellers for filters
        const categories = await Auction.distinct('category', { 'bids.0': { $exists: true } });
        const sellers = await Auction.distinct('seller', { 'bids.0': { $exists: true } });
        
        const sellersPopulated = await Auction.populate(sellers.map(sellerId => ({ _id: sellerId })), {
            path: 'seller',
            select: 'username firstName lastName'
        });

        const filterOptions = {
            categories: ['all', ...categories],
            sellers: ['all', ...sellersPopulated.map(s => ({
                id: s?._id.toString(),
                name: `${s.seller?.firstName} ${s.seller?.lastName}`.trim() || s.seller?.username
            }))],
            statuses: [
                'all', 'active', 'sold', 'ended', 'reserve_not_met', 'cancelled'
            ]
        };

        res.status(200).json({
            success: true,
            data: {
                auctions: transformedAuctions,
                statistics,
                filterOptions,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalAuctionsWithBids / limit),
                    totalAuctions: totalAuctionsWithBids
                }
            }
        });

    } catch (error) {
        console.error('Admin bid history error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching bid history'
        });
    }
};

export const getAdminBidStats = async (req, res) => {
    try {
        // Get comprehensive bid statistics for admin dashboard
        const today = new Date();
        const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

        // Total bids placed
        const totalBids = await Auction.aggregate([
            { $unwind: '$bids' },
            { $count: 'total' }
        ]);

        // Bids in last 7 days
        const recentBids = await Auction.aggregate([
            { $unwind: '$bids' },
            { $match: { 'bids.timestamp': { $gte: lastWeek } } },
            { $count: 'total' }
        ]);

        // Revenue statistics
        const revenueStats = await Auction.aggregate([
            { $match: { status: 'sold' } },
            { 
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$commissionAmount' },
                    averageSalePrice: { $avg: '$finalPrice' },
                    totalSales: { $sum: 1 }
                }
            }
        ]);

        // Bid activity by category
        const bidsByCategory = await Auction.aggregate([
            { $unwind: '$bids' },
            {
                $group: {
                    _id: '$category',
                    totalBids: { $sum: 1 },
                    averageBid: { $avg: '$bids.amount' }
                }
            }
        ]);

        // Active bidders count (users who placed bids in last 30 days)
        const activeBidders = await Auction.aggregate([
            { $unwind: '$bids' },
            { $match: { 'bids.timestamp': { $gte: lastMonth } } },
            { $group: { _id: '$bids.bidder' } },
            { $count: 'total' }
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalBids: totalBids[0]?.total || 0,
                recentBids: recentBids[0]?.total || 0,
                totalRevenue: revenueStats[0]?.totalRevenue || 0,
                averageSalePrice: revenueStats[0]?.averageSalePrice || 0,
                totalSales: revenueStats[0]?.totalSales || 0,
                bidsByCategory,
                activeBidders: activeBidders[0]?.total || 0
            }
        });

    } catch (error) {
        console.error('Admin bid stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching bid statistics'
        });
    }
};
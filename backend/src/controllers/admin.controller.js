import User from '../models/user.model.js';
import Auction from '../models/auction.model.js';
import Comment from '../models/comment.model.js';
import Watchlist from '../models/watchlist.model.js';
import agendaService from '../services/agendaService.js';
import { deleteFromCloudinary, uploadDocumentToCloudinary, uploadImageToCloudinary } from '../utils/cloudinary.js';
import { auctionListedEmail } from '../utils/nodemailer.js';

export const getAdminStats = async (req, res) => {
    try {
        // Get total users count
        const totalUsers = await User.countDocuments({ isActive: true });

        // Get user type breakdown
        const userTypeStats = await User.aggregate([
            { $match: { isActive: true } },
            { $group: { _id: '$userType', count: { $sum: 1 } } }
        ]);

        // Get total auctions count
        const totalAuctions = await Auction.countDocuments();

        // Get auction status breakdown
        const auctionStatusStats = await Auction.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        // Get active auctions
        const activeAuctions = await Auction.countDocuments({
            status: 'active',
            endDate: { $gt: new Date() }
        });

        // Calculate total revenue from sold auctions
        const revenueStats = await Auction.aggregate([
            { $match: { status: 'sold' } },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$finalPrice' },
                    highestSale: { $max: '$finalPrice' },
                    averageSale: { $avg: '$finalPrice' },
                    totalSold: { $sum: 1 }
                }
            }
        ]);

        const totalRevenue = revenueStats[0]?.totalRevenue || 0;
        const highestSaleAmount = revenueStats[0]?.highestSale || 0;
        const averageSalePrice = revenueStats[0]?.averageSale || 0;
        const totalSoldAuctions = revenueStats[0]?.totalSold || 0;

        // Get highest sale auction details
        const highestSaleAuction = await Auction.findOne({ status: 'sold' })
            .sort({ finalPrice: -1 })
            .populate('seller', 'username firstName lastName')
            .populate('winner', 'username firstName lastName')
            .select('title finalPrice seller winner createdAt');

        // Calculate success rate
        const completedAuctions = await Auction.countDocuments({
            status: { $in: ['sold', 'ended', 'reserve_not_met'] }
        });

        const soldAuctions = await Auction.countDocuments({ status: 'sold' });
        const successRate = completedAuctions > 0 ? Math.round((soldAuctions / completedAuctions) * 100) : 0;

        // Get pending moderation counts
        const pendingAuctions = await Auction.countDocuments({ status: 'draft' });
        const pendingUserVerifications = await User.countDocuments({
            isVerified: false,
            isActive: true
        });

        const pendingModeration = pendingAuctions;

        // Get recent user registrations (last 7 days)
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const recentUsers = await User.countDocuments({
            createdAt: { $gte: oneWeekAgo }
        });

        // Get today's revenue
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayRevenueStats = await Auction.aggregate([
            {
                $match: {
                    status: 'sold',
                    updatedAt: {
                        $gte: today,
                        $lt: tomorrow
                    }
                }
            },
            { $group: { _id: null, total: { $sum: '$finalPrice' } } }
        ]);

        const todayRevenue = todayRevenueStats[0]?.total || 0;

        // Get system metrics
        const totalComments = await Comment.countDocuments();
        // const totalWatchlists = await Watchlist.countDocuments();
        const watchlistItems = await Watchlist.aggregate([
            {
                $lookup: {
                    from: 'auctions',
                    localField: 'auction',
                    foreignField: '_id',
                    as: 'auction'
                }
            },
            {
                $unwind: '$auction'
            },
            {
                $match: {
                    'auction.status': 'active',
                }
            },
            {
                $count: 'count'
            }
        ]);

        const totalWatchlists = watchlistItems[0]?.count || 0;

        // Get bidding activity (last 24 hours)
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const recentBids = await Auction.aggregate([
            { $unwind: '$bids' },
            { $match: { 'bids.timestamp': { $gte: yesterday } } },
            { $group: { _id: null, count: { $sum: 1 } } }
        ]);

        const recentBidsCount = recentBids[0]?.count || 0;

        // Get top performing categories
        const categoryStats = await Auction.aggregate([
            { $match: { status: 'sold' } },
            {
                $group: {
                    _id: '$category',
                    totalRevenue: { $sum: '$finalPrice' },
                    auctionCount: { $sum: 1 },
                    avgPrice: { $avg: '$finalPrice' }
                }
            },
            { $sort: { totalRevenue: -1 } }
        ]);

        // Get user engagement metrics
        const totalBids = await Auction.aggregate([
            { $group: { _id: null, totalBids: { $sum: '$bidCount' } } }
        ]);

        const totalBidsCount = totalBids[0]?.totalBids || 0;

        const stats = {
            // Basic counts
            totalUsers,
            totalAuctions,
            activeAuctions,
            totalSoldAuctions,

            // User statistics
            userTypeStats: userTypeStats.reduce((acc, curr) => {
                acc[curr._id] = curr.count;
                return acc;
            }, {}),

            // Auction statistics
            auctionStatusStats: auctionStatusStats.reduce((acc, curr) => {
                acc[curr._id] = curr.count;
                return acc;
            }, {}),

            // Financial metrics
            totalRevenue,
            todayRevenue,
            highestSaleAmount,
            averageSalePrice,
            highestSaleAuction: highestSaleAuction ? {
                title: highestSaleAuction.title,
                amount: highestSaleAuction.finalPrice,
                seller: highestSaleAuction.seller?.username || 'Unknown',
                winner: highestSaleAuction.winner?.username || 'Unknown',
                date: highestSaleAuction.createdAt
            } : null,

            // Performance metrics
            successRate,
            pendingModeration,
            recentUsers,

            // Engagement metrics
            totalComments,
            totalWatchlists,
            totalBids: totalBidsCount,
            recentBids: recentBidsCount,

            // Category performance
            categoryStats,

            // System metrics (you can implement real ones based on your monitoring)
            avgResponseTime: 2.3,
            systemHealth: 99.8,

            // Additional insights
            newUsersThisWeek: recentUsers,
            auctionsEndingToday: await Auction.countDocuments({
                status: 'active',
                endDate: {
                    $gte: today,
                    $lt: tomorrow
                }
            })
        };

        res.status(200).json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error('Get admin stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching admin statistics'
        });
    }
};

// Get all users for admin
export const getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', filter = 'all' } = req.query;

        const skip = (page - 1) * limit;

        // Build search query
        let searchQuery = {
            $or: [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { username: { $regex: search, $options: 'i' } }
            ]
        };

        // Add filter if not 'all'
        if (filter !== 'all') {
            searchQuery.userType = filter;
        }

        // Get users with pagination
        const users = await User.find(searchQuery)
            .select('-password -refreshToken -resetPasswordToken -emailVerificationToken')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count for pagination
        const totalUsers = await User.countDocuments(searchQuery);

        // Get user statistics
        const userStats = await User.aggregate([
            {
                $group: {
                    _id: '$userType',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Convert stats to object
        const stats = {
            total: totalUsers,
            admins: userStats.find(stat => stat._id === 'admin')?.count || 0,
            sellers: userStats.find(stat => stat._id === 'seller')?.count || 0,
            bidders: userStats.find(stat => stat._id === 'bidder')?.count || 0
        };

        res.status(200).json({
            success: true,
            data: {
                users,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalUsers / limit),
                    totalUsers,
                    hasNext: page * limit < totalUsers,
                    hasPrev: page > 1
                },
                stats
            }
        });

    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching users'
        });
    }
};

// Get user details with statistics
export const getUserDetails = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId)
            .select('-password -refreshToken -resetPasswordToken -emailVerificationToken');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        let userStats = {};

        if (user.userType === 'seller') {
            // Seller statistics
            const auctionStats = await Auction.aggregate([
                { $match: { seller: user._id } },
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 },
                        totalRevenue: { $sum: '$finalPrice' }
                    }
                }
            ]);

            const activeAuctions = auctionStats.find(stat => stat._id === 'active')?.count || 0;
            const soldAuctions = auctionStats.find(stat => stat._id === 'sold')?.count || 0;
            const totalRevenue = auctionStats.find(stat => stat._id === 'sold')?.totalRevenue || 0;

            // Calculate rating (you might want to implement a proper rating system)
            const rating = 4.5 + (Math.random() * 0.5); // Mock rating for now

            userStats = {
                totalSales: totalRevenue,
                activeListings: activeAuctions,
                totalAuctions: await Auction.countDocuments({ seller: user._id }),
                soldAuctions,
                rating: Math.round(rating * 10) / 10
            };

        } else if (user.userType === 'bidder') {
            // Bidder statistics
            const totalBids = await Auction.aggregate([
                { $match: { 'bids.bidder': user._id } },
                { $unwind: '$bids' },
                { $match: { 'bids.bidder': user._id } },
                { $group: { _id: null, count: { $sum: 1 } } }
            ]);

            const wonAuctions = await Auction.countDocuments({
                winner: user._id,
                status: 'sold'
            });

            const watchlistItems = await Watchlist.countDocuments({
                user: user._id
            });

            const totalBidsCount = totalBids[0]?.count || 0;
            const successRate = totalBidsCount > 0 ? Math.round((wonAuctions / totalBidsCount) * 100) : 0;

            userStats = {
                totalBids: totalBidsCount,
                auctionsWon: wonAuctions,
                watchlistItems,
                successRate
            };
        } else if (user.userType === 'admin') {
            userStats = {
                role: 'Super Admin', // You might want to store this in user model
                lastLogin: user.updatedAt
            };
        }

        res.status(200).json({
            success: true,
            data: {
                user: {
                    ...user.toObject(),
                    stats: userStats
                }
            }
        });

    } catch (error) {
        console.error('Get user details error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching user details'
        });
    }
};

// Update user status (activate/deactivate)
export const updateUserStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const { isActive } = req.body;

        const user = await User.findByIdAndUpdate(
            userId,
            { isActive },
            { new: true, runValidators: true }
        ).select('-password -refreshToken');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
            data: { user }
        });

    } catch (error) {
        console.error('Update user status error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while updating user status'
        });
    }
};

// Delete user
export const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Prevent admin from deleting themselves
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete your own account'
            });
        }

        // Delete user (you might want to soft delete instead)
        await User.findByIdAndDelete(userId);

        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });

    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while deleting user'
        });
    }
};

// Update user role/type
export const updateUserType = async (req, res) => {
    try {
        const { userId } = req.params;
        const { userType } = req.body;

        // Validate user type
        if (!['admin', 'seller', 'bidder'].includes(userType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user type'
            });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { userType },
            { new: true, runValidators: true }
        ).select('-password -refreshToken');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: `User role updated to ${userType}`,
            data: { user }
        });

    } catch (error) {
        console.error('Update user type error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while updating user type'
        });
    }
};

// Get all auctions for admin
export const getAllAuctions = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', filter = 'all' } = req.query;

        const skip = (page - 1) * limit;

        // Build search query
        let searchQuery = {
            $or: [
                { title: { $regex: search, $options: 'i' } },
                { 'sellerUsername': { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } }
            ]
        };

        // Add status filter if not 'all'
        if (filter !== 'all') {
            if (filter === 'active') {
                searchQuery.status = 'active';
                searchQuery.endDate = { $gt: new Date() };
            } else if (filter === 'pending') {
                searchQuery.status = 'draft';
            } else if (filter === 'ended') {
                searchQuery.status = { $in: ['ended', 'sold', 'reserve_not_met'] };
            } else {
                searchQuery.status = filter;
            }
        }

        // Get auctions with pagination and populate seller info
        const auctions = await Auction.find(searchQuery)
            .populate('seller', 'firstName lastName username phone email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count for pagination
        const totalAuctions = await Auction.countDocuments(searchQuery);

        // Get auction statistics
        const auctionStats = await Auction.aggregate([
            {
                $facet: {
                    total: [{ $count: "count" }],
                    active: [
                        {
                            $match: {
                                status: 'active',
                                endDate: { $gt: new Date() }
                            }
                        },
                        { $count: "count" }
                    ],
                    draft: [
                        { $match: { status: 'draft' } },
                        { $count: "count" }
                    ],
                    sold: [
                        { $match: { status: 'sold' } },
                        { $count: "count" }
                    ],
                    featured: [
                        { $match: { featured: true } },
                        { $count: "count" }
                    ]
                }
            }
        ]);

        const stats = {
            total: auctionStats[0]?.total[0]?.count || 0,
            active: auctionStats[0]?.active[0]?.count || 0,
            pending: auctionStats[0]?.draft[0]?.count || 0,
            sold: auctionStats[0]?.sold[0]?.count || 0,
            featured: auctionStats[0]?.featured[0]?.count || 0
        };

        res.status(200).json({
            success: true,
            data: {
                auctions,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalAuctions / limit),
                    totalAuctions,
                    hasNext: page * limit < totalAuctions,
                    hasPrev: page > 1
                },
                stats
            }
        });

    } catch (error) {
        console.error('Get all auctions error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching auctions'
        });
    }
};

// Get auction details
export const getAuctionDetails = async (req, res) => {
    try {
        const { auctionId } = req.params;

        const auction = await Auction.findById(auctionId)
            .populate('seller', 'firstName lastName username email phone')
            .populate('winner', 'firstName lastName username')
            .populate('currentBidder', 'firstName lastName username');

        if (!auction) {
            return res.status(404).json({
                success: false,
                message: 'Auction not found'
            });
        }

        // Convert specifications Map to plain object
        const auctionObject = auction.toObject();

        if (auctionObject.specifications && auctionObject.specifications instanceof Map) {
            auctionObject.specifications = Object.fromEntries(auctionObject.specifications);
        } else if (auction.specifications && auction.specifications instanceof Map) {
            // Fallback: convert from the original document if toObject() doesn't preserve the Map
            auctionObject.specifications = Object.fromEntries(auction.specifications);
        }

        // Calculate additional statistics
        const auctionStats = {
            totalBids: auction.bidCount,
            totalWatchers: auction.watchlistCount,
            totalViews: auction.views,
            timeRemaining: auction.timeRemaining,
            isReserveMet: auction.isReserveMet()
        };

        res.status(200).json({
            success: true,
            data: {
                auction: {
                    ...auctionObject,
                    stats: auctionStats
                }
            }
        });

    } catch (error) {
        console.error('Get auction details error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching auction details'
        });
    }
};

// Update auction status
export const updateAuctionStatus = async (req, res) => {
    try {
        const { auctionId } = req.params;
        const { status, featured } = req.body;

        const updateData = {};
        if (status) updateData.status = status;
        if (featured !== undefined) updateData.featured = featured;

        const auction = await Auction.findByIdAndUpdate(
            auctionId,
            updateData,
            { new: true, runValidators: true }
        ).populate('seller', 'firstName lastName username');

        if (!auction) {
            return res.status(404).json({
                success: false,
                message: 'Auction not found'
            });
        }

        let message = 'Auction updated successfully';
        if (status) message = `Auction ${status} successfully`;
        if (featured !== undefined) {
            message = `Auction ${featured ? 'featured' : 'unfeatured'} successfully`;
        }

        res.status(200).json({
            success: true,
            message,
            data: { auction }
        });

    } catch (error) {
        console.error('Update auction status error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while updating auction status'
        });
    }
};

// Approve auction (change from draft to active)
export const approveAuction = async (req, res) => {
    try {
        const { auctionId } = req.params;

        const auction = await Auction.findById(auctionId);

        if (!auction) {
            return res.status(404).json({
                success: false,
                message: 'Auction not found'
            });
        }

        if (auction.status !== 'draft') {
            return res.status(400).json({
                success: false,
                message: 'Only draft auctions can be approved'
            });
        }

        // Check if auction start date is in the future
        const now = new Date();
        if (auction.startDate > now) {
            auction.status = 'approved';
            // Schedule activation for start date - keep as draft for now
            await agendaService.scheduleAuctionActivation(auction._id, auction.startDate);
        } else {
            // Activate immediately
            auction.status = 'active';

            await auction.populate('seller', 'email username firstName');

            await auctionListedEmail(auction, auction.seller);

            // If end date is in past, end the auction
            if (auction.endDate <= now) {
                await auction.endAuction();
            }
        }

        await auction.save();

        res.status(200).json({
            success: true,
            message: 'Auction approved successfully',
            data: { auction }
        });

    } catch (error) {
        console.error('Approve auction error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while approving auction'
        });
    }
};

// Delete auction
export const deleteAuction = async (req, res) => {
    try {
        const { auctionId } = req.params;

        const auction = await Auction.findById(auctionId);
        if (!auction) {
            return res.status(404).json({
                success: false,
                message: 'Auction not found'
            });
        }

        // Prevent deletion of active auctions with bids
        if (auction.status === 'active' && auction.bidCount > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete active auction with bids. Please cancel it first.'
            });
        }

        await Auction.findByIdAndDelete(auctionId);

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

// End auction manually
export const endAuction = async (req, res) => {
    try {
        const { auctionId } = req.params;

        const auction = await Auction.findById(auctionId);

        if (!auction) {
            return res.status(404).json({
                success: false,
                message: 'Auction not found'
            });
        }

        if (auction.status !== 'active') {
            return res.status(400).json({
                success: false,
                message: 'Only active auctions can be ended manually'
            });
        }

        await auction.endAuction();

        res.status(200).json({
            success: true,
            message: 'Auction ended successfully',
            data: { auction }
        });

    } catch (error) {
        console.error('End auction error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while ending auction'
        });
    }
};

export const updateAuction = async (req, res) => {
    try {
        const { id } = req.params; // Changed from id to id to match your route

        const auction = await Auction.findById(id);

        if (!auction) {
            return res.status(404).json({
                success: false,
                message: 'Auction not found'
            });
        }

        if (auction.status === 'sold') {
            return res.status(401).json({
                success: false,
                message: `Sold auctions can't be edited`
            });
        }

        // For FormData, we need to access fields from req.body directly
        const {
            title,
            category,
            description,
            specifications,
            location,
            videoLink,
            startPrice,
            bidIncrement,
            auctionType,
            reservePrice,
            startDate,
            endDate,
            removedPhotos,
            removedDocuments
        } = req.body;

        // Basic validation - check if fields exist in req.body
        if (!title || !category || !description || !startPrice || !bidIncrement || !auctionType || !startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'All required fields must be provided',
                missing: {
                    title: !title,
                    category: !category,
                    description: !description,
                    startPrice: !startPrice,
                    bidIncrement: !bidIncrement,
                    auctionType: !auctionType,
                    startDate: !startDate,
                    endDate: !endDate
                }
            });
        }

        // Handle specifications
        let finalSpecifications = new Map();

        // Convert existing specifications to Map if they exist
        if (auction.specifications && auction.specifications instanceof Map) {
            auction.specifications.forEach((value, key) => {
                if (value !== null && value !== undefined && value !== '') {
                    finalSpecifications.set(key, value);
                }
            });
        } else if (auction.specifications && typeof auction.specifications === 'object') {
            Object.entries(auction.specifications).forEach(([key, value]) => {
                if (value !== null && value !== undefined && value !== '') {
                    finalSpecifications.set(key, value);
                }
            });
        }

        // Parse and merge new specifications
        if (specifications) {
            try {
                let newSpecs;
                if (typeof specifications === 'string') {
                    newSpecs = JSON.parse(specifications);
                } else {
                    newSpecs = specifications;
                }

                if (typeof newSpecs === 'object' && newSpecs !== null) {
                    Object.entries(newSpecs).forEach(([key, value]) => {
                        if (value !== null && value !== undefined && value !== '') {
                            finalSpecifications.set(key, value.toString());
                        } else {
                            finalSpecifications.delete(key);
                        }
                    });
                }
            } catch (parseError) {
                console.error('Error parsing specifications:', parseError);
                return res.status(400).json({
                    success: false,
                    message: 'Invalid specifications format'
                });
            }
        }

        // Handle removed photos
        let finalPhotos = [...auction.photos];
        if (removedPhotos) {
            try {
                const removedPhotoIds = typeof removedPhotos === 'string'
                    ? JSON.parse(removedPhotos)
                    : removedPhotos;

                if (Array.isArray(removedPhotoIds)) {
                    // Remove photos from the array and delete from Cloudinary
                    for (const photoId of removedPhotoIds) {
                        const photoIndex = finalPhotos.findIndex(photo =>
                            photo.publicId === photoId || photo._id?.toString() === photoId
                        );

                        if (photoIndex > -1) {
                            const removedPhoto = finalPhotos[photoIndex];
                            // Delete from Cloudinary
                            if (removedPhoto.publicId) {
                                await deleteFromCloudinary(removedPhoto.publicId);
                            }
                            finalPhotos.splice(photoIndex, 1);
                        }
                    }
                }
            } catch (error) {
                console.error('Error processing removed photos:', error);
            }
        }

        // Handle removed documents
        let finalDocuments = [...auction.documents];
        if (removedDocuments) {
            try {
                const removedDocIds = typeof removedDocuments === 'string'
                    ? JSON.parse(removedDocuments)
                    : removedDocuments;

                if (Array.isArray(removedDocIds)) {
                    for (const docId of removedDocIds) {
                        const docIndex = finalDocuments.findIndex(doc =>
                            doc.publicId === docId || doc._id?.toString() === docId
                        );

                        if (docIndex > -1) {
                            const removedDoc = finalDocuments[docIndex];
                            // Delete from Cloudinary
                            if (removedDoc.publicId) {
                                await deleteFromCloudinary(removedDoc.publicId);
                            }
                            finalDocuments.splice(docIndex, 1);
                        }
                    }
                }
            } catch (error) {
                console.error('Error processing removed documents:', error);
            }
        }

        // Handle new photo uploads
        if (req.files && req.files.photos) {
            const photos = Array.isArray(req.files.photos) ? req.files.photos : [req.files.photos];
            for (const photo of photos) {
                try {
                    const result = await uploadImageToCloudinary(photo.buffer, 'auction-photos');
                    finalPhotos.push({
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

        // Handle new document uploads
        if (req.files && req.files.documents) {
            const documents = Array.isArray(req.files.documents) ? req.files.documents : [req.files.documents];
            for (const doc of documents) {
                try {
                    const result = await uploadDocumentToCloudinary(doc.buffer, doc.originalname, 'auction-documents');
                    finalDocuments.push({
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

        // For admin, allow updating past start dates if needed
        // Remove this check for admin or modify as needed
        // if (start <= new Date() && new Date(auction.startDate).getTime() !== start.getTime()) {
        //     return res.status(400).json({
        //         success: false,
        //         message: 'Start date must be in the future'
        //     });
        // }

        if (auctionType === 'reserve' && (!reservePrice || parseFloat(reservePrice) < parseFloat(startPrice))) {
            return res.status(400).json({
                success: false,
                message: 'Reserve price must be provided and greater than or equal to start price'
            });
        }

        // Validate dates
        const start = new Date(startDate);
        const end = new Date(endDate);
        const now = new Date();

        // Prepare update data
        const updateData = {
            title,
            category,
            description,
            specifications: finalSpecifications,
            location: location || '',
            videoLink: videoLink || '',
            startPrice: parseFloat(startPrice),
            bidIncrement: parseFloat(bidIncrement),
            auctionType,
            startDate: start,
            endDate: end,
            photos: finalPhotos,
            documents: finalDocuments,
        };

        // Add reserve price if applicable
        if (auctionType === 'reserve') {
            updateData.reservePrice = parseFloat(reservePrice);
        } else {
            updateData.reservePrice = undefined;
        }

        if (end <= start) {
            return res.status(400).json({
                success: false,
                message: 'End date must be after start date'
            });
        }

        // Handle status changes based on new dates
        if (start > now && end > now) {
            // Dates are in future - activate if not already active
            if (auction.status == 'active') {
                updateData.status = 'approved';
            }
        } else if (end <= now) {
            // Auction has ended
            if (auction.status === 'active') {
                updateData.status = 'ended';
                // Trigger end auction logic
                await auction.endAuction();
            }
        } else if (start <= now && end > now) {
            // Auction should be active now (start date passed but end date in future)
            if (auction.status !== 'active') {
                updateData.status = 'active';
            }
        }

        const updatedAuction = await Auction.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('seller', 'username firstName lastName');

        // Reschedule jobs if dates changed
        if (start.getTime() !== new Date(auction.startDate).getTime() ||
            end.getTime() !== new Date(auction.endDate).getTime()) {

            await agendaService.cancelAuctionJobs(auction._id);

            // Only schedule activation if start date is in future
            if (start > new Date()) {
                await agendaService.scheduleAuctionActivation(auction._id, start);
            } else {
                // If start date is in past, activate immediately
                if (auction.status === 'draft') {
                    updatedAuction.status = 'active';
                    await updatedAuction.save();
                }
            }

            await agendaService.scheduleAuctionEnd(auction._id, end);
        }

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
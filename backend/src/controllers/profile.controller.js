import User from '../models/user.model.js';
import Watchlist from '../models/watchlist.model.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';
import bcrypt from 'bcrypt';

// Get user profile
export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password -refreshToken');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                user
            }
        });

    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching profile'
        });
    }
};

// Update user profile
export const updateProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const {
            firstName,
            lastName,
            phone,
            countryCode,
            countryName,
            street,
            city,
            state,
            zipCode,
            country
        } = req.body;

        const updateData = {
            ...(firstName && { firstName }),
            ...(lastName && { lastName }),
            ...(phone && { phone }),
            ...(countryCode && { countryCode }),
            ...(countryName && { countryName })
        };

        // Handle address fields if provided
        if (street || city || state || zipCode || country) {
            updateData.address = {
                ...(street && { street }),
                ...(city && { city }),
                ...(state && { state }),
                ...(zipCode && { zipCode }),
                ...(country && { country })
            };
        }

        // Handle avatar upload
        if (req.file) {
            try {
                // Delete old avatar if exists
                const oldUser = await User.findById(userId);
                if (oldUser.image) {
                    await deleteFromCloudinary(oldUser.image);
                }

                // Upload new avatar
                const result = await uploadToCloudinary(req.file.buffer, 'user-avatars');
                updateData.image = result.secure_url;

            } catch (uploadError) {
                console.error('Avatar upload error:', uploadError);
                return res.status(400).json({
                    success: false,
                    message: 'Failed to upload avatar image'
                });
            }
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            {
                new: true,
                runValidators: true
            }
        ).select('-password -refreshToken');

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                user: updatedUser
            }
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while updating profile'
        });
    }
};

// Change password
export const changePassword = async (req, res) => {
    try {
        const userId = req.user._id;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password and new password are required'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters long'
            });
        }

        const user = await User.findById(userId);

        // Verify current password
        const isCurrentPasswordValid = await user.isPasswordCorrect(currentPassword);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password updated successfully'
        });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while changing password'
        });
    }
};

// Update preferences
export const updatePreferences = async (req, res) => {
    try {
        const userId = req.user._id;
        const { preferences } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { preferences },
            {
                new: true,
                runValidators: true
            }
        ).select('-password -refreshToken');

        res.status(200).json({
            success: true,
            message: 'Preferences updated successfully',
            data: {
                user: updatedUser
            }
        });

    } catch (error) {
        console.error('Update preferences error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while updating preferences'
        });
    }
};

export const getUserStats = async (req, res) => {
    try {
        const userId = req.user._id;
        const { userType } = req.params;

        const Auction = (await import('../models/auction.model.js')).default;

        let statistics = {};

        if (userType === 'bidder') {
            // Bidder-specific statistics
            const totalBidsResult = await Auction.aggregate([
                { $match: { 'bids.bidder': userId } },
                { $unwind: '$bids' },
                { $match: { 'bids.bidder': userId } },
                { $group: { _id: null, total: { $sum: 1 } } }
            ]);

            const participatedAuctions = await Auction.countDocuments({
                'bids.bidder': userId
            });

            const activeBids = await Auction.countDocuments({
                'bids.bidder': userId,
                status: 'active',
                endDate: { $gt: new Date() }
            });

            const wonAuctions = await Auction.countDocuments({
                winner: userId,
                status: 'sold'
            });

            // const watchlistItems = await Watchlist.countDocuments({
            //     user: userId
            // }).populate({
            //     path: 'auction',
            //     match: { status: 'active' }
            // });

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
                        'user': userId
                    }
                },
                {
                    $count: 'count'
                }
            ]);

            const watchlistCount = watchlistItems[0]?.count || 0;

            const totalBids = totalBidsResult[0]?.total || 0;
            // const successRate = totalBids > 0 ? Math.round((wonAuctions / totalBids) * 100) : 0;
            const successRate = participatedAuctions > 0 ? Math.round((wonAuctions / participatedAuctions) * 100) : 0;

            // Calculate total spent (sum of winning bids)
            const totalSpentResult = await Auction.aggregate([
                { $match: { winner: userId, status: 'sold' } },
                { $group: { _id: null, total: { $sum: '$finalPrice' } } }
            ]);

            const totalSpent = totalSpentResult[0]?.total || 0;
            const avgBidAmount = totalBids > 0 ? totalSpent / totalBids : 0;

            statistics = {
                userType: 'bidder',
                totalBids,
                activeBids,
                wonAuctions,
                watchlistCount,
                successRate,
                totalSpent,
                avgBidAmount: Math.round(avgBidAmount),
                // Additional bidder insights
                totalParticipatedAuctions: await Auction.countDocuments({
                    'bids.bidder': userId
                }),
                currentlyWinning: await Auction.countDocuments({
                    'currentBidder': userId,
                    status: 'active',
                    endDate: { $gt: new Date() }
                })
            };

        } else if (userType === 'seller') {
            // Seller-specific statistics
            const totalAuctions = await Auction.countDocuments({
                seller: userId
            });

            const activeAuctions = await Auction.countDocuments({
                seller: userId,
                status: 'active',
                endDate: { $gt: new Date() }
            });

            const soldAuctions = await Auction.countDocuments({
                seller: userId,
                status: 'sold'
            });

            const draftAuctions = await Auction.countDocuments({
                seller: userId,
                status: 'draft'
            });

            const endedNotSold = await Auction.countDocuments({
                seller: userId,
                status: 'ended',
                winner: { $exists: false }
            });

            const endingSoonAuctions = await Auction.countDocuments({
                seller: userId,
                status: 'active',
                endDate: {
                    $gt: new Date(),
                    $lt: new Date(Date.now() + 24 * 60 * 60 * 1000) // Less than 24 hours from now
                }
            });

            const reserveNotMet = await Auction.countDocuments({
                seller: userId,
                status: 'reserve_not_met'
            });

            // Calculate total revenue from sold auctions
            const totalRevenueResult = await Auction.aggregate([
                { $match: { seller: userId, status: 'sold' } },
                { $group: { _id: null, total: { $sum: '$finalPrice' } } }
            ]);

            const totalRevenue = totalRevenueResult[0]?.total || 0;

            // Calculate average sale price
            const avgSalePrice = soldAuctions > 0 ? totalRevenue / soldAuctions : 0;

            // Calculate success rate (sold vs total completed auctions)
            const completedAuctions = soldAuctions + endedNotSold + reserveNotMet;
            const successRate = completedAuctions > 0 ? Math.round((soldAuctions / completedAuctions) * 100) : 0;

            // Calculate total bids across all seller's auctions
            const totalBidsOnAuctions = await Auction.aggregate([
                { $match: { seller: userId } },
                { $group: { _id: null, totalBids: { $sum: '$bidCount' } } }
            ]);

            const totalBidsReceived = totalBidsOnAuctions[0]?.totalBids || 0;

            // Calculate average bids per auction
            const avgBidsPerAuction = totalAuctions > 0 ? (totalBidsReceived / totalAuctions) : 0;

            // Get highest selling auction
            const highestSaleResult = await Auction.findOne({
                seller: userId,
                status: 'sold'
            }).sort({ finalPrice: -1 }).select('title finalPrice');

            // Get most bid-on auction
            const mostPopularAuction = await Auction.findOne({
                seller: userId,
                bidCount: { $gt: 0 },
                watchlistCount: { $gte: 0 },
            }).sort({ bidCount: -1 }).select('title bidCount');

            // const totalWatchlists = await Watchlist.countDocuments({
            //     auction: { $in: await Auction.find({ seller: userId }).select('_id') }
            // });

            const totalWatchlists = await Watchlist.aggregate([
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
                        'auction.seller': userId
                    }
                },
                {
                    $count: 'count'
                }
            ]);

            const totalWatchlistsCount = totalWatchlists[0]?.count || 0;

            statistics = {
                userType: 'seller',
                // Basic counts
                totalAuctions,
                activeAuctions,
                soldAuctions,
                draftAuctions,
                endedNotSold,
                endingSoonAuctions,
                reserveNotMet,

                // Financial metrics
                totalRevenue,
                avgSalePrice: Math.round(avgSalePrice),
                successRate,

                // Engagement metrics
                totalBidsReceived,
                avgBidsPerAuction: Math.round(avgBidsPerAuction * 100) / 100,

                // Performance highlights
                highestSale: highestSaleResult ? {
                    title: highestSaleResult.title,
                    amount: highestSaleResult.finalPrice
                } : null,

                mostPopularAuction: mostPopularAuction ? {
                    title: mostPopularAuction.title,
                    bidCount: mostPopularAuction.bidCount,
                    watchlistCount: mostPopularAuction.watchlistCount,
                } : null,

                // Additional insights
                totalViews: await Auction.aggregate([
                    { $match: { seller: userId } },
                    { $group: { _id: null, totalViews: { $sum: '$views' } } }
                ]).then(result => result[0]?.totalViews || 0),

                totalWatchlists: totalWatchlistsCount
            };
        }

        res.status(200).json({
            success: true,
            data: {
                statistics,
                userType
            }
        });

    } catch (error) {
        console.error('Get user stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching user statistics'
        });
    }
};

// export const getUserStats = async (req, res) => {
//     try {
//         const userId = req.user._id;
//         const userType = req.user.userType;

//         const Auction = (await import('../models/auction.model.js')).default;
//         const Watchlist = (await import('../models/watchlist.model.js')).default;

//         // Bidder Statistics
//         const totalBidsResult = await Auction.aggregate([
//             { $match: { 'bids.bidder': userId } },
//             { $unwind: '$bids' },
//             { $match: { 'bids.bidder': userId } },
//             { $group: { _id: null, total: { $sum: 1 } } }
//         ]);

//         const participatedAuctions = await Auction.countDocuments({
//             'bids.bidder': userId
//         });

//         const activeBids = await Auction.countDocuments({
//             'bids.bidder': userId,
//             status: 'active',
//             endDate: { $gt: new Date() }
//         });

//         const wonAuctions = await Auction.countDocuments({
//             winner: userId,
//             status: 'sold'
//         });

//         const watchlistItems = await Watchlist.aggregate([
//             {
//                 $lookup: {
//                     from: 'auctions',
//                     localField: 'auction',
//                     foreignField: '_id',
//                     as: 'auction'
//                 }
//             },
//             {
//                 $unwind: '$auction'
//             },
//             {
//                 $match: {
//                     'auction.status': 'active',
//                     'user': userId
//                 }
//             },
//             {
//                 $count: 'count'
//             }
//         ]);

//         const watchlistCount = watchlistItems[0]?.count || 0;
//         const totalBids = totalBidsResult[0]?.total || 0;
//         const successRate = participatedAuctions > 0 ? Math.round((wonAuctions / participatedAuctions) * 100) : 0;

//         // Calculate total spent (sum of winning bids)
//         const totalSpentResult = await Auction.aggregate([
//             { $match: { winner: userId, status: 'sold' } },
//             { $group: { _id: null, total: { $sum: '$finalPrice' } } }
//         ]);

//         const totalSpent = totalSpentResult[0]?.total || 0;
//         const avgBidAmount = totalBids > 0 ? totalSpent / totalBids : 0;

//         // Seller Statistics
//         const totalAuctions = await Auction.countDocuments({
//             seller: userId
//         });

//         const activeAuctions = await Auction.countDocuments({
//             seller: userId,
//             status: 'active',
//             endDate: { $gt: new Date() }
//         });

//         const soldAuctions = await Auction.countDocuments({
//             seller: userId,
//             status: 'sold'
//         });

//         const draftAuctions = await Auction.countDocuments({
//             seller: userId,
//             status: 'draft'
//         });

//         const endedNotSold = await Auction.countDocuments({
//             seller: userId,
//             status: 'ended',
//             winner: { $exists: false }
//         });

//         const endingSoonAuctions = await Auction.countDocuments({
//             seller: userId,
//             status: 'active',
//             endDate: {
//                 $gt: new Date(),
//                 $lt: new Date(Date.now() + 24 * 60 * 60 * 1000)
//             }
//         });

//         const reserveNotMet = await Auction.countDocuments({
//             seller: userId,
//             status: 'reserve_not_met'
//         });

//         // Calculate total revenue from sold auctions
//         const totalRevenueResult = await Auction.aggregate([
//             { $match: { seller: userId, status: 'sold' } },
//             { $group: { _id: null, total: { $sum: '$finalPrice' } } }
//         ]);

//         const totalRevenue = totalRevenueResult[0]?.total || 0;
//         const avgSalePrice = soldAuctions > 0 ? totalRevenue / soldAuctions : 0;

//         // Calculate success rate (sold vs total completed auctions)
//         const completedAuctions = soldAuctions + endedNotSold + reserveNotMet;
//         const sellerSuccessRate = completedAuctions > 0 ? Math.round((soldAuctions / completedAuctions) * 100) : 0;

//         // Calculate total bids across all seller's auctions
//         const totalBidsOnAuctions = await Auction.aggregate([
//             { $match: { seller: userId } },
//             { $group: { _id: null, totalBids: { $sum: '$bidCount' } } }
//         ]);

//         const totalBidsReceived = totalBidsOnAuctions[0]?.totalBids || 0;
//         const avgBidsPerAuction = totalAuctions > 0 ? (totalBidsReceived / totalAuctions) : 0;

//         // Get highest selling auction
//         const highestSaleResult = await Auction.findOne({
//             seller: userId,
//             status: 'sold'
//         }).sort({ finalPrice: -1 }).select('title finalPrice');

//         // Get most bid-on auction
//         const mostPopularAuction = await Auction.findOne({
//             seller: userId,
//             bidCount: { $gt: 0 }
//         }).sort({ bidCount: -1 }).select('title bidCount');

//         const totalWatchlists = await Watchlist.aggregate([
//             {
//                 $lookup: {
//                     from: 'auctions',
//                     localField: 'auction',
//                     foreignField: '_id',
//                     as: 'auction'
//                 }
//             },
//             {
//                 $unwind: '$auction'
//             },
//             {
//                 $match: {
//                     'auction.seller': userId
//                 }
//             },
//             {
//                 $count: 'count'
//             }
//         ]);

//         const totalWatchlistsCount = totalWatchlists[0]?.count || 0;

//         const totalViews = await Auction.aggregate([
//             { $match: { seller: userId } },
//             { $group: { _id: null, totalViews: { $sum: '$views' } } }
//         ]).then(result => result[0]?.totalViews || 0);

//         const statistics = {
//             userType, // Keep userType for reference

//             // Bidder Stats (available to all users)
//             bidderStats: {
//                 totalBids,
//                 activeBids,
//                 wonAuctions,
//                 watchlistCount,
//                 successRate,
//                 totalSpent,
//                 avgBidAmount: Math.round(avgBidAmount),
//                 totalParticipatedAuctions: participatedAuctions,
//                 currentlyWinning: await Auction.countDocuments({
//                     'currentBidder': userId,
//                     status: 'active',
//                     endDate: { $gt: new Date() }
//                 })
//             },

//             // Seller Stats (available to all users)
//             sellerStats: {
//                 totalAuctions,
//                 activeAuctions,
//                 soldAuctions,
//                 draftAuctions,
//                 endedNotSold,
//                 endingSoonAuctions,
//                 reserveNotMet,
//                 totalRevenue,
//                 avgSalePrice: Math.round(avgSalePrice),
//                 successRate: sellerSuccessRate,
//                 totalBidsReceived,
//                 avgBidsPerAuction: Math.round(avgBidsPerAuction * 100) / 100,
//                 highestSale: highestSaleResult ? {
//                     title: highestSaleResult.title,
//                     amount: highestSaleResult.finalPrice
//                 } : null,
//                 mostPopularAuction: mostPopularAuction ? {
//                     title: mostPopularAuction.title,
//                     bidCount: mostPopularAuction.bidCount
//                 } : null,
//                 totalViews,
//                 totalWatchlists: totalWatchlistsCount
//             },

//             // Combined overall stats
//             overallStats: {
//                 totalAuctionsParticipated: participatedAuctions,
//                 totalAuctionsCreated: totalAuctions,
//                 totalWonAuctions: wonAuctions,
//                 totalSoldAuctions: soldAuctions,
//                 totalWatchlisted: watchlistCount,
//                 totalRevenue: totalRevenue,
//                 totalSpent: totalSpent
//             }
//         };

//         res.status(200).json({
//             success: true,
//             data: {
//                 statistics,
//                 userType
//             }
//         });

//     } catch (error) {
//         console.error('Get user stats error:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Internal server error while fetching user statistics'
//         });
//     }
// };
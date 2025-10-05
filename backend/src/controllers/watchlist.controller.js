import Watchlist from '../models/watchlist.model.js';
import Auction from '../models/auction.model.js';

// Add auction to watchlist
export const addToWatchlist = async (req, res) => {
    try {
        const { auctionId } = req.params;
        const userId = req.user._id;

        // Check if auction exists and is active
        const auction = await Auction.findOne({
            _id: auctionId,
            status: { $in: ['draft', 'active'] } // Can watchlist draft and active auctions
        });

        if (!auction) {
            return res.status(404).json({
                success: false,
                message: 'Auction not found or not available for watchlisting'
            });
        }

        // Check if already in watchlist
        const existingWatchlist = await Watchlist.findOne({
            user: userId,
            auction: auctionId
        });

        if (existingWatchlist) {
            return res.status(400).json({
                success: false,
                message: 'Auction is already in your watchlist'
            });
        }

        // Create watchlist entry
        const watchlistItem = await Watchlist.create({
            user: userId,
            auction: auctionId
        });

        // Increment watchlist count on auction
        await Auction.findByIdAndUpdate(auctionId, {
            $inc: { watchlistCount: 1 }
        });

        // Populate the watchlist item for response
        await watchlistItem.populate('auction', 'title currentPrice endDate status photos');

        res.status(201).json({
            success: true,
            message: 'Auction added to watchlist',
            data: { watchlistItem }
        });

    } catch (error) {
        console.error('Add to watchlist error:', error);
        
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Auction is already in your watchlist'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Internal server error while adding to watchlist'
        });
    }
};

// Remove auction from watchlist
export const removeFromWatchlist = async (req, res) => {
    try {
        const { auctionId } = req.params;
        const userId = req.user._id;

        // Find and remove watchlist entry
        const watchlistItem = await Watchlist.findOneAndDelete({
            user: userId,
            auction: auctionId
        });

        if (!watchlistItem) {
            return res.status(404).json({
                success: false,
                message: 'Auction not found in your watchlist'
            });
        }

        // Decrement watchlist count on auction
        await Auction.findByIdAndUpdate(auctionId, {
            $inc: { watchlistCount: -1 }
        });

        res.status(200).json({
            success: true,
            message: 'Auction removed from watchlist',
            data: { removedAuctionId: auctionId }
        });

    } catch (error) {
        console.error('Remove from watchlist error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while removing from watchlist'
        });
    }
};

// Toggle watchlist status (add/remove)
export const toggleWatchlist = async (req, res) => {
    try {
        const { auctionId } = req.params;
        const userId = req.user._id;

        // Check if auction exists
        const auction = await Auction.findById(auctionId);
        if (!auction) {
            return res.status(404).json({
                success: false,
                message: 'Auction not found'
            });
        }

        // Check if already in watchlist
        const existingWatchlist = await Watchlist.findOne({
            user: userId,
            auction: auctionId
        });

        let isWatchlisted;
        let message;

        if (existingWatchlist) {
            // Remove from watchlist
            await Watchlist.findOneAndDelete({
                user: userId,
                auction: auctionId
            });

            await Auction.findByIdAndUpdate(auctionId, {
                $inc: { watchlistCount: -1 }
            });

            isWatchlisted = false;
            message = 'Auction removed from watchlist';
        } else {
            // Add to watchlist
            await Watchlist.create({
                user: userId,
                auction: auctionId
            });

            await Auction.findByIdAndUpdate(auctionId, {
                $inc: { watchlistCount: 1 }
            });

            isWatchlisted = true;
            message = 'Auction added to watchlist';
        }

        // Get updated watchlist count
        const updatedAuction = await Auction.findById(auctionId, 'watchlistCount');

        res.status(200).json({
            success: true,
            message,
            data: {
                isWatchlisted,
                watchlistCount: updatedAuction.watchlistCount,
                auctionId
            }
        });

    } catch (error) {
        console.error('Toggle watchlist error:', error);
        
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Watchlist operation failed'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Internal server error while updating watchlist'
        });
    }
};

// Get user's watchlist
export const getMyWatchlist = async (req, res) => {
    try {
        const userId = req.user._id;
        const { page = 1, limit = 12, status } = req.query;

        // Build filter for auctions
        const auctionFilter = {};
        if (status) {
            auctionFilter.status = status;
        } else {
            // Default: show active and upcoming auctions
            auctionFilter.status = { $in: ['draft', 'active', 'approved'] };
        }

        const watchlistItems = await Watchlist.find({ user: userId })
            .populate({
                path: 'auction',
                match: auctionFilter,
                populate: [
                    { path: 'seller', select: 'username firstName lastName' },
                    { path: 'currentBidder', select: 'username' }
                ]
            })
            .sort({ addedAt: -1 })
            // .limit(limit * 1)
            // .skip((page - 1) * limit);

        // Filter out watchlist items where auction was not found (deleted auctions)
        const validWatchlistItems = watchlistItems.filter(item => item.auction !== null);

        const total = await Watchlist.countDocuments({ user: userId });

        res.status(200).json({
            success: true,
            data: {
                watchlist: validWatchlistItems,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalItems: total,
                    itemsPerPage: parseInt(limit)
                }
            }
        });

    } catch (error) {
        console.error('Get watchlist error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching watchlist'
        });
    }
};

// Check if auction is in user's watchlist
export const getWatchlistStatus = async (req, res) => {
    try {
        const { auctionId } = req.params;
        const userId = req.user._id;

        const watchlistItem = await Watchlist.findOne({
            user: userId,
            auction: auctionId
        });

        const auction = await Auction.findById(auctionId, 'watchlistCount');

        if (!auction) {
            return res.status(404).json({
                success: false,
                message: 'Auction not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                isWatchlisted: !!watchlistItem,
                watchlistCount: auction.watchlistCount
            }
        });

    } catch (error) {
        console.error('Get watchlist status error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while checking watchlist status'
        });
    }
};

// Get users who watchlisted an auction (for sellers)
export const getAuctionWatchlistUsers = async (req, res) => {
    try {
        const { auctionId } = req.params;
        const userId = req.user._id;

        // Verify user owns the auction
        const auction = await Auction.findOne({
            _id: auctionId,
            seller: userId
        });

        if (!auction) {
            return res.status(403).json({
                success: false,
                message: 'You can only view watchlist for your own auctions'
            });
        }

        const watchlistUsers = await Watchlist.find({ auction: auctionId })
            .populate('user', 'username firstName lastName email')
            .sort({ addedAt: -1 });

        res.status(200).json({
            success: true,
            data: {
                auction: auction.title,
                watchlistUsers,
                totalWatchers: watchlistUsers.length
            }
        });

    } catch (error) {
        console.error('Get auction watchlist users error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching watchlist users'
        });
    }
};
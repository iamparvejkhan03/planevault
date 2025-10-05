import Comment from '../models/comment.model.js';
import Auction from '../models/auction.model.js';
import { flaggedCommentAdminEmail, newCommentBidderEmail, newCommentSellerEmail } from '../utils/nodemailer.js';
import User from '../models/user.model.js';

// Add a new comment
export const addComment = async (req, res) => {
    try {
        const { auctionId } = req.params;
        const { content, contentHtml, parentCommentId } = req.body;
        const userId = req.user._id;

        // Validate auction exists
        const auction = await Auction.findById(auctionId);
        if (!auction) {
            return res.status(404).json({
                success: false,
                message: 'Auction not found'
            });
        }

        // Validate content
        if (!content || !content.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Comment content is required'
            });
        }

        // Check if parent comment exists (for replies)
        if (parentCommentId) {
            const parentComment = await Comment.findOne({
                _id: parentCommentId,
                auction: auctionId,
                status: 'active'
            });

            if (!parentComment) {
                return res.status(404).json({
                    success: false,
                    message: 'Parent comment not found'
                });
            }
        }

        // Create comment
        const comment = await Comment.create({
            auction: auctionId,
            user: userId,
            userName: req.user.username,
            userAvatar: req.user.avatar || '',
            content: content.trim(),
            contentHtml: contentHtml || content.trim(),
            parentComment: parentCommentId || null
        });

        // Populate user info for response
        await comment.populate('user', 'username firstName lastName avatar');

        res.status(201).json({
            success: true,
            message: parentCommentId ? 'Reply added successfully' : 'Comment added successfully',
            data: { comment }
        });

        // Populate the comment with necessary data
        const populatedComment = await Comment.findById(comment._id)
            .populate('auction')
            .populate('user', 'firstName lastName username email userType');

        // Populate the auction's seller
        await populatedComment.auction.populate('seller', 'email username firstName');

        // 1. Notify the seller (if comment author is not the seller)
        if (populatedComment.auction.seller._id.toString() !== userId.toString()) {
            await newCommentSellerEmail(
                populatedComment.auction.seller,
                populatedComment.auction,
                populatedComment,
                populatedComment.user
            );
        }

        // Get previous commenters
        const previousCommenters = await Comment.find({
            auction: auctionId,
            user: { $ne: userId }
        }).distinct('user');

        console.log('Previous commenter IDs:', previousCommenters);

        const commenterUsers = await User.find({
            _id: { $in: previousCommenters },
        });

        console.log(`Found ${commenterUsers.length} commenters with alerts enabled`);

        for (const commenter of commenterUsers) {
            // Simple check - just make sure it's not the seller or current user
            const isSeller = commenter._id.toString() === populatedComment.auction.seller._id.toString();
            const isCurrentUser = commenter._id.toString() === userId.toString();

            if (!isSeller && !isCurrentUser) {
                console.log(`Sending comment notification to: ${commenter.email}`);
                await newCommentBidderEmail(
                    commenter,
                    populatedComment.auction,
                    populatedComment,
                    populatedComment.user
                );
            }
        }

    } catch (error) {
        console.error('Add comment error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while adding comment'
        });
    }
};

// Get comments for an auction
export const getComments = async (req, res) => {
    try {
        const { auctionId } = req.params;
        const { page = 1, limit = 10, parentCommentId = null, sortBy = 'recent' } = req.query;

        // Validate auction exists
        const auction = await Auction.findById(auctionId);
        if (!auction) {
            return res.status(404).json({
                success: false,
                message: 'Auction not found'
            });
        }

        // Build sort options
        let sortOptions = {};
        switch (sortBy) {
            case 'recent':
                sortOptions = { createdAt: -1 };
                break;
            case 'oldest':
                sortOptions = { createdAt: 1 };
                break;
            case 'popular':
                sortOptions = { likeCount: -1, createdAt: -1 };
                break;
            default:
                sortOptions = { createdAt: -1 };
        }

        const skip = (page - 1) * limit;

        // Get comments
        const comments = await Comment.find({
            auction: auctionId,
            parentComment: parentCommentId,
            status: 'active'
        })
            .populate('user', 'username firstName lastName avatar')
            .sort(sortOptions)
            .limit(parseInt(limit))
            .skip(skip);

        // Get total count for pagination
        const totalComments = await Comment.countDocuments({
            auction: auctionId,
            parentComment: parentCommentId,
            status: 'active'
        });

        // Get reply counts for each comment (if fetching top-level comments)
        if (!parentCommentId) {
            for (let comment of comments) {
                const replyCount = await Comment.countDocuments({
                    parentComment: comment._id,
                    status: 'active'
                });
                comment._doc.replyCount = replyCount;
            }
        }

        res.status(200).json({
            success: true,
            data: {
                comments,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalComments / limit),
                    totalComments,
                    commentsPerPage: parseInt(limit)
                }
            }
        });

    } catch (error) {
        console.error('Get comments error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching comments'
        });
    }
};

// Like/unlike a comment
export const toggleLike = async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.user._id;

        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        if (comment.status !== 'active') {
            return res.status(400).json({
                success: false,
                message: 'Cannot like this comment'
            });
        }

        let message;
        let isLiked;

        if (comment.isLikedByUser(userId)) {
            comment.removeLike(userId);
            message = 'Comment unliked';
            isLiked = false;
        } else {
            comment.addLike(userId);
            message = 'Comment liked';
            isLiked = true;
        }

        await comment.save();

        res.status(200).json({
            success: true,
            message,
            data: {
                isLiked,
                likeCount: comment.likeCount,
                commentId: comment._id
            }
        });

    } catch (error) {
        console.error('Toggle like error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while updating like'
        });
    }
};

// Update a comment
export const updateComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { content, contentHtml } = req.body;
        const userId = req.user._id;

        const comment = await Comment.findOne({
            _id: commentId,
            user: userId,
            status: 'active'
        });

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found or you are not authorized to edit it'
            });
        }

        // Check if comment is too old to edit (e.g., 15 minutes)
        const editTimeLimit = 15 * 60 * 1000; // 15 minutes
        if (Date.now() - comment.createdAt > editTimeLimit) {
            return res.status(400).json({
                success: false,
                message: 'Comment can only be edited within 15 minutes of posting'
            });
        }

        if (!content || !content.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Comment content is required'
            });
        }

        comment.content = content.trim();
        comment.contentHtml = contentHtml || content.trim();
        comment.updatedAt = new Date();

        await comment.save();

        res.status(200).json({
            success: true,
            message: 'Comment updated successfully',
            data: { comment }
        });

    } catch (error) {
        console.error('Update comment error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while updating comment'
        });
    }
};

// Delete a comment (soft delete)
export const deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.user._id;

        const comment = await Comment.findOne({
            _id: commentId,
            // user: userId
        });

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found or you are not authorized to delete it'
            });
        }

        comment.status = 'deleted';
        await comment.save();

        res.status(200).json({
            success: true,
            message: 'Comment deleted successfully',
            data: { commentId }
        });

    } catch (error) {
        console.error('Delete comment error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while deleting comment'
        });
    }
};

// Flag a comment for moderation
export const flagComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { reason } = req.body;
        const userId = req.user._id;

        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        // Check if user already flagged this comment
        const alreadyFlagged = comment.flags.some(flag =>
            flag.user.toString() === userId.toString()
        );

        if (alreadyFlagged) {
            return res.status(400).json({
                success: false,
                message: 'You have already flagged this comment'
            });
        }

        comment.flags.push({
            user: userId,
            reason: reason || 'Inappropriate content'
        });

        // Auto-moderate if too many flags
        if (comment.flags.length >= 3) {
            comment.status = 'flagged';
        }

        await comment.save();

        res.status(200).json({
            success: true,
            message: 'Comment flagged for moderation',
            data: { commentId }
        });

        const adminUsers = await User.find({ userType: 'admin' });
        const commentWithAuction = await Comment.findById(commentId)
            .populate('auction')
            .populate('user', 'firstName lastName username email userType createdAt');

        // Get the user who reported (from req.user)
        const reportedByUser = req.user;

        for (const admin of adminUsers) {
            await flaggedCommentAdminEmail(
                admin.email,
                reason || 'Inappropriate content',
                commentWithAuction,
                commentWithAuction.auction,
                reportedByUser
            );
        }

    } catch (error) {
        console.error('Flag comment error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while flagging comment'
        });
    }
};

// Get all flagged comments with pagination and filters
export const getFlaggedComments = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            status = 'flagged',
            sortBy = 'recent'
        } = req.query;

        const skip = (page - 1) * limit;

        // Build filter - FIXED
        const filter = {};
        if (status === 'flagged') {
            // Show comments that have flags (flags array not empty) regardless of status
            filter.flags = { $exists: true, $ne: [] }; // This ensures flags array exists and is not empty
        } else if (status === 'all') {
            // No additional filter for 'all'
            filter.status = { $in: ['active', 'flagged', 'deleted'] };
        } else {
            filter.status = status;
        }

        // Build sort options
        let sortOptions = {};
        switch (sortBy) {
            case 'recent':
                sortOptions = { createdAt: -1 };
                break;
            case 'oldest':
                sortOptions = { createdAt: 1 };
                break;
            case 'mostFlags':
                // For mostFlags, we need to use aggregation or handle differently
                // Since we're using find(), we'll sort by the flags array length
                sortOptions = { 'flags': -1 }; // MongoDB sorts by array length in descending order
                break;
            default:
                sortOptions = { createdAt: -1 };
        }

        // Get comments with populated data
        const comments = await Comment.find(filter)
            .populate('user', 'username firstName lastName avatar email isActive')
            .populate('auction', 'title itemName images')
            .populate('flags.user', 'username firstName lastName')
            .sort(sortOptions)
            .limit(parseInt(limit))
            .skip(skip)
            .lean();

        // Add flags count to each comment
        const commentsWithFlagsCount = comments.map(comment => ({
            ...comment,
            flagsCount: comment.flags.length
        }));

        // For mostFlags sorting, we need to sort by the actual flags count after fetching
        if (sortBy === 'mostFlags') {
            commentsWithFlagsCount.sort((a, b) => b.flagsCount - a.flagsCount);
        }

        // Get total count for pagination
        const totalComments = await Comment.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: {
                comments: commentsWithFlagsCount,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalComments / limit),
                    totalComments,
                    commentsPerPage: parseInt(limit)
                }
            }
        });

    } catch (error) {
        console.error('Get flagged comments error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching flagged comments'
        });
    }
};

// Remove/delete a comment (admin)
export const adminDeleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { deleteReason } = req.body;

        const comment = await Comment.findById(commentId)
            .populate('user', 'username');

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        // Update comment status to deleted
        comment.status = 'deleted';
        comment.adminDeleteReason = deleteReason || 'Violation of community guidelines';
        comment.deletedAt = new Date();
        comment.deletedBy = req.user._id;

        await comment.save();

        res.status(200).json({
            success: true,
            message: 'Comment deleted successfully',
            data: {
                commentId,
                userName: comment.user.username
            }
        });

    } catch (error) {
        console.error('Admin delete comment error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while deleting comment'
        });
    }
};

// Restore a deleted comment
export const restoreComment = async (req, res) => {
    try {
        const { commentId } = req.params;

        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        // Restore comment
        comment.status = 'active';
        comment.adminDeleteReason = undefined;
        comment.deletedAt = undefined;
        comment.deletedBy = undefined;

        await comment.save();

        res.status(200).json({
            success: true,
            message: 'Comment restored successfully',
            data: { commentId }
        });

    } catch (error) {
        console.error('Restore comment error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while restoring comment'
        });
    }
};

// Clear flags from a comment
export const clearFlags = async (req, res) => {
    try {
        const { commentId } = req.params;

        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        // Clear all flags and restore to active status
        comment.flags = [];
        comment.status = 'active';

        await comment.save();

        res.status(200).json({
            success: true,
            message: 'Flags cleared successfully',
            data: { commentId }
        });

    } catch (error) {
        console.error('Clear flags error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while clearing flags'
        });
    }
};

// Get comment statistics for dashboard - CORRECTED VERSION
export const getCommentStats = async (req, res) => {
    try {
        const totalComments = await Comment.countDocuments();

        // Count comments that have ANY flags (flags array not empty)
        const flaggedComments = await Comment.countDocuments({
            'flags.0': { $exists: true } // This checks if flags array has at least 1 element
        });

        const activeComments = await Comment.countDocuments({ status: 'active' });
        const deletedComments = await Comment.countDocuments({ status: 'deleted' });

        // Get recent flags (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentFlags = await Comment.aggregate([
            { $unwind: '$flags' },
            { $match: { 'flags.flaggedAt': { $gte: sevenDaysAgo } } },
            { $group: { _id: null, count: { $sum: 1 } } }
        ]);

        const flagsThisWeek = recentFlags.length > 0 ? recentFlags[0].count : 0;

        res.status(200).json({
            success: true,
            data: {
                totalComments,
                flaggedComments, // This now means "comments with any flags"
                activeComments,
                deletedComments,
                flagsThisWeek
            }
        });

    } catch (error) {
        console.error('Get comment stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching comment statistics'
        });
    }
};
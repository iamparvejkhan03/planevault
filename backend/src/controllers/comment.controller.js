import Comment from '../models/comment.model.js';
import Auction from '../models/auction.model.js';

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
            user: userId
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

    } catch (error) {
        console.error('Flag comment error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while flagging comment'
        });
    }
};
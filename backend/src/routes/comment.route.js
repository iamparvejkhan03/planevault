import { Router } from 'express';
import {
    addComment,
    getComments,
    toggleLike,
    updateComment,
    deleteComment,
    flagComment,
    getFlaggedComments,
    getCommentStats,
    adminDeleteComment,
    restoreComment,
    clearFlags
} from '../controllers/comment.controller.js';
import { auth, authAdmin } from '../middlewares/auth.middleware.js';
import { requirePermission } from '../middlewares/permission.middleware.js';

const commentRouter = Router();

// All routes require authentication
// commentRouter.use(auth);

// Comment CRUD operations
commentRouter.post('/auction/:auctionId', auth, addComment);
commentRouter.get('/auction/:auctionId', getComments);
commentRouter.post('/:commentId/like', auth, toggleLike);
commentRouter.put('/:commentId', auth, updateComment);
commentRouter.delete('/:commentId', auth, deleteComment);
commentRouter.post('/:commentId/flag', auth, flagComment);

// Comment moderation routes
commentRouter.get('/flagged', authAdmin, requirePermission("manage_comments"), getFlaggedComments);
commentRouter.get('/stats', authAdmin, requirePermission("manage_comments"), getCommentStats);
commentRouter.delete('/:commentId', authAdmin, requirePermission("manage_comments"), adminDeleteComment);
commentRouter.patch('/:commentId/restore', authAdmin, requirePermission("manage_comments"), restoreComment);
commentRouter.patch('/:commentId/clear-flags', authAdmin, requirePermission("manage_comments"), clearFlags);

export default commentRouter;
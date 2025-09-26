import { Router } from 'express';
import {
    addComment,
    getComments,
    toggleLike,
    updateComment,
    deleteComment,
    flagComment
} from '../controllers/comment.controller.js';
import { auth } from '../middlewares/auth.middleware.js';

const commentRouter = Router();

// All routes require authentication
commentRouter.use(auth);

// Comment CRUD operations
commentRouter.post('/auction/:auctionId', addComment);
commentRouter.get('/auction/:auctionId', getComments);
commentRouter.post('/:commentId/like', toggleLike);
commentRouter.put('/:commentId', updateComment);
commentRouter.delete('/:commentId', deleteComment);
commentRouter.post('/:commentId/flag', flagComment);

export default commentRouter;
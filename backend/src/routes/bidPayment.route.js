import { Router } from 'express';
import {
    createBidPaymentIntent,
    confirmBidPayment,
    chargeWinningBidder,
    getUserBidPayments
} from '../controllers/bidPayment.controller.js';
import { auth } from '../middlewares/auth.middleware.js';

const bidPaymentRouter = Router();

// All routes require authentication
bidPaymentRouter.use(auth);

bidPaymentRouter.post('/create-intent', createBidPaymentIntent);
bidPaymentRouter.post('/confirm', confirmBidPayment);
bidPaymentRouter.post('/charge-winner', chargeWinningBidder);
bidPaymentRouter.get('/auction/:auctionId', getUserBidPayments);

export default bidPaymentRouter;
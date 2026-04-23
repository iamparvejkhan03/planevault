import { Router } from 'express';
import { getMyBids, getBidStats, getSellerBidHistory, getAdminBidHistory, getAdminBidStats } from '../controllers/bid.controller.js';
import { auth, authAdmin, authBidder, authSeller } from '../middlewares/auth.middleware.js';
import { requirePermission } from '../middlewares/permission.middleware.js';

const bidRouter = Router();

bidRouter.get('/my-bids', auth, getMyBids);
bidRouter.get('/stats', auth, getBidStats);
bidRouter.get('/seller/bid-history', authSeller, getSellerBidHistory);
bidRouter.get('/admin/history', auth, authAdmin, requirePermission("manage_bids"), getAdminBidHistory);
bidRouter.get('/admin/stats', auth, authAdmin, requirePermission("manage_bids"), getAdminBidStats);

export default bidRouter;
import { Router } from 'express';
import {
    addToWatchlist,
    removeFromWatchlist,
    toggleWatchlist,
    getMyWatchlist,
    getWatchlistStatus,
    getAuctionWatchlistUsers
} from '../controllers/watchlist.controller.js';
import { auth, authBidder } from '../middlewares/auth.middleware.js';
import { authSeller } from '../middlewares/auth.middleware.js';

const watchlistRouter = Router();

// All routes require authentication
// watchlistRouter.use(authBidder);

// Watchlist management
watchlistRouter.post('/add/:auctionId', authBidder, addToWatchlist);
watchlistRouter.delete('/remove/:auctionId/', authBidder, removeFromWatchlist);
watchlistRouter.post('/toggle/:auctionId', authBidder, toggleWatchlist);

// Get watchlist data
watchlistRouter.get('/my-watchlist', authBidder, getMyWatchlist);
watchlistRouter.get('/status/:auctionId', authBidder, getWatchlistStatus);

// Seller only routes
// watchlistRouter.get('/auction/:auctionId/users', getAuctionWatchlistUsers);

export default watchlistRouter;
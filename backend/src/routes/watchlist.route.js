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
watchlistRouter.use(authBidder);

// Watchlist management
watchlistRouter.post('/add/:auctionId', addToWatchlist);
watchlistRouter.delete('/remove/:auctionId/', removeFromWatchlist);
watchlistRouter.post('/toggle/:auctionId', toggleWatchlist); // Most commonly used

// Get watchlist data
watchlistRouter.get('/my-watchlist', getMyWatchlist);
watchlistRouter.get('/status/:auctionId', getWatchlistStatus);

// Seller only routes
// watchlistRouter.get('/auction/:auctionId/users', getAuctionWatchlistUsers);

export default watchlistRouter;
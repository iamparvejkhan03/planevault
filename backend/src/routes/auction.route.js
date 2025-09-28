import express, { Router } from 'express';
import {
    createAuction,
    getAuctions,
    getAuction,
    updateAuction,
    deleteAuction,
    placeBid,
    getUserAuctions,
    getBiddingStats,
    getWonAuctions
} from '../controllers/auction.controller.js';
import upload from '../middlewares/multer.middleware.js';
import { auth, authBidder, authSeller } from '../middlewares/auth.middleware.js';

const auctionRouter = Router();

// Protected routes
auctionRouter.post('/create', authSeller, upload.fields([
    { name: 'photos' },
    { name: 'documents' }
]), createAuction);

auctionRouter.put('/update/:id', authSeller, updateAuction);
auctionRouter.delete('/delete/:id', authSeller, deleteAuction);
auctionRouter.post('/bid/:id', authBidder, placeBid);
auctionRouter.get('/user/my-auctions', authSeller, getUserAuctions);
auctionRouter.get('/stats', auth, getBiddingStats);
auctionRouter.get('/won-auctions', auth, getWonAuctions);

// Public routes
auctionRouter.get('/', getAuctions);
auctionRouter.get('/:id', getAuction);

export default auctionRouter;
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
    getWonAuctions,
    getSoldAuctions,
    getTopLiveAuctions
} from '../controllers/auction.controller.js';
import upload from '../middlewares/multer.middleware.js';
import { auth, authBidder, authSeller } from '../middlewares/auth.middleware.js';

const auctionRouter = Router();

// Protected routes
auctionRouter.post('/create', authSeller, upload.fields([
    { name: 'photos' },
    { name: 'documents' },
    { name: 'logbooks' },
]), createAuction);

auctionRouter.put('/update/:id', authSeller, upload.fields([
    { name: 'photos' },
    { name: 'documents' },
    { name: 'logbooks' },
]), updateAuction);
auctionRouter.delete('/delete/:id', authSeller, deleteAuction);
auctionRouter.post('/bid/:id', authBidder, placeBid);
auctionRouter.get('/user/my-auctions', authSeller, getUserAuctions);
auctionRouter.get('/stats', auth, getBiddingStats);
auctionRouter.get('/won-auctions', auth, getWonAuctions);
auctionRouter.get('/sold-auctions', authSeller, getSoldAuctions);
auctionRouter.get('/top', getTopLiveAuctions);

// Public routes
auctionRouter.get('/', getAuctions);
auctionRouter.get('/:id', getAuction);

export default auctionRouter;
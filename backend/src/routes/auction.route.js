import express, { Router } from 'express';
import {
    createAuction,
    getAuctions,
    getAuction,
    updateAuction,
    deleteAuction,
    placeBid,
    getUserAuctions
} from '../controllers/auction.controller.js';
import upload from '../middlewares/multer.middleware.js';
import { authBidder, authSeller } from '../middlewares/auth.middleware.js';

const auctionRouter = Router();

// Public routes
auctionRouter.get('/', getAuctions);
auctionRouter.get('/:id', getAuction);

// Protected routes
auctionRouter.post('/create', authSeller, upload.fields([
    { name: 'photos' },
    { name: 'documents' }
]), createAuction);

auctionRouter.put('/update/:id', authSeller, updateAuction);
auctionRouter.delete('/delete/:id', authSeller, deleteAuction);
auctionRouter.post('/bid/:id', authBidder, placeBid);
auctionRouter.get('/user/my-auctions', authSeller, getUserAuctions);

export default auctionRouter;
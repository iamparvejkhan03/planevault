import express from "express";
import "dotenv/config";
import dbConnect from "./db/index.js";
import cors from "cors";
import { configureCloudinary } from "./utils/cloudinary.js";
import compression from "compression";
import userRouter from "./routes/user.route.js";
import auctionRouter from "./routes/auction.route.js";
import agendaService from './services/agendaService.js';
import watchlistRouter from "./routes/watchlist.route.js";
import commentRouter from "./routes/comment.route.js";
import bidRouter from "./routes/bid.route.js";
import AdminRouter from "./routes/admin.route.js";
import commissionRouter from "./routes/commission.routes.js";
import bidPaymentRouter from "./routes/bidPayment.route.js";
import contactQueryRouter from "./routes/contactQuery.route.js";

const app = express();
const PORT = process.env.PORT || 3000;

// 1. FIRST connect to database
await dbConnect();

// 2. THEN configure Cloudinary and Agenda
configureCloudinary();

// 3. Initialize Agenda
let agendaStarted = false;
try {
    await agendaService.start();
    agendaStarted = true;
    console.log('✅ Agenda service started successfully');
} catch (error) {
    console.error('❌ Failed to start Agenda:', error);
}

app.use(compression());
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ limit: '16kb' }));

app.use(cors({
    origin: ['https://www.planevault.com', 'http://localhost:5173'],
    credentials: true,
}));

// Health check
app.get('/api/v1/health', (req, res) => {
    res.status(200).json({ 
        status: 'ok', 
        agenda: agendaStarted ? 'running' : 'failed'
    });
});

// Your API routes
app.use('/api/v1/users', userRouter);
app.use('/api/v1/auctions', auctionRouter);
app.use('/api/v1/watchlist', watchlistRouter);
app.use('/api/v1/comments', commentRouter);
app.use('/api/v1/bids', bidRouter);
app.use('/api/v1/admin', AdminRouter);
app.use('/api/v1/admin/commissions', commissionRouter);
app.use('/api/v1/bid-payments', bidPaymentRouter);
app.use('/api/v1/contact', contactQueryRouter);

// 404 handler - SIMPLIFIED VERSION
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.originalUrl} not found`
    });
});

// Global error handler
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({ 
        success: false,
        message: 'Internal server error'
    });
});

const server = app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});

// Graceful shutdown
const gracefulShutdown = async () => {
    console.log('Shutting down gracefully...');
    if (agendaStarted) await agendaService.stop();
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
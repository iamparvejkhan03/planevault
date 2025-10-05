// controllers/transactionController.js
import BidPayment from '../models/bidPayment.model.js';
import Commission from '../models/commission.model.js';
import Auction from '../models/auction.model.js';
import User from '../models/user.model.js';

export const getAdminTransactions = async (req, res) => {
    try {
        const { page = 1, limit = 12, status, search, type, dateRange, sortBy = 'recent' } = req.query;

        // Build filter object
        const filter = {};
        
        // Status filter
        if (status && status !== 'all') {
            filter.status = status;
        }
        
        // Type filter (bid_payment, commission, etc.)
        if (type && type !== 'all') {
            filter.type = type;
        }
        
        // Date range filter
        if (dateRange && dateRange !== 'all') {
            const now = new Date();
            let startDate;
            
            switch(dateRange) {
                case 'today':
                    startDate = new Date(now.setHours(0, 0, 0, 0));
                    break;
                case 'week':
                    startDate = new Date(now.setDate(now.getDate() - 7));
                    break;
                case 'month':
                    startDate = new Date(now.setMonth(now.getMonth() - 1));
                    break;
                case 'year':
                    startDate = new Date(now.setFullYear(now.getFullYear() - 1));
                    break;
            }
            
            if (startDate) {
                filter.createdAt = { $gte: startDate };
            }
        }
        
        // Search filter
        if (search) {
            filter.$or = [
                { 'auction.title': { $regex: search, $options: 'i' } },
                { 'bidder.username': { $regex: search, $options: 'i' } },
                { 'bidder.firstName': { $regex: search, $options: 'i' } },
                { 'bidder.lastName': { $regex: search, $options: 'i' } },
                { paymentIntentId: { $regex: search, $options: 'i' } }
            ];
        }

        // Find transactions with populated data
        const transactions = await BidPayment.find(filter)
            .populate('auction', 'title category startPrice currentPrice status winner startDate endDate')
            .populate('bidder', 'username firstName lastName email company stripeCustomerId')
            .sort({ createdAt: -1 })
            // .limit(limit * 1)
            // .skip((page - 1) * limit);

        // Transform data for admin view
        const transformedTransactions = transactions.map(transaction => {
            // Determine transaction type and status
            let transactionType = 'bid_payment';
            let displayStatus = transaction.status;
            let statusColor = 'gray';
            
            switch(transaction.status) {
                case 'succeeded':
                    statusColor = 'green';
                    displayStatus = 'Completed';
                    break;
                case 'created':
                    statusColor = 'blue';
                    displayStatus = 'Pending';
                    break;
                case 'requires_capture':
                    statusColor = 'yellow';
                    displayStatus = 'Awaiting Capture';
                    break;
                case 'canceled':
                    statusColor = 'red';
                    displayStatus = 'Canceled';
                    break;
                case 'processing_failed':
                    statusColor = 'red';
                    displayStatus = 'Failed';
                    break;
            }

            return {
                id: transaction._id.toString(),
                transactionId: `TX${transaction._id.toString().slice(-8).toUpperCase()}`,
                paymentIntentId: transaction.paymentIntentId,
                type: transactionType,
                status: transaction.status,
                displayStatus: displayStatus,
                statusColor: statusColor,
                amount: transaction.totalAmount,
                commissionAmount: transaction.commissionAmount,
                bidAmount: transaction.bidAmount,
                createdAt: transaction.createdAt,
                updatedAt: transaction.updatedAt,
                auction: {
                    id: transaction.auction._id.toString(),
                    title: transaction.auction.title,
                    category: transaction.auction.category,
                    status: transaction.auction.status,
                    startPrice: transaction.auction.startPrice,
                    currentPrice: transaction.auction.currentPrice,
                    startDate: transaction.auction.startDate,
                    endDate: transaction.auction.endDate
                },
                bidder: {
                    id: transaction.bidder._id.toString(),
                    name: `${transaction.bidder.firstName} ${transaction.bidder.lastName}`.trim() || transaction.bidder.username,
                    username: transaction.bidder.username,
                    email: transaction.bidder.email,
                    company: transaction.bidder.company || 'N/A',
                    stripeCustomerId: transaction.bidder.stripeCustomerId
                },
                chargeAttempted: transaction.chargeAttempted,
                chargeSucceeded: transaction.chargeSucceeded
            };
        });

        // Apply additional sorting
        transformedTransactions.sort((a, b) => {
            switch(sortBy) {
                case 'recent':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'oldest':
                    return new Date(a.createdAt) - new Date(b.createdAt);
                case 'amount_high':
                    return b.amount - a.amount;
                case 'amount_low':
                    return a.amount - b.amount;
                case 'bidder_name':
                    return a.bidder.name.localeCompare(b.bidder.name);
                default:
                    return new Date(b.createdAt) - new Date(a.createdAt);
            }
        });

        // Calculate transaction statistics
        const totalTransactions = await BidPayment.countDocuments(filter);
        
        const revenueStats = await BidPayment.aggregate([
            { $match: { ...filter, status: 'succeeded' } },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalAmount' },
                    totalCommission: { $sum: '$commissionAmount' },
                    count: { $sum: 1 }
                }
            }
        ]);

        const statusStats = await BidPayment.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$totalAmount' }
                }
            }
        ]);

        const recentStats = await BidPayment.aggregate([
            {
                $match: {
                    ...filter,
                    createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
                }
            },
            {
                $group: {
                    _id: null,
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$totalAmount' }
                }
            }
        ]);

        const statistics = {
            totalTransactions,
            totalRevenue: revenueStats[0]?.totalRevenue || 0,
            totalCommission: revenueStats[0]?.totalCommission || 0,
            completedTransactions: revenueStats[0]?.count || 0,
            recentTransactions: recentStats[0]?.count || 0,
            recentRevenue: recentStats[0]?.totalAmount || 0,
            statusBreakdown: statusStats.reduce((acc, stat) => {
                acc[stat._id] = { count: stat.count, amount: stat.totalAmount };
                return acc;
            }, {})
        };

        // Get filter options
        const filterOptions = {
            statuses: [
                { value: 'all', label: 'All Status' },
                { value: 'succeeded', label: 'Completed' },
                { value: 'created', label: 'Pending' },
                { value: 'requires_capture', label: 'Awaiting Capture' },
                { value: 'canceled', label: 'Canceled' },
                { value: 'processing_failed', label: 'Failed' }
            ],
            types: [
                { value: 'all', label: 'All Types' },
                { value: 'bid_payment', label: 'Bid Payments' },
                { value: 'commission', label: 'Commissions' }
            ],
            dateRanges: [
                { value: 'all', label: 'All Time' },
                { value: 'today', label: 'Today' },
                { value: 'week', label: 'Last 7 Days' },
                { value: 'month', label: 'Last 30 Days' },
                { value: 'year', label: 'Last Year' }
            ]
        };

        res.status(200).json({
            success: true,
            data: {
                transactions: transformedTransactions,
                statistics,
                filterOptions,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalTransactions / limit),
                    totalTransactions: totalTransactions
                }
            }
        });

    } catch (error) {
        console.error('Admin transactions error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching transactions'
        });
    }
};

export const getTransactionStats = async (req, res) => {
    try {
        // Get comprehensive transaction statistics
        const today = new Date();
        const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

        // Total revenue and transactions
        const overallStats = await BidPayment.aggregate([
            { $match: { status: 'succeeded' } },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalAmount' },
                    totalTransactions: { $sum: 1 },
                    averageTransaction: { $avg: '$totalAmount' }
                }
            }
        ]);

        // Recent activity (last 7 days)
        const recentActivity = await BidPayment.aggregate([
            { $match: { createdAt: { $gte: lastWeek }, status: 'succeeded' } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    dailyRevenue: { $sum: '$totalAmount' },
                    transactionCount: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Revenue by category
        const revenueByCategory = await BidPayment.aggregate([
            { $match: { status: 'succeeded' } },
            {
                $lookup: {
                    from: 'auctions',
                    localField: 'auction',
                    foreignField: '_id',
                    as: 'auctionData'
                }
            },
            { $unwind: '$auctionData' },
            {
                $group: {
                    _id: '$auctionData.category',
                    totalRevenue: { $sum: '$totalAmount' },
                    transactionCount: { $sum: 1 }
                }
            }
        ]);

        // Payment status distribution
        const statusDistribution = await BidPayment.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$totalAmount' }
                }
            }
        ]);

        // Top bidders by spending
        const topBidders = await BidPayment.aggregate([
            { $match: { status: 'succeeded' } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'bidder',
                    foreignField: '_id',
                    as: 'bidderData'
                }
            },
            { $unwind: '$bidderData' },
            {
                $group: {
                    _id: '$bidder',
                    totalSpent: { $sum: '$totalAmount' },
                    transactionCount: { $sum: 1 },
                    bidderName: { $first: '$bidderData.username' },
                    bidderEmail: { $first: '$bidderData.email' }
                }
            },
            { $sort: { totalSpent: -1 } },
            { $limit: 10 }
        ]);

        res.status(200).json({
            success: true,
            data: {
                overall: overallStats[0] || { totalRevenue: 0, totalTransactions: 0, averageTransaction: 0 },
                recentActivity,
                revenueByCategory,
                statusDistribution,
                topBidders
            }
        });

    } catch (error) {
        console.error('Transaction stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching transaction statistics'
        });
    }
};
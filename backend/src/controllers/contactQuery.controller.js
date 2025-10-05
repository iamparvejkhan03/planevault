// controllers/contactQuery.controller.js
import ContactQuery from '../models/contactQuery.model.js';
import { contactConfirmationEmail, contactEmail } from '../utils/nodemailer.js';

// Submit contact form query
export const submitContactQuery = async (req, res) => {
    try {
        const { name, email, phone, userType, message } = req.body;
        
        // Validate required fields
        if (!name || !email || !userType || !message) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, user type, and message are required'
            });
        }

        // Create contact query
        const contactQuery = await ContactQuery.create({
            name,
            email,
            phone: phone || '',
            userType,
            message,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        // Populate for response
        await contactQuery.populate('assignedTo', 'username firstName lastName');

        if(contactQuery){
            await contactEmail(name, email, phone, userType, message);
            await contactConfirmationEmail(name, email);
        }

        res.status(201).json({
            success: true,
            message: 'Your query has been submitted successfully. We will get back to you within 24 hours.',
            data: {
                queryId: contactQuery.queryId,
                query: contactQuery
            }
        });

    } catch (error) {
        console.error('Submit contact query error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while submitting your query'
        });
    }
};

// Get all contact queries for admin
export const getContactQueries = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 12, 
            status, 
            search, 
            userType, 
            category, 
            priority,
            sortBy = 'recent',
            dateRange 
        } = req.query;

        // Build filter object
        const filter = {};
        
        // Status filter
        if (status && status !== 'all') {
            filter.status = status;
        }
        
        // User type filter
        if (userType && userType !== 'all') {
            filter.userType = userType;
        }
        
        // Category filter
        if (category && category !== 'all') {
            filter.category = category;
        }
        
        // Priority filter
        if (priority && priority !== 'all') {
            filter.priority = priority;
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
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { message: { $regex: search, $options: 'i' } },
                { queryId: { $regex: search, $options: 'i' } }
            ];
        }

        // Find queries with populated data
        const queries = await ContactQuery.find(filter)
            .populate('assignedTo', 'username firstName lastName email')
            .sort({ createdAt: -1 })
            // .limit(limit * 1)
            // .skip((page - 1) * limit);

        // Transform data for frontend
        const transformedQueries = queries.map(query => ({
            id: query._id.toString(),
            queryId: query.queryId,
            name: query.name,
            email: query.email,
            phone: query.phone,
            userType: query.userType,
            message: query.message,
            status: query.status,
            category: query.category,
            priority: query.priority,
            notes: query.notes,
            response: query.response,
            assignedTo: query.assignedTo ? {
                id: query.assignedTo._id.toString(),
                name: `${query.assignedTo.firstName} ${query.assignedTo.lastName}`.trim() || query.assignedTo.username,
                email: query.assignedTo.email
            } : null,
            createdAt: query.createdAt,
            updatedAt: query.updatedAt,
            respondedAt: query.respondedAt,
            ipAddress: query.ipAddress
        }));

        // Apply additional sorting
        transformedQueries.sort((a, b) => {
            switch(sortBy) {
                case 'recent':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'oldest':
                    return new Date(a.createdAt) - new Date(b.createdAt);
                case 'priority':
                    const priorityOrder = { 'urgent': 4, 'high': 3, 'medium': 2, 'low': 1 };
                    return priorityOrder[b.priority] - priorityOrder[a.priority];
                case 'name':
                    return a.name.localeCompare(b.name);
                default:
                    return new Date(b.createdAt) - new Date(a.createdAt);
            }
        });

        // Calculate statistics
        const totalQueries = await ContactQuery.countDocuments(filter);
        
        const statusStats = await ContactQuery.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const priorityStats = await ContactQuery.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: '$priority',
                    count: { $sum: 1 }
                }
            }
        ]);

        const recentStats = await ContactQuery.aggregate([
            {
                $match: {
                    ...filter,
                    createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
                }
            },
            { $count: 'count' }
        ]);

        const statistics = {
            totalQueries,
            newQueries: statusStats.find(stat => stat._id === 'new')?.count || 0,
            inProgressQueries: statusStats.find(stat => stat._id === 'in-progress')?.count || 0,
            resolvedQueries: statusStats.find(stat => stat._id === 'resolved')?.count || 0,
            recentQueries: recentStats[0]?.count || 0,
            priorityBreakdown: priorityStats.reduce((acc, stat) => {
                acc[stat._id] = stat.count;
                return acc;
            }, {})
        };

        // Get filter options
        const filterOptions = {
            statuses: [
                { value: 'all', label: 'All Status' },
                { value: 'new', label: 'New' },
                { value: 'in-progress', label: 'In Progress' },
                { value: 'resolved', label: 'Resolved' },
                { value: 'closed', label: 'Closed' }
            ],
            userTypes: [
                { value: 'all', label: 'All User Types' },
                { value: 'bidder', label: 'Bidder' },
                { value: 'seller', label: 'Seller' }
            ],
            categories: [
                { value: 'all', label: 'All Categories' },
                { value: 'bidding', label: 'Bidding' },
                { value: 'listing', label: 'Listing' },
                { value: 'account', label: 'Account' },
                { value: 'payment', label: 'Payment' },
                { value: 'technical', label: 'Technical' },
                { value: 'general', label: 'General' },
                { value: 'fees', label: 'Fees' },
                { value: 'platform', label: 'Platform' },
                { value: 'post-auction', label: 'Post Auction' }
            ],
            priorities: [
                { value: 'all', label: 'All Priorities' },
                { value: 'urgent', label: 'Urgent' },
                { value: 'high', label: 'High' },
                { value: 'medium', label: 'Medium' },
                { value: 'low', label: 'Low' }
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
                queries: transformedQueries,
                statistics,
                filterOptions,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalQueries / limit),
                    totalQueries: totalQueries
                }
            }
        });

    } catch (error) {
        console.error('Get contact queries error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching contact queries'
        });
    }
};

// Update contact query status
export const updateQueryStatus = async (req, res) => {
    try {
        const { queryId } = req.params;
        const { status, notes, response, priority, assignedTo } = req.body;

        const updateData = {};
        if (status) updateData.status = status;
        if (notes !== undefined) updateData.notes = notes;
        if (response !== undefined) updateData.response = response;
        if (priority) updateData.priority = priority;
        if (assignedTo) updateData.assignedTo = assignedTo;

        // If marking as resolved, set respondedAt
        if (status === 'resolved' || status === 'closed') {
            updateData.respondedAt = new Date();
        }

        const query = await ContactQuery.findByIdAndUpdate(
            queryId,
            updateData,
            { new: true, runValidators: true }
        ).populate('assignedTo', 'username firstName lastName email');

        if (!query) {
            return res.status(404).json({
                success: false,
                message: 'Contact query not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Query updated successfully',
            data: { query }
        });

    } catch (error) {
        console.error('Update query status error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while updating query'
        });
    }
};

// Delete contact query
export const deleteQuery = async (req, res) => {
    try {
        const { queryId } = req.params;

        const query = await ContactQuery.findByIdAndDelete(queryId);

        if (!query) {
            return res.status(404).json({
                success: false,
                message: 'Contact query not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Query deleted successfully',
            data: { deletedQueryId: queryId }
        });

    } catch (error) {
        console.error('Delete query error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while deleting query'
        });
    }
};

// Get query statistics for dashboard
export const getQueryStats = async (req, res) => {
    try {
        const today = new Date();
        const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

        // Overall statistics
        const overallStats = await ContactQuery.aggregate([
            {
                $group: {
                    _id: null,
                    totalQueries: { $sum: 1 },
                    avgResponseTime: { $avg: { $subtract: ['$respondedAt', '$createdAt'] } }
                }
            }
        ]);

        // Recent activity (last 7 days)
        const recentActivity = await ContactQuery.aggregate([
            { $match: { createdAt: { $gte: lastWeek } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    queryCount: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Queries by category
        const queriesByCategory = await ContactQuery.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Response rate
        const responseStats = await ContactQuery.aggregate([
            {
                $group: {
                    _id: null,
                    totalQueries: { $sum: 1 },
                    respondedQueries: {
                        $sum: { $cond: [{ $ne: ['$respondedAt', null] }, 1, 0] }
                    }
                }
            }
        ]);

        const responseRate = responseStats[0] ? 
            (responseStats[0].respondedQueries / responseStats[0].totalQueries) * 100 : 0;

        res.status(200).json({
            success: true,
            data: {
                totalQueries: overallStats[0]?.totalQueries || 0,
                averageResponseTime: overallStats[0]?.avgResponseTime || 0,
                responseRate: Math.round(responseRate),
                recentActivity,
                queriesByCategory,
                todayQueries: await ContactQuery.countDocuments({
                    createdAt: { $gte: new Date(today.setHours(0, 0, 0, 0)) }
                })
            }
        });

    } catch (error) {
        console.error('Get query stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching query statistics'
        });
    }
};
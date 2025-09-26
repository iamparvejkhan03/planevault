import Auction from '../models/auction.model.js';
import User from '../models/user.model.js';
import {
    uploadImageToCloudinary,
    uploadDocumentToCloudinary,
    deleteFromCloudinary
} from '../utils/cloudinary.js';
import agendaService from '../services/agendaService.js';

// Create New Auction
export const createAuction = async (req, res) => {
    try {
        const seller = req.user;

        // Check if user is a seller
        if (seller.userType !== 'seller') {
            return res.status(403).json({
                success: false,
                message: 'Only sellers can create auctions'
            });
        }

        const {
            title,
            category,
            description,
            location,
            videoLink,
            startPrice,
            bidIncrement,
            auctionType,
            reservePrice,
            startDate,
            endDate
        } = req.body;

        // Basic validation
        if (!title || !category || !description || !startPrice || !bidIncrement || !auctionType || !startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'All required fields must be provided'
            });
        }

        // Validate dates
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (end <= start) {
            return res.status(400).json({
                success: false,
                message: 'End date must be after start date'
            });
        }

        // Validate start date is in future
        if (start <= new Date()) {
            return res.status(400).json({
                success: false,
                message: 'Start date must be in the future'
            });
        }

        // Validate reserve price for reserve auctions
        if (auctionType === 'reserve' && (!reservePrice || reservePrice < startPrice)) {
            return res.status(400).json({
                success: false,
                message: 'Reserve price must be provided and greater than start price'
            });
        }

        // Handle file uploads
        let uploadedPhotos = [];
        let uploadedDocuments = [];

        // Upload photos (images)
        if (req.files && req.files.photos) {
            for (const photo of req.files.photos) {
                try {
                    const result = await uploadImageToCloudinary(photo.buffer, 'auction-photos');
                    uploadedPhotos.push({
                        url: result.secure_url,
                        publicId: result.public_id,
                        filename: photo.originalname,
                        resourceType: 'image'
                    });
                } catch (uploadError) {
                    console.error('Photo upload error:', uploadError);
                    return res.status(400).json({
                        success: false,
                        message: `Failed to upload photo: ${photo.originalname}`
                    });
                }
            }
        }

        // Upload documents (all file types)
        if (req.files && req.files.documents) {
            for (const doc of req.files.documents) {
                try {
                    const result = await uploadDocumentToCloudinary(doc.buffer, doc.originalname, 'auction-documents');
                    uploadedDocuments.push({
                        url: result.secure_url,
                        publicId: result.public_id,
                        filename: doc.originalname,
                        originalName: doc.originalname,
                        resourceType: 'raw'
                    });
                } catch (uploadError) {
                    console.error('Document upload error:', uploadError);
                    return res.status(400).json({
                        success: false,
                        message: `Failed to upload document: ${doc.originalname}`
                    });
                }
            }
        }

        // Create auction
        const auctionData = {
            title,
            category,
            description,
            location,
            videoLink,
            startPrice: parseFloat(startPrice),
            bidIncrement: parseFloat(bidIncrement),
            auctionType,
            startDate: start,
            endDate: end,
            seller: seller._id,
            sellerUsername: seller.username,
            photos: uploadedPhotos,
            documents: uploadedDocuments,
            status: 'draft' // Will be activated based on start date
        };

        // Add reserve price if applicable
        if (auctionType === 'reserve') {
            auctionData.reservePrice = parseFloat(reservePrice);
        }

        const auction = await Auction.create(auctionData);

        // Schedule activation and ending jobs
        await agendaService.scheduleAuctionActivation(auction._id, auction.startDate);
        await agendaService.scheduleAuctionEnd(auction._id, auction.endDate);

        // Populate seller info for response
        await auction.populate('seller', 'username firstName lastName');

        res.status(201).json({
            success: true,
            message: 'Auction created successfully',
            data: {
                auction
            }
        });

    } catch (error) {
        console.error('Create auction error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while creating auction'
        });
    }
};

// Get All Auctions (with filtering and pagination)
export const getAuctions = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 12,
            category,
            status,
            search,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Build filter object
        const filter = {};

        if (category) filter.category = category;
        if (status) filter.status = status;

        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Sort options
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const auctions = await Auction.find(filter)
            .populate('seller', 'username firstName lastName')
            .populate('currentBidder', 'username')
            .populate('winner', 'username firstName lastName')
            .sort(sortOptions)
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Auction.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: {
                auctions,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalAuctions: total
                }
            }
        });

    } catch (error) {
        console.error('Get auctions error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching auctions'
        });
    }
};

// Get Single Auction
export const getAuction = async (req, res) => {
    try {
        const { id } = req.params;

        const auction = await Auction.findById(id)
            .populate('seller', 'username firstName lastName countryName')
            .populate('currentBidder', 'username firstName')
            .populate('winner', 'username firstName lastName')
            .populate('bids.bidder', 'username firstName');

        if (!auction) {
            return res.status(404).json({
                success: false,
                message: 'Auction not found'
            });
        }

        // Increment views
        auction.views += 1;
        await auction.save();

        res.status(200).json({
            success: true,
            data: { auction }
        });

    } catch (error) {
        console.error('Get auction error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching auction'
        });
    }
};

// Update Auction
export const updateAuction = async (req, res) => {
    try {
        const { id } = req.params;
        const seller = req.user;

        const auction = await Auction.findById(id);

        if (!auction) {
            return res.status(404).json({
                success: false,
                message: 'Auction not found'
            });
        }

        // Check if user owns the auction
        if (auction.seller.toString() !== seller._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only update your own auctions'
            });
        }

        // Check if auction can be modified (only draft auctions can be modified)
        if (auction.status !== 'draft') {
            return res.status(400).json({
                success: false,
                message: 'Only draft auctions can be modified'
            });
        }

        const updates = { ...req.body };

        // Handle date updates
        if (updates.startDate) updates.startDate = new Date(updates.startDate);
        if (updates.endDate) updates.endDate = new Date(updates.endDate);

        // Validate dates if both are provided
        if (updates.startDate && updates.endDate && updates.endDate <= updates.startDate) {
            return res.status(400).json({
                success: false,
                message: 'End date must be after start date'
            });
        }

        const updatedAuction = await Auction.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        ).populate('seller', 'username firstName lastName');

        res.status(200).json({
            success: true,
            message: 'Auction updated successfully',
            data: { auction: updatedAuction }
        });

    } catch (error) {
        console.error('Update auction error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while updating auction'
        });
    }
};

// Delete Auction
export const deleteAuction = async (req, res) => {
    try {
        const { id } = req.params;
        const seller = req.user;

        const auction = await Auction.findById(id);

        if (!auction) {
            return res.status(404).json({
                success: false,
                message: 'Auction not found'
            });
        }

        // Check if user owns the auction
        if (auction.seller.toString() !== seller._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only delete your own auctions'
            });
        }

        // Only allow deletion of draft or cancelled auctions
        if (!['draft', 'cancelled'].includes(auction.status)) {
            return res.status(400).json({
                success: false,
                message: 'Only draft or cancelled auctions can be deleted'
            });
        }

        // Delete uploaded files from cloudinary
        for (const photo of auction.photos) {
            await deleteFromCloudinary(photo.publicId);
        }

        for (const doc of auction.documents) {
            await deleteFromCloudinary(doc.publicId);
        }

        await Auction.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Auction deleted successfully'
        });

    } catch (error) {
        console.error('Delete auction error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while deleting auction'
        });
    }
};

// Place Bid
export const placeBid = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount } = req.body;
        const bidder = req.user;

        // Check if user is a bidder
        if (bidder.userType !== 'bidder') {
            return res.status(403).json({
                success: false,
                message: 'Only bidders can place bids'
            });
        }

        const auction = await Auction.findById(id);

        if (!auction) {
            return res.status(404).json({
                success: false,
                message: 'Auction not found'
            });
        }

        // Place bid using the model method
        await auction.placeBid(bidder._id, bidder.username, parseFloat(amount));

        // Populate the updated auction
        await auction.populate('currentBidder', 'username firstName');

        res.status(200).json({
            success: true,
            message: 'Bid placed successfully',
            data: { auction }
        });

    } catch (error) {
        console.error('Place bid error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get User's Auctions
export const getUserAuctions = async (req, res) => {
    try {
        const user = req.user;
        const { status, page = 1, limit = 10 } = req.query;

        const filter = { seller: user._id };
        if (status) filter.status = status;

        const auctions = await Auction.find(filter)
            .populate('currentBidder', 'username firstName')
            .populate('winner', 'username firstName lastName')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Auction.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: {
                auctions,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalAuctions: total
                }
            }
        });

    } catch (error) {
        console.error('Get user auctions error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching user auctions'
        });
    }
};
import Auction from '../models/auction.model.js';
import User from '../models/user.model.js';
import {
    uploadImageToCloudinary,
    uploadDocumentToCloudinary,
    deleteFromCloudinary
} from '../utils/cloudinary.js';
import agendaService from '../services/agendaService.js';
import { bidConfirmationEmail, outbidNotificationEmail, sendOutbidNotifications } from '../utils/nodemailer.js';

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
            specifications, // This is coming as a JSON string
            location,
            videoLink,
            startPrice,
            bidIncrement,
            auctionType,
            reservePrice,
            // startDate,
            // endDate
        } = req.body;

        // Basic validation
        if (!title || !category || !description || !startPrice || !bidIncrement || !auctionType) {
            return res.status(400).json({
                success: false,
                message: 'All required fields must be provided'
            });
        }

        // Parse specifications from JSON string to object
        let parsedSpecifications = {};
        if (specifications) {
            try {
                parsedSpecifications = JSON.parse(specifications);
            } catch (parseError) {
                console.error('Error parsing specifications:', parseError);
                return res.status(400).json({
                    success: false,
                    message: 'Invalid specifications format'
                });
            }
        }

        // Validate dates
        // const start = new Date(startDate);
        // const end = new Date(endDate);

        // if (end <= start) {
        //     return res.status(400).json({
        //         success: false,
        //         message: 'End date must be after start date'
        //     });
        // }

        // // Validate start date is in future
        // if (start <= new Date()) {
        //     return res.status(400).json({
        //         success: false,
        //         message: 'Start date must be in the future'
        //     });
        // }

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
            specifications: parsedSpecifications, // Use the parsed object
            location,
            videoLink,
            startPrice: parseFloat(startPrice),
            bidIncrement: parseFloat(bidIncrement),
            auctionType,
            // startDate: start,
            // endDate: end,
            seller: seller._id,
            sellerUsername: seller.username,
            photos: uploadedPhotos,
            documents: uploadedDocuments,
            status: 'draft'
        };

        // Add reserve price if applicable
        if (auctionType === 'reserve') {
            auctionData.reservePrice = parseFloat(reservePrice);
        }

        const auction = await Auction.create(auctionData);

        // Schedule activation and ending jobs
        // await agendaService.scheduleAuctionActivation(auction._id, auction.startDate);
        // await agendaService.scheduleAuctionEnd(auction._id, auction.endDate);

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
// export const getAuctions = async (req, res) => {
//     try {
//         const {
//             page = 1,
//             limit = 12,
//             category,
//             status,
//             search,
//             sortBy = 'createdAt',
//             sortOrder = 'desc',
//             // Add specifications filters
//             make,
//             model,
//             yearMin,
//             yearMax,
//             fuelType,
//             engineType,
//             seatingCapacityMin,
//             seatingCapacityMax,
//             // Price filters
//             priceMin,
//             priceMax,
//             location
//         } = req.query;

//         // Build filter object
//         const filter = {};

//         if (category) filter.category = category;
//         if (status) filter.status = status;

//         // Price filtering
//         if (priceMin || priceMax) {
//             filter.currentPrice = {};
//             if (priceMin) filter.currentPrice.$gte = parseFloat(priceMin);
//             if (priceMax) filter.currentPrice.$lte = parseFloat(priceMax);
//         }

//         // Search in title and description
//         if (search) {
//             filter.$or = [
//                 { title: { $regex: search, $options: 'i' } },
//                 { description: { $regex: search, $options: 'i' } }
//             ];
//         }

//         // Location filtering
//         if (location) {
//             filter.location = { $regex: location, $options: 'i' };
//         }

//         // Specifications filtering
//         const specsFilter = {};
//         if (make) specsFilter['specifications.make'] = { $regex: make, $options: 'i' };
//         if (model) specsFilter['specifications.model'] = { $regex: model, $options: 'i' };
//         if (fuelType) specsFilter['specifications.fuelType'] = fuelType;
//         if (engineType) specsFilter['specifications.engineType'] = engineType;

//         // Year range filtering
//         if (yearMin || yearMax) {
//             specsFilter['specifications.year'] = {};
//             if (yearMin) specsFilter['specifications.year'].$gte = parseInt(yearMin);
//             if (yearMax) specsFilter['specifications.year'].$lte = parseInt(yearMax);
//         }

//         // Seating capacity filtering
//         if (seatingCapacityMin || seatingCapacityMax) {
//             specsFilter['specifications.seatingCapacity'] = {};
//             if (seatingCapacityMin) specsFilter['specifications.seatingCapacity'].$gte = parseInt(seatingCapacityMin);
//             if (seatingCapacityMax) specsFilter['specifications.seatingCapacity'].$lte = parseInt(seatingCapacityMax);
//         }

//         // Combine specifications filter with main filter
//         if (Object.keys(specsFilter).length > 0) {
//             filter.$and = filter.$and || [];
//             filter.$and.push(specsFilter);
//         }

//         if (status && status !== 'draft') {
//             filter.status = status;
//         } else {
//             // Only exclude draft if no specific status is selected or if status is not draft
//             filter.status = { $ne: 'draft' };
//         }

//         // Sort options
//         const sortOptions = {};
//         sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

//         const auctions = await Auction.find(filter)
//             .populate('seller', 'username firstName lastName')
//             .populate('currentBidder', 'username')
//             .populate('winner', 'username firstName lastName')
//             .sort(sortOptions)
//         // .limit(limit * 1)
//         // .skip((page - 1) * limit);

//         const total = await Auction.countDocuments(filter);

//         res.status(200).json({
//             success: true,
//             data: {
//                 auctions,
//                 pagination: {
//                     currentPage: parseInt(page),
//                     totalPages: Math.ceil(total / limit),
//                     totalAuctions: total
//                 }
//             }
//         });

//     } catch (error) {
//         console.error('Get auctions error:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Internal server error while fetching auctions'
//         });
//     }
// };

export const getAuctions = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 12,
            category,
            status,
            search,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            // Add specifications filters
            make,
            model,
            yearMin,
            yearMax,
            fuelType,
            engineType,
            seatingCapacityMin,
            seatingCapacityMax,
            // Price filters
            priceMin,
            priceMax,
            location
        } = req.query;

        // Build filter object
        const filter = {};

        if (category) filter.category = category;
        if (status) filter.status = status;

        // Price filtering
        if (priceMin || priceMax) {
            filter.currentPrice = {};
            if (priceMin) filter.currentPrice.$gte = parseFloat(priceMin);
            if (priceMax) filter.currentPrice.$lte = parseFloat(priceMax);
        }

        // Search in title, description, and specifications (make, model, engine)
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { 'specifications.make': { $regex: search, $options: 'i' } },
                { 'specifications.model': { $regex: search, $options: 'i' } },
                { 'specifications.engineType': { $regex: search, $options: 'i' } }
            ];
        }

        // Location filtering
        if (location) {
            filter.location = { $regex: location, $options: 'i' };
        }

        // Specifications filtering
        const specsFilter = {};
        if (make) specsFilter['specifications.make'] = { $regex: make, $options: 'i' };
        if (model) specsFilter['specifications.model'] = { $regex: model, $options: 'i' };
        if (fuelType) specsFilter['specifications.fuelType'] = fuelType;
        if (engineType) specsFilter['specifications.engineType'] = engineType;

        // Year range filtering
        if (yearMin || yearMax) {
            specsFilter['specifications.year'] = {};
            if (yearMin) specsFilter['specifications.year'].$gte = parseInt(yearMin);
            if (yearMax) specsFilter['specifications.year'].$lte = parseInt(yearMax);
        }

        // Seating capacity filtering
        if (seatingCapacityMin || seatingCapacityMax) {
            specsFilter['specifications.seatingCapacity'] = {};
            if (seatingCapacityMin) specsFilter['specifications.seatingCapacity'].$gte = parseInt(seatingCapacityMin);
            if (seatingCapacityMax) specsFilter['specifications.seatingCapacity'].$lte = parseInt(seatingCapacityMax);
        }

        // Combine specifications filter with main filter
        if (Object.keys(specsFilter).length > 0) {
            filter.$and = filter.$and || [];
            filter.$and.push(specsFilter);
        }

        if (status && status !== 'draft') {
            filter.status = status;
        } else {
            // Only exclude draft if no specific status is selected or if status is not draft
            filter.status = { $ne: 'draft' };
        }

        // Sort options
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const auctions = await Auction.find(filter)
            .populate('seller', 'username firstName lastName')
            .populate('currentBidder', 'username')
            .populate('winner', 'username firstName lastName')
            .sort(sortOptions)
        // .limit(limit * 1)
        // .skip((page - 1) * limit);

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

export const getTopLiveAuctions = async (req, res) => {
    try {
        const {
            category,
            status = 'active', // Default to active auctions
            limit = 4,
            sortBy = 'highestBid' // highestBid, mostBids, endingSoon, newest
        } = req.query;

        // Build filter object
        const filter = {};

        // Status filtering
        if (status === 'active') {
            filter.status = 'active';
            filter.endDate = { $gt: new Date() }; // Only auctions that haven't ended
        } else if (status === 'ending_soon') {
            filter.status = 'active';
            filter.endDate = {
                $gt: new Date(),
                $lt: new Date(Date.now() + 24 * 60 * 60 * 1000) // Ending in next 24 hours
            };
        } else if (status === 'sold') {
            filter.status = 'sold';
        } else if (status === 'upcoming') {
            filter.status = 'active';
            filter.startDate = { $gt: new Date() }; // Haven't started yet
        } else {
            // For any other status, use it directly
            filter.status = status;
        }

        // Add category filter if provided
        if (category && category !== 'all') {
            filter.category = category;
        }

        // Build sort options based on sortBy parameter
        const sortOptions = {};
        switch (sortBy) {
            case 'highestBid':
                sortOptions.currentPrice = -1;
                sortOptions.bidCount = -1;
                break;
            case 'mostBids':
                sortOptions.bidCount = -1;
                sortOptions.currentPrice = -1;
                break;
            case 'endingSoon':
                sortOptions.endDate = 1;
                sortOptions.currentPrice = -1;
                break;
            case 'newest':
                sortOptions.createdAt = -1;
                sortOptions.currentPrice = -1;
                break;
            case 'lowestBid':
                sortOptions.currentPrice = 1;
                sortOptions.bidCount = -1;
                break;
            default:
                sortOptions.currentPrice = -1;
                sortOptions.bidCount = -1;
        }

        // Get auctions based on filters and sort
        let auctions = await Auction.find(filter)
            .populate('seller', 'username firstName lastName')
            .populate('currentBidder', 'username firstName')
            .sort(sortOptions)
            .limit(parseInt(limit));

        // If we don't have enough auctions and we're looking for active/ending_soon, 
        // try to fill with other active auctions
        if (auctions.length < parseInt(limit) && (status === 'active' || status === 'ending_soon')) {
            const additionalFilter = {
                status: 'active',
                endDate: { $gt: new Date() },
                _id: { $nin: auctions.map(a => a._id) } // Exclude already fetched auctions
            };

            if (category && category !== 'all') {
                additionalFilter.category = category;
            }

            const additionalAuctions = await Auction.find(additionalFilter)
                .populate('seller', 'username firstName lastName')
                .populate('currentBidder', 'username firstName')
                .sort({
                    createdAt: -1, // Get newest first as fallback
                    startDate: 1
                })
                .limit(parseInt(limit) - auctions.length);

            auctions.push(...additionalAuctions);
        }

        res.status(200).json({
            success: true,
            data: {
                auctions,
                total: auctions.length,
                filters: {
                    category: category || 'all',
                    status,
                    sortBy,
                    limit: parseInt(limit)
                }
            }
        });

    } catch (error) {
        console.error('Get top live auctions error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching top live auctions'
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
        if (auction.status === 'active') {
            return res.status(401).json({
                success: false,
                message: `Active auction can't be updated.`
            });
        }

        const {
            title,
            category,
            description,
            specifications,
            location,
            videoLink,
            startPrice,
            bidIncrement,
            auctionType,
            reservePrice,
            startDate,
            endDate,
            removedPhotos, // New field
            removedDocuments // New field
        } = req.body;

        // Basic validation
        if (!title || !category || !description || !startPrice || !bidIncrement || !auctionType || !startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'All required fields must be provided'
            });
        }

        // Handle specifications
        let finalSpecifications = new Map();

        // Convert existing specifications to Map if they exist
        if (auction.specifications && auction.specifications instanceof Map) {
            auction.specifications.forEach((value, key) => {
                if (value !== null && value !== undefined && value !== '') {
                    finalSpecifications.set(key, value);
                }
            });
        } else if (auction.specifications && typeof auction.specifications === 'object') {
            Object.entries(auction.specifications).forEach(([key, value]) => {
                if (value !== null && value !== undefined && value !== '') {
                    finalSpecifications.set(key, value);
                }
            });
        }

        // Parse and merge new specifications
        if (specifications) {
            try {
                let newSpecs;
                if (typeof specifications === 'string') {
                    newSpecs = JSON.parse(specifications);
                } else {
                    newSpecs = specifications;
                }

                if (typeof newSpecs === 'object' && newSpecs !== null) {
                    Object.entries(newSpecs).forEach(([key, value]) => {
                        if (value !== null && value !== undefined && value !== '') {
                            finalSpecifications.set(key, value.toString());
                        } else {
                            finalSpecifications.delete(key);
                        }
                    });
                }
            } catch (parseError) {
                console.error('Error parsing specifications:', parseError);
                return res.status(400).json({
                    success: false,
                    message: 'Invalid specifications format'
                });
            }
        }

        // Handle removed photos
        let finalPhotos = [...auction.photos];
        if (removedPhotos) {
            try {
                const removedPhotoIds = typeof removedPhotos === 'string'
                    ? JSON.parse(removedPhotos)
                    : removedPhotos;

                if (Array.isArray(removedPhotoIds)) {
                    // Remove photos from the array and delete from Cloudinary
                    for (const photoId of removedPhotoIds) {
                        const photoIndex = finalPhotos.findIndex(photo =>
                            photo.publicId === photoId || photo._id?.toString() === photoId
                        );

                        if (photoIndex > -1) {
                            const removedPhoto = finalPhotos[photoIndex];
                            // Delete from Cloudinary
                            if (removedPhoto.publicId) {
                                await deleteFromCloudinary(removedPhoto.publicId);
                            }
                            finalPhotos.splice(photoIndex, 1);
                        }
                    }
                }
            } catch (error) {
                console.error('Error processing removed photos:', error);
            }
        }

        // Handle removed documents
        let finalDocuments = [...auction.documents];
        if (removedDocuments) {
            try {
                const removedDocIds = typeof removedDocuments === 'string'
                    ? JSON.parse(removedDocuments)
                    : removedDocuments;

                if (Array.isArray(removedDocIds)) {
                    for (const docId of removedDocIds) {
                        const docIndex = finalDocuments.findIndex(doc =>
                            doc.publicId === docId || doc._id?.toString() === docId
                        );

                        if (docIndex > -1) {
                            const removedDoc = finalDocuments[docIndex];
                            // Delete from Cloudinary
                            if (removedDoc.publicId) {
                                await deleteFromCloudinary(removedDoc.publicId);
                            }
                            finalDocuments.splice(docIndex, 1);
                        }
                    }
                }
            } catch (error) {
                console.error('Error processing removed documents:', error);
            }
        }

        // Handle new photo uploads
        if (req.files && req.files.photos) {
            for (const photo of req.files.photos) {
                try {
                    const result = await uploadImageToCloudinary(photo.buffer, 'auction-photos');
                    finalPhotos.push({
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

        // Handle new document uploads
        if (req.files && req.files.documents) {
            for (const doc of req.files.documents) {
                try {
                    const result = await uploadDocumentToCloudinary(doc.buffer, doc.originalname, 'auction-documents');
                    finalDocuments.push({
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

        // Validate dates
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (end <= start) {
            return res.status(400).json({
                success: false,
                message: 'End date must be after start date'
            });
        }

        if (start <= new Date() && new Date(auction.startDate).getTime() !== start.getTime()) {
            return res.status(400).json({
                success: false,
                message: 'Start date must be in the future'
            });
        }

        if (auctionType === 'reserve' && (!reservePrice || reservePrice < startPrice)) {
            return res.status(400).json({
                success: false,
                message: 'Reserve price must be provided and greater than start price'
            });
        }

        // Prepare update data
        const updateData = {
            title,
            category,
            description,
            specifications: finalSpecifications,
            location,
            videoLink,
            startPrice: parseFloat(startPrice),
            bidIncrement: parseFloat(bidIncrement),
            auctionType,
            startDate: start,
            endDate: end,
            photos: finalPhotos,
            documents: finalDocuments,
            status: 'draft'
        };

        // Add reserve price if applicable
        if (auctionType === 'reserve') {
            updateData.reservePrice = parseFloat(reservePrice);
        } else {
            updateData.reservePrice = undefined;
        }

        const updatedAuction = await Auction.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('seller', 'username firstName lastName');

        // Reschedule jobs if dates changed
        if (start.getTime() !== new Date(auction.startDate).getTime() ||
            end.getTime() !== new Date(auction.endDate).getTime()) {

            await agendaService.cancelAuctionJobs(auction._id);
            await agendaService.scheduleAuctionActivation(auction._id, start);
            await agendaService.scheduleAuctionEnd(auction._id, end);
        }

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

        // Store previous highest bidder before placing new bid
        const previousHighestBidder = auction.currentBidder;
        const previousBidders = [...new Set(auction.bids.map(bid => bid.bidder.toString()))];

        // Place bid using the model method
        await auction.placeBid(bidder._id, bidder.username, parseFloat(amount));

        // Populate the updated auction
        await auction.populate('currentBidder', 'username firstName email');

        res.status(200).json({
            success: true,
            message: 'Bid placed successfully',
            data: { auction }
        });

        // Send bid confirmation to the current bidder
        await bidConfirmationEmail(
            bidder.email,
            bidder.username,
            auction.title,
            amount,
            auction.currentPrice,
            auction.endDate
        );

        // Send outbid notifications to previous bidders (except current bidder)
        if (previousHighestBidder && previousHighestBidder.toString() !== bidder._id.toString()) {
            await sendOutbidNotifications(
                auction,
                previousHighestBidder,
                previousBidders,
                bidder._id.toString(),
                amount
            );
        }

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
        if (status && status.trim() !== '') {
            filter.status = status;
        }

        const auctions = await Auction.find(filter)
            .populate('currentBidder', 'username firstName image')
            .populate('winner', 'username firstName lastName image')
            .populate('bids.bidder', 'username firstName lastName email image company')
            .sort({ createdAt: -1 })
        // .limit(limit * 1)
        // .skip((page - 1) * limit);

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

// Detailed bidding stats
export const getBiddingStats = async (req, res) => {
    try {
        const userId = req.user._id;
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        // Basic counts - FIXED: Remove userId from these queries
        const activeAuctions = await Auction.countDocuments({
            status: 'active',
            endDate: { $gt: now }
        });

        const endingSoon = await Auction.countDocuments({
            status: 'active',
            endDate: {
                $gt: now,
                $lt: new Date(now.getTime() + 24 * 60 * 60 * 1000)
            }
        });

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const newToday = await Auction.countDocuments({
            status: 'active',
            createdAt: { $gte: today }
        });

        const totalBidders = await User.countDocuments({ userType: 'bidder' });

        // Bidder-specific analytics - FIXED: Proper aggregation
        const myTotalBidsResult = await Auction.aggregate([
            {
                $match: {
                    'bids.bidder': userId
                }
            },
            {
                $project: {
                    userBids: {
                        $filter: {
                            input: '$bids',
                            as: 'bid',
                            cond: { $eq: ['$$bid.bidder', userId] }
                        }
                    }
                }
            },
            {
                $project: {
                    bidCount: { $size: '$userBids' }
                }
            },
            {
                $group: {
                    _id: null,
                    totalBids: { $sum: '$bidCount' }
                }
            }
        ]);

        const myWinningAuctions = await Auction.countDocuments({
            winner: userId,
            status: 'sold'
        });

        const myActiveBids = await Auction.countDocuments({
            'bids.bidder': userId,
            status: 'active',
            endDate: { $gt: now }
        });

        // Recent activity (last 30 days) - FIXED: Proper aggregation
        const recentBids = await Auction.aggregate([
            {
                $match: {
                    'bids.bidder': userId,
                    'bids.timestamp': { $gte: thirtyDaysAgo }
                }
            },
            { $unwind: '$bids' },
            {
                $match: {
                    'bids.bidder': userId,
                    'bids.timestamp': { $gte: thirtyDaysAgo }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$bids.timestamp" }
                    },
                    bidsCount: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const myTotalBids = myTotalBidsResult[0]?.totalBids || 0;
        const bidSuccessRate = myTotalBids > 0 ?
            ((myWinningAuctions / myTotalBids) * 100).toFixed(1) : 0;

        res.status(200).json({
            success: true,
            data: {
                // Basic stats
                activeAuctions,
                newToday,
                endingSoon,
                totalBidders,

                // Bidder personal stats
                myTotalBids,
                myWinningAuctions,
                myActiveBids,

                // Analytics
                bidSuccessRate: parseFloat(bidSuccessRate),

                // Recent activity
                recentBiddingActivity: recentBids,

                lastUpdated: new Date()
            }
        });

    } catch (error) {
        console.error('Get bidding stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching bidding stats'
        });
    }
};

// Get user's won auctions
export const getWonAuctions = async (req, res) => {
    try {
        const userId = req.user._id;
        const { page = 1, limit = 12, status, search } = req.query;

        // Build filter for auctions won by user
        const filter = {
            winner: userId,
            status: { $in: ['sold', 'ended'] } // Include both sold and ended auctions where user won
        };

        // Add status filter if provided
        if (status && status !== 'all') {
            // Map frontend status to backend status
            const statusMap = {
                'payment_pending': 'sold',
                'paid': 'sold',
                'shipped': 'sold',
                'delivered': 'sold'
            };
            filter.status = statusMap[status] || status;
        }

        // Add search filter
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } }
            ];
        }

        const auctions = await Auction.find(filter)
            .populate('seller', 'username firstName lastName email phone createdAt')
            .populate('winner', 'username firstName lastName')
            .populate('currentBidder', 'username firstName')
            .sort({ endDate: -1 })
        // .limit(limit * 1)
        // .skip((page - 1) * limit);

        const total = await Auction.countDocuments(filter);

        // Transform data to match frontend structure
        const transformedAuctions = auctions.map(auction => ({
            _id: auction._id.toString(),
            auctionId: `AU${auction._id.toString().slice(-6).toUpperCase()}`,
            title: auction.title,
            description: auction.description,
            category: auction.category,
            finalBid: auction.finalPrice || auction.currentPrice,
            startingBid: auction.startPrice,
            yourMaxBid: getMaxBidForUser(auction.bids, userId),
            winningBid: auction.finalPrice || auction.currentPrice,
            bids: auction.bidCount,
            watchers: auction.watchlistCount,
            endTime: auction.endDate,
            winTime: auction.endDate,
            image: auction.photos.length > 0 ? auction.photos[0].url : '/api/placeholder/400/300',
            location: auction.location,
            seller: {
                name: auction.seller.firstName && auction.seller.lastName
                    ? `${auction.seller.firstName} ${auction.seller.lastName}`
                    : auction.seller.username,
                memberSince: auction.seller.createdAt || '2025',
                email: auction.seller.email,
                phone: auction.seller.phone,
            },
            condition: auction.specifications.get('condition') || 'Good',
            congratulatoryMessage: generateCongratulatoryMessage(auction)
        }));

        // Calculate statistics
        const totalWon = total;
        const totalSpent = auctions.reduce((sum, auction) => sum + (auction.finalPrice || auction.currentPrice), 0);
        const averageSavings = auctions.length > 0 ?
            auctions.reduce((sum, auction) => sum + (auction.startPrice / (auction.finalPrice || auction.currentPrice)), 0) / auctions.length : 0;

        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const recentWins = auctions.filter(auction => new Date(auction.endDate) > weekAgo).length;

        res.status(200).json({
            success: true,
            data: {
                auctions: transformedAuctions,
                statistics: {
                    totalWon,
                    totalSpent,
                    averageSavings,
                    recentWins
                },
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalAuctions: total
                }
            }
        });

    } catch (error) {
        console.error('Get won auctions error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching won auctions'
        });
    }
};

// Helper function to get user's max bid
const getMaxBidForUser = (bids, userId) => {
    const userBids = bids.filter(bid => bid.bidder.toString() === userId.toString());
    if (userBids.length === 0) return 0;
    return Math.max(...userBids.map(bid => bid.amount));
};

// Helper function to generate congratulatory messages
const generateCongratulatoryMessage = (auction) => {
    const messages = {
        'Aircraft': 'Congratulations on winning this magnificent aircraft!',
        'Engines & Parts': 'Outstanding win! This is a fantastic addition to any collection.',
        'Aviation Memorabilia': 'Fantastic win! This piece is in impeccable condition and holds great historical value.'
    };

    return messages[auction.category] || 'Congratulations on your winning bid!';
};

// Get seller's sold auctions
export const getSoldAuctions = async (req, res) => {
    try {
        const sellerId = req.user._id;
        const { page = 1, limit = 12, status, search } = req.query;

        // Build filter for auctions sold by this seller
        const filter = {
            seller: sellerId,
            status: { $in: ['sold', 'ended'] } // Auctions that have been sold or ended
        };

        // Add status filter if provided
        if (status && status !== 'all') {
            const statusMap = {
                'sold': 'sold',
                'ended': 'ended',
                'reserve_not_met': 'reserve_not_met'
            };
            filter.status = statusMap[status] || status;
        }

        // Add search filter
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } }
            ];
        }

        const auctions = await Auction.find(filter)
            .populate('seller', 'username firstName lastName email phone createdAt')
            .populate('winner', 'username firstName lastName email phone image company address')
            .populate('currentBidder', 'username firstName')
            .populate('bids.bidder', 'username firstName lastName email phone company')
            .sort({ endDate: -1 })
        // .limit(limit * 1)
        // .skip((page - 1) * limit);

        const total = await Auction.countDocuments(filter);

        // Transform data to match frontend structure for seller's won auctions page
        const transformedAuctions = auctions.map(auction => {
            // Get all unique bidders with their highest bid
            const uniqueBidders = auction.bids.reduce((acc, bid) => {
                const bidderId = bid.bidder?._id?.toString();
                if (bidderId && bid.bidder?._id) {
                    const existing = acc.find(b => b.id === bidderId);
                    if (!existing || bid.amount > existing.finalBid) {
                        // Remove existing and add new highest bid
                        const filtered = acc.filter(b => b.id !== bidderId);
                        return [...filtered, {
                            id: bidderId,
                            name: bid.bidder.firstName && bid.bidder.lastName
                                ? `${bid.bidder.firstName} ${bid.bidder.lastName}`
                                : bid.bidder.username,
                            username: bid.bidder.username,
                            email: bid.bidder.email,
                            image: bid.bidder.image,
                            phone: bid.bidder.phone,
                            company: bid.bidder.company,
                            address: bid.bidder.address,
                            finalBid: bid.amount,
                            bidTime: bid.timestamp,
                            isWinner: auction.winner?._id?.toString() === bidderId
                        }];
                    }
                }
                return acc;
            }, []);

            // Sort bidders by final bid (highest first)
            const sortedBidders = uniqueBidders.sort((a, b) => b.finalBid - a.finalBid);

            return {
                id: auction._id.toString(),
                auctionId: `AV${auction._id.toString().slice(-6).toUpperCase()}`,
                title: auction.title,
                description: auction.description,
                category: auction.category,
                auctionType: auction.auctionType === 'reserve' ? 'Reserve Auction' : 'Standard Auction',
                reservePrice: auction.reservePrice,
                startingBid: auction.startPrice,
                winningBid: auction.finalPrice || auction.currentPrice,
                startTime: auction.startDate,
                endTime: auction.endDate,
                winner: auction.winner ? {
                    id: auction.winner._id.toString(),
                    name: auction.winner.firstName && auction.winner.lastName
                        ? `${auction.winner.firstName} ${auction.winner.lastName}`
                        : auction.winner.username,
                    username: auction.winner.username,
                    email: auction.winner.email,
                    image: auction.winner.image,
                    phone: auction.winner.phone,
                    company: auction.winner.company,
                    address: auction.winner.address,
                    ip: "Not Available", // IP might not be stored
                    bidHistory: auction.bids
                        .filter(bid => bid.bidder?._id?.toString() === auction.winner?._id?.toString())
                        .map(bid => ({
                            amount: bid.amount,
                            time: bid.timestamp
                        }))
                        .sort((a, b) => new Date(a.time) - new Date(b.time))
                } : null,
                bidders: sortedBidders.filter(bidder =>
                    !auction.winner || bidder.id !== auction.winner._id?.toString()
                )
            };
        });

        // Calculate statistics for seller
        const totalSold = total;
        const totalRevenue = auctions.reduce((sum, auction) => sum + (auction.finalPrice || auction.currentPrice || 0), 0);
        const averageSalePrice = totalSold > 0 ? totalRevenue / totalSold : 0;

        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const recentSales = auctions.filter(auction => new Date(auction.endDate) > weekAgo).length;

        res.status(200).json({
            success: true,
            data: {
                auctions: transformedAuctions,
                statistics: {
                    totalSold,
                    totalRevenue,
                    averageSalePrice,
                    recentSales
                },
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalAuctions: total
                }
            }
        });

    } catch (error) {
        console.error('Get sold auctions error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching sold auctions'
        });
    }
};
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import path from 'path';

// Configure Cloudinary
export const configureCloudinary = async () => {
    try {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });
        console.log('Cloudinary configured successfully');
    } catch (error) {
        console.error('Cloudinary configuration failed:', error);
        throw new Error('Cloudinary configuration failed');
    }
};

// Upload images (photos) - uses 'image' resource_type
export const uploadImageToCloudinary = (buffer, folder = 'auction-photos') => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { 
                folder,
                resource_type: 'image',
                quality: 'auto',
                fetch_format: 'auto'
            },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );
        
        streamifier.createReadStream(buffer).pipe(uploadStream);
    });
};

export const uploadDocumentToCloudinary = (buffer, originalName, folder = 'auction-documents') => {
    return new Promise((resolve, reject) => {
        const originalNameWithoutExt = path.parse(originalName).name;
        const extension = path.parse(originalName).ext;
        
        const publicId = `${originalNameWithoutExt}-${Date.now()}${extension}`;

        // Different settings for PDF vs other files
        const isPDF = originalName.toLowerCase().endsWith('.pdf');
        
        const uploadOptions = {
            folder,
            resource_type: 'raw',
            public_id: publicId,
        };

        // For PDFs, use minimal settings to avoid security flags
        if (isPDF) {
            console.log('📄 PDF detected - using minimal upload settings');
            // Remove these parameters for PDFs
            delete uploadOptions.use_filename;
            delete uploadOptions.unique_filename;
        } else {
            // For other files, use normal settings
            uploadOptions.use_filename = true;
            uploadOptions.unique_filename = false;
        }

        // Remove these lines entirely - they might be causing issues
        // type: 'upload', 
        // access_mode: 'public'

        const uploadStream = cloudinary.uploader.upload_stream(
            uploadOptions,
            (error, result) => {
                if (error) {
                    console.error('❌ Upload failed:', error);
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        );
        
        streamifier.createReadStream(buffer).pipe(uploadStream);
    });
};

// Generic upload function that auto-detects file type
export const uploadToCloudinary = (buffer, originalName, folder = 'auctions') => {
    return new Promise((resolve, reject) => {
        const fileExtension = path.extname(originalName).toLowerCase();
        const isImage = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'].includes(fileExtension);
        
        const originalNameWithoutExt = path.parse(originalName).name;
        const publicId = `${originalNameWithoutExt}-${Date.now()}${fileExtension}`;

        const uploadOptions = {
            folder,
            public_id: publicId,
            resource_type: isImage ? 'image' : 'raw',
            ...(isImage ? { quality: 'auto', fetch_format: 'auto' } : {})
        };

        const uploadStream = cloudinary.uploader.upload_stream(
            uploadOptions,
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );
        
        streamifier.createReadStream(buffer).pipe(uploadStream);
    });
};

// Delete from Cloudinary
export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
    try {
        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType
        });
        return result;
    } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
        throw error;
    }
};

// Delete multiple files
export const deleteMultipleFromCloudinary = async (publicIds, resourceType = 'image') => {
    try {
        const results = await Promise.all(
            publicIds.map(publicId => 
                cloudinary.uploader.destroy(publicId, { resource_type: resourceType })
            )
        );
        return results;
    } catch (error) {
        console.error('Error deleting multiple files from Cloudinary:', error);
        throw error;
    }
};
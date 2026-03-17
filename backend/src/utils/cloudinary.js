// import { v2 as cloudinary } from 'cloudinary';
// import streamifier from 'streamifier';
// import path from 'path';

// // Configure Cloudinary
// export const configureCloudinary = async () => {
//     try {
//         cloudinary.config({
//             cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//             api_key: process.env.CLOUDINARY_API_KEY,
//             api_secret: process.env.CLOUDINARY_API_SECRET
//         });
//         console.log('Cloudinary configured successfully');
//     } catch (error) {
//         console.error('Cloudinary configuration failed:', error);
//         throw new Error('Cloudinary configuration failed');
//     }
// };

// // Upload images (photos) - uses 'image' resource_type
// export const uploadImageToCloudinary = (buffer, folder = 'auction-photos') => {
//     return new Promise((resolve, reject) => {
//         const uploadStream = cloudinary.uploader.upload_stream(
//             {
//                 folder,
//                 resource_type: 'image',
//                 quality: 'auto',
//                 fetch_format: 'auto'
//             },
//             (error, result) => {
//                 if (error) reject(error);
//                 else resolve(result);
//             }
//         );

//         streamifier.createReadStream(buffer).pipe(uploadStream);
//     });
// };

// export const uploadDocumentToCloudinary = (buffer, originalName, folder = 'auction-documents') => {
//     return new Promise((resolve, reject) => {
//         const originalNameWithoutExt = path.parse(originalName).name;
//         const extension = path.parse(originalName).ext;

//         const publicId = `${originalNameWithoutExt}-${Date.now()}${extension}`;

//         // Different settings for PDF vs other files
//         const isPDF = originalName.toLowerCase().endsWith('.pdf');

//         const uploadOptions = {
//             folder,
//             resource_type: 'raw',
//             public_id: publicId,
//         };

//         // For PDFs, use minimal settings to avoid security flags
//         if (isPDF) {
//             console.log('📄 PDF detected - using minimal upload settings');
//             // Remove these parameters for PDFs
//             delete uploadOptions.use_filename;
//             delete uploadOptions.unique_filename;
//         } else {
//             // For other files, use normal settings
//             uploadOptions.use_filename = true;
//             uploadOptions.unique_filename = false;
//         }

//         // Remove these lines entirely - they might be causing issues
//         // type: 'upload',
//         // access_mode: 'public'

//         const uploadStream = cloudinary.uploader.upload_stream(
//             uploadOptions,
//             (error, result) => {
//                 if (error) {
//                     console.error('❌ Upload failed:', error);
//                     reject(error);
//                 } else {
//                     resolve(result);
//                 }
//             }
//         );

//         streamifier.createReadStream(buffer).pipe(uploadStream);
//     });
// };

// // Generic upload function that auto-detects file type
// export const uploadToCloudinary = (buffer, originalName, folder = 'auctions') => {
//     return new Promise((resolve, reject) => {
//         const fileExtension = path.extname(originalName).toLowerCase();
//         const isImage = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'].includes(fileExtension);

//         const originalNameWithoutExt = path.parse(originalName).name;
//         const publicId = `${originalNameWithoutExt}-${Date.now()}${fileExtension}`;

//         const uploadOptions = {
//             folder,
//             public_id: publicId,
//             resource_type: isImage ? 'image' : 'raw',
//             ...(isImage ? { quality: 'auto', fetch_format: 'auto' } : {})
//         };

//         const uploadStream = cloudinary.uploader.upload_stream(
//             uploadOptions,
//             (error, result) => {
//                 if (error) reject(error);
//                 else resolve(result);
//             }
//         );

//         streamifier.createReadStream(buffer).pipe(uploadStream);
//     });
// };

// // Delete from Cloudinary
// export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
//     try {
//         const result = await cloudinary.uploader.destroy(publicId, {
//             resource_type: resourceType
//         });
//         return result;
//     } catch (error) {
//         console.error('Error deleting from Cloudinary:', error);
//         throw error;
//     }
// };

// // Delete multiple files
// export const deleteMultipleFromCloudinary = async (publicIds, resourceType = 'image') => {
//     try {
//         const results = await Promise.all(
//             publicIds.map(publicId =>
//                 cloudinary.uploader.destroy(publicId, { resource_type: resourceType })
//             )
//         );
//         return results;
//     } catch (error) {
//         console.error('Error deleting multiple files from Cloudinary:', error);
//         throw error;
//     }
// };

import {
  PutObjectCommand,
  DeleteObjectCommand,
  S3Client,
  ListBucketsCommand,
  HeadBucketCommand,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import path from "path";
import { r2Client, BUCKET_NAME } from "./r2Client.js";

// Get custom domain from environment variables
const R2_PUBLIC_URL =
  process.env.R2_PUBLIC_URL ||
  `https://${BUCKET_NAME}.${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;

// Configure R2 client with actual connection test
export const configureR2 = async () => {
  try {
    // Test the connection by checking if your specific bucket exists and is accessible
    const command = new HeadBucketCommand({
      Bucket: BUCKET_NAME,
    });

    await r2Client.send(command);
    console.log("✅ R2 configured successfully");
    return true;
  } catch (error) {
    console.error("❌ R2 configuration failed:", error);
    throw new Error(`R2 configuration failed: ${error.message}`);
  }
};

// Helper function to determine content type
const getContentType = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".pdf": "application/pdf",
    ".doc": "application/msword",
    ".docx":
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".txt": "text/plain",
  };
  return mimeTypes[ext] || "application/octet-stream";
};

// Upload images (photos)
export const uploadImageToR2 = async (buffer, folder = 'auction-photos', originalName = 'image.jpg') => {
    try {
        const extension = path.extname(originalName);
        const originalNameWithoutExt = path.parse(originalName).name;
        const key = `${folder}/${originalNameWithoutExt}-${Date.now()}${extension}`;
        const contentType = getContentType(originalName);

        const upload = new Upload({
            client: r2Client,
            params: {
                Bucket: BUCKET_NAME,
                Key: key,
                Body: buffer,
                ContentType: contentType,
            },
        });

        const result = await upload.done();
        
        return {
            secure_url: `${R2_PUBLIC_URL}/${key}`,
            public_id: key,
            format: extension.replace('.', ''),
            bytes: buffer.length,
        };
    } catch (error) {
        console.error('Error uploading to R2:', error);
        throw error;
    }
};

// Upload documents (PDFs, etc.)
export const uploadDocumentToR2 = async (
  buffer,
  originalName,
  folder = "auction-documents",
) => {
  try {
    const originalNameWithoutExt = path.parse(originalName).name;
    const extension = path.extname(originalName);
    const key = `${folder}/${originalNameWithoutExt}-${Date.now()}${extension}`;
    const contentType = getContentType(originalName);

    const upload = new Upload({
      client: r2Client,
      params: {
        Bucket: BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      },
    });

    const result = await upload.done();

    console.log("✅ Document uploaded successfully:", key);

    return {
      secure_url: `${R2_PUBLIC_URL}/${key}`,
      public_id: key,
      format: extension.replace(".", ""),
      bytes: buffer.length,
    };
  } catch (error) {
    console.error("❌ Upload failed:", error);
    throw error;
  }
};

// Generic upload function that auto-detects file type
export const uploadToR2 = async (buffer, originalName, folder = "auctions") => {
  try {
    const fileExtension = path.extname(originalName).toLowerCase();
    const isImage = [
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".bmp",
      ".webp",
      ".svg",
    ].includes(fileExtension);

    const originalNameWithoutExt = path.parse(originalName).name;
    const key = `${folder}/${originalNameWithoutExt}-${Date.now()}${fileExtension}`;
    const contentType = getContentType(originalName);

    const upload = new Upload({
      client: r2Client,
      params: {
        Bucket: BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      },
    });

    const result = await upload.done();

    return {
      secure_url: `${R2_PUBLIC_URL}/${key}`,
      public_id: key,
      format: fileExtension.replace(".", ""),
      bytes: buffer.length,
      resource_type: isImage ? "image" : "raw",
    };
  } catch (error) {
    console.error("Error uploading to R2:", error);
    throw error;
  }
};

// Delete from R2
export const deleteFromR2 = async (publicId, resourceType = "image") => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: publicId,
    });

    const result = await r2Client.send(command);
    return { result: "ok" }; // Simulate Cloudinary response
  } catch (error) {
    console.error("Error deleting from R2:", error);
    throw error;
  }
};

// Delete multiple files
export const deleteMultipleFromR2 = async (
  publicIds,
  resourceType = "image",
) => {
  try {
    const results = await Promise.all(
      publicIds.map((publicId) => deleteFromR2(publicId, resourceType)),
    );
    return results;
  } catch (error) {
    console.error("Error deleting multiple files from R2:", error);
    throw error;
  }
};

// For backward compatibility - keep the same function names
export const configureCloudinary = configureR2;
export const uploadImageToCloudinary = uploadImageToR2;
export const uploadDocumentToCloudinary = uploadDocumentToR2;
export const uploadToCloudinary = uploadToR2;
export const deleteFromCloudinary = deleteFromR2;
export const deleteMultipleFromCloudinary = deleteMultipleFromR2;

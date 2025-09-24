import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";
import path from 'path';
import streamifier from 'streamifier';

const configureCloudinary = async () => {
    try {
        const configured = cloudinary.config({
            cloud_name: `${process.env.CLOUDINARY_CLOUD_NAME}`,
            api_key: `${process.env.CLOUDINARY_API_KEY}`,
            api_secret: `${process.env.CLOUDINARY_API_SECRET}`
        });

        if (configured) {
            console.log('Cloudinary configured.');
        }
    } catch (error) {
        throw new Error(error);
    }
}

const uploadOnCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: 'image' },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

const uploadDocsOnCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const originalName = path.parse(file.originalname).name;
    const extension = path.parse(file.originalname).ext;

    const publicId = `${originalName}-${Date.now()}${extension}`;

    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'raw',
        use_filename: true,
        unique_filename: false,
        public_id: publicId,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      }
    );

    streamifier.createReadStream(file.buffer).pipe(stream);
  });
};


export { configureCloudinary, uploadOnCloudinary, uploadDocsOnCloudinary }
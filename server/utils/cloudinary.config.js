import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from 'dotenv';

dotenv.config();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = async (filePath) => {
  try {
    if (!filePath) return null;

    const response = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
    });

    console.log("File uploaded Successfully");
    fs.existsSync(filePath) && fs.unlinkSync(filePath);

    return response;
  } catch (error) {
    console.error("Cloudinary upload failed:", error.message);

    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (unlinkErr) {
        console.error("Failed to delete local file:", unlinkErr.message);
      }
    }

    return null;
  }
};

const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return null;

    const response = await cloudinary.uploader.destroy(publicId);
    console.log("File deleted Successfully from Cloudinary");

    return response;
  } catch (error) {
    console.error("Cloudinary delete failed:", error.message);
    return null;
  }
};

export { uploadToCloudinary, deleteFromCloudinary };
import { v2 as cloudinary } from "cloudinary";

// Parse CLOUDINARY_URL format: cloudinary://api_key:api_secret@cloud_name
const cloudinaryUrl = process.env.CLOUDINARY_URL || "";
const match = cloudinaryUrl.match(/cloudinary:\/\/(\d+):([^@]+)@(.+)/);

if (match) {
  const [, apiKey, apiSecret, cloudName] = match;
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
} else {
  console.warn("⚠️ CLOUDINARY_URL not properly configured");
}

export { cloudinary };

/**
 * Upload a file buffer to Cloudinary
 * @param buffer - The file buffer to upload
 * @param folder - Optional folder name in Cloudinary (default: "Devevent")
 * @returns Promise with the secure_url of the uploaded image
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  folder: string = "Devevent"
): Promise<string> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        { resource_type: "image", folder },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error("Upload failed"));
          resolve(result.secure_url);
        }
      )
      .end(buffer);
  });
}

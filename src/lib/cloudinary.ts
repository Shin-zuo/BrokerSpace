import { v2 as cloudinary } from 'cloudinary';

// CLOUDINARY_URL is automatically picked up by the SDK if it's set in the environment.
// However, we can also explicitly configure it just to be safe.
cloudinary.config({
  secure: true,
});

export async function uploadImage(buffer: Buffer, folder: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        if (result) return resolve(result.secure_url);
        reject(new Error("Cloudinary upload failed with no result"));
      }
    );
    uploadStream.end(buffer);
  });
}

export { cloudinary };

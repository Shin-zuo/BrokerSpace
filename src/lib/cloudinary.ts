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

export async function deleteImage(url: string): Promise<void> {
  try {
    const parts = url.split('/upload/');
    if (parts.length === 2) {
      const pathParts = parts[1].split('/');
      if (pathParts[0].startsWith('v') && !isNaN(parseInt(pathParts[0].substring(1)))) {
        pathParts.shift();
      }
      const fullPath = pathParts.join('/');
      const publicId = fullPath.substring(0, fullPath.lastIndexOf('.'));
      
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
        console.log("Successfully deleted Cloudinary image:", publicId);
      }
    }
  } catch (error) {
    console.error('Failed to delete image from Cloudinary:', error);
  }
}

export { cloudinary };

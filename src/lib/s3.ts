import { S3Client } from "@aws-sdk/client-s3";

if (!process.env.S3_ENDPOINT || !process.env.S3_REGION || !process.env.S3_ACCESS_KEY_ID || !process.env.S3_SECRET_ACCESS_KEY) {
  throw new Error("Missing MinIO/S3 environment variables");
}

export const s3Client = new S3Client({
  region: process.env.S3_REGION,
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: true, // Required for MinIO
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
});

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

export async function uploadImage(buffer: Buffer, folder: string, mimeType: string = "image/jpeg"): Promise<string> {
  const fileName = `${folder}/${uuidv4()}`;
  const bucket = process.env.S3_BUCKET_NAME || "sg-brokerspace";
  
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: fileName,
    Body: buffer,
    ContentType: mimeType,
  });

  await s3Client.send(command);
  
  // Return the public URL for the MinIO object
  // Assuming the bucket is public or we serve via proxy
  return `${process.env.S3_ENDPOINT}/${bucket}/${fileName}`;
}

import { DeleteObjectCommand } from "@aws-sdk/client-s3";

export async function deleteImage(url: string): Promise<void> {
  const bucket = process.env.S3_BUCKET_NAME || "sg-brokerspace";
  
  try {
    // Extract key from URL
    // e.g. http://localhost:9002/sg-brokerspace/folder/image-uuid
    const urlParts = url.split(`/${bucket}/`);
    if (urlParts.length === 2) {
      const key = urlParts[1];
      const command = new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      });
      await s3Client.send(command);
    }
  } catch (error) {
    console.error("Failed to delete from S3:", error);
  }
}

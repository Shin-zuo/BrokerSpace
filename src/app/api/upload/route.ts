import { NextRequest, NextResponse } from 'next/server';
import { uploadImage } from '@/src/lib/s3';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    try {
      const publicUrl = await uploadImage(buffer, "sg-brokerspace/profiles");
      return NextResponse.json({ url: publicUrl });
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

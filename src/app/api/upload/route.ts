import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const fileExtension = file.name.split('.').pop() || 'png';
    const uniqueFilename = `${Date.now()}-${Math.round(Math.random() * 1000)}.${fileExtension}`;
    
    // Ensure directory exists
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'profiles');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const filepath = join(uploadDir, uniqueFilename);
    await writeFile(filepath, buffer);

    const publicUrl = `/uploads/profiles/${uniqueFilename}`;

    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

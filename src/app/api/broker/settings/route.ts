import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { getSession } from '@/src/lib/auth';
import { deleteImage } from '@/src/lib/cloudinary';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session || !session.brokerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const broker = await prisma.broker.findUnique({
      where: { id: session.brokerId as string },
    });

    if (!broker) {
      return NextResponse.json({ error: 'Broker not found' }, { status: 404 });
    }

    return NextResponse.json(broker);
  } catch (error) {
    console.error('Error fetching broker settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session || !session.brokerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    
    // Whitelist allowed fields for update
    const updateData: any = {};
    const allowedFields = [
      'name', 'whatsappNumber', 'contactNumber', 'companyName', 'licenseNumber', 'bio',
      'profilePictureUrl', 'facebookUrl', 'linkedinUrl', 'officeAddress',
      'instagramUrl', 'websiteUrl', 'specialization', 'publicEmail'
    ];

    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    });

    const oldBroker = await prisma.broker.findUnique({
      where: { id: session.brokerId as string }
    });

    const updatedBroker = await prisma.broker.update({
      where: { id: session.brokerId as string },
      data: updateData,
    });

    if (oldBroker && updateData.profilePictureUrl && oldBroker.profilePictureUrl && oldBroker.profilePictureUrl !== updateData.profilePictureUrl) {
      const oldUrl = oldBroker.profilePictureUrl;
      if (oldUrl.startsWith('/uploads/profiles/')) {
        const safeUrl = oldUrl.replace(/^\//, '');
        const filePath = path.join(process.cwd(), "public", safeUrl);
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
          } catch (e) {
            console.error("Failed to delete old local profile picture:", e);
          }
        }
      } else if (oldUrl.includes('cloudinary.com')) {
        await deleteImage(oldUrl);
      }
    }

    return NextResponse.json(updatedBroker);
  } catch (error) {
    console.error('Error updating broker settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

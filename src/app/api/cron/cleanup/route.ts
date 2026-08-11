import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { deleteImage } from '@/src/lib/s3';

export async function POST(req: Request) {
  try {
    // Basic authorization for cron job
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Calculate the date 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Find properties that were deleted more than 30 days ago
    const oldDeletedProperties = await prisma.property.findMany({
      where: {
        deletedAt: {
          lte: thirtyDaysAgo
        }
      },
      include: {
        images: true
      }
    });

    if (oldDeletedProperties.length === 0) {
      return NextResponse.json({ message: 'No properties to clean up' });
    }

    let deletedCount = 0;

    for (const property of oldDeletedProperties) {
      // 1. Delete images from S3
      for (const image of property.images) {
        if (!image.url.startsWith('/uploads')) {
          await deleteImage(image.url);
        }
      }

      // 2. Hard delete property from DB (this will cascade to images if configured, 
      // but we should manually delete relations just in case, similar to propertyController)
      await prisma.propertyImage.deleteMany({ where: { propertyId: property.id } });
      await prisma.like.deleteMany({ where: { propertyId: property.id } });
      await prisma.savedProperty.deleteMany({ where: { propertyId: property.id } });
      await prisma.conversation.updateMany({ 
        where: { propertyId: property.id }, 
        data: { propertyId: null } 
      });

      await prisma.property.delete({
        where: { id: property.id }
      });

      deletedCount++;
    }

    return NextResponse.json({ 
      success: true, 
      message: `Cleaned up ${deletedCount} old properties from trash.` 
    });

  } catch (error: any) {
    console.error('Cron cleanup error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

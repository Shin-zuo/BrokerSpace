import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { getSession } from '@/src/lib/auth';

export async function POST() {
  try {
    const session = await getSession();
    if (!session || !session.brokerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.inquiry.updateMany({
      where: {
        isRead: false,
        property: {
          brokerId: session.brokerId as string,
        },
      },
      data: {
        isRead: true,
      }
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error marking all inquiries as read:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

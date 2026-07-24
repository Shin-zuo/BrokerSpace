import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { getSession } from '@/src/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.brokerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const unreadCount = await prisma.inquiry.count({
      where: {
        isRead: false,
        property: {
          brokerId: session.brokerId as string,
        },
      },
    });

    const unreadInquiries = await prisma.inquiry.findMany({
      where: {
        isRead: false,
        property: {
          brokerId: session.brokerId as string,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        property: {
          select: { title: true }
        }
      }
    });

    return NextResponse.json({ count: unreadCount, inquiries: unreadInquiries }, { status: 200 });
  } catch (error) {
    console.error('Error fetching unread inquiries count:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { getSession } from '@/src/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || !session.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = session.userId as string;

  try {
    const connections = await prisma.connection.findMany({
      where: {
        OR: [
          { requesterId: userId },
          { receiverId: userId }
        ]
      },
      include: {
        requester: { include: { broker: true } },
        receiver: { include: { broker: true } }
      }
    });
    return NextResponse.json(connections);
  } catch (error) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !session.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = session.userId as string;
  const { targetUserId } = await req.json();

  if (!targetUserId || userId === targetUserId) {
    return NextResponse.json({ error: 'Invalid target user' }, { status: 400 });
  }

  try {
    // Check if connection already exists
    const existing = await prisma.connection.findFirst({
      where: {
        OR: [
          { requesterId: userId, receiverId: targetUserId },
          { requesterId: targetUserId, receiverId: userId }
        ]
      }
    });

    if (existing) {
      return NextResponse.json({ error: 'Connection already exists' }, { status: 400 });
    }

    const connection = await prisma.connection.create({
      data: {
        requesterId: userId,
        receiverId: targetUserId,
        status: 'PENDING'
      }
    });

    // Create Notification
    await prisma.notification.create({
      data: {
        userId: targetUserId,
        actorId: userId,
        type: 'FRIEND_REQUEST'
      }
    });

    return NextResponse.json({ success: true, connection });
  } catch (error) {
    console.error('Error creating connection:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { getSession } from '@/src/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || !session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.userId as string;

  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { participantOneId: userId },
          { participantTwoId: userId },
        ],
      },
      include: {
        participantOne: { include: { broker: true } },
        participantTwo: { include: { broker: true } },
        property: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            messages: {
              where: {
                isRead: false,
                senderId: { not: userId },
              }
            }
          }
        }
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.userId as string;
  const { brokerId, propertyId } = await req.json();

  if (!brokerId) {
    return NextResponse.json({ error: 'brokerId is required' }, { status: 400 });
  }

  try {
    const targetUser = await prisma.user.findFirst({ where: { brokerId } });
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found for this broker' }, { status: 404 });
    }
    const targetUserId = targetUser.id;

    if (targetUserId === userId) {
      return NextResponse.json({ error: 'Cannot chat with yourself' }, { status: 400 });
    }

    // Ensure participantOne is always the smaller ID for consistency
    const p1 = userId < targetUserId ? userId : targetUserId;
    const p2 = userId < targetUserId ? targetUserId : userId;

    let conversation = await prisma.conversation.findFirst({
      where: {
        participantOneId: p1,
        participantTwoId: p2,
      },
      include: {
        participantOne: { include: { broker: true } },
        participantTwo: { include: { broker: true } },
      }
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          participantOneId: p1,
          participantTwoId: p2,
          propertyId: propertyId || null,
        },
        include: {
          participantOne: { include: { broker: true } },
          participantTwo: { include: { broker: true } },
        }
      });
    }

    return NextResponse.json(conversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { getSession } from '@/src/lib/auth';

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getSession();
  if (!session || !session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.userId as string;
  const conversationId = params.id;

  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    }

    if (conversation.participantOneId !== userId && conversation.participantTwoId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Mark unread messages from the other user as read
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        isRead: false,
      },
      data: { isRead: true },
    });

    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getSession();
  if (!session || !session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.userId as string;
  const conversationId = params.id;
  const { content } = await req.json();

  if (!content || !content.trim()) {
    return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
  }

  // Global Messaging Killswitch check (SuperAdmins are exempt)
  if (session.role !== 'SuperAdmin') {
    const { getSystemSettings } = await import('@/src/lib/systemSettings');
    const settings = await getSystemSettings();

    if (!settings.global_messaging_enabled || settings.maintenance_mode) {
      return NextResponse.json({
        error: 'Direct messaging is temporarily paused for system maintenance.',
      }, { status: 403 });
    }
  }

  // Check if sender has messaging permission
  if (session.brokerId) {
    const senderBroker = await prisma.broker.findUnique({
      where: { id: session.brokerId as string },
      select: { canMessage: true },
    });
    if (senderBroker && !senderBroker.canMessage) {
      return NextResponse.json({ 
        error: 'Your messaging permission has been restricted by the administrator.' 
      }, { status: 403 });
    }
  }

  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    }

    if (conversation.participantOneId !== userId && conversation.participantTwoId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const message = await prisma.message.create({
      data: {
        content: content.trim(),
        senderId: userId,
        conversationId,
      },
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { getSession } from '@/src/lib/auth';

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    
    // Ensure the notification belongs to the user
    const notification = await prisma.notification.findUnique({
      where: { id }
    });
    
    if (!notification || notification.userId !== session.userId) {
      return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 });
    }

    await prisma.notification.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

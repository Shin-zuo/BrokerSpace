import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { getSession } from '@/src/lib/auth';

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const session = await getSession();
  if (!session || !session.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = session.userId as string;
  const { status } = await req.json(); // ACCEPTED or DECLINED

  try {
    const connection = await prisma.connection.findUnique({ where: { id } });
    if (!connection) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (connection.receiverId !== userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const updated = await prisma.connection.update({
      where: { id },
      data: { status }
    });

    return NextResponse.json({ success: true, connection: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const session = await getSession();
  if (!session || !session.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = session.userId as string;

  try {
    const connection = await prisma.connection.findUnique({ where: { id } });
    if (!connection) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    
    if (connection.requesterId !== userId && connection.receiverId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await prisma.connection.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

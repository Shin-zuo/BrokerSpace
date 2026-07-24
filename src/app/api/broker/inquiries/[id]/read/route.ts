import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { getSession } from '@/src/lib/auth';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session || !session.brokerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Verify the inquiry belongs to a property owned by the broker
    const inquiry = await prisma.inquiry.findUnique({
      where: { id },
      include: { property: true }
    });

    if (!inquiry || inquiry.property.brokerId !== session.brokerId) {
      return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 });
    }

    const updatedInquiry = await prisma.inquiry.update({
      where: { id },
      data: { isRead: true }
    });

    return NextResponse.json(updatedInquiry, { status: 200 });
  } catch (error) {
    console.error('Error updating inquiry status:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

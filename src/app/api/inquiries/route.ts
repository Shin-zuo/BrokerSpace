import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { propertyId, clientName, clientEmail, clientPhone, message } = body;

    if (!propertyId || !clientName || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const inquiry = await prisma.inquiry.create({
      data: {
        propertyId,
        clientName,
        clientEmail: clientEmail || null,
        clientPhone: clientPhone || null,
        message,
        isRead: false,
      },
    });

    return NextResponse.json(inquiry, { status: 201 });
  } catch (error) {
    console.error('Error creating inquiry:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

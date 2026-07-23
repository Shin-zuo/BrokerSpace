import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import bcrypt from 'bcryptjs';
import { createSession } from '@/src/lib/auth';

export async function POST(req: Request) {
  try {
    const { identifier, password } = await req.json();

    if (!identifier || !password) {
      return NextResponse.json({ success: false, message: 'Missing identifier or password' }, { status: 400 });
    }

    // Check if the identifier is an email or username
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { username: identifier }
        ]
      },
      include: {
        broker: true
      }
    });

    if (!user) {
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }

    await createSession(user.id, user.role, user.brokerId);

    return NextResponse.json({ 
      success: true, 
      message: 'Logged in successfully', 
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email, 
        role: user.role,
        brokerId: user.brokerId,
        name: user.broker?.name // use broker's name if they have one
      } 
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

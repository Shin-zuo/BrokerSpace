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

    // Check if account is suspended
    if (user.isSuspended) {
      return NextResponse.json({ 
        success: false, 
        message: 'Your account has been suspended by the administrator. Please contact support.' 
      }, { status: 403 });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }

    // Global Login Killswitch & Maintenance check (SuperAdmins are exempt)
    if (user.role !== 'SuperAdmin') {
      const { getSystemSettings } = await import('@/src/lib/systemSettings');
      const settings = await getSystemSettings();

      if (!settings.global_login_enabled || settings.maintenance_mode) {
        return NextResponse.json({
          success: false,
          message: settings.maintenance_message || 'Broker login is temporarily paused for system maintenance. Please check back shortly.',
        }, { status: 503 });
      }
    }

    await createSession(user.id, user.role, user.brokerId);

    const redirectUrl = user.role === 'SuperAdmin' ? '/admin' : '/feed';

    return NextResponse.json({ 
      success: true, 
      message: 'Logged in successfully',
      redirectUrl,
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email, 
        role: user.role,
        brokerId: user.brokerId,
        name: user.broker?.name
      } 
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { destroySession } from '@/src/lib/auth';

export async function GET(request: NextRequest) {
  await destroySession();
  return NextResponse.redirect(new URL('/login', request.url));
}

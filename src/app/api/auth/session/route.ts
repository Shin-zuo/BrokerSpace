import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/src/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || !session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({ userId: session.userId });
}

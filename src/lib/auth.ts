import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const secretKey = process.env.JWT_SECRET || 'fallback_secret_for_development_only';
const key = new TextEncoder().encode(secretKey);

export async function signToken(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(key);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, key);
    return payload;
  } catch (error) {
    return null;
  }
}

export async function getSession(req?: NextRequest) {
  let token: string | undefined;

  if (req) {
    token = req.cookies.get('session')?.value;
  } else {
    const cookieStore = await cookies();
    token = cookieStore.get('session')?.value;
  }

  if (!token) return null;
  return await verifyToken(token);
}

export async function createSession(userId: string, role: string, brokerId?: string | null) {
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const token = await signToken({ userId, role, brokerId });
  
  const cookieStore = await cookies();
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expires,
    sameSite: 'lax',
    path: '/',
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}

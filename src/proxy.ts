import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from './lib/auth';

// Regular broker protected routes
const protectedRoutes = ['/properties', '/feed', '/messages', '/settings'];

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Protect /admin routes strictly for SuperAdmin
  if (path.startsWith('/admin')) {
    const session = await getSession(req);

    if (!session) {
      return NextResponse.redirect(new URL('/login?redirect=/admin', req.url));
    }

    if (session.role !== 'SuperAdmin') {
      return NextResponse.redirect(new URL('/feed', req.url));
    }
  }

  // Check if standard broker route is protected
  const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route));

  if (isProtectedRoute) {
    const session = await getSession(req);

    if (!session) {
      // Redirect to login if unauthenticated
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  // Prevent logged-in users from accessing login, signup, or public landing page
  if (path === '/login' || path === '/signup' || path === '/') {
    const session = await getSession(req);
    if (session) {
      if (session.role === 'SuperAdmin') {
        return NextResponse.redirect(new URL('/admin', req.url));
      }
      return NextResponse.redirect(new URL('/feed', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|uploads).*)'],
};

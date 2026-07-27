import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from './lib/auth';

// Add the routes you want to protect here
const protectedRoutes = ['/properties', '/feed', '/messages', '/settings'];

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route));

  if (isProtectedRoute) {
    const session = await getSession(req);

    if (!session) {
      // Redirect to login if unauthenticated
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  // Prevent logged-in users from accessing the login, signup, or public landing page
  if (path === '/login' || path === '/signup' || path === '/') {
    const session = await getSession(req);
    if (session) {
      return NextResponse.redirect(new URL('/feed', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|uploads).*)'],
};

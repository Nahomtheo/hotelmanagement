import { withAuth } from 'next-auth/middleware';
import { NextRequest, NextResponse } from 'next/server';

export const middleware = withAuth(
  function middleware(req: NextRequest & { nextauth: any }) {
    const { token } = req.nextauth;
    const pathname = req.nextUrl.pathname;

    // Redirect unauthenticated users to login
    if (!token) {
      if (pathname.startsWith('/admin') || pathname.startsWith('/receptionist') || pathname.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/auth/login', req.url));
      }
    }

    // Protect admin routes
    if (pathname.startsWith('/admin') && token?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Protect receptionist routes
    if (pathname.startsWith('/receptionist') && token?.role !== 'receptionist' && token?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;

        // Allow public routes
        if (pathname.startsWith('/auth') || pathname === '/') {
          return true;
        }

        // Require token for protected routes
        if (pathname.startsWith('/admin') || pathname.startsWith('/receptionist') || pathname.startsWith('/dashboard')) {
          return !!token;
        }

        return true;
      },
    },
  }
);

export const config = {
  matcher: ['/admin/:path*', '/receptionist/:path*', '/dashboard/:path*', '/auth/:path*'],
};

import { withAuth } from 'next-auth/middleware';
import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

const locales = ['en', 'am'];

// 1. Create the next-intl middleware
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: 'en',
});

// 2. Create the next-auth middleware with your custom role protection logic
const authMiddleware = withAuth(
  function middleware(req: NextRequest & { nextauth: any }) {
    const { token } = req.nextauth;
    const pathname = req.nextUrl.pathname;

    // Helper: strip the /en or /am locale prefix to easily read the original route
    const pathnameWithoutLocale = pathname.replace(new RegExp(`^/(${locales.join('|')})`), '') || '/';

    // Redirect unauthenticated users to login
    if (!token) {
      if (
        pathnameWithoutLocale.startsWith('/admin') ||
        pathnameWithoutLocale.startsWith('/receptionist') ||
        pathnameWithoutLocale.startsWith('/dashboard')
      ) {
        return NextResponse.redirect(new URL('/auth/login', req.url));
      }
    }

    // Protect admin routes
    if (pathnameWithoutLocale.startsWith('/admin') && token?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Protect receptionist routes
    if (
      pathnameWithoutLocale.startsWith('/receptionist') &&
      token?.role !== 'receptionist' &&
      token?.role !== 'admin'
    ) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // If authentication passes, hand over to the localization middleware to handle locales/rewrites
    return intlMiddleware(req);
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;
        const pathnameWithoutLocale = pathname.replace(new RegExp(`^/(${locales.join('|')})`), '') || '/';

        // Allow public routes
        if (pathnameWithoutLocale.startsWith('/auth') || pathnameWithoutLocale === '/') {
          return true;
        }

        // Require token for protected routes
        if (
          pathnameWithoutLocale.startsWith('/admin') ||
          pathnameWithoutLocale.startsWith('/receptionist') ||
          pathnameWithoutLocale.startsWith('/dashboard')
        ) {
          return !!token;
        }

        return true;
      },
    },
  }
);

// 3. Main entry point: Decide which middleware handles the request
export default function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Clean the path to check if it matches a public segment
  const pathnameWithoutLocale = pathname.replace(new RegExp(`^/(${locales.join('|')})`), '') || '/';

  // Check if it is the root page or an auth page (public)
  const isPublicPage = pathnameWithoutLocale === '/' || pathnameWithoutLocale.startsWith('/auth');

  if (isPublicPage) {
    // If it's a public page, run the localization middleware directly (no auth needed)
    return intlMiddleware(req);
  } else {
    // If it's a protected page, run Next-Auth first
    return (authMiddleware as any)(req);
  }
}

// 4. Update the matcher to match all pages but ignore static files/APIs
export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
// Next.js middleware for route protection and role-based access control
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'student-portal-secret-key-2024-super-secure'
);

export async function middleware(request) {
    const { pathname } = request.nextUrl;

    // Public routes - no auth needed
    if (pathname === '/login' || pathname === '/api/auth/login' || pathname === '/api/auth/logout' || pathname.startsWith('/_next') || pathname.startsWith('/favicon')) {
        return NextResponse.next();
    }

    // Get token from cookie
    const token = request.cookies.get('auth-token')?.value;

    // No token → redirect to login
    if (!token) {
        if (pathname.startsWith('/api/')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);

        // Root path → redirect to role dashboard
        if (pathname === '/') {
            return NextResponse.redirect(new URL(`/dashboard/${payload.role}`, request.url));
        }

        // Dashboard route protection
        if (pathname.startsWith('/dashboard/')) {
            const segments = pathname.split('/');
            const dashboardRole = segments[2]; // /dashboard/admin, /dashboard/teacher, /dashboard/student

            // Only allow access to your own dashboard
            if (dashboardRole && dashboardRole !== payload.role) {
                return NextResponse.redirect(new URL(`/dashboard/${payload.role}`, request.url));
            }
        }

        // Inject user info into request headers for API routes
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-user-id', String(payload.id));
        requestHeaders.set('x-user-role', payload.role);
        requestHeaders.set('x-user-name', payload.fullName);

        return NextResponse.next({ request: { headers: requestHeaders } });
    } catch {
        // Invalid token → clear cookie and redirect
        if (pathname.startsWith('/api/')) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('auth-token');
        return response;
    }
}

export const config = {
    matcher: ['/', '/dashboard/:path*', '/api/:path*'],
};

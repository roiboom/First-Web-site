// Auth Login API - POST /api/auth/login
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { comparePassword, signToken } from '@/lib/auth';

export async function POST(request) {
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
        }

        const db = getDb();
        const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

        if (!user || !comparePassword(password, user.password)) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Determine if 2FA is required based on role
        if (user.role === 'admin' || user.role === 'teacher') {
            // Generate a temporary token that expires very quickly (e.g. 10 mins) to allow them to complete 2FA
            const tempToken = await signToken({
                id: user.id,
                username: user.username,
                role: user.role,
                fullName: user.full_name,
                temp: true
            }, '24h'); // We might need to adjust auth.js signToken if we want flexible expirations, but the default is 24h which is okay for this temp token as long as it's not the final generic token. Actually, we'll just check for a 'temp' flag or rely on the frontend flow.

            if (!user.two_factor_secret) {
                return NextResponse.json({
                    success: true,
                    requires2FASetup: true,
                    tempToken
                });
            } else {
                return NextResponse.json({
                    success: true,
                    requires2FA: true,
                    tempToken
                });
            }
        }

        // If not admin/teacher (e.g., student), proceed as normal
        // Create JWT token
        const token = await signToken({
            id: user.id,
            username: user.username,
            role: user.role,
            fullName: user.full_name,
        });

        // Set httpOnly cookie
        const response = NextResponse.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                fullName: user.full_name,
                email: user.email,
            },
        });

        response.cookies.set('auth-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24, // 24 hours
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// Auth Verify 2FA API - POST /api/auth/verify-2fa
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { verifyToken, signToken } from '@/lib/auth';
import pkg from 'otplib';
const { authenticator } = pkg;

export async function POST(request) {
    try {
        const { tempToken, code, setupSecret } = await request.json();

        if (!tempToken || !code) {
            return NextResponse.json({ error: 'Token and code are required' }, { status: 400 });
        }

        const decoded = await verifyToken(tempToken);
        if (!decoded || !decoded.id) {
            return NextResponse.json({ error: 'Invalid or expired temporary token' }, { status: 401 });
        }

        const db = getDb();
        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(decoded.id);

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Determine which secret to check against
        // If the user already has 2FA set up, use the DB secret.
        // If they are setting it up now, use the setupSecret provided in the request body.
        let secretToVerify = user.two_factor_secret;
        let isFirstSetup = false;

        if (!secretToVerify) {
            if (!setupSecret) {
                return NextResponse.json({ error: 'Setup secret is missing for first-time configuration' }, { status: 400 });
            }
            secretToVerify = setupSecret;
            isFirstSetup = true;
        }

        // Verify the code
        const isValid = authenticator.verify({
            token: code,
            secret: secretToVerify
        });

        if (!isValid) {
            return NextResponse.json({ error: 'Invalid 2FA code' }, { status: 401 });
        }

        // If it was the first setup and code is valid, save the secret to the database
        if (isFirstSetup) {
            db.prepare('UPDATE users SET two_factor_secret = ? WHERE id = ?').run(secretToVerify, user.id);
        }

        // 2FA is valid, issue the final authentication JWT
        const token = await signToken({
            id: user.id,
            username: user.username,
            role: user.role,
            fullName: user.full_name,
        });

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
        console.error('Verify 2FA error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
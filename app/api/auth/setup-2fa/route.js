// Auth Setup 2FA API - GET /api/auth/setup-2fa
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';

export async function GET(request) {
    try {
        // Authenticate the user via the temporary token passed in query string or header
        const { searchParams } = new URL(request.url);
        const tempToken = searchParams.get('tempToken');

        if (!tempToken) {
            return NextResponse.json({ error: 'Temporary token required' }, { status: 401 });
        }

        const decoded = await verifyToken(tempToken);
        console.log('Setup 2FA - TempToken Received:', tempToken?.slice(0, 10) + '...');
        console.log('Setup 2FA - Decoded Payload:', decoded);

        if (!decoded || !decoded.id) {
            return NextResponse.json({ error: 'Invalid or expired temporary token' }, { status: 401 });
        }

        const db = getDb();
        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(decoded.id);

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Generate a new secret for the user (do not save to DB yet, wait for verification)
        const secret = authenticator.generateSecret();

        // Generate OTP Auth URL
        const otpauthUrl = authenticator.keyuri(user.username, 'Student Portal', secret);

        // Generate QR code
        const qrCodeUrl = await QRCode.toDataURL(otpauthUrl);

        return NextResponse.json({
            success: true,
            secret,
            qrCodeUrl
        });

    } catch (error) {
        console.error('Setup 2FA error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

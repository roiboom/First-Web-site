import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import fs from 'fs';

const JWT_SECRET = new TextEncoder().encode('student-portal-secret-key-2024-super-secure');

// Sign a JWT token with user data and role
export async function signToken(payload, expires = '24h') {
    console.log('Signing token for payload:', payload.username, 'expires:', expires);
    return new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime(expires)
        .setIssuedAt()
        .sign(JWT_SECRET);
}

// Verify and decode a JWT token
export async function verifyToken(token) {
    if (!token) {
        console.error('VerifyToken called with empty token');
        return null;
    }
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        console.log('VerifyToken SUCCESS for:', payload.username);
        return payload;
    } catch (e) {
        const logMsg = `[${new Date().toISOString()}] JWT Verify Error: ${e.message} (Code: ${e.code})\nToken: ${token}\n\n`;
        try {
            fs.appendFileSync('portal_debug.log', logMsg);
        } catch (err) {
            console.error('Failed to write to log file', err);
        }
        console.error('VerifyToken FAILED. Token start:', token.slice(0, 20));
        console.error('Error Message:', e.message);
        console.error('Error Code:', e.code);
        return null;
    }
}

// Hash a password
export function hashPassword(password) {
    return bcrypt.hashSync(password, 10);
}

// Compare password with hash
export function comparePassword(password, hash) {
    return bcrypt.compareSync(password, hash);
}

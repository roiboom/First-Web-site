// Authentication utilities: JWT token management and password hashing
const { SignJWT, jwtVerify } = require('jose');
const bcrypt = require('bcryptjs');

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'student-portal-secret-key-2024-super-secure'
);

// Sign a JWT token with user data and role
async function signToken(payload) {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('24h')
        .setIssuedAt()
        .sign(JWT_SECRET);
}

// Verify and decode a JWT token
async function verifyToken(token) {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload;
    } catch {
        return null;
    }
}

// Hash a password
function hashPassword(password) {
    return bcrypt.hashSync(password, 10);
}

// Compare password with hash
function comparePassword(password, hash) {
    return bcrypt.compareSync(password, hash);
}

module.exports = { signToken, verifyToken, hashPassword, comparePassword };

// Auth Me API - GET /api/auth/me
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request) {
    const userId = request.headers.get('x-user-id');
    const role = request.headers.get('x-user-role');

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();
    const user = db.prepare('SELECT id, username, role, full_name, email, avatar FROM users WHERE id = ?').get(userId);

    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get extended info based on role
    let extendedInfo = {};
    if (role === 'student') {
        extendedInfo = db.prepare('SELECT * FROM students WHERE user_id = ?').get(userId) || {};
    } else if (role === 'teacher') {
        extendedInfo = db.prepare('SELECT * FROM teachers WHERE user_id = ?').get(userId) || {};
    }

    return NextResponse.json({
        ...user,
        ...extendedInfo,
        fullName: user.full_name,
    });
}

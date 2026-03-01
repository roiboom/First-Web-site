// Teachers API - GET (list), POST (create)
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function GET(request) {
    const role = request.headers.get('x-user-role');
    if (role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const db = getDb();
    const teachers = db.prepare(`
    SELECT u.id as userId, u.username, u.full_name, u.email, u.created_at,
           t.id, t.teacher_id, t.subject, t.phone, t.department, t.hire_date
    FROM users u
    JOIN teachers t ON u.id = t.user_id
    WHERE u.role = 'teacher'
    ORDER BY u.full_name ASC
  `).all();

    return NextResponse.json(teachers);
}

export async function POST(request) {
    const role = request.headers.get('x-user-role');
    if (role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { fullName, email, subject, department, phone } = body;

        if (!fullName || !subject) {
            return NextResponse.json({ error: 'Full name and subject are required' }, { status: 400 });
        }

        const db = getDb();

        const baseName = fullName.toLowerCase().replace(/[^a-z]/g, '').slice(0, 10);
        let username = baseName;
        let counter = 1;
        while (db.prepare('SELECT id FROM users WHERE username = ?').get(username)) {
            username = `${baseName}${counter}`;
            counter++;
        }

        const password = `${baseName}${Math.floor(Math.random() * 900) + 100}`;
        const hashedPassword = hashPassword(password);

        const lastTeacher = db.prepare('SELECT teacher_id FROM teachers ORDER BY id DESC LIMIT 1').get();
        let nextNum = 1;
        if (lastTeacher) {
            nextNum = parseInt(lastTeacher.teacher_id.split('-')[1]) + 1;
        }
        const teacherId = `TCH-${String(nextNum).padStart(3, '0')}`;

        const userResult = db.prepare(
            `INSERT INTO users (username, password, role, full_name, email) VALUES (?, ?, 'teacher', ?, ?)`
        ).run(username, hashedPassword, fullName, email || null);

        db.prepare(
            `INSERT INTO teachers (user_id, teacher_id, subject, department, phone) VALUES (?, ?, ?, ?, ?)`
        ).run(userResult.lastInsertRowid, teacherId, subject, department || 'General', phone || null);

        return NextResponse.json({
            success: true,
            teacher: { userId: userResult.lastInsertRowid, teacherId, username, password, fullName, subject },
        }, { status: 201 });
    } catch (error) {
        console.error('Create teacher error:', error);
        return NextResponse.json({ error: 'Failed to create teacher' }, { status: 500 });
    }
}

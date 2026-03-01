// Students API - GET (list all), POST (create new)
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function GET(request) {
    const role = request.headers.get('x-user-role');
    if (role !== 'admin' && role !== 'teacher') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const db = getDb();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const className = searchParams.get('class') || '';

    let query = `
    SELECT u.id as userId, u.username, u.full_name, u.email, u.created_at,
           s.id, s.student_id, s.date_of_birth, s.gender, s.phone, s.address,
           s.class_name, s.enrollment_date, s.parent_name, s.parent_phone
    FROM users u
    JOIN students s ON u.id = s.user_id
    WHERE u.role = 'student'
  `;
    const params = [];

    if (search) {
        query += ` AND (u.full_name LIKE ? OR s.student_id LIKE ? OR u.email LIKE ?)`;
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (className) {
        query += ` AND s.class_name = ?`;
        params.push(className);
    }

    query += ` ORDER BY u.full_name ASC`;
    const students = db.prepare(query).all(...params);

    return NextResponse.json(students);
}

export async function POST(request) {
    const role = request.headers.get('x-user-role');
    if (role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { fullName, email, dateOfBirth, gender, phone, address, className, parentName, parentPhone } = body;

        if (!fullName) {
            return NextResponse.json({ error: 'Full name is required' }, { status: 400 });
        }

        const db = getDb();

        // Auto-generate username from name
        const baseName = fullName.toLowerCase().replace(/[^a-z]/g, '').slice(0, 10);
        let username = baseName;
        let counter = 1;
        while (db.prepare('SELECT id FROM users WHERE username = ?').get(username)) {
            username = `${baseName}${counter}`;
            counter++;
        }

        // Auto-generate password
        const password = `${baseName}${Math.floor(Math.random() * 900) + 100}`;
        const hashedPassword = hashPassword(password);

        // Generate student ID
        const lastStudent = db.prepare('SELECT student_id FROM students ORDER BY id DESC LIMIT 1').get();
        let nextNum = 1;
        if (lastStudent) {
            nextNum = parseInt(lastStudent.student_id.split('-')[1]) + 1;
        }
        const studentId = `STU-${String(nextNum).padStart(3, '0')}`;

        // Insert user
        const userResult = db.prepare(
            `INSERT INTO users (username, password, role, full_name, email) VALUES (?, ?, 'student', ?, ?)`
        ).run(username, hashedPassword, fullName, email || null);

        // Insert student
        db.prepare(
            `INSERT INTO students (user_id, student_id, date_of_birth, gender, phone, address, class_name, parent_name, parent_phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).run(userResult.lastInsertRowid, studentId, dateOfBirth || null, gender || null, phone || null, address || null, className || 'Class A', parentName || null, parentPhone || null);

        return NextResponse.json({
            success: true,
            student: {
                userId: userResult.lastInsertRowid,
                studentId,
                username,
                password, // Return plaintext password for admin to share
                fullName,
                email,
                className: className || 'Class A',
            },
        }, { status: 201 });
    } catch (error) {
        console.error('Create student error:', error);
        return NextResponse.json({ error: 'Failed to create student' }, { status: 500 });
    }
}

// Attendance API - GET, POST
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request) {
    const userId = request.headers.get('x-user-id');
    const role = request.headers.get('x-user-role');
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const className = searchParams.get('class');

    let query, params = [];

    if (role === 'student') {
        const student = db.prepare('SELECT id FROM students WHERE user_id = ?').get(userId);
        if (!student) return NextResponse.json([]);
        query = `SELECT a.*, u.full_name as student_name, s.student_id as student_code
             FROM attendance a
             JOIN students s ON a.student_id = s.id
             JOIN users u ON s.user_id = u.id
             WHERE a.student_id = ?`;
        params = [student.id];
    } else {
        query = `SELECT a.*, u.full_name as student_name, s.student_id as student_code, s.class_name
             FROM attendance a
             JOIN students s ON a.student_id = s.id
             JOIN users u ON s.user_id = u.id
             WHERE 1=1`;
    }

    if (date) { query += ` AND a.date = ?`; params.push(date); }
    if (className) { query += ` AND s.class_name = ?`; params.push(className); }
    query += ` ORDER BY a.date DESC, u.full_name`;

    return NextResponse.json(db.prepare(query).all(...params));
}

export async function POST(request) {
    const role = request.headers.get('x-user-role');
    const userId = request.headers.get('x-user-id');
    if (role !== 'teacher' && role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { records } = body; // Array of { studentId, date, status, notes }
    const db = getDb();

    let teacherId = null;
    if (role === 'teacher') {
        const teacher = db.prepare('SELECT id FROM teachers WHERE user_id = ?').get(userId);
        teacherId = teacher?.id;
    }

    const upsert = db.prepare(`
    INSERT OR REPLACE INTO attendance (student_id, date, status, recorded_by, notes)
    VALUES (?, ?, ?, ?, ?)
  `);

    const insertMany = db.transaction((items) => {
        for (const r of items) {
            upsert.run(r.studentId, r.date, r.status, teacherId || r.recordedBy, r.notes || '');
        }
    });

    insertMany(records);
    return NextResponse.json({ success: true });
}

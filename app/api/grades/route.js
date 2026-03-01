// Grades API - GET, POST
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request) {
    const userId = request.headers.get('x-user-id');
    const role = request.headers.get('x-user-role');
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const term = searchParams.get('term');

    let query, params = [];

    if (role === 'student') {
        const student = db.prepare('SELECT id FROM students WHERE user_id = ?').get(userId);
        if (!student) return NextResponse.json([]);
        query = `SELECT g.*, u.full_name as student_name, s.student_id as student_code
             FROM grades g
             JOIN students s ON g.student_id = s.id
             JOIN users u ON s.user_id = u.id
             WHERE g.student_id = ?`;
        params = [student.id];
    } else if (role === 'teacher') {
        const teacher = db.prepare('SELECT id FROM teachers WHERE user_id = ?').get(userId);
        if (!teacher) return NextResponse.json([]);
        query = `SELECT g.*, u.full_name as student_name, s.student_id as student_code, s.class_name
             FROM grades g
             JOIN students s ON g.student_id = s.id
             JOIN users u ON s.user_id = u.id
             WHERE g.teacher_id = ?`;
        params = [teacher.id];
    } else {
        query = `SELECT g.*, u.full_name as student_name, s.student_id as student_code, s.class_name
             FROM grades g
             JOIN students s ON g.student_id = s.id
             JOIN users u ON s.user_id = u.id
             WHERE 1=1`;
    }

    if (studentId) { query += ` AND g.student_id = ?`; params.push(studentId); }
    if (term) { query += ` AND g.term = ?`; params.push(term); }
    query += ` ORDER BY u.full_name, g.subject`;

    return NextResponse.json(db.prepare(query).all(...params));
}

export async function POST(request) {
    const role = request.headers.get('x-user-role');
    const userId = request.headers.get('x-user-id');
    if (role !== 'teacher' && role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { grades } = body; // Array of { studentId, subject, grade, maxGrade, term, remarks }
    const db = getDb();

    let teacherId = null;
    if (role === 'teacher') {
        const teacher = db.prepare('SELECT id FROM teachers WHERE user_id = ?').get(userId);
        teacherId = teacher?.id;
    }

    const upsert = db.prepare(`
    INSERT INTO grades (student_id, teacher_id, subject, grade, max_grade, term, remarks)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

    const insertMany = db.transaction((items) => {
        for (const g of items) {
            // Delete existing grade for same student/subject/term first
            db.prepare('DELETE FROM grades WHERE student_id = ? AND subject = ? AND term = ?')
                .run(g.studentId, g.subject, g.term);
            upsert.run(g.studentId, teacherId || g.teacherId, g.subject, g.grade, g.maxGrade || 100, g.term || 'Term 1', g.remarks || '');
        }
    });

    insertMany(grades);
    return NextResponse.json({ success: true });
}

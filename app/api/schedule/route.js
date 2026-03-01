// Schedule API - GET /api/schedule
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request) {
    const userId = request.headers.get('x-user-id');
    const role = request.headers.get('x-user-role');
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const className = searchParams.get('class');

    let query, params = [];

    if (role === 'student') {
        const student = db.prepare('SELECT class_name FROM students WHERE user_id = ?').get(userId);
        if (!student) return NextResponse.json([]);
        query = `SELECT sc.*, u.full_name as teacher_name
             FROM schedules sc
             LEFT JOIN teachers t ON sc.teacher_id = t.id
             LEFT JOIN users u ON t.user_id = u.id
             WHERE sc.class_name = ?
             ORDER BY CASE sc.day_of_week
               WHEN 'Monday' THEN 1 WHEN 'Tuesday' THEN 2 WHEN 'Wednesday' THEN 3
               WHEN 'Thursday' THEN 4 WHEN 'Friday' THEN 5 END, sc.start_time`;
        params = [student.class_name];
    } else if (role === 'teacher') {
        const teacher = db.prepare('SELECT id FROM teachers WHERE user_id = ?').get(userId);
        if (!teacher) return NextResponse.json([]);
        query = `SELECT sc.*, u.full_name as teacher_name
             FROM schedules sc
             LEFT JOIN teachers t ON sc.teacher_id = t.id
             LEFT JOIN users u ON t.user_id = u.id
             WHERE sc.teacher_id = ?
             ORDER BY CASE sc.day_of_week
               WHEN 'Monday' THEN 1 WHEN 'Tuesday' THEN 2 WHEN 'Wednesday' THEN 3
               WHEN 'Thursday' THEN 4 WHEN 'Friday' THEN 5 END, sc.start_time`;
        params = [teacher.id];
    } else {
        query = `SELECT sc.*, u.full_name as teacher_name
             FROM schedules sc
             LEFT JOIN teachers t ON sc.teacher_id = t.id
             LEFT JOIN users u ON t.user_id = u.id
             WHERE 1=1`;
        if (className) { query += ` AND sc.class_name = ?`; params.push(className); }
        query += ` ORDER BY sc.class_name, CASE sc.day_of_week
               WHEN 'Monday' THEN 1 WHEN 'Tuesday' THEN 2 WHEN 'Wednesday' THEN 3
               WHEN 'Thursday' THEN 4 WHEN 'Friday' THEN 5 END, sc.start_time`;
    }

    return NextResponse.json(db.prepare(query).all(...params));
}

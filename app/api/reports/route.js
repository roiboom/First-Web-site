// Reports API - GET /api/reports
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request) {
    const role = request.headers.get('x-user-role');
    if (role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const db = getDb();

    // Total counts
    const totalStudents = db.prepare('SELECT COUNT(*) as count FROM students').get().count;
    const totalTeachers = db.prepare('SELECT COUNT(*) as count FROM teachers').get().count;

    // Attendance stats (last 30 days)
    const attendanceStats = db.prepare(`
    SELECT status, COUNT(*) as count
    FROM attendance
    WHERE date >= date('now', '-30 day')
    GROUP BY status
  `).all();

    const totalAttendance = attendanceStats.reduce((sum, s) => sum + s.count, 0);
    const presentCount = attendanceStats.find(s => s.status === 'present')?.count || 0;
    const attendanceRate = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;

    // Average grade
    const avgGrade = db.prepare('SELECT AVG(grade) as avg FROM grades').get().avg || 0;

    // Grades by subject
    const gradesBySubject = db.prepare(`
    SELECT subject, AVG(grade) as avg, MIN(grade) as min, MAX(grade) as max, COUNT(*) as count
    FROM grades
    GROUP BY subject
    ORDER BY subject
  `).all();

    // Attendance by class
    const attendanceByClass = db.prepare(`
    SELECT s.class_name, a.status, COUNT(*) as count
    FROM attendance a
    JOIN students s ON a.student_id = s.id
    WHERE a.date >= date('now', '-30 day')
    GROUP BY s.class_name, a.status
    ORDER BY s.class_name
  `).all();

    // Recent students
    const recentStudents = db.prepare(`
    SELECT u.full_name, s.student_id, s.class_name, u.created_at
    FROM users u
    JOIN students s ON u.id = s.user_id
    ORDER BY u.created_at DESC
    LIMIT 5
  `).all();

    return NextResponse.json({
        totalStudents,
        totalTeachers,
        attendanceRate,
        avgGrade: Math.round(avgGrade * 10) / 10,
        attendanceStats,
        gradesBySubject,
        attendanceByClass,
        recentStudents,
    });
}

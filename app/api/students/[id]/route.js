// Students [id] API - GET, PUT, DELETE
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request, { params }) {
    const { id } = await params;
    const db = getDb();

    const student = db.prepare(`
    SELECT u.id as userId, u.username, u.full_name, u.email,
           s.*, s.id as studentTableId
    FROM users u
    JOIN students s ON u.id = s.user_id
    WHERE s.id = ?
  `).get(id);

    if (!student) {
        return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json(student);
}

export async function PUT(request, { params }) {
    const role = request.headers.get('x-user-role');
    if (role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const db = getDb();

    const student = db.prepare('SELECT * FROM students WHERE id = ?').get(id);
    if (!student) {
        return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Update user table
    if (body.fullName || body.email) {
        db.prepare('UPDATE users SET full_name = COALESCE(?, full_name), email = COALESCE(?, email), updated_at = CURRENT_TIMESTAMP WHERE id = ?')
            .run(body.fullName || null, body.email || null, student.user_id);
    }

    // Update student table
    db.prepare(`
    UPDATE students SET
      date_of_birth = COALESCE(?, date_of_birth),
      gender = COALESCE(?, gender),
      phone = COALESCE(?, phone),
      address = COALESCE(?, address),
      class_name = COALESCE(?, class_name),
      parent_name = COALESCE(?, parent_name),
      parent_phone = COALESCE(?, parent_phone)
    WHERE id = ?
  `).run(body.dateOfBirth || null, body.gender || null, body.phone || null, body.address || null, body.className || null, body.parentName || null, body.parentPhone || null, id);

    return NextResponse.json({ success: true });
}

export async function DELETE(request, { params }) {
    const role = request.headers.get('x-user-role');
    if (role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const db = getDb();

    const student = db.prepare('SELECT * FROM students WHERE id = ?').get(id);
    if (!student) {
        return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    db.prepare('DELETE FROM users WHERE id = ?').run(student.user_id);
    return NextResponse.json({ success: true });
}

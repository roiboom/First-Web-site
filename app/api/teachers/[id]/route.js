// Teachers [id] API
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function DELETE(request, { params }) {
    const role = request.headers.get('x-user-role');
    if (role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const db = getDb();

    const teacher = db.prepare('SELECT * FROM teachers WHERE id = ?').get(id);
    if (!teacher) {
        return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    db.prepare('DELETE FROM users WHERE id = ?').run(teacher.user_id);
    return NextResponse.json({ success: true });
}

export async function PUT(request, { params }) {
    const role = request.headers.get('x-user-role');
    if (role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const db = getDb();

    const teacher = db.prepare('SELECT * FROM teachers WHERE id = ?').get(id);
    if (!teacher) {
        return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    if (body.fullName || body.email) {
        db.prepare('UPDATE users SET full_name = COALESCE(?, full_name), email = COALESCE(?, email), updated_at = CURRENT_TIMESTAMP WHERE id = ?')
            .run(body.fullName || null, body.email || null, teacher.user_id);
    }

    db.prepare(`
    UPDATE teachers SET
      subject = COALESCE(?, subject),
      department = COALESCE(?, department),
      phone = COALESCE(?, phone)
    WHERE id = ?
  `).run(body.subject || null, body.department || null, body.phone || null, id);

    return NextResponse.json({ success: true });
}

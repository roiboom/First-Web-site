// Mark message as read - PUT /api/messages/[id]
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function PUT(request, { params }) {
    const { id } = await params;
    const db = getDb();
    db.prepare('UPDATE messages SET is_read = 1 WHERE id = ?').run(id);
    return NextResponse.json({ success: true });
}

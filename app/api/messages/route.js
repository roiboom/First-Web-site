// Messages API - GET, POST
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request) {
  const userId = request.headers.get('x-user-id');
  const role = request.headers.get('x-user-role');
  const db = getDb();

  // Get messages sent to this user directly, or sent by this user, or announcements for this role
  const messages = db.prepare(`
    SELECT m.*, u.full_name as sender_name, u.role as sender_role
    FROM messages m
    JOIN users u ON m.sender_id = u.id
    WHERE m.recipient_id = ? 
       OR m.sender_id = ? 
       OR (m.is_announcement = 1 AND m.recipient_role = ?)
    ORDER BY m.created_at DESC
  `).all(userId, userId, role);

  // Filter out duplicate specific-recipient messages sent by the user so we don't flood the UI 
  // with 30 copies of the exact same message body if they sent to 30 people individually.
  // Instead we will group them by subject and body and created_at if sender_id == userId.
  const uniqueMessagesMap = new Map();
  for (const msg of messages) {
    if (msg.sender_id == userId && msg.is_announcement === 0) {
      // Create a unique key for grouping duplicate sent messages
      // Slice the timestamp to group messages sent within exactly the same second/bulk job
      const timeKey = new Date(msg.created_at).toISOString().slice(0, 19);
      const key = `sent_${msg.subject}_${msg.body}_${timeKey}`;
      if (!uniqueMessagesMap.has(key)) {
        // To display it nicely in the UI, we might want to override recipient info
        msg.is_bulk_sent = true;
        uniqueMessagesMap.set(key, msg);
      }
    } else {
      uniqueMessagesMap.set(msg.id, msg);
    }
  }

  return NextResponse.json(Array.from(uniqueMessagesMap.values()).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
}

export async function POST(request) {
  const userId = request.headers.get('x-user-id');
  const role = request.headers.get('x-user-role');

  if (role !== 'admin' && role !== 'teacher') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const { recipientRole, recipientIds = [], recipientClasses = [], subject, messageBody, isAnnouncement } = body;

  if (!subject || !messageBody) {
    return NextResponse.json({ error: 'Subject and body are required' }, { status: 400 });
  }

  const db = getDb();

  if (isAnnouncement) {
    // Global announcement to a role
    db.prepare(`
            INSERT INTO messages (sender_id, recipient_role, subject, body, is_announcement)
            VALUES (?, ?, ?, ?, 1)
        `).run(userId, recipientRole || null, subject, messageBody);
  } else {
    // Multi-select custom recipients
    let targetUserIds = new Set(recipientIds);

    if (recipientClasses.length > 0) {
      const placeholders = recipientClasses.map(() => '?').join(',');
      const classStudents = db.prepare(`SELECT user_id FROM students WHERE class_name IN (${placeholders})`).all(...recipientClasses);
      classStudents.forEach(s => targetUserIds.add(s.user_id));
    }

    const insertStmt = db.prepare(`
            INSERT INTO messages (sender_id, recipient_id, subject, body, is_announcement)
            VALUES (?, ?, ?, ?, 0)
        `);

    // Use a transaction for bulk inserts
    const insertMany = db.transaction((targets) => {
      for (const targetId of targets) {
        insertStmt.run(userId, targetId, subject, messageBody);
      }
    });

    const targetArray = Array.from(targetUserIds);
    if (targetArray.length > 0) {
      insertMany(targetArray);
    } else {
      return NextResponse.json({ error: 'No recipients selected' }, { status: 400 });
    }
  }

  return NextResponse.json({ success: true }, { status: 201 });
}

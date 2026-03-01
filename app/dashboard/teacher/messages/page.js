'use client';

import { useState, useEffect } from 'react';
import { Send, MessageSquare } from 'lucide-react';

export default function TeacherMessages() {
    const [messages, setMessages] = useState([]);
    const [students, setStudents] = useState([]);
    const [showCompose, setShowCompose] = useState(false);
    const [form, setForm] = useState({ recipientId: '', subject: '', messageBody: '', isAnnouncement: false });

    useEffect(() => {
        fetch('/api/messages').then(r => r.json()).then(setMessages);
        fetch('/api/students').then(r => r.json()).then(setStudents);
    }, []);

    const handleSend = async (e) => {
        e.preventDefault();
        await fetch('/api/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                recipientId: form.recipientId || null,
                recipientRole: form.recipientId ? null : 'student',
                subject: form.subject,
                messageBody: form.messageBody,
                isAnnouncement: !form.recipientId,
            }),
        });
        setShowCompose(false);
        setForm({ recipientId: '', subject: '', messageBody: '', isAnnouncement: false });
        fetch('/api/messages').then(r => r.json()).then(setMessages);
    };

    return (
        <div>
            <div className="card" style={{ padding: '16px 20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MessageSquare size={20} color="#3b82f6" /> Messages
                </h3>
                <button className="btn btn-primary" onClick={() => setShowCompose(!showCompose)}>
                    <Send size={18} /> Send Message
                </button>
            </div>

            {showCompose && (
                <div className="card" style={{ padding: '24px', marginBottom: '20px' }}>
                    <form onSubmit={handleSend}>
                        <div className="form-group">
                            <label>Send To</label>
                            <select value={form.recipientId} onChange={e => setForm({ ...form, recipientId: e.target.value })}>
                                <option value="">All Students (Announcement)</option>
                                {students.map(s => <option key={s.userId} value={s.userId}>{s.full_name}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Subject</label>
                            <input required value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="Subject" />
                        </div>
                        <div className="form-group">
                            <label>Message</label>
                            <textarea rows={4} required value={form.messageBody} onChange={e => setForm({ ...form, messageBody: e.target.value })} placeholder="Write your message..." style={{ resize: 'vertical' }} />
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button type="submit" className="btn btn-primary"><Send size={16} /> Send</button>
                            <button type="button" className="btn btn-outline" onClick={() => setShowCompose(false)}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {messages.map(msg => (
                    <div key={msg.id} className="card" style={{ padding: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{msg.subject}</h4>
                            <span className={`badge ${msg.is_announcement ? 'badge-primary' : 'badge-success'}`}>
                                {msg.is_announcement ? '📢 Announcement' : 'Direct'}
                            </span>
                        </div>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                            From: {msg.sender_name} • {new Date(msg.created_at).toLocaleDateString()}
                        </p>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>{msg.body}</p>
                    </div>
                ))}
                {messages.length === 0 && <div className="card empty-state"><MessageSquare size={48} /><p>No messages</p></div>}
            </div>
        </div>
    );
}

'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Mail, MailOpen } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

export default function StudentMessages() {
    const { t } = useLanguage();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMsg, setSelectedMsg] = useState(null);

    useEffect(() => {
        fetch('/api/messages').then(r => r.json()).then(data => { setMessages(data); setLoading(false); });
    }, []);

    const openMessage = async (msg) => {
        setSelectedMsg(msg);
        if (!msg.is_read) {
            await fetch(`/api/messages/${msg.id}`, { method: 'PUT' });
            setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, is_read: 1 } : m));
        }
    };

    if (loading) return <div className="loading-page"><div className="spinner" /></div>;

    const unread = messages.filter(m => !m.is_read).length;

    return (
        <div className="animate-fade-in">
            <div className="card" style={{ padding: '16px 20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MessageSquare size={20} color="#3b82f6" /> {t.messages_page.title}
                </h3>
                {unread > 0 && (
                    <span className="badge badge-danger">{unread} {t.student_dashboard.unreadMessages}</span>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: selectedMsg ? '1fr 1.5fr' : '1fr', gap: '20px' }}>
                {/* Message List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {messages.map(msg => (
                        <div
                            key={msg.id}
                            className="card"
                            onClick={() => openMessage(msg)}
                            style={{
                                padding: '16px 20px',
                                cursor: 'pointer',
                                borderLeft: `3px solid ${msg.is_read ? 'transparent' : '#3b82f6'}`,
                                background: selectedMsg?.id === msg.id ? 'var(--primary-50)' : msg.is_read ? 'var(--bg-card)' : 'var(--bg-card)',
                                opacity: msg.is_read && selectedMsg?.id !== msg.id ? 0.7 : 1,
                                transition: 'all 0.2s ease',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                                {msg.is_read ? <MailOpen size={16} color="var(--text-muted)" /> : <Mail size={16} color="#3b82f6" />}
                                <span style={{ fontWeight: msg.is_read ? 500 : 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{msg.subject}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>From: {msg.sender_name}</span>
                                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{new Date(msg.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))}
                    {messages.length === 0 && (
                        <div className="card empty-state">
                            <MessageSquare size={48} />
                            <p>No messages yet</p>
                        </div>
                    )}
                </div>

                {/* Message Detail */}
                {selectedMsg && (
                    <div className="card" style={{ padding: '28px' }}>
                        <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
                            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px' }}>{selectedMsg.subject}</h3>
                            <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                <span>From: <strong style={{ color: 'var(--text-secondary)' }}>{selectedMsg.sender_name}</strong></span>
                                <span>{new Date(selectedMsg.created_at).toLocaleString()}</span>
                            </div>
                            {selectedMsg.is_announcement ? (
                                <span className="badge badge-primary" style={{ marginTop: '8px' }}>📢 Announcement</span>
                            ) : null}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                            {selectedMsg.body}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

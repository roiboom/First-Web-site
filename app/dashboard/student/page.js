'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Calendar, ClipboardCheck, MessageSquare, GraduationCap, Clock } from 'lucide-react';

export default function StudentDashboard() {
    const [profile, setProfile] = useState(null);
    const [grades, setGrades] = useState([]);
    const [schedule, setSchedule] = useState([]);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            fetch('/api/auth/me').then(r => r.json()),
            fetch('/api/grades').then(r => r.json()),
            fetch('/api/schedule').then(r => r.json()),
            fetch('/api/messages').then(r => r.json()),
        ]).then(([p, g, s, m]) => {
            setProfile(p);
            setGrades(g);
            setSchedule(s);
            setMessages(m);
            setLoading(false);
        });
    }, []);

    if (loading) return <div className="loading-page"><div className="spinner" /></div>;

    const today = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()];
    const todaySchedule = schedule.filter(s => s.day_of_week === today);
    const avgGrade = grades.length > 0 ? Math.round(grades.reduce((sum, g) => sum + g.grade, 0) / grades.length) : 0;
    const unreadMessages = messages.filter(m => !m.is_read).length;

    return (
        <div>
            {/* Welcome Card */}
            <div className="card" style={{ padding: '28px', marginBottom: '24px', background: 'linear-gradient(135deg, #1e40af, #3b82f6)', color: 'white', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
                <div style={{ position: 'absolute', bottom: '-20px', right: '80px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                        <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800 }}>
                            {(profile?.fullName || profile?.full_name || 'S')[0]}
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'white' }}>Welcome, {profile?.fullName || profile?.full_name}! 👋</h2>
                            <p style={{ opacity: 0.8, fontSize: '0.875rem', color: 'rgba(255,255,255,0.85)' }}>
                                {profile?.student_id} • {profile?.class_name}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }} className="stagger">
                {[
                    { label: 'Average Grade', value: avgGrade, icon: BookOpen, color: '#3b82f6', suffix: '/100' },
                    { label: 'Today\'s Classes', value: todaySchedule.length, icon: Calendar, color: '#22c55e', suffix: '' },
                    { label: 'Unread Messages', value: unreadMessages, icon: MessageSquare, color: '#f59e0b', suffix: '' },
                    { label: 'Total Subjects', value: [...new Set(grades.map(g => g.subject))].length, icon: GraduationCap, color: '#8b5cf6', suffix: '' },
                ].map((c, i) => {
                    const Icon = c.icon;
                    return (
                        <div key={i} className="card animate-fade-in" style={{ padding: '18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${c.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Icon size={22} color={c.color} />
                            </div>
                            <div>
                                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{c.label}</p>
                                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: c.color }}>{c.value}<span style={{ fontSize: '0.8rem', fontWeight: 400 }}>{c.suffix}</span></h3>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '24px' }}>
                {/* Today's Schedule */}
                <div className="card" style={{ padding: '24px' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontSize: '1rem', fontWeight: 700 }}>
                        <Clock size={20} color="#22c55e" /> Today&apos;s Schedule
                    </h3>
                    {todaySchedule.length > 0 ? todaySchedule.map((s, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '10px', background: 'var(--bg-hover)', marginBottom: '8px' }}>
                            <div style={{ padding: '6px 12px', borderRadius: '8px', background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: 'white', fontSize: '0.78rem', fontWeight: 700 }}>
                                {s.start_time}
                            </div>
                            <div>
                                <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{s.subject}</p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.room} • {s.teacher_name}</p>
                            </div>
                        </div>
                    )) : <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>No classes today! 🎉</p>}
                </div>

                {/* Recent Grades */}
                <div className="card" style={{ padding: '24px' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontSize: '1rem', fontWeight: 700 }}>
                        <BookOpen size={20} color="#3b82f6" /> Recent Grades
                    </h3>
                    <div className="table-container">
                        <table>
                            <thead><tr><th>Subject</th><th>Grade</th><th>Status</th></tr></thead>
                            <tbody>
                                {grades.slice(0, 8).map((g, i) => (
                                    <tr key={i}>
                                        <td style={{ fontWeight: 500 }}>{g.subject}</td>
                                        <td style={{ fontWeight: 700, color: g.grade >= 80 ? '#22c55e' : g.grade >= 60 ? '#f59e0b' : '#ef4444' }}>{g.grade}/{g.max_grade}</td>
                                        <td><span className={`badge ${g.grade >= 80 ? 'badge-success' : g.grade >= 60 ? 'badge-warning' : 'badge-danger'}`}>
                                            {g.grade >= 80 ? 'Excellent' : g.grade >= 60 ? 'Good' : 'Needs Work'}
                                        </span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

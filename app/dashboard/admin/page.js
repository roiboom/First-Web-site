'use client';

import { useState, useEffect } from 'react';
import { Users, GraduationCap, ClipboardCheck, TrendingUp, BookOpen, Calendar, UserPlus, BarChart3 } from 'lucide-react';

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/reports')
            .then(r => r.json())
            .then(data => { setStats(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    if (loading) return <div className="loading-page"><div className="spinner" /></div>;

    const cards = [
        { label: 'Total Students', value: stats?.totalStudents || 0, icon: Users, color: '#3b82f6', bg: 'linear-gradient(135deg, #dbeafe, #eff6ff)' },
        { label: 'Total Teachers', value: stats?.totalTeachers || 0, icon: GraduationCap, color: '#8b5cf6', bg: 'linear-gradient(135deg, #ede9fe, #f5f3ff)' },
        { label: 'Attendance Rate', value: `${stats?.attendanceRate || 0}%`, icon: ClipboardCheck, color: '#22c55e', bg: 'linear-gradient(135deg, #dcfce7, #f0fdf4)' },
        { label: 'Average Grade', value: stats?.avgGrade || 0, icon: TrendingUp, color: '#f59e0b', bg: 'linear-gradient(135deg, #fef3c7, #fffbeb)' },
    ];

    return (
        <div>
            {/* Stats Cards */}
            <div style={styles.statsGrid} className="stagger">
                {cards.map((card, i) => {
                    const Icon = card.icon;
                    return (
                        <div key={i} className="card animate-fade-in" style={styles.statCard}>
                            <div style={styles.statTop}>
                                <div>
                                    <p style={styles.statLabel}>{card.label}</p>
                                    <h2 style={{ ...styles.statValue, color: card.color }}>{card.value}</h2>
                                </div>
                                <div style={{ ...styles.statIcon, background: card.bg }}>
                                    <Icon size={24} color={card.color} />
                                </div>
                            </div>
                            <div style={styles.statBar}>
                                <div style={{ ...styles.statBarFill, width: `${Math.min(100, typeof card.value === 'string' ? parseInt(card.value) : (card.value / 20) * 100)}%`, background: card.color }} />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Content Grid */}
            <div style={styles.contentGrid}>
                {/* Recent Students */}
                <div className="card" style={{ padding: '24px' }}>
                    <div style={styles.sectionHeader}>
                        <h3 style={styles.sectionTitle}>
                            <UserPlus size={20} color="#3b82f6" /> Recent Students
                        </h3>
                    </div>
                    <div className="table-container" style={{ marginTop: '16px' }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>ID</th>
                                    <th>Class</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(stats?.recentStudents || []).map((s, i) => (
                                    <tr key={i}>
                                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.full_name}</td>
                                        <td><span className="badge badge-primary">{s.student_id}</span></td>
                                        <td>{s.class_name}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Grades by Subject */}
                <div className="card" style={{ padding: '24px' }}>
                    <div style={styles.sectionHeader}>
                        <h3 style={styles.sectionTitle}>
                            <BarChart3 size={20} color="#8b5cf6" /> Grades by Subject
                        </h3>
                    </div>
                    <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {(stats?.gradesBySubject || []).map((g, i) => {
                            const colors = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
                            const color = colors[i % colors.length];
                            return (
                                <div key={i}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{g.subject}</span>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Avg: {Math.round(g.avg)}</span>
                                    </div>
                                    <div style={styles.progressBg}>
                                        <div style={{ ...styles.progressFill, width: `${g.avg}%`, background: `linear-gradient(90deg, ${color}, ${color}aa)` }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="card" style={{ padding: '24px', marginTop: '24px' }}>
                <h3 style={styles.sectionTitle}>
                    <Calendar size={20} color="#22c55e" /> Quick Actions
                </h3>
                <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
                    <a href="/dashboard/admin/students" className="btn btn-primary">
                        <UserPlus size={18} /> Add Student
                    </a>
                    <a href="/dashboard/admin/teachers" className="btn btn-outline" style={{ color: '#8b5cf6', borderColor: '#8b5cf6' }}>
                        <GraduationCap size={18} /> Manage Teachers
                    </a>
                    <a href="/dashboard/admin/messages" className="btn btn-outline" style={{ color: '#3b82f6', borderColor: '#3b82f6' }}>
                        <BookOpen size={18} /> Send Announcement
                    </a>
                </div>
            </div>
        </div>
    );
}

const styles = {
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '20px',
        marginBottom: '24px',
    },
    statCard: {
        padding: '20px',
    },
    statTop: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    statLabel: {
        fontSize: '0.825rem',
        color: 'var(--text-muted)',
        fontWeight: 500,
        marginBottom: '4px',
    },
    statValue: {
        fontSize: '2rem',
        fontWeight: 800,
        lineHeight: 1.1,
    },
    statIcon: {
        width: '48px',
        height: '48px',
        borderRadius: '14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    statBar: {
        height: '4px',
        borderRadius: '999px',
        background: 'var(--bg-hover)',
        marginTop: '16px',
        overflow: 'hidden',
    },
    statBarFill: {
        height: '100%',
        borderRadius: '999px',
        transition: 'width 1s ease',
    },
    contentGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '24px',
    },
    sectionHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sectionTitle: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontSize: '1rem',
        fontWeight: 700,
    },
    progressBg: {
        height: '8px',
        borderRadius: '999px',
        background: 'var(--bg-hover)',
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: '999px',
        transition: 'width 1s ease',
    },
};

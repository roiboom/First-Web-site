'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Users, GraduationCap, ClipboardCheck, TrendingUp } from 'lucide-react';

export default function AdminReports() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/reports').then(r => r.json()).then(data => { setStats(data); setLoading(false); });
    }, []);

    if (loading) return <div className="loading-page"><div className="spinner" /></div>;

    // Build attendance by class data
    const classAttendance = {};
    (stats?.attendanceByClass || []).forEach(row => {
        if (!classAttendance[row.class_name]) classAttendance[row.class_name] = {};
        classAttendance[row.class_name][row.status] = row.count;
    });

    return (
        <div>
            <div className="card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BarChart3 size={20} color="#3b82f6" /> Reports & Analytics
                </h3>
            </div>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                {[
                    { label: 'Students', value: stats?.totalStudents, icon: Users, color: '#3b82f6' },
                    { label: 'Teachers', value: stats?.totalTeachers, icon: GraduationCap, color: '#8b5cf6' },
                    { label: 'Attendance', value: `${stats?.attendanceRate}%`, icon: ClipboardCheck, color: '#22c55e' },
                    { label: 'Avg Grade', value: stats?.avgGrade, icon: TrendingUp, color: '#f59e0b' },
                ].map((c, i) => {
                    const Icon = c.icon;
                    return (
                        <div key={i} className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${c.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Icon size={22} color={c.color} />
                            </div>
                            <div>
                                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{c.label}</p>
                                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: c.color }}>{c.value}</h3>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
                {/* Grades by Subject */}
                <div className="card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '20px' }}>📊 Grade Distribution by Subject</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {(stats?.gradesBySubject || []).map((g, i) => {
                            const colors = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
                            const color = colors[i % colors.length];
                            return (
                                <div key={i}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                        <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{g.subject}</span>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            Min: {Math.round(g.min)} | Avg: {Math.round(g.avg)} | Max: {Math.round(g.max)}
                                        </span>
                                    </div>
                                    <div style={{ height: '10px', borderRadius: '999px', background: 'var(--bg-hover)', overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${g.avg}%`, borderRadius: '999px', background: `linear-gradient(90deg, ${color}, ${color}99)`, transition: 'width 1s ease' }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Attendance by Class */}
                <div className="card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '20px' }}>📋 Attendance by Class (Last 30 Days)</h3>
                    {Object.entries(classAttendance).map(([cls, data]) => {
                        const total = Object.values(data).reduce((s, v) => s + v, 0);
                        const present = data.present || 0;
                        const rate = total > 0 ? Math.round((present / total) * 100) : 0;
                        return (
                            <div key={cls} style={{ marginBottom: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ fontWeight: 600 }}>{cls}</span>
                                    <span style={{ fontSize: '0.85rem', color: rate > 80 ? '#22c55e' : '#f59e0b', fontWeight: 600 }}>{rate}% Present</span>
                                </div>
                                <div style={{ display: 'flex', gap: '4px', height: '28px', borderRadius: '8px', overflow: 'hidden' }}>
                                    {data.present && <div style={{ flex: data.present, background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.7rem', fontWeight: 600 }}>{data.present}</div>}
                                    {data.late && <div style={{ flex: data.late, background: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.7rem', fontWeight: 600 }}>{data.late}</div>}
                                    {data.absent && <div style={{ flex: data.absent, background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.7rem', fontWeight: 600 }}>{data.absent}</div>}
                                    {data.excused && <div style={{ flex: data.excused, background: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.7rem', fontWeight: 600 }}>{data.excused}</div>}
                                </div>
                                <div style={{ display: 'flex', gap: '16px', marginTop: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    <span>🟢 Present: {data.present || 0}</span>
                                    <span>🟡 Late: {data.late || 0}</span>
                                    <span>🔴 Absent: {data.absent || 0}</span>
                                    <span>⚪ Excused: {data.excused || 0}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

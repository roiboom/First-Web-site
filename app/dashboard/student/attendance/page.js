'use client';

import { useState, useEffect } from 'react';
import { ClipboardCheck, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

export default function StudentAttendance() {
    const { t } = useLanguage();
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/attendance').then(r => r.json()).then(data => { setAttendance(data); setLoading(false); });
    }, []);

    if (loading) return <div className="loading-page"><div className="spinner" /></div>;

    const totals = {
        present: attendance.filter(a => a.status === 'present').length,
        absent: attendance.filter(a => a.status === 'absent').length,
        late: attendance.filter(a => a.status === 'late').length,
        excused: attendance.filter(a => a.status === 'excused').length,
    };
    const total = attendance.length;
    const rate = total > 0 ? Math.round((totals.present / total) * 100) : 0;

    const statusConfig = {
        present: { icon: CheckCircle2, color: '#22c55e', bg: '#dcfce7', label: t.teacher_attendance.present },
        absent: { icon: XCircle, color: '#ef4444', bg: '#fee2e2', label: t.teacher_attendance.absent },
        late: { icon: Clock, color: '#f59e0b', bg: '#fef3c7', label: t.teacher_attendance.late },
        excused: { icon: AlertCircle, color: '#64748b', bg: '#f1f5f9', label: t.teacher_attendance.excused },
    };

    return (
        <div className="animate-fade-in">
            <div className="card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ClipboardCheck size={20} color="#22c55e" /> {t.student_attendance.title}
                </h3>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '24px' }} className="stagger">
                <div className="card animate-fade-in" style={{ padding: '20px', textAlign: 'center' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: `conic-gradient(#22c55e ${rate * 3.6}deg, var(--bg-hover) 0deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1rem', color: '#22c55e' }}>
                            {rate}%
                        </div>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Rate</p>
                </div>

                {Object.entries(totals).map(([status, count]) => {
                    const config = statusConfig[status];
                    const Icon = config.icon;
                    return (
                        <div key={status} className="card animate-fade-in" style={{ padding: '18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${config.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Icon size={20} color={config.color} />
                            </div>
                            <div>
                                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{config.label}</p>
                                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: config.color }}>{count}</h3>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* History */}
            <div className="card">
                <div className="table-container">
                    <table>
                        <thead><tr><th>{t.teacher_attendance.date}</th><th>Day</th><th>{t.student_grades.status}</th></tr></thead>
                        <tbody>
                            {attendance.slice(0, 30).map((a, i) => {
                                const config = statusConfig[a.status];
                                const Icon = config.icon;
                                const dateObj = new Date(a.date + 'T00:00:00');
                                const dayNameIndex = dateObj.getDay();
                                const translatedDayName = [t.common.sunday, t.common.monday, t.common.tuesday, t.common.wednesday, t.common.thursday, t.common.friday, t.common.saturday][dayNameIndex];
                                const shortTranslatedDayName = translatedDayName.substring(0, 3);
                                return (
                                    <tr key={i}>
                                        <td style={{ fontWeight: 500 }}>{a.date}</td>
                                        <td>{shortTranslatedDayName}</td>
                                        <td>
                                            <span className={`badge ${a.status === 'present' ? 'badge-success' : a.status === 'absent' ? 'badge-danger' : a.status === 'late' ? 'badge-warning' : 'badge-primary'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                <Icon size={12} /> {config.label}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

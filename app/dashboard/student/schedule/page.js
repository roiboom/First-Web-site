'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

export default function StudentSchedule() {
    const { t, language } = useLanguage();
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/schedule').then(r => r.json()).then(data => { setSchedule(data); setLoading(false); });
    }, []);

    if (loading) return <div className="loading-page"><div className="spinner" /></div>;

    const daysEn = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    // For rendering translated days
    const translatedDays = [t.common.monday, t.common.tuesday, t.common.wednesday, t.common.thursday, t.common.friday];

    // For comparing with database english days
    const allDaysEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayIndex = new Date().getDay();
    const todayEn = allDaysEn[todayIndex];
    const todayTranslated = [t.common.sunday, t.common.monday, t.common.tuesday, t.common.wednesday, t.common.thursday, t.common.friday, t.common.saturday][todayIndex];

    const dayColors = {
        Monday: '#3b82f6', Tuesday: '#22c55e', Wednesday: '#f59e0b', Thursday: '#8b5cf6', Friday: '#ef4444',
    };

    return (
        <div className="animate-fade-in">
            <div className="card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={20} color="#3b82f6" /> {t.student_schedule.title}
                </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }} className="stagger">
                {daysEn.map((dayEn, idx) => {
                    const daySchedule = schedule.filter(s => s.day_of_week === dayEn);
                    const isToday = dayEn === todayEn;
                    const color = dayColors[dayEn];
                    const translatedDay = translatedDays[idx];

                    return (
                        <div key={dayEn} className="card animate-fade-in" style={{ overflow: 'hidden' }}>
                            <div style={{
                                padding: '14px 20px',
                                background: isToday ? `linear-gradient(135deg, ${color}, ${color}cc)` : 'var(--bg-hover)',
                                color: isToday ? 'white' : 'var(--text-primary)',
                                fontWeight: 700,
                                fontSize: '0.9rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                            }}>
                                <span>{translatedDay}</span>
                                {isToday && <span className="badge" style={{ background: 'rgba(255,255,255,0.25)', color: 'white', fontSize: '0.7rem' }}>Today</span>}
                            </div>
                            <div style={{ padding: '12px' }}>
                                {daySchedule.length > 0 ? daySchedule.map((s, i) => (
                                    <div key={i} style={{
                                        padding: '12px',
                                        borderRadius: '10px',
                                        background: 'var(--bg-hover)',
                                        marginBottom: '8px',
                                        borderLeft: language === 'ar' ? 'none' : `3px solid ${color}`,
                                        borderRight: language === 'ar' ? `3px solid ${color}` : 'none',
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                            <Clock size={14} color="var(--text-muted)" />
                                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>{s.start_time} - {s.end_time}</span>
                                        </div>
                                        <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{s.subject}</p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.room} • {s.teacher_name}</p>
                                    </div>
                                )) : (
                                    <p style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{t.student_schedule.noClasses}</p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

'use client';

import { useState, useEffect } from 'react';
import { BookOpen, TrendingUp } from 'lucide-react';

export default function StudentGrades() {
    const [grades, setGrades] = useState([]);
    const [term, setTerm] = useState('Term 1');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/grades?term=${term}`).then(r => r.json()).then(data => { setGrades(data); setLoading(false); });
    }, [term]);

    if (loading) return <div className="loading-page"><div className="spinner" /></div>;

    const avgGrade = grades.length > 0 ? Math.round(grades.reduce((sum, g) => sum + g.grade, 0) / grades.length) : 0;
    const subjects = [...new Set(grades.map(g => g.subject))];

    return (
        <div>
            <div className="card" style={{ padding: '16px 20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BookOpen size={20} color="#3b82f6" /> My Grades
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '10px', background: `${avgGrade >= 80 ? '#22c55e' : avgGrade >= 60 ? '#f59e0b' : '#ef4444'}15` }}>
                        <TrendingUp size={18} color={avgGrade >= 80 ? '#22c55e' : avgGrade >= 60 ? '#f59e0b' : '#ef4444'} />
                        <span style={{ fontWeight: 700, color: avgGrade >= 80 ? '#22c55e' : avgGrade >= 60 ? '#f59e0b' : '#ef4444' }}>
                            GPA: {avgGrade}
                        </span>
                    </div>
                    <select value={term} onChange={e => setTerm(e.target.value)} style={{ maxWidth: '120px' }}>
                        <option>Term 1</option>
                        <option>Term 2</option>
                    </select>
                </div>
            </div>

            {/* Grade Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }} className="stagger">
                {subjects.map(subj => {
                    const subjectGrades = grades.filter(g => g.subject === subj);
                    const grade = subjectGrades[0]?.grade || 0;
                    const colors = {
                        Mathematics: '#3b82f6', English: '#22c55e', Physics: '#f59e0b',
                        Chemistry: '#ef4444', Biology: '#8b5cf6', History: '#ec4899',
                    };
                    const color = colors[subj] || '#64748b';
                    return (
                        <div key={subj} className="card animate-fade-in" style={{ padding: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{subj}</h4>
                                <span className={`badge ${grade >= 80 ? 'badge-success' : grade >= 60 ? 'badge-warning' : 'badge-danger'}`}>
                                    {grade >= 80 ? 'Excellent' : grade >= 60 ? 'Good' : 'Needs Work'}
                                </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '10px' }}>
                                <span style={{ fontSize: '2rem', fontWeight: 800, color }}>{grade}</span>
                                <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/100</span>
                            </div>
                            <div style={{ height: '8px', borderRadius: '999px', background: 'var(--bg-hover)', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${grade}%`, borderRadius: '999px', background: `linear-gradient(90deg, ${color}, ${color}88)`, transition: 'width 1s ease' }} />
                            </div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                                {subjectGrades[0]?.remarks || 'No remarks'}
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* All Grades Table */}
            <div className="card">
                <div className="table-container">
                    <table>
                        <thead><tr><th>Subject</th><th>Grade</th><th>Max</th><th>Term</th><th>Remarks</th></tr></thead>
                        <tbody>
                            {grades.map((g, i) => (
                                <tr key={i}>
                                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{g.subject}</td>
                                    <td style={{ fontWeight: 700, color: g.grade >= 80 ? '#22c55e' : g.grade >= 60 ? '#f59e0b' : '#ef4444' }}>{g.grade}</td>
                                    <td>{g.max_grade}</td>
                                    <td><span className="badge badge-primary">{g.term}</span></td>
                                    <td style={{ color: 'var(--text-muted)' }}>{g.remarks || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

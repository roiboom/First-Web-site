'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Save, Search } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

export default function TeacherGrades() {
    const { t } = useLanguage();
    const [students, setStudents] = useState([]);
    const [grades, setGrades] = useState([]);
    const [subject, setSubject] = useState('Mathematics');
    const [term, setTerm] = useState('Term 1');
    const [editMode, setEditMode] = useState(false);
    const [gradeEdits, setGradeEdits] = useState({});
    const [saving, setSaving] = useState(false);

    const subjects = ['Mathematics', 'English', 'Physics', 'Chemistry', 'Biology', 'History'];

    useEffect(() => {
        fetch('/api/students').then(r => r.json()).then(setStudents);
    }, []);

    useEffect(() => {
        fetch(`/api/grades?term=${term}`).then(r => r.json()).then(data => {
            setGrades(data);
            const edits = {};
            data.forEach(g => { edits[`${g.student_id || g.student_code}-${g.subject}`] = g.grade; });
            setGradeEdits(edits);
        });
    }, [term]);

    const getGrade = (studentId, subj) => {
        const g = grades.find(gr => gr.student_id === studentId && gr.subject === subj);
        return g ? g.grade : '-';
    };

    const handleSave = async () => {
        setSaving(true);
        const gradeData = [];
        students.forEach(s => {
            const key = `${s.id}-${subject}`;
            if (gradeEdits[key] !== undefined) {
                gradeData.push({
                    studentId: s.id,
                    subject,
                    grade: Number(gradeEdits[key]),
                    maxGrade: 100,
                    term,
                    remarks: '',
                });
            }
        });

        await fetch('/api/grades', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ grades: gradeData }),
        });

        setSaving(false);
        setEditMode(false);
        // Refresh
        const data = await fetch(`/api/grades?term=${term}`).then(r => r.json());
        setGrades(data);
    };

    return (
        <div className="animate-fade-in">
            <div className="card" style={{ padding: '16px 20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BookOpen size={20} color="#8b5cf6" /> {t.teacher_grades.title}
                </h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <select value={subject} onChange={e => setSubject(e.target.value)} style={{ maxWidth: '160px' }}>
                        {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <select value={term} onChange={e => setTerm(e.target.value)} style={{ maxWidth: '120px' }}>
                        <option>Term 1</option>
                        <option>Term 2</option>
                    </select>
                    {editMode ? (
                        <button className="btn btn-success" onClick={handleSave} disabled={saving}>
                            <Save size={16} /> {saving ? '...' : t.teacher_grades.saveChanges}
                        </button>
                    ) : (
                        <button className="btn btn-primary" onClick={() => setEditMode(true)}>
                            {t.teacher_grades.saveChanges} {/* Reusing the save changes string as a generic edit button text, or maybe just "Edit" */}
                        </button>
                    )}
                </div>
            </div>

            <div className="card">
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>{t.teacher_grades.student}</th>
                                <th>ID</th>
                                <th>{t.teacher_dashboard.classGroup}</th>
                                <th>{subject} {t.teacher_grades.grade}</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map(s => {
                                const grade = getGrade(s.id, subject);
                                const key = `${s.id}-${subject}`;
                                const displayGrade = editMode ? (gradeEdits[key] ?? grade) : grade;
                                const numGrade = typeof displayGrade === 'number' ? displayGrade : parseInt(displayGrade);
                                return (
                                    <tr key={s.student_id}>
                                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.full_name}</td>
                                        <td><span className="badge badge-primary">{s.student_id}</span></td>
                                        <td>{s.class_name}</td>
                                        <td>
                                            {editMode ? (
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    value={gradeEdits[key] ?? ''}
                                                    onChange={e => setGradeEdits({ ...gradeEdits, [key]: e.target.value })}
                                                    style={{ maxWidth: '80px', padding: '6px 10px' }}
                                                />
                                            ) : (
                                                <span style={{ fontWeight: 700, fontSize: '1rem', color: numGrade >= 80 ? '#22c55e' : numGrade >= 60 ? '#f59e0b' : '#ef4444' }}>
                                                    {displayGrade}
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            {!isNaN(numGrade) && (
                                                <span className={`badge ${numGrade >= 80 ? 'badge-success' : numGrade >= 60 ? 'badge-warning' : 'badge-danger'}`}>
                                                    {numGrade >= 80 ? 'Excellent' : numGrade >= 60 ? 'Good' : 'Needs Work'}
                                                </span>
                                            )}
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

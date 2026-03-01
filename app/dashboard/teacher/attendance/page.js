'use client';

import { useState, useEffect } from 'react';
import { ClipboardCheck, Save, Check, X as XIcon } from 'lucide-react';

export default function TeacherAttendance() {
    const [students, setStudents] = useState([]);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendance, setAttendance] = useState({});
    const [existingAttendance, setExistingAttendance] = useState([]);
    const [classFilter, setClassFilter] = useState('');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        fetch('/api/students').then(r => r.json()).then(setStudents);
    }, []);

    useEffect(() => {
        fetch(`/api/attendance?date=${date}`)
            .then(r => r.json())
            .then(data => {
                setExistingAttendance(data);
                const att = {};
                data.forEach(a => { att[a.student_id] = a.status; });
                setAttendance(att);
            });
    }, [date]);

    const filteredStudents = classFilter
        ? students.filter(s => s.class_name === classFilter)
        : students;

    const toggleStatus = (studentId, status) => {
        setAttendance(prev => ({ ...prev, [studentId]: status }));
        setSaved(false);
    };

    const handleSave = async () => {
        setSaving(true);
        const records = Object.entries(attendance).map(([studentId, status]) => ({
            studentId: parseInt(studentId),
            date,
            status,
        }));

        await fetch('/api/attendance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ records }),
        });

        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const markAll = (status) => {
        const att = { ...attendance };
        filteredStudents.forEach(s => { att[s.id] = status; });
        setAttendance(att);
    };

    const presentCount = filteredStudents.filter(s => attendance[s.id] === 'present').length;
    const absentCount = filteredStudents.filter(s => attendance[s.id] === 'absent').length;

    return (
        <div>
            <div className="card" style={{ padding: '16px 20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ClipboardCheck size={20} color="#22c55e" /> Record Attendance
                </h3>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ maxWidth: '160px' }} />
                    <select value={classFilter} onChange={e => setClassFilter(e.target.value)} style={{ maxWidth: '130px' }}>
                        <option value="">All Classes</option>
                        <option>Class A</option>
                        <option>Class B</option>
                    </select>
                    <button className="btn btn-success" onClick={handleSave} disabled={saving}>
                        {saved ? <Check size={16} /> : <Save size={16} />}
                        {saving ? 'Saving...' : saved ? 'Saved!' : 'Save'}
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                <div className="card" style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e' }} />
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Present: <strong>{presentCount}</strong></span>
                </div>
                <div className="card" style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} />
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Absent: <strong>{absentCount}</strong></span>
                </div>
                <button className="btn btn-outline btn-sm" onClick={() => markAll('present')}>Mark All Present</button>
            </div>

            <div className="card">
                <div className="table-container">
                    <table>
                        <thead>
                            <tr><th>Student</th><th>ID</th><th>Class</th><th>Status</th></tr>
                        </thead>
                        <tbody>
                            {filteredStudents.map(s => {
                                const status = attendance[s.id] || 'unmarked';
                                return (
                                    <tr key={s.student_id}>
                                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.full_name}</td>
                                        <td><span className="badge badge-primary">{s.student_id}</span></td>
                                        <td>{s.class_name}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                {['present', 'absent', 'late', 'excused'].map(st => (
                                                    <button
                                                        key={st}
                                                        onClick={() => toggleStatus(s.id, st)}
                                                        className={`btn btn-sm ${status === st ? (st === 'present' ? 'btn-success' : st === 'absent' ? 'btn-danger' : 'btn-outline') : 'btn-outline'}`}
                                                        style={{
                                                            ...(status === st && st === 'late' ? { background: '#f59e0b', color: 'white', borderColor: '#f59e0b' } : {}),
                                                            ...(status === st && st === 'excused' ? { background: '#64748b', color: 'white', borderColor: '#64748b' } : {}),
                                                            textTransform: 'capitalize',
                                                            fontSize: '0.75rem',
                                                            padding: '4px 10px',
                                                        }}
                                                    >
                                                        {st}
                                                    </button>
                                                ))}
                                            </div>
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

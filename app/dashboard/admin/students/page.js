'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Edit3, Trash2, X, UserPlus, Download, Eye, EyeOff, Filter } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

export default function AdminStudents() {
    const { t } = useLanguage();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [classFilter, setClassFilter] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editStudent, setEditStudent] = useState(null);
    const [newCreds, setNewCreds] = useState(null);
    const [form, setForm] = useState({ fullName: '', email: '', dateOfBirth: '', gender: '', phone: '', address: '', className: 'Class A', parentName: '', parentPhone: '' });

    const fetchStudents = () => {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (classFilter) params.set('class', classFilter);
        fetch(`/api/students?${params}`)
            .then(r => r.json())
            .then(data => { setStudents(data); setLoading(false); });
    };

    useEffect(() => { fetchStudents(); }, [search, classFilter]);

    const openAdd = () => {
        setEditStudent(null);
        setForm({ fullName: '', email: '', dateOfBirth: '', gender: '', phone: '', address: '', className: 'Class A', parentName: '', parentPhone: '' });
        setNewCreds(null);
        setShowModal(true);
    };

    const openEdit = (s) => {
        setEditStudent(s);
        setForm({
            fullName: s.full_name, email: s.email || '', dateOfBirth: s.date_of_birth || '',
            gender: s.gender || '', phone: s.phone || '', address: s.address || '',
            className: s.class_name || 'Class A', parentName: s.parent_name || '', parentPhone: s.parent_phone || '',
        });
        setNewCreds(null);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (editStudent) {
            await fetch(`/api/students/${editStudent.id}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
            });
            setShowModal(false);
        } else {
            const res = await fetch('/api/students', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
            });
            const data = await res.json();
            if (data.success) {
                setNewCreds(data.student);
            }
        }
        fetchStudents();
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this student?')) return;
        await fetch(`/api/students/${id}`, { method: 'DELETE' });
        fetchStudents();
    };

    if (loading) return <div className="loading-page"><div className="spinner" /></div>;

    return (
        <div className="animate-fade-in">
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>{t.students_page.title}</h1>
                    <p style={styles.subtitle}>{t.students_page.subtitle}</p>
                </div>
                <div style={styles.actions}>
                    <button className="btn btn-outline">
                        <Download size={18} /> {t.students_page.exportData}
                    </button>
                    <button className="btn btn-primary" onClick={openAdd}>
                        <UserPlus size={18} /> {t.students_page.addStudent}
                    </button>
                </div>
            </div>

            <div className="card" style={styles.filtersCard}>
                <div style={styles.searchBox}>
                    <Search size={18} color="var(--text-muted)" />
                    <input
                        type="text"
                        placeholder={t.common.search}
                        style={styles.searchInput}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div style={styles.filterGroup}>
                    <button className="btn btn-outline" style={{ padding: '8px 12px' }}>
                        <Filter size={16} /> {t.students_page.filters}
                    </button>
                    <select style={styles.select} value={classFilter} onChange={e => setClassFilter(e.target.value)}>
                        <option value="">{t.students_page.allClasses}</option>
                        <option value="Class A">Class A</option>
                        <option value="Class B">Class B</option>
                    </select>
                    <select style={styles.select}>
                        <option>{t.students_page.allStatuses}</option>
                        <option>{t.students_page.active}</option>
                        <option>{t.students_page.inactive}</option>
                    </select>
                </div>
            </div>

            <div className="card table-container">
                <table>
                    <thead>
                        <tr>
                            <th>{t.students_page.tableStudent}</th>
                            <th>{t.dashboard.id}</th>
                            <th>{t.students_page.tableClass}</th>
                            <th>{t.students_page.tableStatus}</th>
                            <th style={{ textAlign: 'right' }}>{t.common.actions}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((student, i) => (
                            <tr key={student.id} className="stagger" style={{ animationDelay: `${i * 0.05}s` }}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={styles.avatar}>
                                            {(student.full_name || 'U')[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{student.full_name}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{student.email || 'student@school.edu'}</div>
                                        </div>
                                    </div>
                                </td>
                                <td><span className="badge badge-primary">{student.student_id}</span></td>
                                <td>{student.class_name || 'Unassigned'}</td>
                                <td>
                                    <span className="badge" style={{ background: '#dcfce7', color: '#166534' }}>{t.students_page.active}</span>
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                        <button style={styles.iconBtn} onClick={() => openEdit(student)} title={t.students_page.edit}><Edit3 size={16} /></button>
                                        <button style={{ ...styles.iconBtn, color: '#ef4444', borderColor: '#fca5a5' }} onClick={() => handleDelete(student.id)} title="Delete"><Trash2 size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {students.length === 0 && (
                            <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No students found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editStudent ? t.students_page.edit : t.students_page.addStudent}</h3>
                            <button className="btn btn-icon btn-outline" onClick={() => setShowModal(false)}><X size={18} /></button>
                        </div>
                        {newCreds ? (
                            <div className="modal-body" style={{ textAlign: 'center' }}>
                                <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, #22c55e, #16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                    <UserPlus size={28} color="white" />
                                </div>
                                <h3 style={{ marginBottom: '4px' }}>Student Created!</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>Share these credentials with the student.</p>
                                <div style={{ background: 'var(--bg-hover)', borderRadius: '12px', padding: '16px', textAlign: 'left' }}>
                                    <div style={{ display: 'grid', gap: '10px' }}>
                                        <div><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Full Name</span><br /><strong>{newCreds.fullName}</strong></div>
                                        <div><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Student ID</span><br /><strong>{newCreds.studentId}</strong></div>
                                        <div><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Username</span><br /><strong style={{ fontFamily: 'monospace' }}>{newCreds.username}</strong></div>
                                        <div><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Password</span><br /><strong style={{ fontFamily: 'monospace', color: '#ef4444' }}>{newCreds.password}</strong></div>
                                    </div>
                                </div>
                                <button className="btn btn-primary w-full" style={{ marginTop: '20px' }} onClick={() => setShowModal(false)}>Done</button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="form-group">
                                        <label>Full Name *</label>
                                        <input required value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} placeholder="Enter full name" />
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Email</label>
                                            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email address" />
                                        </div>
                                        <div className="form-group">
                                            <label>Date of Birth</label>
                                            <input type="date" value={form.dateOfBirth} onChange={e => setForm({ ...form, dateOfBirth: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Gender</label>
                                            <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                                                <option value="">Select</option>
                                                <option>Male</option>
                                                <option>Female</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Class</label>
                                            <select value={form.className} onChange={e => setForm({ ...form, className: e.target.value })}>
                                                <option>Class A</option>
                                                <option>Class B</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Phone</label>
                                            <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Phone number" />
                                        </div>
                                        <div className="form-group">
                                            <label>Parent Name</label>
                                            <input value={form.parentName} onChange={e => setForm({ ...form, parentName: e.target.value })} placeholder="Parent name" />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Address</label>
                                        <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Address" />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>{t.messages_page.cancel}</button>
                                    <button type="submit" className="btn btn-primary">{editStudent ? t.students_page.edit : t.students_page.addStudent}</button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

const styles = {
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px',
    },
    title: {
        fontSize: '1.5rem',
        fontWeight: 700,
        color: 'var(--text-primary)',
        marginBottom: '4px',
    },
    subtitle: {
        color: 'var(--text-muted)',
        fontSize: '0.9rem',
    },
    actions: {
        display: 'flex',
        gap: '12px',
    },
    filtersCard: {
        padding: '16px',
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
    },
    searchBox: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: 'var(--bg-secondary)',
        padding: '8px 16px',
        borderRadius: '10px',
        flex: '1 1 300px',
        border: '1px solid var(--border-color)',
    },
    searchInput: {
        border: 'none',
        background: 'transparent',
        outline: 'none',
        width: '100%',
        color: 'var(--text-primary)',
        fontSize: '0.9rem',
    },
    filterGroup: {
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
    },
    select: {
        padding: '8px 36px 8px 16px',
        borderRadius: '8px',
        border: '1px solid var(--border-color)',
        background: 'var(--bg-secondary)',
        color: 'var(--text-primary)',
        outline: 'none',
        appearance: 'none',
        cursor: 'pointer',
    },
    avatar: {
        width: '36px',
        height: '36px',
        borderRadius: '10px',
        background: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 600,
        fontSize: '1rem',
    },
    iconBtn: {
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        width: '32px',
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-secondary)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
    }
};

'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Edit3, Trash2, X, BookOpen } from 'lucide-react';

export default function AdminTeachers() {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editTeacher, setEditTeacher] = useState(null);
    const [newCreds, setNewCreds] = useState(null);
    const [form, setForm] = useState({ fullName: '', email: '', subject: '', department: 'General', phone: '' });

    const fetchTeachers = () => {
        fetch('/api/teachers').then(r => r.json()).then(data => { setTeachers(data); setLoading(false); });
    };

    useEffect(() => { fetchTeachers(); }, []);

    const openAdd = () => {
        setEditTeacher(null);
        setForm({ fullName: '', email: '', subject: '', department: 'General', phone: '' });
        setNewCreds(null);
        setShowModal(true);
    };

    const openEdit = (t) => {
        setEditTeacher(t);
        setForm({ fullName: t.full_name, email: t.email || '', subject: t.subject || '', department: t.department || 'General', phone: t.phone || '' });
        setNewCreds(null);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (editTeacher) {
            await fetch(`/api/teachers/${editTeacher.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
            setShowModal(false);
        } else {
            const res = await fetch('/api/teachers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
            const data = await res.json();
            if (data.success) setNewCreds(data.teacher);
        }
        fetchTeachers();
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this teacher?')) return;
        await fetch(`/api/teachers/${id}`, { method: 'DELETE' });
        fetchTeachers();
    };

    return (
        <div>
            <div className="card" style={{ padding: '16px 20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BookOpen size={20} color="#8b5cf6" /> Teacher Management
                </h3>
                <button className="btn btn-primary" onClick={openAdd}><Plus size={18} /> Add Teacher</button>
            </div>

            <div className="card">
                <div className="table-container">
                    <table>
                        <thead>
                            <tr><th>Teacher</th><th>ID</th><th>Username</th><th>Subject</th><th>Department</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {teachers.map(t => (
                                <tr key={t.teacher_id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.85rem' }}>
                                                {t.full_name?.[0]}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.full_name}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td><span className="badge badge-purple">{t.teacher_id}</span></td>
                                    <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{t.username}</td>
                                    <td>{t.subject}</td>
                                    <td>{t.department}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '6px' }}>
                                            <button className="btn btn-outline btn-sm btn-icon" onClick={() => openEdit(t)}><Edit3 size={15} /></button>
                                            <button className="btn btn-sm btn-icon" onClick={() => handleDelete(t.id)}
                                                style={{ background: 'var(--danger-50)', color: 'var(--danger-500)', border: '1px solid var(--danger-100)' }}>
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {teachers.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No teachers found</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editTeacher ? 'Edit Teacher' : 'Add New Teacher'}</h3>
                            <button className="btn btn-icon btn-outline" onClick={() => setShowModal(false)}><X size={18} /></button>
                        </div>
                        {newCreds ? (
                            <div className="modal-body" style={{ textAlign: 'center' }}>
                                <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                    <BookOpen size={28} color="white" />
                                </div>
                                <h3 style={{ marginBottom: '4px' }}>Teacher Created!</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>Share these credentials with the teacher.</p>
                                <div style={{ background: 'var(--bg-hover)', borderRadius: '12px', padding: '16px', textAlign: 'left' }}>
                                    <div style={{ display: 'grid', gap: '10px' }}>
                                        <div><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Full Name</span><br /><strong>{newCreds.fullName}</strong></div>
                                        <div><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Username</span><br /><strong style={{ fontFamily: 'monospace' }}>{newCreds.username}</strong></div>
                                        <div><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Password</span><br /><strong style={{ fontFamily: 'monospace', color: '#ef4444' }}>{newCreds.password}</strong></div>
                                    </div>
                                </div>
                                <button className="btn btn-primary w-full" style={{ marginTop: '20px' }} onClick={() => setShowModal(false)}>Done</button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="form-row">
                                        <div className="form-group"><label>Full Name *</label><input required value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} /></div>
                                        <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group"><label>Subject *</label><input required value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} /></div>
                                        <div className="form-group"><label>Department</label><input value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} /></div>
                                    </div>
                                    <div className="form-group"><label>Phone</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary">{editTeacher ? 'Save Changes' : 'Create Teacher'}</button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

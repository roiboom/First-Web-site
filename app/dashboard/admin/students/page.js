'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Edit3, Trash2, X, UserPlus, Download, Eye, EyeOff } from 'lucide-react';

export default function AdminStudents() {
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

    return (
        <div>
            {/* Toolbar */}
            <div className="card" style={{ padding: '16px 20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: '10px', flex: 1, minWidth: '200px' }}>
                    <div style={{ position: 'relative', flex: 1, maxWidth: '300px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            placeholder="Search students..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{ paddingLeft: '38px' }}
                        />
                    </div>
                    <select value={classFilter} onChange={e => setClassFilter(e.target.value)} style={{ maxWidth: '140px' }}>
                        <option value="">All Classes</option>
                        <option value="Class A">Class A</option>
                        <option value="Class B">Class B</option>
                    </select>
                </div>
                <button className="btn btn-primary" onClick={openAdd}>
                    <Plus size={18} /> Add Student
                </button>
            </div>

            {/* Students Table */}
            <div className="card">
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Student</th>
                                <th>ID</th>
                                <th>Username</th>
                                <th>Class</th>
                                <th>Gender</th>
                                <th>Parent</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map(s => (
                                <tr key={s.student_id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #3b82f6, #60a5fa)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>
                                                {s.full_name?.[0]}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.full_name}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td><span className="badge badge-primary">{s.student_id}</span></td>
                                    <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{s.username}</td>
                                    <td><span className="badge badge-purple">{s.class_name}</span></td>
                                    <td>{s.gender || '-'}</td>
                                    <td>{s.parent_name || '-'}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '6px' }}>
                                            <button className="btn btn-outline btn-sm btn-icon" onClick={() => openEdit(s)} title="Edit">
                                                <Edit3 size={15} />
                                            </button>
                                            <button className="btn btn-sm btn-icon" onClick={() => handleDelete(s.id)} title="Delete"
                                                style={{ background: 'var(--danger-50)', color: 'var(--danger-500)', border: '1px solid var(--danger-100)' }}>
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {students.length === 0 && (
                                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No students found</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editStudent ? 'Edit Student' : 'Add New Student'}</h3>
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
                                    <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary">{editStudent ? 'Save Changes' : 'Create Student'}</button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

'use client';

import { useState, useEffect } from 'react';
import { Send, MessageSquare, Users, GraduationCap, Layers } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

export default function AdminMessages() {
    const { t } = useLanguage();
    const [messages, setMessages] = useState([]);
    const [students, setStudents] = useState([]);
    const [teachers, setTeachers] = useState([]);

    const [showCompose, setShowCompose] = useState(false);
    const [form, setForm] = useState({ subject: '', messageBody: '' });

    // Multi-select UI state
    const [targetType, setTargetType] = useState('all_students'); // 'all_students', 'all_teachers', 'custom'
    const [selectedTeachers, setSelectedTeachers] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [selectedClasses, setSelectedClasses] = useState([]);

    // Modals
    const [activeModal, setActiveModal] = useState(null); // 'teachers' | 'students' | 'classes' | null
    const [studentClassFilter, setStudentClassFilter] = useState('');

    useEffect(() => {
        fetch('/api/messages').then(r => r.json()).then(setMessages);
        fetch('/api/students').then(r => r.json()).then(setStudents);
        fetch('/api/teachers').then(r => r.json()).then(setTeachers);
    }, []);

    const handleSend = async (e) => {
        e.preventDefault();

        let payload = {
            subject: form.subject,
            messageBody: form.messageBody,
        };

        if (targetType === 'all_students') {
            payload.isAnnouncement = true;
            payload.recipientRole = 'student';
        } else if (targetType === 'all_teachers') {
            payload.isAnnouncement = true;
            payload.recipientRole = 'teacher';
        } else {
            payload.isAnnouncement = false;
            payload.recipientIds = [...selectedTeachers, ...selectedStudents];
            payload.recipientClasses = selectedClasses;

            if (payload.recipientIds.length === 0 && payload.recipientClasses.length === 0) {
                alert('Please select at least one recipient.');
                return;
            }
        }

        await fetch('/api/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        setShowCompose(false);
        setForm({ subject: '', messageBody: '' });
        setSelectedTeachers([]);
        setSelectedStudents([]);
        setSelectedClasses([]);
        fetch('/api/messages').then(r => r.json()).then(setMessages);
    };

    const uniqueClasses = [...new Set(students.map(s => s.class_name))];

    return (
        <div className="animate-fade-in">
            <div className="card" style={{ padding: '16px 20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MessageSquare size={20} color="#3b82f6" /> {t.messages_page.title}
                </h3>
                <button className="btn btn-primary" onClick={() => setShowCompose(!showCompose)}>
                    <Send size={18} /> {t.messages_page.newMessage}
                </button>
            </div>

            {showCompose && (
                <div className="card" style={{ padding: '24px', marginBottom: '20px' }}>
                    <form onSubmit={handleSend}>

                        <div className="form-group" style={{ marginBottom: '20px' }}>
                            <label>{t.messages_page.to}</label>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' }}>
                                <button type="button" className={`btn ${targetType === 'all_students' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTargetType('all_students')}>{t.students_page.allClasses}</button>
                                <button type="button" className={`btn ${targetType === 'all_teachers' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTargetType('all_teachers')}>{t.teachers_page.allDepartments}</button>
                                <button type="button" className={`btn ${targetType === 'custom' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTargetType('custom')}>{t.messages_page.selectRecipients}</button>
                            </div>

                            {targetType === 'custom' && (
                                <div style={{ padding: '16px', background: 'var(--bg-hover)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                                    <p style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '12px' }}>{t.messages_page.selectRecipients}</p>
                                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                        <button type="button" className="btn btn-outline" onClick={() => setActiveModal('teachers')}>
                                            <GraduationCap size={16} /> {t.common.teachers} ({selectedTeachers.length})
                                        </button>
                                        <button type="button" className="btn btn-outline" onClick={() => setActiveModal('students')}>
                                            <Users size={16} /> {t.common.students} ({selectedStudents.length})
                                        </button>
                                        <button type="button" className="btn btn-outline" onClick={() => setActiveModal('classes')}>
                                            <Layers size={16} /> {t.teachers_page.tableClasses} ({selectedClasses.length})
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label>{t.messages_page.subject}</label>
                            <input required value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder={t.messages_page.subject} />
                        </div>
                        <div className="form-group">
                            <label>{t.messages_page.message}</label>
                            <textarea rows={4} required value={form.messageBody} onChange={e => setForm({ ...form, messageBody: e.target.value })} placeholder={`${t.messages_page.message}...`} style={{ resize: 'vertical' }} />
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button type="submit" className="btn btn-primary"><Send size={16} /> {t.messages_page.send}</button>
                            <button type="button" className="btn btn-outline" onClick={() => setShowCompose(false)}>{t.messages_page.cancel}</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Modals for Custom Selection */}
            {activeModal && (
                <div onClick={() => setActiveModal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="card" onClick={e => e.stopPropagation()} style={{ width: '90%', maxWidth: '500px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', padding: '24px' }}>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                                {t.messages_page.selectRecipients}
                            </h3>
                            <button className="btn btn-outline btn-sm" onClick={() => setActiveModal(null)}>{t.messages_page.cancel}</button>
                        </div>

                        {activeModal === 'students' && (
                            <div className="form-group">
                                <select value={studentClassFilter} onChange={e => setStudentClassFilter(e.target.value)} style={{ marginBottom: '16px' }}>
                                    <option value="">{t.students_page.allClasses}</option>
                                    {uniqueClasses.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        )}

                        <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {activeModal === 'teachers' && teachers.map(t => (
                                <label key={t.userId} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: 'var(--bg-hover)', borderRadius: '8px', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={selectedTeachers.includes(t.userId)} onChange={(e) => {
                                        if (e.target.checked) setSelectedTeachers([...selectedTeachers, t.userId]);
                                        else setSelectedTeachers(selectedTeachers.filter(id => id !== t.userId));
                                    }} />
                                    <div>
                                        <span style={{ fontWeight: 600 }}>{t.full_name}</span>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>{t.subject} (ID: {t.teacher_id})</span>
                                    </div>
                                </label>
                            ))}

                            {activeModal === 'students' && students.filter(s => !studentClassFilter || s.class_name === studentClassFilter).map(s => (
                                <label key={s.userId} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: 'var(--bg-hover)', borderRadius: '8px', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={selectedStudents.includes(s.userId)} onChange={(e) => {
                                        if (e.target.checked) setSelectedStudents([...selectedStudents, s.userId]);
                                        else setSelectedStudents(selectedStudents.filter(id => id !== s.userId));
                                    }} />
                                    <div>
                                        <span style={{ fontWeight: 600 }}>{s.full_name}</span>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>{s.class_name} • {s.student_id}</span>
                                    </div>
                                </label>
                            ))}

                            {activeModal === 'classes' && uniqueClasses.map(c => (
                                <label key={c} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: 'var(--bg-hover)', borderRadius: '8px', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={selectedClasses.includes(c)} onChange={(e) => {
                                        if (e.target.checked) setSelectedClasses([...selectedClasses, c]);
                                        else setSelectedClasses(selectedClasses.filter(cls => cls !== c));
                                    }} />
                                    <span style={{ fontWeight: 600 }}>{c}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Sent Messages */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {messages.map(msg => (
                    <div key={msg.id} className="card" style={{ padding: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                            <div>
                                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>{msg.subject}</h4>
                                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                    {new Date(msg.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{msg.body}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

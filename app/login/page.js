'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GraduationCap, User, BookOpen, Shield, Eye, EyeOff, LogIn, Loader2 } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [selectedRole, setSelectedRole] = useState('admin');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const roles = [
        { key: 'admin', label: 'Admin', icon: Shield, color: '#ef4444', demo: { user: 'admin', pass: 'admin123' } },
        { key: 'teacher', label: 'Teacher', icon: BookOpen, color: '#3b82f6', demo: { user: 'teacher1', pass: 'teacher123' } },
        { key: 'student', label: 'Student', icon: User, color: '#22c55e', demo: { user: 'alice', pass: 'student123' } },
    ];

    const fillDemo = (role) => {
        const r = roles.find(r => r.key === role);
        if (r) {
            setUsername(r.demo.user);
            setPassword(r.demo.pass);
            setSelectedRole(role);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Login failed');
                setLoading(false);
                return;
            }

            router.push(`/dashboard/${data.user.role}`);
        } catch {
            setError('Network error. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            {/* Animated background shapes */}
            <div style={styles.bgShapes}>
                <div style={{ ...styles.shape, ...styles.shape1 }} />
                <div style={{ ...styles.shape, ...styles.shape2 }} />
                <div style={{ ...styles.shape, ...styles.shape3 }} />
                <div style={{ ...styles.shape, ...styles.shape4 }} />
                <div style={{ ...styles.shape, ...styles.shape5 }} />
                <div style={{ ...styles.shape, ...styles.shape6 }} />
            </div>

            {/* Floating education icons */}
            <div style={styles.floatingIcons}>
                <span style={{ ...styles.floatIcon, top: '10%', left: '5%', animationDelay: '0s' }}>📚</span>
                <span style={{ ...styles.floatIcon, top: '20%', right: '8%', animationDelay: '1s' }}>🎓</span>
                <span style={{ ...styles.floatIcon, bottom: '15%', left: '10%', animationDelay: '2s' }}>✏️</span>
                <span style={{ ...styles.floatIcon, top: '60%', right: '5%', animationDelay: '0.5s' }}>🔬</span>
                <span style={{ ...styles.floatIcon, top: '40%', left: '3%', animationDelay: '1.5s' }}>📐</span>
                <span style={{ ...styles.floatIcon, bottom: '30%', right: '12%', animationDelay: '2.5s' }}>🌍</span>
            </div>

            <div style={styles.loginCard}>
                {/* Header */}
                <div style={styles.cardHeader}>
                    <div style={styles.logoContainer}>
                        <div style={styles.logoCircle}>
                            <GraduationCap size={32} color="white" />
                        </div>
                    </div>
                    <h1 style={styles.title}>Student Portal</h1>
                    <p style={styles.subtitle}>Welcome back! Please sign in to continue.</p>
                </div>

                {/* Role Tabs */}
                <div style={styles.roleTabs}>
                    {roles.map(role => {
                        const Icon = role.icon;
                        const isActive = selectedRole === role.key;
                        return (
                            <button
                                key={role.key}
                                onClick={() => fillDemo(role.key)}
                                style={{
                                    ...styles.roleTab,
                                    ...(isActive ? {
                                        background: `linear-gradient(135deg, ${role.color}22, ${role.color}11)`,
                                        borderColor: role.color,
                                        color: role.color,
                                    } : {}),
                                }}
                            >
                                <Icon size={16} />
                                <span>{role.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} style={styles.form}>
                    {error && (
                        <div style={styles.errorBox}>
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <div style={styles.inputWrapper}>
                            <User size={18} style={styles.inputIcon} />
                            <input
                                id="username"
                                type="text"
                                placeholder="Enter your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                style={styles.inputWithIcon}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <div style={styles.inputWrapper}>
                            <Shield size={18} style={styles.inputIcon} />
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={styles.inputWithIcon}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={styles.eyeBtn}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            ...styles.submitBtn,
                            opacity: loading ? 0.7 : 1,
                        }}
                    >
                        {loading ? <Loader2 size={20} className="spin" style={{ animation: 'spin 0.6s linear infinite' }} /> : <LogIn size={20} />}
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>


            </div>

            <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes morphBg {
          0%, 100% { border-radius: 40% 60% 60% 40% / 60% 30% 70% 40%; }
          25% { border-radius: 50% 50% 30% 70% / 50% 60% 40% 50%; }
          50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
          75% { border-radius: 60% 40% 50% 50% / 40% 50% 60% 50%; }
        }
      `}</style>
        </div>
    );
}

const styles = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 40%, #1e40af 60%, #3b82f6 100%)',
        position: 'relative',
        overflow: 'hidden',
        padding: '20px',
    },
    bgShapes: {
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
    },
    shape: {
        position: 'absolute',
        animation: 'morphBg 15s ease-in-out infinite',
        opacity: 0.08,
    },
    shape1: { width: '500px', height: '500px', background: '#60a5fa', top: '-10%', left: '-10%', animationDuration: '18s' },
    shape2: { width: '400px', height: '400px', background: '#a78bfa', bottom: '-5%', right: '-5%', animationDuration: '22s', animationDelay: '2s' },
    shape3: { width: '300px', height: '300px', background: '#34d399', top: '40%', left: '60%', animationDuration: '20s', animationDelay: '4s' },
    shape4: { width: '200px', height: '200px', background: '#fbbf24', top: '10%', right: '20%', animationDuration: '16s', animationDelay: '1s' },
    shape5: { width: '250px', height: '250px', background: '#f472b6', bottom: '20%', left: '20%', animationDuration: '24s', animationDelay: '3s' },
    shape6: { width: '350px', height: '350px', background: '#818cf8', top: '60%', right: '40%', animationDuration: '19s', animationDelay: '5s' },
    floatingIcons: {
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
    },
    floatIcon: {
        position: 'absolute',
        fontSize: '2rem',
        animation: 'float 6s ease-in-out infinite',
        opacity: 0.3,
    },
    loginCard: {
        width: '100%',
        maxWidth: '440px',
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1)',
        position: 'relative',
        zIndex: 10,
        animation: 'fadeIn 0.6s ease-out',
        overflow: 'hidden',
    },
    cardHeader: {
        textAlign: 'center',
        padding: '32px 32px 0',
    },
    logoContainer: {
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '16px',
    },
    logoCircle: {
        width: '64px',
        height: '64px',
        borderRadius: '18px',
        background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 8px 24px rgba(37, 99, 235, 0.3)',
    },
    title: {
        fontSize: '1.6rem',
        fontWeight: 800,
        color: '#0f172a',
        marginBottom: '4px',
    },
    subtitle: {
        fontSize: '0.9rem',
        color: '#64748b',
    },
    roleTabs: {
        display: 'flex',
        gap: '8px',
        padding: '20px 32px 0',
    },
    roleTab: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        padding: '10px',
        borderRadius: '10px',
        border: '1.5px solid #e2e8f0',
        background: 'transparent',
        color: '#64748b',
        fontSize: '0.825rem',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        fontFamily: 'inherit',
    },
    form: {
        padding: '20px 32px',
    },
    inputWrapper: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
    },
    inputIcon: {
        position: 'absolute',
        left: '12px',
        color: '#94a3b8',
        pointerEvents: 'none',
    },
    inputWithIcon: {
        paddingLeft: '40px',
    },
    eyeBtn: {
        position: 'absolute',
        right: '12px',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: '#94a3b8',
        padding: '4px',
        display: 'flex',
        alignItems: 'center',
    },
    errorBox: {
        padding: '10px 14px',
        borderRadius: '10px',
        background: '#fef2f2',
        color: '#dc2626',
        fontSize: '0.85rem',
        fontWeight: 500,
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    submitBtn: {
        width: '100%',
        padding: '12px',
        borderRadius: '12px',
        border: 'none',
        background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
        color: 'white',
        fontSize: '0.95rem',
        fontWeight: 700,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        transition: 'all 0.2s ease',
        boxShadow: '0 4px 16px rgba(37, 99, 235, 0.3)',
        fontFamily: 'inherit',
        marginTop: '8px',
    },
    demoBox: {
        margin: '0 32px 24px',
        padding: '16px',
        borderRadius: '12px',
        background: '#f0f4ff',
        border: '1px solid #dbeafe',
    },
    demoTitle: {
        fontSize: '0.8rem',
        fontWeight: 700,
        color: '#1e40af',
        marginBottom: '10px',
        textAlign: 'center',
    },
    demoGrid: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },
    demoItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 12px',
        borderRadius: '8px',
        background: 'white',
        border: '1px solid #e2e8f0',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        fontFamily: 'inherit',
        fontSize: '0.825rem',
    },
};

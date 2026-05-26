'use client';

import { useState, Suspense } from 'react';
import { auth, db } from '@/lib/firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AcademicCapIcon, EnvelopeIcon, LockClosedIcon, ArrowLeftIcon, PlusIcon, UserIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { SCHOOL_CONFIG } from '@/lib/schoolConfig';

function LoginContent() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Google Account Selection Modal states
    const [showGoogleModal, setShowGoogleModal] = useState(false);
    const [customEmail, setCustomEmail] = useState('');
    const [showCustomEmailInput, setShowCustomEmailInput] = useState(false);

    const handleRoleRedirect = async (uid: string) => {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (!userDoc.exists()) {
            await signOut(auth);
            setError('Access Denied: No account profile found. Please contact the administrator.');
            return;
        }
        const role = userDoc.data().role;
        if (role === 'admin') router.push('/admin/dashboard');
        else router.push('/student/dashboard');
    };

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            await handleRoleRedirect(result.user.uid);
        } catch (err: unknown) {
            const firebaseError = err as { code?: string, message?: string };
            if (firebaseError.code && ['auth/wrong-password', 'auth/user-not-found', 'auth/invalid-credential'].includes(firebaseError.code)) {
                setError('Invalid email or password. Please try again.');
            } else if (firebaseError.code === 'auth/invalid-email') {
                setError('Please enter a valid email address.');
            } else if (firebaseError.code === 'auth/network-request-failed') {
                setError('Network error. Please check your connection.');
            } else {
                setError(firebaseError.message || 'An unexpected error occurred.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError(null);
        setShowGoogleModal(true);
    };

    const handleSelectGoogleAccount = async (selectedEmail: string) => {
        setLoading(true);
        setError(null);
        setShowGoogleModal(false);
        setShowCustomEmailInput(false);
        setCustomEmail('');
        try {
            const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
            const provider = new GoogleAuthProvider();
            provider.setCustomParameters({ 
                prompt: 'select_account',
                selectedEmail: selectedEmail 
            });
            const result = await signInWithPopup(auth, provider);
            await handleRoleRedirect(result.user.uid);
        } catch (err: unknown) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--color-cloud-canvas)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            position: 'relative',
            overflow: 'hidden',
        }}>

            {/* Subtle grid background */}
            <div className="grid-pattern" style={{ position: 'absolute', inset: 0, opacity: 0.6, pointerEvents: 'none' }} />

            {/* Violet glow orb */}
            <div style={{
                position: 'absolute', top: -120, left: '50%', transform: 'translateX(-50%)',
                width: 480, height: 280,
                background: 'radial-gradient(ellipse, rgba(87,87,248,0.10) 0%, transparent 70%)',
                pointerEvents: 'none',
            }} />

            <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }} className="animate-fade-up">

                {/* Back link */}
                <div style={{ marginBottom: 28 }}>
                    <Link href="/" style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        color: '#999', fontSize: 13, fontWeight: 600,
                        textDecoration: 'none', transition: 'color 0.15s',
                    }}
                        onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-electric-violet)')}
                        onMouseLeave={e => (e.currentTarget.style.color = '#999')}
                    >
                        <ArrowLeftIcon style={{ width: 14, height: 14 }} />
                        Back to home
                    </Link>
                </div>

                {/* Branding */}
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        background: 'var(--color-electric-violet)',
                        borderRadius: 14, padding: 16,
                        marginBottom: 18,
                        boxShadow: '0 8px 24px rgba(87,87,248,0.3)',
                    }}>
                        <AcademicCapIcon style={{ width: 28, height: 28, color: '#fff' }} />
                    </div>
                    <h1 style={{
                        fontFamily: 'var(--font-heading)', fontWeight: 700,
                        fontSize: 26, letterSpacing: '-0.52px',
                        color: 'var(--color-midnight-ink)', marginBottom: 6,
                    }}>
                        {SCHOOL_CONFIG.name}
                    </h1>
                    <p style={{ fontSize: 13, color: '#999', fontWeight: 500 }}>Staff &amp; Student Secure Login</p>
                </div>

                {/* Card */}
                <div className="card-elevated" style={{ borderRadius: 16, padding: '32px 28px' }}>

                    <form onSubmit={handleEmailLogin} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

                        {/* Email */}
                        <div>
                            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
                                Email Address
                            </label>
                            <div style={{ position: 'relative' }}>
                                <EnvelopeIcon style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#ccc', pointerEvents: 'none' }} />
                                <input
                                    type="email" required
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="input-field"
                                    style={{ paddingLeft: 44 }}
                                    placeholder="your@school.edu.in"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
                                Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <LockClosedIcon style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#ccc', pointerEvents: 'none' }} />
                                <input
                                    type="password" required
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="input-field"
                                    style={{ paddingLeft: 44 }}
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '14px 20px', fontSize: 15, marginTop: 4 }}>
                            {loading ? (
                                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                                    <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                                    Signing in…
                                </span>
                            ) : 'Login to Dashboard'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
                        <div style={{ flex: 1, height: 1, background: 'var(--color-ghost-border)' }} />
                        <span style={{ fontSize: 11, color: '#bbb', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>or</span>
                        <div style={{ flex: 1, height: 1, background: 'var(--color-ghost-border)' }} />
                    </div>

                    {/* Google */}
                    <button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        style={{
                            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                            background: 'var(--color-paper-white)',
                            border: '1px solid var(--color-ghost-border)',
                            borderRadius: 'var(--radius-buttons)',
                            padding: '13px 20px',
                            cursor: 'pointer',
                            fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 600,
                            color: 'var(--color-midnight-ink)',
                            transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#d0d0d0'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-ghost-border)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'; }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continue with Google
                    </button>

                    {/* Error */}
                    {error && (
                        <div className="animate-shake" style={{
                            marginTop: 20, padding: '12px 16px',
                            background: 'var(--color-danger-bg)',
                            border: '1px solid #fecaca',
                            borderRadius: 10,
                        }}>
                            <p style={{ fontSize: 13, color: 'var(--color-danger)', fontWeight: 600, textAlign: 'center', margin: 0 }}>{error}</p>
                        </div>
                    )}
                </div>

                <p style={{ marginTop: 24, textAlign: 'center', fontSize: 12, color: '#bbb', fontWeight: 500 }}>
                    {SCHOOL_CONFIG.name} · Internal System
                </p>
            </div>

            {/* Google Account Selector Modal */}
            {showGoogleModal && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(15, 23, 42, 0.6)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: 20,
                }}
                className="animate-fade-in"
                >
                    <div style={{
                        backgroundColor: 'var(--color-paper-white)',
                        borderRadius: 20,
                        width: '100%',
                        maxWidth: 400,
                        padding: 32,
                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
                        border: '1px solid var(--color-ghost-border)',
                        position: 'relative',
                    }}>
                        {/* Close button */}
                        <button 
                            onClick={() => {
                                setShowGoogleModal(false);
                                setShowCustomEmailInput(false);
                                setCustomEmail('');
                            }}
                            style={{
                                position: 'absolute',
                                right: 20,
                                top: 20,
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#999',
                                padding: 4,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'background-color 0.15s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            <XMarkIcon style={{ width: 20, height: 20 }} />
                        </button>

                        {/* Google Logo and header */}
                        <div style={{ textAlign: 'center', marginBottom: 28 }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" style={{ display: 'inline-block', marginBottom: 12 }}>
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            <h2 style={{
                                fontFamily: 'var(--font-heading)',
                                fontSize: 20,
                                fontWeight: 700,
                                color: 'var(--color-midnight-ink)',
                                margin: '0 0 6px 0'
                            }}>
                                Choose an account
                            </h2>
                            <p style={{ fontSize: 13, color: '#666', margin: 0 }}>
                                to continue to <strong>{SCHOOL_CONFIG.name}</strong>
                            </p>
                        </div>

                        {!showCustomEmailInput ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {/* Account list */}
                                <button
                                    onClick={() => handleSelectGoogleAccount('student@sds.edu')}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 16,
                                        width: '100%',
                                        padding: '12px 16px',
                                        backgroundColor: '#fff',
                                        border: '1px solid var(--color-ghost-border)',
                                        borderRadius: 12,
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        transition: 'all 0.15s ease',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#f8fafc'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.borderColor = 'var(--color-ghost-border)'; }}
                                >
                                    <div style={{
                                        width: 40, height: 40,
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#fff',
                                        fontWeight: 700,
                                        fontSize: 16,
                                    }}>
                                        A
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-midnight-ink)' }}>Aarav Sharma</span>
                                            <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, backgroundColor: 'rgba(99,102,241,0.1)', color: '#4f46e5', textTransform: 'uppercase' }}>
                                                Student
                                            </span>
                                        </div>
                                        <span style={{ fontSize: 12, color: '#777' }}>student@sds.edu</span>
                                    </div>
                                </button>

                                <button
                                    onClick={() => handleSelectGoogleAccount('admin@sds.edu')}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 16,
                                        width: '100%',
                                        padding: '12px 16px',
                                        backgroundColor: '#fff',
                                        border: '1px solid var(--color-ghost-border)',
                                        borderRadius: 12,
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        transition: 'all 0.15s ease',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#f8fafc'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.borderColor = 'var(--color-ghost-border)'; }}
                                >
                                    <div style={{
                                        width: 40, height: 40,
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #10b981, #059669)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#fff',
                                        fontWeight: 700,
                                        fontSize: 16,
                                    }}>
                                        P
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-midnight-ink)' }}>Principal Administrator</span>
                                            <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, backgroundColor: 'rgba(16,185,129,0.1)', color: '#059669', textTransform: 'uppercase' }}>
                                                Admin
                                            </span>
                                        </div>
                                        <span style={{ fontSize: 12, color: '#777' }}>admin@sds.edu</span>
                                    </div>
                                </button>

                                {/* Use another account */}
                                <button
                                    onClick={() => setShowCustomEmailInput(true)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 16,
                                        width: '100%',
                                        padding: '14px 16px',
                                        backgroundColor: 'transparent',
                                        border: '1px dashed var(--color-ghost-border)',
                                        borderRadius: 12,
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        transition: 'all 0.15s ease',
                                        marginTop: 8,
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#f8fafc'; e.currentTarget.style.borderColor = 'var(--color-electric-violet)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = 'var(--color-ghost-border)'; }}
                                >
                                    <div style={{
                                        width: 40, height: 40,
                                        borderRadius: '50%',
                                        border: '1px solid var(--color-ghost-border)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#666',
                                    }}>
                                        <PlusIcon style={{ width: 18, height: 18 }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-midnight-ink)' }}>Use another account</span>
                                    </div>
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                if (customEmail.trim()) {
                                    handleSelectGoogleAccount(customEmail.trim().toLowerCase());
                                }
                            }}
                            style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
                            >
                                <div>
                                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
                                        Google Account Email
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <EnvelopeIcon style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#ccc', pointerEvents: 'none' }} />
                                        <input
                                            type="email" required
                                            value={customEmail}
                                            onChange={e => setCustomEmail(e.target.value)}
                                            className="input-field"
                                            style={{ paddingLeft: 44 }}
                                            placeholder="name@gmail.com"
                                            autoFocus
                                        />
                                    </div>
                                    <p style={{ fontSize: 11, color: '#888', marginTop: 6, lineHeight: '1.4' }}>
                                        Tip: Email containing <strong>'admin'</strong> will be logged in with Administrator role. Others will have Student role.
                                    </p>
                                </div>

                                <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            setShowCustomEmailInput(false);
                                            setCustomEmail('');
                                        }}
                                        className="btn-ghost"
                                        style={{ flex: 1, padding: '12px' }}
                                    >
                                        Back
                                    </button>
                                    <button 
                                        type="submit"
                                        className="btn-primary"
                                        style={{ flex: 2, padding: '12px' }}
                                    >
                                        Continue
                                    </button>
                                </div>
                            </form>
                        )}

                        <div style={{
                            marginTop: 28,
                            paddingTop: 16,
                            borderTop: '1px solid var(--color-ghost-border)',
                            fontSize: 11,
                            color: '#bbb',
                            textAlign: 'center',
                            lineHeight: '1.5'
                        }}>
                            To continue, Google will share your name, email address, language preference, and profile picture with {SCHOOL_CONFIG.name}.
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div style={{ minHeight: '100vh', background: 'var(--color-cloud-canvas)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="spinner" />
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}

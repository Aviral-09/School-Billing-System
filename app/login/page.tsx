'use client';

import { useState, Suspense } from 'react';
import { auth, db } from '@/lib/firebase';
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AcademicCapIcon, EnvelopeIcon, LockClosedIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { SCHOOL_CONFIG } from '@/lib/schoolConfig';

function LoginContent() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleRoleRedirect = async (uid: string) => {
        const userDoc = await getDoc(doc(db, 'users', uid));

        if (!userDoc.exists()) {
            await signOut(auth);
            setError('Access Denied: No account profile found. Please contact the administrator.');
            return;
        }

        const role = userDoc.data().role;
        if (role === 'admin') {
            router.push('/admin/dashboard');
        } else {
            router.push('/student/dashboard');
        }
    };

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            await handleRoleRedirect(result.user.uid);
        } catch (err: any) {
            console.error('Email Login Error:', err);
            if (
                err.code === 'auth/wrong-password' ||
                err.code === 'auth/user-not-found' ||
                err.code === 'auth/invalid-credential'
            ) {
                setError('Invalid email or password. Please try again.');
            } else if (err.code === 'auth/invalid-email') {
                setError('Please enter a valid email address.');
            } else if (err.code === 'auth/network-request-failed') {
                setError('Network error. Please check your connection.');
            } else {
                setError(err.message || 'An unexpected error occurred.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError(null);
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            await handleRoleRedirect(result.user.uid);
        } catch (err: unknown) {
            console.error('Google Login Error:', err);
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-500/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="w-full max-w-md">
                {/* Back link */}
                <div className="mb-6">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-white/40 hover:text-yellow-400 text-xs font-black uppercase tracking-widest transition-all duration-200 group"
                    >
                        <ArrowLeftIcon className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                        Back to Home
                    </Link>
                </div>

                {/* Branding */}
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-white p-4 rounded-2xl shadow-2xl border border-yellow-500/30 mb-6 transition-transform hover:scale-105">
                        <AcademicCapIcon className="w-10 h-10 text-black" />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight mb-1 text-center">
                        {SCHOOL_CONFIG.name}
                    </h1>
                    <p className="text-white/50 font-medium font-mono text-xs uppercase tracking-widest text-center">
                        Staff &amp; Student Login
                    </p>
                </div>

                {/* Login Card */}
                <div className="glass-card rounded-[2.5rem] p-8 md:p-10 border border-white/5 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 opacity-50 group-hover:opacity-100 transition-opacity" />

                    <form onSubmit={handleEmailLogin} className="space-y-5 relative z-10">
                        <div>
                            <label className="block text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-2 ml-1">
                                Email Address
                            </label>
                            <div className="relative">
                                <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 text-white pl-12 pr-4 py-4 rounded-2xl focus:outline-none focus:border-yellow-500/50 transition-all placeholder:text-white/10"
                                    placeholder="your@school.edu.in"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-2 ml-1">
                                Password
                            </label>
                            <div className="relative">
                                <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 text-white pl-12 pr-4 py-4 rounded-2xl focus:outline-none focus:border-yellow-500/50 transition-all placeholder:text-white/10"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-4 rounded-2xl font-black transition-all active:scale-[0.98] disabled:opacity-50 uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(234,179,8,0.2)]"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-black/20 border-t-black" />
                                    <span>Signing in...</span>
                                </div>
                            ) : (
                                'Login to Dashboard'
                            )}
                        </button>
                    </form>

                    <div className="my-8 relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/5" />
                        </div>
                        <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-black">
                            <span className="bg-black/80 px-4 text-white/20 backdrop-blur-sm">or</span>
                        </div>
                    </div>

                    <button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-4 bg-white/5 hover:bg-white/10 text-white px-6 py-4 rounded-2xl font-bold transition-all border border-white/10 active:scale-[0.98] disabled:opacity-50"
                    >
                        <svg className="w-6 h-6" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continue with Google
                    </button>

                    {error && (
                        <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl animate-shake">
                            <p className="text-red-400 text-xs text-center font-bold uppercase tracking-wider">{error}</p>
                        </div>
                    )}
                </div>

                <p className="mt-8 text-center text-white/20 text-[10px] uppercase tracking-widest font-bold">
                    {SCHOOL_CONFIG.name} &bull; Internal System
                </p>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500" />
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}

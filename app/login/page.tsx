'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, getDocs, query, where, collection, updateDoc } from 'firebase/firestore';

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const roleParam = searchParams.get('role');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    
    const retryOperation = async <T,>(operation: () => Promise<T>, delay: number, retries: number): Promise<T> => {
        try {
            return await operation();
        } catch (error) {
            if (retries <= 0) throw error;
            console.log(`Retrying operation... (${retries} attempts left)`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return retryOperation(operation, delay * 2, retries - 1);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError('');

        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            
            const userRef = doc(db, 'users', user.uid);

            const checkUserExists = async () => {
                const snapshot = await getDoc(userRef);
                return snapshot;
            };

            
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Database connection timed out. Check your internet connection.")), 30000)
            );

            
            const userSnap: any = await Promise.race([
                retryOperation(checkUserExists, 1000, 3),
                timeoutPromise
            ]);

            if (userSnap.exists()) {
                const userData = userSnap.data();

                
                if (roleParam === 'admin' && userData.role !== 'admin') {
                    await signOut(auth);
                    setError('Access Denied: This portal is restricted to Administrators.');
                    return;
                }

                if (userData.role === 'admin') {
                    router.push('/admin/dashboard');
                } else if (userData.role === 'student') {
                    
                    const redirectPath = searchParams?.get('redirect') || '/student/dashboard';
                    router.push(redirectPath);
                } else {
                    setError('Invalid role assigned. Contact admin.');
                }
            } else {
                

                
                if (roleParam === 'admin') {
                    await signOut(auth);
                    setError('Access Denied: Admin account not found.');
                    return;
                }

                
                
                const studentsRef = collection(db, 'students');
                const q = query(studentsRef, where('parentEmail', '==', user.email));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    console.log("LOGIN: Found pre-registered student. Linking account...");
                    const studentDoc = querySnapshot.docs[0];

                    
                    await setDoc(doc(db, 'users', user.uid), {
                        uid: user.uid,
                        name: user.displayName || studentDoc.data().name,
                        email: user.email,
                        role: 'student',
                        createdAt: Date.now()
                    });

                    
                    await updateDoc(doc(db, 'students', studentDoc.id), {
                        userId: user.uid
                    });

                    const redirectPath = searchParams?.get('redirect') || '/student/dashboard';
                    router.push(redirectPath);
                } else {
                    await signOut(auth);
                    setError('Account not found. Please ask the Admin to add your email to the student list first.');
                }
            }
        } catch (err: any) {
            console.error("Login Error:", err);

            
            if (err.code === 'auth/cancelled-popup-request' || err.code === 'auth/popup-closed-by-user' || err.message?.includes('cancelled-popup-request') || err.message?.includes('popup-closed-by-user')) {
                console.log('Login popup cancelled or closed by user.');
                
                setLoading(false);
                return;
            }

            const errorCode = err.code || (err.message && err.message.includes('offline') ? 'connectivity-issue' : 'unknown-error');
            const errorMessage = err.message || 'Unknown error occurred';
            setError(`Login Failed: ${errorMessage} (Code: ${errorCode})`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center overflow-hidden relative selection:bg-emerald-500/30">
            {}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[20%] left-[20%] w-[400px] h-[400px] bg-emerald-500/10 blur-[100px] rounded-full mix-blend-screen animate-blob"></div>
                <div className="absolute bottom-[20%] right-[20%] w-[400px] h-[400px] bg-cyan-500/10 blur-[100px] rounded-full mix-blend-screen animate-blob animation-delay-2000"></div>
            </div>

            <div className="relative w-full max-w-md space-y-8 glass-card p-10 rounded-3xl z-10 animate-fadeIn">
                <div className="text-center">
                    {}
                    <div className="mx-auto h-20 w-20 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/20">
                        <svg className="h-10 w-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>

                    <h2 className="text-3xl font-bold text-white capitalize tracking-wide mb-2">
                        {roleParam ? `${roleParam} Login` : 'Welcome Back'}
                    </h2>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        {roleParam === 'student'
                            ? 'Secure student portal for fee payments.'
                            : roleParam === 'admin'
                                ? 'Administrator control panel.'
                                : 'Sign in to access the dashboard.'}
                    </p>
                </div>

                {error && (
                    <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 flex items-center gap-3 animate-slideUp">
                        <svg className="h-5 w-5 text-red-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-red-300 font-medium leading-snug">{error}</span>
                    </div>
                )}

                <div className="mt-8">
                    <button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="group relative flex w-full justify-center items-center rounded-xl bg-white hover:bg-slate-50 px-4 py-4 text-base font-bold text-slate-900 shadow-lg shadow-black/5 transition-all duration-300 hover:shadow-black/10 hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {loading ? (
                            <span className="flex items-center gap-3">
                                <svg className="h-5 w-5 animate-spin text-slate-900" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Authenticating...
                            </span>
                        ) : (
                            <span className="flex items-center gap-3">
                                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.2 1 12s.43 3.45 1.18 4.93l2.85-2.26c.74 1.34 1.95 2.37 3.37 2.89l-2.85 2.26z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Continue with Google
                            </span>
                        )}
                    </button>
                    <p className="mt-8 text-center text-xs text-slate-500">
                        &copy; {new Date().getFullYear()} SchoolBilling System. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div></div>}>
            <LoginContent />
        </Suspense>
    );
}

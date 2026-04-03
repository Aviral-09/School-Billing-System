'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';

function SuccessContent() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const studentId = searchParams.get('studentId');
    const amount = searchParams.get('amount');
    const { user, loading: authLoading } = useAuth();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Verifying payment details...');

    const processedRef = useRef(false);

    useEffect(() => {
        if (authLoading) return;

        // Bailing out early if preconditions are not met
        if (!user || !sessionId || !studentId) {
            Promise.resolve().then(() => {
                if (status !== 'error') {
                    setStatus('error');
                    if (!user) setMessage('You must be logged in to complete this transaction.');
                    else setMessage('Invalid payment session.');
                }
            });
            return;
        }

        if (processedRef.current) return;
        processedRef.current = true;

        const verifyAndRecord = async () => {
            try {
                const res = await fetch('/api/verify_payment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sessionId }),
                });

                const data = await res.json();

                if (data.status === 'paid') {
                    const q = query(collection(db, 'payments'), where('stripeSessionId', '==', sessionId));
                    const existing = await getDocs(q);

                    if (existing.empty) {
                        await addDoc(collection(db, 'payments'), {
                            paymentId: 'PAY-' + Date.now(),
                            studentId: studentId,
                            userId: user?.uid || '',
                            amount: Number(amount),
                            status: 'paid',
                            stripeSessionId: sessionId,
                            createdAt: Date.now()
                        });
                        console.log("Payment recorded in Firestore");
                    } else {
                        console.log("Payment already recorded");
                    }

                    setStatus('success');
                    setMessage('Payment confirmed! Receipt generated.');
                } else {
                    setStatus('error');
                    setMessage('Payment not completed.');
                }

            } catch (err) {
                console.error(err);
                setStatus('error');
                setMessage('Network error verifying payment.');
            }
        };

        verifyAndRecord();
    }, [sessionId, studentId, amount, user, authLoading, status]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-black py-12 sm:px-6 lg:px-8">
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="glass-card py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center border border-yellow-500/20">
                    {status === 'loading' && (
                        <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mb-4"></div>
                            <h2 className="text-xl font-medium text-white">Processing...</h2>
                            <p className="mt-2 text-white/60">{message}</p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="flex flex-col items-center">
                            <CheckCircleIcon className="h-16 w-16 text-yellow-500 mb-4" />
                            <h2 className="text-2xl font-bold text-white">Success!</h2>
                            <p className="mt-2 text-white/60">{message}</p>
                            <div className="mt-6 w-full">
                                <Link
                                    href="/student/dashboard"
                                    className="flex w-full justify-center rounded-xl border border-yellow-500/30 bg-white py-2 px-4 text-sm font-bold text-black shadow-sm hover:bg-gray-100 focus:outline-none"
                                >
                                    Return to Dashboard
                                </Link>
                            </div>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="flex flex-col items-center">
                            <XCircleIcon className="h-16 w-16 text-red-500 mb-4" />
                            <h2 className="text-2xl font-bold text-white">Verification Failed</h2>
                            <p className="mt-2 text-white/60">{message}</p>
                            <div className="mt-6 w-full">
                                <Link
                                    href="/student/dashboard"
                                    className="flex w-full justify-center rounded-xl border border-white/10 bg-white/5 py-2 px-4 text-sm font-bold text-white shadow-sm hover:bg-white/10 focus:outline-none"
                                >
                                    Back to Dashboard
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function SuccessPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center bg-black">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
            </div>
        }>
            <SuccessContent />
        </Suspense>
    );
}

'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { createReceipt } from '@/lib/receiptUtils';
import { useAuth } from '@/context/AuthContext';

function ReturnContent() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const studentId = searchParams.get('studentId');
    const amount = searchParams.get('amount');
    const { user, loading: authLoading } = useAuth();

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Finalizing your secure payment...');
    const processedRef = useRef(false);

    useEffect(() => {
        if (authLoading) return;

        if (!user || !sessionId) {
            Promise.resolve().then(() => {
                if (status !== 'error') {
                    setStatus('error');
                    if (!user) setMessage('You must be logged in to complete this transaction.');
                    else setMessage('Invalid session.');
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

                if (data.status === 'paid' || data.status === 'complete') {
                    const q = query(collection(db, 'payments'), where('stripeSessionId', '==', sessionId));
                    const existing = await getDocs(q);

                    if (!existing.empty) {
                        const paymentDoc = existing.docs[0];
                        const paymentData = paymentDoc.data();

                        if (paymentData.paymentStatus !== 'success') {
                            await updateDoc(doc(db, 'payments', paymentDoc.id), {
                                paymentStatus: 'success',
                                updatedAt: Date.now()
                            });

                            // Only generate receipt if it doesn't already exist
                            const receiptsQuery = query(collection(db, 'receipts'), where('transactionId', '==', sessionId));
                            const receiptSnap = await getDocs(receiptsQuery);

                            if (receiptSnap.empty) {
                                await createReceipt({
                                    amount: Number(amount),
                                    paymentId: paymentData.paymentId,
                                    method: 'online_stripe',
                                    status: 'paid',
                                    transactionId: sessionId
                                }, studentId || paymentData.studentId, 'System Return');
                            }
                        }
                    } else if (studentId && amount) {
                        // Fallback: Create record if for some reason it wasn't created in checkout_sessions
                        await addDoc(collection(db, 'payments'), {
                            paymentId: 'PAY-' + Date.now(),
                            studentId: studentId,
                            userId: user?.uid || '',
                            amount: Number(amount),
                            paymentStatus: 'success',
                            stripeSessionId: sessionId,
                            createdAt: Date.now(),
                            updatedAt: Date.now()
                        });

                        await createReceipt({
                            amount: Number(amount),
                            paymentId: 'PAY-' + Date.now(),
                            method: 'online_stripe',
                            status: 'paid',
                            transactionId: sessionId
                        }, studentId, 'System Return Fallback');
                    }
                    setStatus('success');
                    setMessage('Payment successful! Your fees have been updated.');
                } else if (data.status === 'open') {

                    setStatus('error');
                    setMessage('Payment was not completed.');
                } else {
                    setStatus('error');
                    setMessage('Payment verification failed.');
                }

            } catch (err) {
                console.error(err);
                setStatus('error');
                setMessage('Network error verifying payment.');
            }
        };

        verifyAndRecord();
    }, [sessionId, studentId, amount, user, authLoading, status]);

    if (status === 'loading') {
        return (
            <div className="flex min-h-screen items-center justify-center bg-black text-white">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
                    <h2 className="text-xl font-black uppercase tracking-tight italic">Processing...</h2>
                    <p className="text-white/40 mt-2 font-medium">{message}</p>
                </div>
            </div>
        )
    }

    if (status === 'success') {
        return (
            <div className="flex min-h-screen items-center justify-center bg-black text-white p-4">
                <div className="glass-card p-8 rounded-3xl border border-yellow-500/20 shadow-2xl max-w-md w-full text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-yellow-500/30"></div>

                    <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-white text-black mb-6 border-2 border-yellow-500/30">
                        <CheckCircleIcon className="h-12 w-12" />
                    </div>

                    <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tight italic">Success!</h2>
                    <p className="text-white/40 mb-8 font-medium">{message}</p>

                    <div className="space-y-4">
                        <Link
                            href="/student/dashboard"
                            className="block w-full rounded-xl bg-white px-6 py-4 text-black font-black uppercase tracking-widest text-sm shadow-xl border border-yellow-500/30 hover:bg-gray-100 transition-all"
                        >
                            Go to Dashboard
                        </Link>
                        <Link
                            href="/payment"
                            className="block w-full rounded-xl bg-transparent border border-white/10 px-6 py-3 text-white/40 font-bold hover:text-white hover:border-white/20 transition-all"
                        >
                            Make Another Payment
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-black text-white p-4">
            <div className="glass-card p-8 rounded-3xl border border-white/5 shadow-2xl max-w-md w-full text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-white/20"></div>

                <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-white/5 text-white mb-6 border border-white/10">
                    <XCircleIcon className="h-12 w-12" />
                </div>

                <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight italic">Error</h2>
                <p className="text-white/40 mb-8 font-medium">{message}</p>

                <Link
                    href="/payment"
                    className="block w-full rounded-xl bg-white px-6 py-4 text-black font-black uppercase tracking-widest text-sm border border-yellow-500/30 hover:bg-gray-100 transition-all shadow-lg"
                >
                    Try Again
                </Link>
            </div>
        </div>
    );
}

export default function ReturnPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center bg-black text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
            </div>
        }>
            <ReturnContent />
        </Suspense>
    );
}

'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { createReceipt } from '@/lib/receiptUtils';

export default function ReturnPage() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const studentId = searchParams.get('studentId');
    const amount = searchParams.get('amount');

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Finalizing your secure payment...');
    const processedRef = useRef(false);

    useEffect(() => {
        if (!sessionId) {
            
            setStatus('error');
            setMessage('Invalid session.');
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

                    if (existing.empty && studentId && amount) {
                        
                        const pRef = await addDoc(collection(db, 'payments'), {
                            paymentId: 'PAY-' + Date.now(),
                            studentId: studentId,
                            amount: Number(amount),
                            status: 'paid',
                            stripeSessionId: sessionId,
                            createdAt: Date.now()
                        });

                        
                        await createReceipt({
                            amount: Number(amount),
                            paymentId: pRef.id,
                            method: 'online',
                            status: 'paid',
                            transactionId: sessionId
                        }, studentId, 'System');
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
    }, [sessionId, studentId, amount]);

    if (status === 'loading') {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#0C1417] text-white">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
                    <h2 className="text-xl font-bold">Processing...</h2>
                    <p className="text-gray-400 mt-2">{message}</p>
                </div>
            </div>
        )
    }

    if (status === 'success') {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#0C1417] text-white p-4">
                <div className="bg-[#131F22] p-8 rounded-3xl border border-[#1F2E32] shadow-2xl max-w-md w-full text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 to-teal-500"></div>

                    <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-emerald-500/10 mb-6">
                        <CheckCircleIcon className="h-12 w-12 text-emerald-500" />
                    </div>

                    <h2 className="text-3xl font-bold text-white mb-2">Payment Successful!</h2>
                    <p className="text-gray-400 mb-8">{message}</p>

                    <div className="space-y-4">
                        <Link
                            href="/student/dashboard"
                            className="block w-full rounded-xl bg-emerald-500 px-6 py-3 text-white font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all"
                        >
                            Return to Dashboard
                        </Link>
                        <Link
                            href="/payment"
                            className="block w-full rounded-xl bg-transparent border border-[#2A3E44] px-6 py-3 text-gray-400 font-semibold hover:border-emerald-500/30 hover:text-white transition-all"
                        >
                            Make Another Payment
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#0C1417] text-white p-4">
            <div className="bg-[#131F22] p-8 rounded-3xl border border-[#1F2E32] shadow-2xl max-w-md w-full text-center relative">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 to-orange-500"></div>

                <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-500/10 mb-6">
                    <XCircleIcon className="h-12 w-12 text-red-500" />
                </div>

                <h2 className="text-2xl font-bold text-white mb-2">Payment Failed</h2>
                <p className="text-gray-400 mb-8">{message}</p>

                <Link
                    href="/payment"
                    className="block w-full rounded-xl bg-[#1A2E33] border border-[#2A3E44] px-6 py-3 text-white font-bold hover:bg-[#23353b] transition-all"
                >
                    Try Again
                </Link>
            </div>
        </div>
    );
}

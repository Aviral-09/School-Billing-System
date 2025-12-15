'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';

export default function SuccessPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const sessionId = searchParams.get('session_id');
    const studentId = searchParams.get('studentId');
    const amount = searchParams.get('amount');

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Verifying payment details...');

    
    const processedRef = useRef(false);

    useEffect(() => {
        if (!sessionId || !studentId) {
            setStatus('error');
            setMessage('Invalid payment session.');
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
    }, [sessionId, studentId, amount]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
                    {status === 'loading' && (
                        <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                            <h2 className="text-xl font-medium text-gray-900">Processing...</h2>
                            <p className="mt-2 text-gray-500">{message}</p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="flex flex-col items-center">
                            <CheckCircleIcon className="h-16 w-16 text-green-500 mb-4" />
                            <h2 className="text-2xl font-bold text-gray-900">Success!</h2>
                            <p className="mt-2 text-gray-600">{message}</p>
                            <div className="mt-6 w-full">
                                <Link
                                    href="/student/dashboard"
                                    className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none"
                                >
                                    Return to Dashboard
                                </Link>
                            </div>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="flex flex-col items-center">
                            <XCircleIcon className="h-16 w-16 text-red-500 mb-4" />
                            <h2 className="text-2xl font-bold text-gray-900">Verification Failed</h2>
                            <p className="mt-2 text-gray-600">{message}</p>
                            <div className="mt-6 w-full">
                                <Link
                                    href="/student/dashboard"
                                    className="flex w-full justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none"
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

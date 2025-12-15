'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Payment } from '@/types';
import { useRouter } from 'next/navigation';
import { createReceipt } from '@/lib/receiptUtils';
import { ArrowPathIcon, DocumentTextIcon } from '@heroicons/react/24/outline'; 

export default function PaymentsPage() {
    const { user, role, loading: authLoading } = useAuth();
    const router = useRouter();

    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading) {
            if (!user) router.push('/login');
            else if (role !== 'admin') router.push('/student/dashboard');
        }
    }, [user, role, authLoading, router]);

    const fetchPayments = async () => {
        try {
            setLoading(true);
            const q = query(collection(db, 'payments'));
            const querySnapshot = await getDocs(q);
            const list = querySnapshot.docs.map(doc => ({
                ...doc.data()
            })) as Payment[];

            list.sort((a, b) => b.createdAt - a.createdAt);

            setPayments(list);
        } catch (error) {
            console.error("Error fetching payments:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user && role === 'admin') {
            fetchPayments();
        }
    }, [user, role]);

    if (authLoading || loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-900 text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    return (
        <Sidebar>
            <div className="sm:flex sm:items-center justify-between">
                <div className="sm:flex-auto">
                    <h1 className="text-3xl font-bold leading-7 text-white tracking-tight">Payment History</h1>
                    <p className="mt-2 text-sm text-slate-400">
                        A global record of all transactions processed by the system.
                    </p>
                </div>
                <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                    <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-sm font-bold text-emerald-400 shadow-sm ring-1 ring-inset ring-emerald-500/30 hover:bg-emerald-500/10 transition-all hover:scale-105"
                        onClick={fetchPayments}
                    >
                        <ArrowPathIcon className="h-4 w-4" />
                        Refresh List
                    </button>
                </div>
            </div>

            <div className="mt-8 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                        <div className="overflow-hidden shadow-2xl rounded-3xl glass-card">
                            <table className="min-w-full divide-y divide-white/5">
                                <thead className="bg-white/5">
                                    <tr>
                                        <th scope="col" className="py-4 pl-4 pr-3 text-left text-sm font-bold text-slate-300 sm:pl-6">Date</th>
                                        <th scope="col" className="px-3 py-4 text-left text-sm font-bold text-slate-300">Student ID</th>
                                        <th scope="col" className="px-3 py-4 text-left text-sm font-bold text-slate-300">Amount</th>
                                        <th scope="col" className="px-3 py-4 text-left text-sm font-bold text-slate-300">Status</th>
                                        <th scope="col" className="px-3 py-4 text-left text-sm font-bold text-slate-300">Transaction ID</th>
                                        <th scope="col" className="relative py-4 pl-3 pr-4 sm:pr-6">
                                            <span className="sr-only">Actions</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 bg-transparent">
                                    {payments.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="py-12 text-center text-sm text-slate-500">
                                                <div className="flex flex-col items-center justify-center">
                                                    <p className="font-bold text-lg text-slate-400">No payments found</p>
                                                    <p className="mt-1">Transactions will appear here once students process payments.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        payments.map((payment, index) => (
                                            <tr key={payment.paymentId || payment.stripeSessionId || index} className="hover:bg-white/5 transition-colors group">
                                                <td className="whitespace-nowrap py-5 pl-4 pr-3 text-sm font-medium text-slate-300 sm:pl-6">
                                                    {new Date(payment.createdAt).toLocaleDateString()} <span className="text-slate-500 text-xs ml-1">{new Date(payment.createdAt).toLocaleTimeString()}</span>
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-5 text-sm text-slate-400 font-mono tracking-wide">{payment.studentId}</td>
                                                <td className="whitespace-nowrap px-3 py-5 text-sm font-bold text-emerald-400">₹{payment.amount.toLocaleString()}</td>
                                                <td className="whitespace-nowrap px-3 py-5 text-sm">
                                                    <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-bold ${payment.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20' : 'bg-yellow-500/10 text-yellow-400 ring-1 ring-yellow-500/20'
                                                        }`}>
                                                        {payment.status.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-5 text-sm text-slate-500 font-mono text-xs">{payment.stripeSessionId.substring(0, 18)}...</td>
                                                <td className="relative whitespace-nowrap py-5 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                const receiptsRef = collection(db, 'receipts');
                                                                const q = query(receiptsRef, where('transactionId', '==', payment.stripeSessionId));
                                                                const snap = await getDocs(q);

                                                                if (!snap.empty) {
                                                                    window.open(`/receipt/${snap.docs[0].id}`, '_blank');
                                                                } else {
                                                                    if (confirm('Receipt not found. Would you like to generate one now?')) {
                                                                        const method = payment.stripeSessionId.startsWith('MANUAL') ? 'manual_admin' : 'online_stripe';
                                                                        const newReceiptId = await createReceipt({
                                                                            amount: payment.amount,
                                                                            paymentId: payment.paymentId,
                                                                            method: method,
                                                                            status: payment.status,
                                                                            transactionId: payment.stripeSessionId
                                                                        }, payment.studentId, user?.uid || 'Admin');

                                                                        if (newReceiptId) {
                                                                            window.open(`/receipt/${newReceiptId}`, '_blank');
                                                                        }
                                                                    }
                                                                }
                                                            } catch (e) {
                                                                console.error("Receipt Action Error:", e);
                                                                alert('Error accessing receipt: ' + (e as Error).message);
                                                            }
                                                        }}
                                                        className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg inline-flex items-center gap-1"
                                                        title="View Receipt"
                                                    >
                                                        <DocumentTextIcon className="h-5 w-5" />
                                                        <span className="hidden sm:inline">Receipt</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </Sidebar>
    );
}

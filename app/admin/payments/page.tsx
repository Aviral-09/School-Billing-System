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
import { SCHOOL_CONFIG } from '@/lib/schoolConfig';

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
            <div className="flex h-screen items-center justify-center bg-black text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
            </div>
        );
    }

    return (
        <Sidebar>
            <div className="sm:flex sm:items-center justify-between">
                <div className="sm:flex-auto">
                    <h1 className="text-3xl font-black leading-7 text-white tracking-tight uppercase">Payment History</h1>
                    <p className="mt-2 text-sm text-white/40 italic">
                        All fee transactions processed by {SCHOOL_CONFIG.name}.
                    </p>
                </div>
                <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                    <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-black text-black shadow-lg border border-yellow-500/30 hover:bg-gray-100 transition-all hover:scale-105"
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
                                        <th scope="col" className="py-4 pl-4 pr-3 text-left text-[10px] font-black text-white/40 uppercase tracking-widest sm:pl-6">Date</th>
                                        <th scope="col" className="px-3 py-4 text-left text-[10px] font-black text-white/40 uppercase tracking-widest">Student ID</th>
                                        <th scope="col" className="px-3 py-4 text-left text-[10px] font-black text-white/40 uppercase tracking-widest">Amount</th>
                                        <th scope="col" className="px-3 py-4 text-left text-[10px] font-black text-white/40 uppercase tracking-widest">Status</th>
                                        <th scope="col" className="px-3 py-4 text-left text-[10px] font-black text-white/40 uppercase tracking-widest">Transaction ID</th>
                                        <th scope="col" className="relative py-4 pl-3 pr-4 sm:pr-6">
                                            <span className="sr-only">Actions</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 bg-transparent">
                                    {payments.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="py-12 text-center text-sm text-white/40">
                                                <div className="flex flex-col items-center justify-center">
                                                    <p className="font-bold text-lg text-white/60">No payments found</p>
                                                    <p className="mt-1">Transactions will appear here once students process payments.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        payments.map((payment, index) => {
                                            const statusKey = (payment.paymentStatus || (payment as any).status || 'pending') as string;
                                            return (
                                                <tr key={payment.paymentId || payment.stripeSessionId || index} className="hover:bg-white/5 transition-colors group">
                                                    <td className="whitespace-nowrap py-5 pl-4 pr-3 text-sm font-medium text-white/80 sm:pl-6">
                                                        {new Date(payment.createdAt).toLocaleDateString()} <span className="text-white/40 text-xs ml-1">{new Date(payment.createdAt).toLocaleTimeString()}</span>
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-5 text-sm text-white/60 font-mono tracking-wide">{payment.studentId}</td>
                                                    <td className="whitespace-nowrap px-3 py-5 text-sm font-black text-yellow-500">₹{payment.amount.toLocaleString()}</td>
                                                    <td className="whitespace-nowrap px-3 py-5 text-sm">
                                                        <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-bold ${statusKey === 'success' || statusKey === 'paid' ? 'bg-yellow-500/10 text-yellow-500 ring-1 ring-yellow-500/20' : 'bg-white/10 text-white ring-1 ring-white/20'
                                                            }`}>
                                                            {statusKey.toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-5 text-sm text-white/40 font-mono text-xs">{payment.stripeSessionId.substring(0, 18)}...</td>
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
                                                                            const result = await createReceipt({
                                                                                amount: payment.amount,
                                                                                paymentId: payment.paymentId,
                                                                                method: method,
                                                                                status: payment.paymentStatus || (payment as any).status || 'paid',
                                                                                transactionId: payment.stripeSessionId
                                                                            }, payment.studentId, user?.uid || 'Admin');

                                                                            if (result.id) {
                                                                                window.open(`/receipt/${result.id}`, '_blank');
                                                                            }
                                                                        }
                                                                    }
                                                                } catch (e) {
                                                                    console.error("Receipt Action Error:", e);
                                                                    alert('Error accessing receipt: ' + (e as Error).message);
                                                                }
                                                            }}
                                                            className="text-white/40 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg inline-flex items-center gap-1 font-bold uppercase text-[10px] tracking-widest"
                                                            title="View Receipt"
                                                        >
                                                            <DocumentTextIcon className="h-5 w-5" />
                                                            <span className="hidden sm:inline">Receipt</span>
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
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

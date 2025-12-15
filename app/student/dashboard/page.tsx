'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { StudentProfile, FeeStructure, Payment, Receipt } from '@/types';
import { useRouter } from 'next/navigation';

export default function StudentDashboard() {
    const { user, role, loading: authLoading } = useAuth();
    const router = useRouter();

    const [student, setStudent] = useState<StudentProfile | null>(null);
    const [feeDetails, setFeeDetails] = useState<FeeStructure | null>(null);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [receiptMap, setReceiptMap] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);

    
    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                router.push('/login');
            } else if (role !== 'student') {
                
            }
        }
    }, [user, role, authLoading, router]);

    
    useEffect(() => {
        if (!user) return;

        const fetchStudentData = async () => {
            try {
                
                const q = query(collection(db, 'students'), where('userId', '==', user.uid));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    const studentData = querySnapshot.docs[0].data() as StudentProfile;
                    setStudent(studentData);

                    
                    const feeQ = query(collection(db, 'fees'), where('className', '==', studentData.class));
                    const feeSnap = await getDocs(feeQ);
                    if (!feeSnap.empty) {
                        setFeeDetails(feeSnap.docs[0].data() as FeeStructure);
                    }

                    
                    const paymentsRef = collection(db, 'payments');
                    const paymentsQ = query(paymentsRef, where('studentId', '==', studentData.studentId));

                    const unsubPayments = onSnapshot(paymentsQ, (snapshot) => {
                        const paymentList: Payment[] = [];
                        snapshot.forEach((doc) => {
                            paymentList.push(doc.data() as Payment);
                        });
                        paymentList.sort((a, b) => b.createdAt - a.createdAt);
                        setPayments(paymentList);
                    });

                    
                    const receiptsRef = collection(db, 'receipts');
                    const receiptsQ = query(receiptsRef, where('studentId', '==', studentData.studentId));

                    const unsubReceipts = onSnapshot(receiptsQ, (snapshot) => {
                        const rMap: Record<string, string> = {};
                        snapshot.forEach((doc) => {
                            const data = doc.data() as Receipt;
                            rMap[data.transactionId] = doc.id;
                        });
                        setReceiptMap(rMap);
                    });

                    return () => {
                        unsubPayments();
                        unsubReceipts();
                    };
                }
            } catch (err) {
                console.error("Error fetching data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchStudentData();
    }, [user]);

    if (authLoading || loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-900 text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    
    const totalPaid = payments
        .filter(p => p.status === 'paid')
        .reduce((sum, p) => sum + p.amount, 0);

    const totalDue = feeDetails ? feeDetails.totalFee - totalPaid : 0;

    
    const getStatusStyle = (status: 'paid' | 'pending' | 'overdue' | string) => {
        switch (status) {
            case 'paid': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
            case 'pending': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
            case 'overdue': return 'bg-red-500/10 text-red-400 border border-red-500/20';
            default: return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
        }
    };

    return (
        <div className="min-h-screen text-slate-200 font-sans selection:bg-emerald-500/30">
            <Navbar />

            <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                {}
                <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <p className="text-emerald-400 font-medium text-sm mb-2 tracking-wider uppercase">Academic Year 2023-2024</p>
                        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">{student?.name.split(' ')[0]}</span>
                        </h1>
                        <p className="mt-2 text-slate-400 max-w-xl">Manage your fee structure, view payment history, and download receipts all in one place.</p>
                    </div>
                    <button
                        onClick={() => router.push('/payment')}
                        className="group relative inline-flex items-center justify-center overflow-hidden rounded-full p-0.5 font-bold focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900"
                    >
                        <span className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-500 opacity-100 transition-opacity group-hover:opacity-80 animate-gradient-x"></span>
                        <span className="relative flex items-center gap-2 rounded-full bg-slate-900 px-8 py-3 transition-all duration-200 group-hover:bg-opacity-90 group-hover:text-white text-white">
                            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent group-hover:text-white transition-colors">Pay Now</span>
                            <svg className="h-5 w-5 text-cyan-400 group-hover:text-white transition-colors group-hover:translate-x-1 duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </span>
                    </button>
                </div>

                {}
                {!student ? (
                    <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-6 mb-8 text-amber-200 flex items-center gap-3">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        Profile Not Linked. Please contact admin.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-12">
                        {}
                        <div className="glass-card rounded-3xl p-8 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                <svg className="h-24 w-24 text-white transform rotate-12" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z" /></svg>
                            </div>
                            <div className="flex justify-between items-start mb-6">
                                <div className="rounded-2xl bg-slate-800/50 p-3 ring-1 ring-white/10">
                                    <svg className="h-6 w-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                                </div>
                            </div>
                            <dt className="truncate text-sm font-medium text-slate-400">Total Annual Fee</dt>
                            <dd className="mt-2 text-4xl font-bold text-white tracking-tight">₹{feeDetails?.totalFee.toLocaleString() ?? 0}</dd>
                        </div>

                        {}
                        <div className="glass-card rounded-3xl p-8 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                            <div className="absolute -right-6 -top-6 h-32 w-32 bg-emerald-500/20 rounded-full blur-3xl group-hover:bg-emerald-500/30 transition-colors"></div>
                            <div className="flex justify-between items-start mb-6 relative z-10">
                                <div className="rounded-2xl bg-emerald-500/20 p-3 ring-1 ring-emerald-500/30">
                                    <svg className="h-6 w-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                </div>
                                <div className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/20">
                                    {(feeDetails?.totalFee && feeDetails.totalFee > 0) ? Math.round((totalPaid / feeDetails.totalFee) * 100) : 0}% Paid
                                </div>
                            </div>
                            <dt className="truncate text-sm font-medium text-slate-400 relative z-10">Total Paid</dt>
                            <dd className="mt-2 text-4xl font-bold text-white tracking-tight relative z-10">₹{totalPaid.toLocaleString()}</dd>

                            {}
                            <div className="mt-6 h-2 w-full bg-slate-700/50 rounded-full overflow-hidden relative z-10">
                                <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ width: `${Math.min((totalPaid / (feeDetails?.totalFee || 1)) * 100, 100)}%` }}></div>
                            </div>
                        </div>

                        {}
                        <div className="glass-card rounded-3xl p-8 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                            <div className="absolute -right-6 -top-6 h-32 w-32 bg-amber-500/20 rounded-full blur-3xl group-hover:bg-amber-500/30 transition-colors"></div>
                            <div className="flex justify-between items-start mb-6 relative z-10">
                                <div className="rounded-2xl bg-amber-500/20 p-3 ring-1 ring-amber-500/30">
                                    <svg className="h-6 w-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                            </div>
                            <dt className="truncate text-sm font-medium text-slate-400 relative z-10">Pending Amount</dt>
                            <dd className="mt-2 text-4xl font-bold text-white tracking-tight relative z-10">₹{totalDue.toLocaleString()}</dd>
                            {totalDue > 0 && <p className="mt-2 text-xs text-amber-400 font-medium flex items-center gap-1">
                                <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse"></span>
                                Due Immediately
                            </p>}
                        </div>
                    </div>
                )}

                {}
                <div className="glass-card rounded-3xl overflow-hidden">
                    <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-white/5 backdrop-blur-md">
                        <div>
                            <h3 className="text-xl font-bold text-white">Recent Transactions</h3>
                            <p className="text-slate-400 text-sm mt-1">History of your recent fee payments</p>
                        </div>
                        <button className="text-emerald-400 hover:text-emerald-300 text-sm font-semibold flex items-center gap-1 transition-colors px-3 py-1.5 rounded-lg hover:bg-emerald-500/10">
                            View All <span aria-hidden="true">&rarr;</span>
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full whitespace-nowrap text-left text-sm">
                            <thead className="bg-slate-900/50 text-slate-400 uppercase tracking-wider text-xs">
                                <tr>
                                    <th scope="col" className="px-8 py-4 font-semibold">Payment ID</th>
                                    <th scope="col" className="px-8 py-4 font-semibold">Description</th>
                                    <th scope="col" className="px-8 py-4 font-semibold">Date</th>
                                    <th scope="col" className="px-8 py-4 font-semibold">Method</th>
                                    <th scope="col" className="px-8 py-4 font-semibold">Amount</th>
                                    <th scope="col" className="px-8 py-4 font-semibold">Status</th>
                                    <th scope="col" className="px-8 py-4 font-semibold text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {payments.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-8 py-12 text-center text-slate-500">
                                            No transactions found yet.
                                        </td>
                                    </tr>
                                ) : (
                                    payments.slice(0, 5).map((payment) => (
                                        <tr key={payment.paymentId} className="hover:bg-white/5 transition-colors group">
                                            <td className="px-8 py-4 text-slate-400 font-mono text-xs">#{payment.stripeSessionId.slice(-8).toUpperCase()}</td>
                                            <td className="px-8 py-4 text-slate-200 font-medium group-hover:text-white transition-colors">Tuition Fee Payment</td>
                                            <td className="px-8 py-4 text-slate-400">{new Date(payment.createdAt).toLocaleDateString()}</td>
                                            <td className="px-8 py-4 text-slate-300 flex items-center gap-2">
                                                <svg className="h-4 w-4 text-slate-500" fill="currentColor" viewBox="0 0 24 24"><path d="M2 10h20v7a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3v-7zm0-2V6a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v2H2z" /></svg>
                                                Card
                                            </td>
                                            <td className="px-8 py-4 text-white font-bold">₹{payment.amount.toLocaleString()}</td>
                                            <td className="px-8 py-4">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold border ${getStatusStyle(payment.status)}`}>
                                                    <span className={`h-1.5 w-1.5 mr-1.5 rounded-full ${payment.status === 'paid' ? 'bg-current' : 'bg-current'}`}></span>
                                                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-8 py-4 text-right">
                                                {receiptMap[payment.stripeSessionId] ? (
                                                    <a
                                                        href={`/receipt/${receiptMap[payment.stripeSessionId]}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all hover:scale-105 active:scale-95 shadow-[0_0_10px_rgba(16,185,129,0.1)]"
                                                    >
                                                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        </svg>
                                                        Receipt
                                                    </a>
                                                ) : (
                                                    <span className="text-slate-600 text-xs italic">Processing...</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {payments.length > 5 && (
                        <div className="border-t border-white/5 px-8 py-4 flex items-center justify-between text-xs text-slate-500 bg-white/5">
                            <span>Showing {Math.min(payments.length, 5)} of {payments.length} transactions</span>
                            <div className="flex gap-2">
                                <button className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-50">&lt;</button>
                                <button className="h-8 w-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold shadow-lg shadow-emerald-500/20">1</button>
                                <button className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-50">&gt;</button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

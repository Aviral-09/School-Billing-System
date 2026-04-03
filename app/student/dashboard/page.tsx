'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, onSnapshot, orderBy } from 'firebase/firestore';
import { StudentProfile, FeeStructure, Payment } from '@/types';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SCHOOL_CONFIG } from '@/lib/schoolConfig';
import {
    CreditCardIcon,
    ClockIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    ArrowUpRightIcon
} from '@heroicons/react/24/outline';

export default function StudentDashboard() {
    const { user, role, loading: authLoading } = useAuth();
    const router = useRouter();
    const [student, setStudent] = useState<StudentProfile | null>(null);
    const [feeDetails, setFeeDetails] = useState<FeeStructure | null>(null);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }
        if (role === 'admin') {
            router.push('/admin/dashboard');
            return;
        }
    }, [user, role, authLoading, router]);

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            try {
                // Fetch Student Profile linked to this Auth User
                const studentQuery = query(collection(db, 'students'), where('userId', '==', user.uid));
                const studentSnap = await getDocs(studentQuery);

                if (!studentSnap.empty) {
                    const studentData = studentSnap.docs[0].data() as StudentProfile;
                    setStudent(studentData);

                    // Fetch Fee Structure for student's class
                    const feeQuery = query(collection(db, 'fees'), where('className', '==', studentData.class));
                    const feeSnap = await getDocs(feeQuery);
                    if (!feeSnap.empty) {
                        setFeeDetails(feeSnap.docs[0].data() as FeeStructure);
                    }

                    // Fetch Payments with real-time updates
                    const paymentsQuery = query(
                        collection(db, 'payments'),
                        where('userId', '==', user.uid),
                        orderBy('createdAt', 'desc')
                    );

                    const unsubscribe = onSnapshot(paymentsQuery, (snapshot) => {
                        const paymentsList = snapshot.docs.map(doc => doc.data() as Payment);
                        setPayments(paymentsList);
                        setLoading(false);
                    });

                    return unsubscribe;
                } else {
                    setLoading(false);
                }
            } catch (error) {
                console.error("Dashboard Fetch Error:", error);
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    if (authLoading || loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-black">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
            </div>
        );
    }

    if (!student) {
        return (
            <div className="min-h-screen bg-black text-white">
                <Navbar />
                <div className="max-w-3xl mx-auto py-20 px-6 text-center">
                    <ExclamationCircleIcon className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
                    <h1 className="text-3xl font-bold mb-4">No Student Profile Linked</h1>
                    <p className="text-white/60 mb-8">
                        Your account is not linked to any student record at{' '}
                        <strong>{SCHOOL_CONFIG.name}</strong>. Please contact the
                        administration office to link your account using your email:{' '}
                        <strong>{user?.email}</strong>
                    </p>
                    <p className="text-white/40 text-sm mb-8">
                        Contact: {SCHOOL_CONFIG.email} &bull; {SCHOOL_CONFIG.phone}
                    </p>
                    <button
                        onClick={() => router.push('/login')}
                        className="bg-white text-black border border-yellow-500/30 px-8 py-3 rounded-xl font-bold"
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        );
    }

    const totalPaid = payments
        .filter(p => p.paymentStatus === 'success')
        .reduce((sum, p) => sum + p.amount, 0);

    const balanceDue = feeDetails ? feeDetails.totalFee - totalPaid : 0;

    return (
        <div className="min-h-screen bg-black text-white">
            <Navbar />

            <main className="max-w-7xl mx-auto p-4 md:p-8 lg:p-12">
                {/* Welcome Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <div>
                        <h2 className="text-yellow-500 font-bold uppercase tracking-[0.2em] text-sm mb-2">Student Portal</h2>
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                            Hi, {student.name.split(' ')[0]} 👋
                        </h1>
                        <p className="mt-4 text-white/60 max-w-lg leading-relaxed text-lg">
                            Manage your academic expenses and handle secure payments for <span className="text-white font-bold">{student.class}</span>.
                        </p>
                    </div>

                    <div className="flex items-center gap-4 bg-white/5 p-4 rounded-3xl border border-yellow-500/20 backdrop-blur-sm self-start md:self-auto">
                        <div className="w-12 h-12 rounded-2xl bg-white border border-yellow-500/30 flex items-center justify-center shadow-lg">
                            <CreditCardIcon className="w-6 h-6 text-black" />
                        </div>
                        <div>
                            <p className="text-xs text-white/40 uppercase font-black tracking-widest">Student ID</p>
                            <p className="text-white font-mono font-bold">{student.studentId}</p>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="glass-card rounded-[2rem] p-8 border border-yellow-500/20 relative overflow-hidden group">
                        <p className="text-white/40 font-bold text-sm uppercase tracking-widest mb-2">Total Fees</p>
                        <h3 className="text-4xl font-black text-white">₹{feeDetails?.totalFee.toLocaleString()}</h3>
                        <div className="mt-4 inline-flex items-center text-xs text-white/60 bg-white/5 border border-yellow-500/10 rounded-full px-3 py-1">
                            Annual Schedule
                        </div>
                        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-yellow-500/5 blur-3xl rounded-full"></div>
                    </div>

                    <div className="glass-card rounded-[2rem] p-8 border border-yellow-500/20 relative overflow-hidden group">
                        <p className="text-yellow-500 font-bold text-sm uppercase tracking-widest mb-2">Paid Amount</p>
                        <h3 className="text-4xl font-black text-white">₹{totalPaid.toLocaleString()}</h3>
                        <div className="mt-4 inline-flex items-center gap-1.5 text-xs text-yellow-500 bg-yellow-500/10 rounded-full px-3 py-1 font-bold">
                            <CheckCircleIcon className="w-3.5 h-3.5" />
                            Confirmed Transactions
                        </div>
                    </div>

                    <div className="glass-card rounded-[2rem] p-8 border border-yellow-500/20 relative overflow-hidden group bg-gradient-to-br from-white/5 to-transparent">
                        <p className="text-orange-400 font-bold text-sm uppercase tracking-widest mb-2">Balance Due</p>
                        <h3 className="text-4xl font-black text-white">₹{balanceDue.toLocaleString()}</h3>
                        {balanceDue > 0 ? (
                            <button
                                onClick={() => router.push('/payment')}
                                className="mt-4 inline-flex items-center gap-2 text-xs text-black bg-white hover:bg-gray-100 border border-yellow-500/30 rounded-full px-4 py-2 font-black transition-all hover:scale-105 shadow-lg"
                            >
                                Pay Outstanding
                                <ArrowUpRightIcon className="w-3 h-3" />
                            </button>
                        ) : (
                            <div className="mt-4 inline-flex items-center gap-1.5 text-xs text-yellow-500 bg-yellow-500/10 rounded-full px-3 py-1 font-bold border border-yellow-500/20">
                                <CheckCircleIcon className="w-3.5 h-3.5" /> All Settled
                            </div>
                        )}
                    </div>
                </div>

                {/* History Section */}
                <div>
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <ClockIcon className="w-6 h-6 text-yellow-500" />
                            Payment History
                        </h2>
                    </div>

                    <div className="glass-card rounded-[2.5rem] overflow-hidden border border-yellow-500/20">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 border-b border-yellow-500/10 font-bold uppercase tracking-widest text-[10px] text-white/40">
                                    <tr>
                                        <th className="px-8 py-5">Date</th>
                                        <th className="px-8 py-5">Transaction ID</th>
                                        <th className="px-8 py-5">Amount</th>
                                        <th className="px-8 py-5">Status</th>
                                        <th className="px-8 py-5">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-yellow-500/5 text-sm">
                                    {payments.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-8 py-20 text-center text-white/40">
                                                No transactions recorded yet.
                                            </td>
                                        </tr>
                                    ) : (
                                        payments.map((p, idx) => (
                                            <tr key={idx} className="group hover:bg-white/5 transition-colors">
                                                <td className="px-8 py-6 text-white/60 font-medium">
                                                    {new Date(p.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-8 py-6 text-white/40 font-mono text-xs">
                                                    {p.stripeSessionId.substring(0, 16)}...
                                                </td>
                                                <td className="px-8 py-6 text-white font-black">
                                                    ₹{p.amount.toLocaleString()}
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-black uppercase leading-none border ${p.paymentStatus === 'success'
                                                        ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                                        : p.paymentStatus === 'pending'
                                                            ? 'bg-white/5 text-white/40 border-white/10'
                                                            : p.paymentStatus === 'failed'
                                                                ? 'bg-red-500/10 text-red-500 border-red-500/20'
                                                                : 'bg-white/5 text-white/20 border-white/5 italic'
                                                        }`}>
                                                        {p.paymentStatus}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    {p.paymentStatus === 'success' && (
                                                        <button
                                                            onClick={async () => {
                                                                try {
                                                                    const q = query(collection(db, 'receipts'), where('transactionId', '==', p.stripeSessionId));
                                                                    const snap = await getDocs(q);
                                                                    if (!snap.empty) {
                                                                        router.push(`/receipt/${snap.docs[0].id}`);
                                                                    } else {
                                                                        alert('Receipt still generating. Please refresh in a moment.');
                                                                    }
                                                                } catch (e) {
                                                                    console.error(e);
                                                                }
                                                            }}
                                                            className="text-yellow-500 hover:text-white font-black uppercase text-xs tracking-widest transition-colors"
                                                        >
                                                            View Receipt
                                                        </button>
                                                    )}
                                                    {p.paymentStatus === 'failed' && (
                                                        <Link href="/payment" className="text-white/40 hover:text-white text-xs font-bold transition-colors uppercase">
                                                            Retry
                                                        </Link>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

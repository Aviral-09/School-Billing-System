'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { StudentProfile, Payment, FeeStructure } from '@/types';
import { useRouter } from 'next/navigation';
import { createReceipt } from '@/lib/receiptUtils';

export default function AdminDashboard() {
    const { user, role, loading: authLoading } = useAuth();
    const router = useRouter();

    const [stats, setStats] = useState({
        totalStudents: 0,
        totalRevenue: 0,
        pendingPayments: 0
    });

    const [loading, setLoading] = useState(true);

    
    const [allStudents, setAllStudents] = useState<StudentProfile[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterClass, setFilterClass] = useState('All');

    
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentNote, setPaymentNote] = useState('');

    
    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                router.push('/login');
            } else if (role !== 'admin') {
                router.push('/student/dashboard');
            }
        }
    }, [user, role, authLoading, router]);

    
    const fetchAdminData = async () => {
        if (!user || role !== 'admin') return;
        try {
            setLoading(true);
            
            const studentsSnap = await getDocs(collection(db, 'students'));
            const studentsList = studentsSnap.docs.map(d => d.data() as StudentProfile);
            setAllStudents(studentsList);

            
            const feesSnap = await getDocs(collection(db, 'fees'));
            const feeMap: Record<string, number> = {};
            feesSnap.docs.forEach(doc => {
                const f = doc.data() as FeeStructure;
                feeMap[f.className] = f.totalFee;
            });

            
            const paymentsSnap = await getDocs(collection(db, 'payments'));
            const paymentsList = paymentsSnap.docs.map(d => d.data() as Payment);

            
            const revenue = paymentsList
                .filter(p => p.status === 'paid')
                .reduce((sum, p) => sum + p.amount, 0);

            let totalExpected = 0;
            studentsList.forEach(student => {
                const classFee = feeMap[student.class] || 0;
                totalExpected += classFee;
            });

            const pending = Math.max(0, totalExpected - revenue);

            setStats({
                totalStudents: studentsList.length,
                totalRevenue: revenue,
                pendingPayments: pending
            });

        } catch (error) {
            console.error("Admin Load Error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdminData();
    }, [user, role]);

    
    const filteredStudents = allStudents.filter(student => {
        const matchesSearch =
            student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.studentId.includes(searchQuery);
        const matchesClass = filterClass === 'All' || student.class === filterClass;

        return matchesSearch && matchesClass;
    });

    const displayStudents = filteredStudents.slice(0, 50);

    const uniqueClasses = ['All', ...Array.from(new Set(allStudents.map(s => s.class))).sort()];

    
    const handleExport = () => {
        const headers = ["Student ID", "Name", "Class", "Parent Email"];
        const rows = filteredStudents.map(s => [
            s.studentId,
            s.name,
            s.class,
            s.parentEmail
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + [headers, ...rows].map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "student_records.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    
    const handleAddPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStudentId || !paymentAmount) return;

        try {
            setIsSubmitting(true);
            const timestamp = Date.now();
            const transactionId = `MANUAL-${timestamp}`;

            const payRef = await addDoc(collection(db, 'payments'), {
                studentId: selectedStudentId,
                amount: Number(paymentAmount),
                status: 'paid',
                method: 'manual_admin',
                notes: paymentNote,
                stripeSessionId: transactionId,
                createdAt: timestamp
            });

            
            await createReceipt({
                amount: Number(paymentAmount),
                paymentId: payRef.id,
                method: 'manual_admin',
                status: 'paid',
                transactionId: transactionId
            }, selectedStudentId, user?.uid || 'Admin');

            setShowPaymentModal(false);
            setSelectedStudentId('');
            setPaymentAmount('');
            setPaymentNote('');
            fetchAdminData();
            alert("Payment recorded and Receipt generated successfully!");
        } catch (err) {
            console.error("Payment Add Error:", err);
            alert("Failed to add payment.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-900 text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    return (
        <Sidebar>
            <div className="font-sans text-slate-200 relative selection:bg-emerald-500/30">
                {}
                <div className="md:flex md:items-center md:justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-bold leading-7 text-white tracking-tight">
                            Dashboard Overview
                        </h2>
                        <p className="text-slate-400 text-sm mt-1">Welcome back, Administrator.</p>
                    </div>

                    <div className="flex items-center gap-4 mt-4 md:mt-0">
                        <div className="relative group">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 transition-colors group-focus-within:text-emerald-500">
                                <svg className="h-5 w-5 text-slate-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="block w-full rounded-full border-0 bg-white/5 py-2 pl-10 pr-4 text-white ring-1 ring-inset ring-white/10 placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-emerald-500 transition-all hover:bg-white/10 sm:text-sm sm:leading-6 backdrop-blur-sm"
                                placeholder="Search records..."
                            />
                        </div>

                        {}
                        <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-white tracking-wide">{user?.displayName || 'Admin'}</p>
                                <p className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold">Administrator</p>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center text-emerald-400 font-bold ring-1 ring-emerald-500/30 shadow-lg shadow-emerald-500/10">
                                {user?.displayName ? user.displayName.charAt(0) : 'A'}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-8">
                    <span className="inline-flex items-center gap-2 rounded-lg bg-yellow-500/10 px-3 py-2 text-sm font-medium text-yellow-400 border border-yellow-500/20">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Note: To test actual payments, please sign in as a Student.
                    </span>
                </div>

                {}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-10">
                    <div className="glass-card p-6 relative overflow-hidden group hover:bg-white/5 transition-colors">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <svg className="h-20 w-20 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" /><path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" /></svg>
                        </div>
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className="rounded-xl bg-emerald-500/20 p-3 text-emerald-400">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-400 ring-1 ring-emerald-500/20">
                                +12.5%
                            </span>
                        </div>
                        <dt className="truncate text-sm font-medium text-slate-400 relative z-10">Total Revenue</dt>
                        <dd className="mt-2 text-3xl font-bold tracking-tight text-white relative z-10">₹{stats.totalRevenue.toLocaleString()}</dd>
                    </div>

                    <div className="glass-card p-6 relative overflow-hidden group hover:bg-white/5 transition-colors">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <svg className="h-20 w-20 text-orange-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                        </div>
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className="rounded-xl bg-orange-500/20 p-3 text-orange-400">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <span className="inline-flex items-center rounded-full bg-orange-500/10 px-2.5 py-0.5 text-xs font-bold text-orange-400 border border-orange-500/20">
                                Action
                            </span>
                        </div>
                        <dt className="truncate text-sm font-medium text-slate-400 relative z-10">Pending Payments</dt>
                        <dd className="mt-2 text-3xl font-bold tracking-tight text-white relative z-10">₹{stats.pendingPayments.toLocaleString()}</dd>
                    </div>

                    <div className="glass-card p-6 relative overflow-hidden group hover:bg-white/5 transition-colors">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <svg className="h-20 w-20 text-indigo-500" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" /></svg>
                        </div>
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className="rounded-xl bg-indigo-500/20 p-3 text-indigo-400">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                            </div>
                            <span className="inline-flex items-center rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs font-bold text-indigo-400 border border-indigo-500/20">
                                Live
                            </span>
                        </div>
                        <dt className="truncate text-sm font-medium text-slate-400 relative z-10">Total Students</dt>
                        <dd className="mt-2 text-3xl font-bold tracking-tight text-white relative z-10">{stats.totalStudents}</dd>
                    </div>
                </div>

                {}
                <div className="glass-card rounded-3xl overflow-hidden shadow-2xl">
                    <div className="border-b border-white/5 px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white/5">
                        <div>
                            <h3 className="text-lg font-bold leading-6 text-white">Student Fee Records</h3>
                            <p className="mt-1 text-sm text-slate-400">Manage and view recent transaction details</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <select
                                    value={filterClass}
                                    onChange={(e) => setFilterClass(e.target.value)}
                                    className="appearance-none bg-[#1A2E33] pl-4 pr-10 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-xl border border-white/10 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                                >
                                    {uniqueClasses.map(cls => (
                                        <option key={cls} value={cls}>Class: {cls}</option>
                                    ))}
                                </select>
                            </div>

                            <button
                                onClick={handleExport}
                                className="inline-flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-sm font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-colors border border-white/10"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                Export
                            </button>
                            <button
                                onClick={() => setShowPaymentModal(true)}
                                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2 text-sm font-bold text-white hover:shadow-lg hover:shadow-emerald-500/20 hover:scale-105 transition-all"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                Add Payment
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm whitespace-nowrap">
                            <thead className="text-slate-400 bg-white/5 uppercase text-xs tracking-wider">
                                <tr>
                                    <th scope="col" className="px-6 py-4 font-bold">Student Name</th>
                                    <th scope="col" className="px-6 py-4 font-bold">Class/Grade</th>
                                    <th scope="col" className="px-6 py-4 font-bold">Fee Type</th>
                                    <th scope="col" className="px-6 py-4 font-bold">Details</th>
                                    <th scope="col" className="px-6 py-4 font-bold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {displayStudents.length > 0 ? displayStudents.map((student, index) => (
                                    <tr key={student.studentId} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold ${['bg-blue-500/20 text-blue-400', 'bg-purple-500/20 text-purple-400', 'bg-amber-500/20 text-amber-400'][index % 3]
                                                    }`}>
                                                    {student.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white">{student.name}</div>
                                                    <div className="text-xs text-slate-500 font-mono">ID: #{student.studentId}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-300 font-medium">Grade {student.class}</td>
                                        <td className="px-6 py-4 text-slate-300">Tuition Fee</td>
                                        <td className="px-6 py-4">
                                            <div className="text-slate-400 flex items-center gap-2">
                                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                                {student.parentEmail}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => router.push('/admin/students')}
                                                className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                                            >
                                                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                            No records found matching your criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {}
            {showPaymentModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-slate-900/80 backdrop-blur-md transition-opacity"
                        onClick={() => setShowPaymentModal(false)}
                    ></div>
                    <div className="relative glass-card border border-white/10 rounded-3xl p-8 w-full max-w-lg shadow-2xl animate-scaleUp">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-white">Record Payment</h3>
                                <p className="text-slate-400 text-sm mt-1">Manually record a payment received via Cash, Cheque, or Bank Transfer.</p>
                            </div>
                            <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-white transition-colors">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <form onSubmit={handleAddPayment} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">Select Student</label>
                                <select
                                    required
                                    value={selectedStudentId}
                                    onChange={(e) => setSelectedStudentId(e.target.value)}
                                    className="w-full bg-slate-900/50 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all hover:bg-slate-900/70"
                                >
                                    <option value="">-- Choose Student --</option>
                                    {allStudents.map(s => (
                                        <option key={s.studentId} value={s.studentId}>
                                            {s.name} (ID: {s.studentId})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">Amount (INR)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-3 text-slate-500">₹</span>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={paymentAmount}
                                        onChange={(e) => setPaymentAmount(e.target.value)}
                                        className="w-full bg-slate-900/50 border border-white/10 text-white rounded-xl pl-8 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all hover:bg-slate-900/70 font-mono"
                                        placeholder="5000"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">Notes (Optional)</label>
                                <textarea
                                    rows={3}
                                    value={paymentNote}
                                    onChange={(e) => setPaymentNote(e.target.value)}
                                    className="w-full bg-slate-900/50 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all hover:bg-slate-900/70"
                                    placeholder="e.g. Cash payment received for Term 1"
                                />
                            </div>

                            <div className="flex items-center gap-3 mt-8">
                                <button
                                    type="button"
                                    onClick={() => setShowPaymentModal(false)}
                                    className="flex-1 px-4 py-3 bg-white/5 border border-white/10 text-slate-300 rounded-xl hover:bg-white/10 hover:text-white font-bold transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:shadow-lg hover:shadow-emerald-500/20 hover:scale-[1.02] font-bold transition-all disabled:opacity-50 disabled:transform-none"
                                >
                                    {isSubmitting ? 'Recording...' : 'Save Payment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Sidebar>
    );
}

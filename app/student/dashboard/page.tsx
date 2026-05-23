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
    CreditCard,
    Clock,
    CheckCircle2,
    AlertCircle,
    ArrowUpRight,
    IndianRupee,
    Wallet,
    FileText,
    TrendingUp,
    PieChart,
    Calendar,
    Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function StudentDashboard() {
    const { user, role, loading: authLoading } = useAuth();
    const router = useRouter();
    const [student, setStudent] = useState<StudentProfile | null>(null);
    const [feeDetails, setFeeDetails] = useState<FeeStructure | null>(null);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [hoveredPoint, setHoveredPoint] = useState<{ index: number; label: string; amount: number; paymentAmount: number; date: string; ref: string } | null>(null);

    useEffect(() => {
        if (!authLoading && !user) { router.push('/login'); return; }
        if (role === 'admin') { router.push('/admin/dashboard'); return; }
    }, [user, role, authLoading, router]);

    useEffect(() => {
        if (!user) return;
        const fetchData = async () => {
            try {
                const studentQuery = query(collection(db, 'students'), where('userId', '==', user.uid));
                const studentSnap = await getDocs(studentQuery);
                if (!studentSnap.empty) {
                    const studentData = studentSnap.docs[0].data() as StudentProfile;
                    setStudent(studentData);
                    if (studentData.feeStructure) {
                        setFeeDetails(studentData.feeStructure);
                    } else {
                        const feeQuery = query(collection(db, 'fees'), where('className', '==', studentData.class));
                        const feeSnap = await getDocs(feeQuery);
                        if (!feeSnap.empty) setFeeDetails(feeSnap.docs[0].data() as any);
                    }
                    const paymentsQuery = query(collection(db, 'payments'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
                    const unsubscribe = onSnapshot(paymentsQuery, snap => {
                        setPayments(snap.docs.map((d: any) => d.data() as Payment));
                        setLoading(false);
                    });
                    return unsubscribe;
                } else { setLoading(false); }
            } catch (error) { console.error('Dashboard Fetch Error:', error); setLoading(false); }
        };
        fetchData();
    }, [user]);

    if (authLoading || loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary border-r-transparent border-l-transparent border-b-transparent"></div>
            </div>
        );
    }

    if (!student) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="max-w-xl mx-auto py-32 px-6 text-center">
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="w-8 h-8 text-destructive" />
                    </motion.div>
                    <h1 className="text-3xl font-bold text-foreground mb-4 tracking-tight">Profile Not Found</h1>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                        Your account is not linked to any student record at <strong className="text-foreground">{SCHOOL_CONFIG.name}</strong>. Please contact the administration.
                    </p>
                    <p className="text-sm font-mono text-muted-foreground mb-10 bg-muted/50 py-2 rounded-lg inline-block px-4">{user?.email}</p>
                    <div>
                        <button onClick={() => router.push('/login')} className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-8 py-2">
                            Return to Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const totalPaid = payments.filter(p => p.paymentStatus === 'success' || (p as any).status === 'paid').reduce((s, p) => s + p.amount, 0);
    const balanceDue = feeDetails ? feeDetails.totalFee - totalPaid : 0;
    const totalFee = feeDetails?.totalFee || 19500;
    const percentPaid = totalFee > 0 ? Math.min(100, (totalPaid / totalFee) * 100) : 100;

    // Build dynamic list of enabled fee components
    const feeCategories: Array<{ name: string; amount: number; color: string; pct: number }> = [];
    if (feeDetails) {
        const componentsList = [
            { key: 'admissionFee', name: 'Admission Fee', color: 'bg-indigo-500' },
            { key: 'tuitionFee', name: 'Tuition Fee', color: 'bg-primary' },
            { key: 'examFee', name: 'Exam Fee', color: 'bg-amber-500' },
            { key: 'libraryFee', name: 'Library Fee', color: 'bg-emerald-500' },
            { key: 'computerFee', name: 'Computer Fee', color: 'bg-blue-500' },
            { key: 'transportFee', name: 'Transport Fee', color: 'bg-rose-500' },
            { key: 'sportsFee', name: 'Sports Fee', color: 'bg-orange-500' },
            { key: 'miscFee', name: 'Misc Fee', color: 'bg-slate-500' }
        ];

        let allocatedPaid = totalPaid;
        componentsList.forEach((comp) => {
            const isEnabled = feeDetails.enabledComponents 
                ? feeDetails.enabledComponents[comp.key as keyof typeof feeDetails.enabledComponents] 
                : (feeDetails[comp.key as keyof FeeStructure] !== undefined);

            if (isEnabled) {
                const amount = Number(feeDetails[comp.key as keyof FeeStructure] || 0);
                if (amount > 0) {
                    const pct = Math.min(100, (allocatedPaid / amount) * 100);
                    allocatedPaid = Math.max(0, allocatedPaid - amount);
                    feeCategories.push({
                        name: comp.name,
                        amount,
                        color: comp.color,
                        pct
                    });
                }
            }
        });
    } else {
        feeCategories.push(
            { name: 'Tuition Fee', amount: 14000, color: 'bg-primary', pct: Math.min(100, (totalPaid / 14000) * 100) },
            { name: 'Transport Fee', amount: 5000, color: 'bg-emerald-500', pct: totalPaid > 14000 ? Math.min(100, ((totalPaid - 14000) / 5000) * 100) : 0 },
            { name: 'Exam Fee', amount: 500, color: 'bg-amber-500', pct: totalPaid > 19000 ? Math.min(100, ((totalPaid - 19000) / 500) * 100) : 0 }
        );
    }

    // ── CUMULATIVE PAYMENT TREND CALCULATIONS ──
    const chronologicalPayments = [...payments]
        .filter(p => p.paymentStatus === 'success' || (p as any).status === 'paid')
        .sort((a, b) => a.createdAt - b.createdAt);

    let runningTotal = 0;
    const cumulativePoints = chronologicalPayments.map((p) => {
        runningTotal += p.amount;
        return {
            label: new Date(p.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
            amount: runningTotal,
            paymentAmount: p.amount,
            date: new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
            ref: p.stripeSessionId
        };
    });

    const statCards = [
        {
            label: 'Total Fees',
            value: `₹${feeDetails?.totalFee.toLocaleString() || 0}`,
            sub: 'Annual schedule',
            icon: IndianRupee,
            color: 'text-primary',
            bg: 'bg-primary/5',
        },
        {
            label: 'Amount Paid',
            value: `₹${totalPaid.toLocaleString()}`,
            sub: 'Confirmed',
            icon: CheckCircle2,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10',
        },
        {
            label: 'Balance Due',
            value: `₹${balanceDue.toLocaleString()}`,
            sub: balanceDue === 0 ? 'All settled ✓' : 'Outstanding',
            icon: Wallet,
            color: balanceDue > 0 ? 'text-amber-500' : 'text-emerald-500',
            bg: balanceDue > 0 ? 'bg-amber-500/10' : 'bg-emerald-500/10',
            cta: balanceDue > 0,
        },
    ];

    return (
        <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/10">
            <Navbar />

            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {/* Minimalist Welcome Header */}
                <motion.div 
                    initial={{ y: 20, opacity: 0 }} 
                    animate={{ y: 0, opacity: 1 }} 
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16"
                >
                    <div>
                        <div className="inline-flex items-center gap-2 mb-4">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></span>
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Student Portal</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-3">
                            Welcome back, {student.name.split(' ')[0]}.
                        </h1>
                        <p className="text-lg text-muted-foreground font-medium">
                            Managing <span className="text-foreground">{student.class}</span> at {SCHOOL_CONFIG.name}
                        </p>
                    </div>

                    <div className="bg-card px-5 py-3 rounded-xl border border-border shadow-sm flex items-center gap-4 hover:border-primary/20 transition-colors">
                        <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center flex-shrink-0">
                            <CreditCard className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Student ID</p>
                            <p className="font-mono font-semibold text-foreground">{student.studentId}</p>
                        </div>
                    </div>
                </motion.div>

                {/* Aesthetic Bento Grid Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    {statCards.map((card, idx) => (
                        <motion.div 
                            key={card.label} 
                            initial={{ y: 20, opacity: 0 }} 
                            animate={{ y: 0, opacity: 1 }} 
                            transition={{ duration: 0.5, delay: 0.1 * (idx + 1), ease: "easeOut" }}
                            className="group relative bg-card rounded-2xl p-6 border border-border overflow-hidden hover:border-primary/30 transition-all duration-300 hover:shadow-sm"
                        >
                            {/* Subtle background glow effect */}
                            <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full blur-3xl opacity-20 transition-opacity group-hover:opacity-40 ${card.bg}`} />
                            
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-8">
                                    <div className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center`}>
                                        <card.icon className={`w-5 h-5 ${card.color}`} />
                                    </div>
                                    {card.cta && (
                                        <button
                                            onClick={() => router.push('/payment')}
                                            className="inline-flex items-center gap-1.5 text-xs font-semibold bg-primary text-primary-foreground px-3 py-1.5 rounded-full hover:bg-primary/90 transition-colors"
                                        >
                                            Pay Now <ArrowUpRight className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5">{card.label}</p>
                                <p className="text-3xl font-bold tracking-tight mb-2">{card.value}</p>
                                <p className="text-sm text-muted-foreground font-medium">{card.sub}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Minimalist Payment History */}
                <motion.div 
                    initial={{ y: 20, opacity: 0 }} 
                    animate={{ y: 0, opacity: 1 }} 
                    transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
                    className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm"
                >
                    <div className="p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50">
                        <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
                            <Clock className="w-5 h-5 text-muted-foreground" />
                            Recent Transactions
                        </h2>
                        {payments.length > 0 && (
                            <span className="text-xs font-semibold text-muted-foreground bg-muted px-3 py-1 rounded-full">
                                {payments.length} {payments.length === 1 ? 'Record' : 'Records'}
                            </span>
                        )}
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-border/50">
                                    <th className="py-4 px-6 md:px-8 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Date</th>
                                    <th className="py-4 px-6 md:px-8 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Reference ID</th>
                                    <th className="py-4 px-6 md:px-8 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Amount</th>
                                    <th className="py-4 px-6 md:px-8 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Status</th>
                                    <th className="py-4 px-6 md:px-8 text-[11px] font-bold text-muted-foreground uppercase tracking-widest text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {payments.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-16 text-center text-muted-foreground text-sm">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <FileText className="w-8 h-8 opacity-20" />
                                                <p>No transactions recorded yet.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : payments.map((p, idx) => (
                                    <tr key={idx} className="hover:bg-muted/30 transition-colors group">
                                        <td className="py-4 px-6 md:px-8 text-sm font-medium">
                                            {new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="py-4 px-6 md:px-8 text-xs font-mono text-muted-foreground">
                                            {p.stripeSessionId.substring(0, 18)}…
                                        </td>
                                        <td className="py-4 px-6 md:px-8 font-semibold">
                                            ₹{p.amount.toLocaleString()}
                                        </td>
                                        <td className="py-4 px-6 md:px-8">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${
                                                p.paymentStatus === 'success' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 
                                                p.paymentStatus === 'pending' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 
                                                p.paymentStatus === 'failed' ? 'bg-destructive/10 text-destructive' : 
                                                'bg-muted text-muted-foreground'
                                            }`}>
                                                {p.paymentStatus}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 md:px-8 text-right">
                                            {p.paymentStatus === 'success' && (
                                                <button
                                                    onClick={async () => {
                                                        try {
                                                            const q = query(collection(db, 'receipts'), where('transactionId', '==', p.stripeSessionId));
                                                            const snap = await getDocs(q);
                                                            if (!snap.empty) {
                                                                router.push(`/receipt/${snap.docs[0].id}`);
                                                            } else {
                                                                const { createReceipt } = await import('@/lib/receiptUtils');
                                                                const result = await createReceipt({
                                                                    amount: p.amount,
                                                                    paymentId: p.paymentId || 'PAY-' + Date.now(),
                                                                    method: p.stripeSessionId.startsWith('MANUAL') ? 'manual_admin' : 'online_stripe',
                                                                    status: 'paid',
                                                                    transactionId: p.stripeSessionId
                                                                }, student.studentId || 'ST-12345', 'System On-Demand');
                                                                router.push(`/receipt/${result.id}`);
                                                            }
                                                        } catch (e) {
                                                            console.error("Receipt error:", e);
                                                            alert('Failed to load or generate receipt. Please try again.');
                                                        }
                                                    }}
                                                    className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                                >
                                                    Receipt &rarr;
                                                </button>
                                            )}
                                            {p.paymentStatus === 'failed' && (
                                                <Link href="/payment" className="text-xs font-semibold text-destructive hover:text-destructive/80 transition-colors">
                                                    Retry
                                                </Link>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                {/* ── STUDENT PAYMENT ANALYTICS & VISUALIZATIONS ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
                    
                    {/* LEFT COLUMN: Fee Allocation & Circle Progress */}
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm flex flex-col justify-between relative overflow-hidden"
                    >
                        <div className="relative z-10">
                            <h3 className="text-lg font-bold tracking-tight flex items-center gap-2 mb-2">
                                <PieChart className="w-5 h-5 text-primary" />
                                Fee Status Overview
                            </h3>
                            <p className="text-xs text-muted-foreground font-medium mb-8">Allocation of paid dues against annual schedule</p>
                            
                            {/* Circular gauge */}
                            <div className="flex justify-center items-center my-6 relative">
                                <svg className="w-36 h-36 transform -rotate-90">
                                    {/* Background track */}
                                    <circle
                                        cx="72"
                                        cy="72"
                                        r="60"
                                        className="stroke-muted"
                                        strokeWidth="10"
                                        fill="transparent"
                                    />
                                    {/* Progress segment */}
                                    <circle
                                        cx="72"
                                        cy="72"
                                        r="60"
                                        className="stroke-primary transition-all duration-1000 ease-out"
                                        strokeWidth="10"
                                        fill="transparent"
                                        strokeDasharray={2 * Math.PI * 60}
                                        strokeDashoffset={(2 * Math.PI * 60) * (1 - percentPaid / 100)}
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute text-center">
                                    <p className="text-3xl font-extrabold tracking-tighter">{Math.round(percentPaid)}%</p>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Slipped / Paid</p>
                                </div>
                            </div>

                            {/* Itemized Categories */}
                            <div className="space-y-4 mt-8">
                                {feeCategories.map((item) => (
                                    <div key={item.name} className="space-y-1.5">
                                        <div className="flex items-center justify-between text-xs font-semibold">
                                            <span className="text-muted-foreground">{item.name}</span>
                                            <span className="text-foreground">₹{item.amount.toLocaleString()} ({Math.round(item.pct)}%)</span>
                                        </div>
                                        <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                                            <div 
                                                className={`h-full ${item.color} rounded-full transition-all duration-1000`} 
                                                style={{ width: `${item.pct}%` }} 
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Top corner gradient glow */}
                        <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full blur-3xl opacity-20 bg-primary" />
                    </motion.div>

                    {/* RIGHT COLUMN: Interactive Cumulative Payment Timeline SVG Chart */}
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm lg:col-span-2 flex flex-col justify-between relative overflow-hidden"
                    >
                        <div className="relative z-10 flex-1 flex flex-col justify-between">
                            <div>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                    <div>
                                        <h3 className="text-lg font-bold tracking-tight flex items-center gap-2">
                                            <TrendingUp className="w-5 h-5 text-primary" />
                                            Payment Growth Timeline
                                        </h3>
                                        <p className="text-xs text-muted-foreground font-medium mt-0.5">Interactive cumulative transaction progress</p>
                                    </div>

                                    {/* Live HUD displayed on hover */}
                                    <AnimatePresence mode="wait">
                                        {hoveredPoint ? (
                                            <motion.div 
                                                key="hud"
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                className="bg-muted px-4 py-2 rounded-xl text-right flex flex-col shrink-0 border border-border/50"
                                            >
                                                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Transaction Ref: {hoveredPoint.ref.substring(0, 10)}…</span>
                                                <span className="text-sm font-bold text-primary mt-0.5">₹{hoveredPoint.paymentAmount.toLocaleString()} added</span>
                                                <span className="text-[10px] font-semibold text-muted-foreground mt-0.5">{hoveredPoint.date} (Total: ₹{hoveredPoint.amount.toLocaleString()})</span>
                                            </motion.div>
                                        ) : (
                                            <motion.div 
                                                key="hud-default"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="hidden sm:flex flex-col text-right"
                                            >
                                                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Total Settled</span>
                                                <span className="text-lg font-bold text-foreground mt-0.5">₹{totalPaid.toLocaleString()}</span>
                                                <span className="text-[10px] font-medium text-muted-foreground">Hover nodes to view receipts</span>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Timeline SVG */}
                            <div className="flex-1 flex items-center justify-center my-4 min-h-[160px] relative w-full">
                                {chronologicalPayments.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                        <Calendar className="w-8 h-8 opacity-25" />
                                        <p className="text-sm">No payment nodes to render on the timeline.</p>
                                    </div>
                                ) : (
                                    <svg viewBox="0 0 500 160" className="w-full h-full overflow-visible">
                                        <defs>
                                            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="var(--color-electric-violet)" stopOpacity="0.15" />
                                                <stop offset="100%" stopColor="var(--color-electric-violet)" stopOpacity="0.0" />
                                            </linearGradient>
                                        </defs>

                                        {/* Reference Grid lines */}
                                        <line x1="20" y1="20" x2="480" y2="20" className="stroke-muted/40" strokeWidth="1" strokeDasharray="3,3" />
                                        <line x1="20" y1="80" x2="480" y2="80" className="stroke-muted/40" strokeWidth="1" strokeDasharray="3,3" />
                                        <line x1="20" y1="140" x2="480" y2="140" className="stroke-muted/40" strokeWidth="1" strokeDasharray="3,3" />

                                        {/* Area path */}
                                        {(() => {
                                            const maxVal = Math.max(totalFee, ...cumulativePoints.map(p => p.amount));
                                            const valRange = maxVal || 1;
                                            const getX = (idx: number) => {
                                                if (cumulativePoints.length === 1) return 250;
                                                return 20 + (idx * 460) / (cumulativePoints.length - 1);
                                            };
                                            const getY = (amount: number) => {
                                                return 140 - (amount * 120) / valRange;
                                            };
                                            const pathStr = cumulativePoints.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx)} ${getY(p.amount)}`).join(' ');
                                            const fillStr = `${pathStr} L ${getX(cumulativePoints.length - 1)} 140 L ${getX(0)} 140 Z`;
                                            
                                            return (
                                                <>
                                                    <path d={fillStr} fill="url(#areaGrad)" />
                                                    <path d={pathStr} fill="none" className="stroke-primary" strokeWidth="3" />
                                                    
                                                    {/* Interactive points */}
                                                    {cumulativePoints.map((p, idx) => (
                                                        <g 
                                                            key={idx} 
                                                            className="cursor-pointer"
                                                            onMouseEnter={() => setHoveredPoint({ index: idx, ...p })}
                                                            onMouseLeave={() => setHoveredPoint(null)}
                                                        >
                                                            <circle 
                                                                cx={getX(idx)} 
                                                                cy={getY(p.amount)} 
                                                                r="5" 
                                                                className="fill-background stroke-primary" 
                                                                strokeWidth="3" 
                                                            />
                                                            <circle 
                                                                cx={getX(idx)} 
                                                                cy={getY(p.amount)} 
                                                                r="12" 
                                                                className="fill-transparent hover:fill-primary/10 transition-colors"
                                                            />
                                                        </g>
                                                    ))}
                                                </>
                                            );
                                        })()}
                                    </svg>
                                )}
                            </div>

                            {/* X-Axis labels */}
                            <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2 mt-2">
                                {cumulativePoints.length > 0 ? (
                                    <>
                                        <span>{cumulativePoints[0].label}</span>
                                        {cumulativePoints.length > 2 && (
                                            <span>{cumulativePoints[Math.floor(cumulativePoints.length / 2)].label}</span>
                                        )}
                                        <span>{cumulativePoints[cumulativePoints.length - 1].label}</span>
                                    </>
                                ) : (
                                    <span>No data points</span>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </main>
        </div>
    );
}

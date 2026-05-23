'use client';

import { useEffect, useState, useCallback } from 'react';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { StudentProfile, Payment, FeeStructure } from '@/types';
import { useRouter } from 'next/navigation';
import { createReceipt } from '@/lib/receiptUtils';
import { CLASSES } from '@/lib/schoolConfig';
import {
    IndianRupee,
    Clock,
    Users,
    Search,
    Plus,
    Download,
    X,
    FileText,
    ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminDashboard() {
    const { user, role, loading: authLoading } = useAuth();
    const router = useRouter();

    const [stats, setStats] = useState({ totalStudents: 0, totalRevenue: 0, pendingPayments: 0 });
    const [loading, setLoading] = useState(true);
    const [allStudents, setAllStudents] = useState<StudentProfile[]>([]);
    const [allPayments, setAllPayments] = useState<Payment[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [analyticsClassFilter, setAnalyticsClassFilter] = useState('All');
    const [analyticsTimeframe, setAnalyticsTimeframe] = useState<'7days' | '30days'>('7days');
    const [hoveredPoint, setHoveredPoint] = useState<{ index: number; label: string; amount: number; count: number } | null>(null);
    const [filterClass, setFilterClass] = useState('All');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentNote, setPaymentNote] = useState('');

    useEffect(() => {
        if (!authLoading) {
            if (!user) router.push('/login');
            else if (role !== 'admin') router.push('/student/dashboard');
        }
    }, [user, role, authLoading, router]);

    const fetchAdminData = useCallback(async () => {
        if (!user || role !== 'admin') return;
        try {
            setLoading(true);
            const studentsSnap = await getDocs(collection(db, 'students'));
            const studentsList = studentsSnap.docs.map(d => d.data() as StudentProfile);
            setAllStudents(studentsList);

            const feesSnap = await getDocs(collection(db, 'fees'));
            const feeMap: Record<string, number> = {};
            feesSnap.docs.forEach(doc => { const f = doc.data() as FeeStructure; feeMap[f.className] = f.totalFee; });

            const paymentsSnap = await getDocs(collection(db, 'payments'));
            const paymentsList = paymentsSnap.docs.map(d => d.data() as Payment);
            setAllPayments(paymentsList);
            const revenue = paymentsList.filter(p => p.paymentStatus === 'success' || (p as Payment & { status?: string }).status === 'paid').reduce((s, p) => s + p.amount, 0);

            let totalExpected = 0;
            studentsList.forEach(s => { totalExpected += s.totalPayable !== undefined ? s.totalPayable : (feeMap[s.class] || 0); });

            setStats({ totalStudents: studentsList.length, totalRevenue: revenue, pendingPayments: Math.max(0, totalExpected - revenue) });
        } catch (error) { console.error('Admin Load Error:', error); }
        finally { setLoading(false); }
    }, [user, role]);

    useEffect(() => { fetchAdminData(); }, [fetchAdminData]);

    const filteredStudents = allStudents.filter(s => {
        const nameStr = (s.name || '').toLowerCase();
        const idStr = (s.studentId || s.userId || '').toLowerCase();
        const emailStr = (s.email || '').toLowerCase();
        const parentEmailStr = (s.parentEmail || '').toLowerCase();
        const queryStr = searchQuery.toLowerCase();

        const matchesSearch = nameStr.includes(queryStr) || 
                              idStr.includes(queryStr) || 
                              emailStr.includes(queryStr) ||
                              parentEmailStr.includes(queryStr);

        const matchesClass = filterClass === 'All' || s.class === filterClass;
        return matchesSearch && matchesClass;
    }).slice(0, 50);

    const handleExport = () => {
        const headers = ['Student ID', 'Name', 'Class', 'Parent Email'];
        const rows = filteredStudents.map(s => [s.studentId, s.name, s.class, s.parentEmail]);
        const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].map(e => e.join(',')).join('\n');
        const link = document.createElement('a');
        link.setAttribute('href', encodeURI(csvContent));
        link.setAttribute('download', 'student_records.csv');
        document.body.appendChild(link); link.click(); document.body.removeChild(link);
    };

    const handleAddPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStudentId || !paymentAmount) return;
        try {
            setIsSubmitting(true);
            const timestamp = Date.now();
            const transactionId = `MANUAL-${timestamp}`;
            const student = allStudents.find(s => s.studentId === selectedStudentId);
            const payRef = await addDoc(collection(db, 'payments'), {
                studentId: selectedStudentId, userId: student?.userId || '',
                amount: Number(paymentAmount), status: 'paid', method: 'manual_admin',
                notes: paymentNote, stripeSessionId: transactionId, createdAt: timestamp,
            });
            await createReceipt({ amount: Number(paymentAmount), paymentId: payRef.id, method: 'manual_admin', status: 'paid', transactionId }, selectedStudentId, user?.uid || 'Admin');
            setShowPaymentModal(false); setSelectedStudentId(''); setPaymentAmount(''); setPaymentNote('');
            fetchAdminData();
            alert('Payment recorded and receipt generated!');
        } catch { alert('Failed to add payment.'); }
        finally { setIsSubmitting(false); }
    };

    if (authLoading || loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary border-r-transparent border-l-transparent border-b-transparent"></div>
            </div>
        );
    }

    const statCards = [
        {
            label: 'Total Revenue',
            value: `₹${stats.totalRevenue.toLocaleString()}`,
            icon: IndianRupee,
            badge: '+12.5%',
            color: 'text-primary',
            bg: 'bg-primary/5',
            badgeBg: 'bg-primary/10 text-primary',
        },
        {
            label: 'Pending Dues',
            value: `₹${stats.pendingPayments.toLocaleString()}`,
            icon: Clock,
            badge: 'Action Needed',
            color: 'text-amber-500',
            bg: 'bg-amber-500/10',
            badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
        },
        {
            label: 'Total Students',
            value: stats.totalStudents,
            icon: Users,
            badge: 'Live',
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10',
            badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        },
    ];

    // ── ANALYTICS COMPUTATIONS ──
    const getAnalyticsData = () => {
        // Filter students by selected class
        const targetStudents = analyticsClassFilter === 'All' 
            ? allStudents 
            : allStudents.filter(s => s.class === analyticsClassFilter);
        
        const targetStudentIds = new Set(targetStudents.map(s => s.studentId || s.userId));

        // Filter payments belonging to target students
        const filteredPayments = allPayments.filter(p => targetStudentIds.has(p.studentId));
        const successfulPayments = filteredPayments.filter(p => p.paymentStatus === 'success' || (p as any).status === 'paid');
        
        // 1. Success Rate
        const totalAttempts = filteredPayments.length;
        const successRate = totalAttempts > 0 ? (successfulPayments.length / totalAttempts) * 100 : 100;
        
        // 2. Average Payment Value (APV)
        const totalRevenue = successfulPayments.reduce((s, p) => s + p.amount, 0);
        const avgPayment = successfulPayments.length > 0 ? totalRevenue / successfulPayments.length : 0;
        
        // 3. Online vs Manual Split
        const onlinePayments = successfulPayments.filter(p => (p as any).method?.startsWith('online') || (p as any).method === 'stripe' || (p.stripeSessionId && !p.stripeSessionId.startsWith('MANUAL') && !p.stripeSessionId.startsWith('sess_mock')));
        const manualPayments = successfulPayments.filter(p => (p as any).method?.startsWith('manual') || (p as any).method === 'manual_admin' || (p.stripeSessionId && (p.stripeSessionId.startsWith('MANUAL') || p.stripeSessionId.startsWith('sess_mock'))));
        const totalPaidCount = successfulPayments.length;
        const onlinePercent = totalPaidCount > 0 ? (onlinePayments.length / totalPaidCount) * 100 : 0;
        const manualPercent = totalPaidCount > 0 ? (manualPayments.length / totalPaidCount) * 100 : 0;

        // 4. Class-wise fulfillment
        const classFulfillment = CLASSES.map(className => {
            const studentsInClass = allStudents.filter(s => s.class === className);
            let expectedFee = 0;
            studentsInClass.forEach(s => {
                expectedFee += s.totalPayable !== undefined ? s.totalPayable : 19500;
            });
            const studentIds = new Set(studentsInClass.map(s => s.studentId || s.userId));
            const collected = successfulPayments
                .filter(p => studentIds.has(p.studentId))
                .reduce((sum, p) => sum + p.amount, 0);
            
            return {
                className,
                studentCount: studentsInClass.length,
                expected: expectedFee,
                collected,
                percent: expectedFee > 0 ? Math.min(100, (collected / expectedFee) * 100) : 0
            };
        }).filter(item => item.studentCount > 0);

        // 5. Daily/Weekly Revenue Trend
        const periodDays = analyticsTimeframe === '7days' ? 7 : 30;
        const lastDays = Array.from({ length: periodDays }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (periodDays - 1 - i));
            return date;
        });

        const dailyRevenue = lastDays.map(date => {
            const dayStr = analyticsTimeframe === '7days'
                ? date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })
                : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            
            const dayPayments = successfulPayments.filter(p => {
                const payDate = new Date(p.createdAt);
                return payDate.getDate() === date.getDate() &&
                       payDate.getMonth() === date.getMonth() &&
                       payDate.getFullYear() === date.getFullYear();
            });

            const amount = dayPayments.reduce((sum, p) => sum + p.amount, 0);
            return { label: dayStr, amount, count: dayPayments.length };
        });

        return {
            successRate,
            avgPayment,
            onlinePercent,
            manualPercent,
            classFulfillment,
            dailyRevenue,
            totalRevenue
        };
    };

    const analytics = getAnalyticsData();

    return (
        <Sidebar>
            <div className="font-sans text-foreground max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 selection:bg-primary/10">
                {/* Page header */}
                <motion.div 
                    initial={{ y: -20, opacity: 0 }} 
                    animate={{ y: 0, opacity: 1 }} 
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12"
                >
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
                            Dashboard Overview
                        </h1>
                        <p className="text-muted-foreground font-medium">Welcome back, Administrator</p>
                    </div>

                    {/* Search */}
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                            type="text" value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full md:w-72 pl-10 pr-4 py-2 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-sm"
                            placeholder="Search students…"
                        />
                    </div>
                </motion.div>

                {/* Info banner */}
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }} 
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="mb-8"
                >
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                        To test actual stripe payments, please sign in as a Student
                    </span>
                </motion.div>

                {/* Aesthetic Bento Grid Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {statCards.map((card, idx) => (
                        <motion.div 
                            key={card.label} 
                            initial={{ y: 20, opacity: 0 }} 
                            animate={{ y: 0, opacity: 1 }} 
                            transition={{ duration: 0.5, delay: 0.1 * (idx + 2), ease: "easeOut" }}
                            className="group relative bg-card rounded-2xl p-6 border border-border overflow-hidden hover:border-primary/30 transition-all duration-300 hover:shadow-sm"
                        >
                            {/* Subtle background glow effect */}
                            <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full blur-3xl opacity-20 transition-opacity group-hover:opacity-40 ${card.bg}`} />
                            
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-8">
                                    <div className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center`}>
                                        <card.icon className={`w-5 h-5 ${card.color}`} />
                                    </div>
                                    <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${card.badgeBg}`}>
                                        {card.badge}
                                    </span>
                                </div>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5">{card.label}</p>
                                <p className="text-3xl font-bold tracking-tight">{card.value}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Students table */}
                <motion.div 
                    initial={{ y: 20, opacity: 0 }} 
                    animate={{ y: 0, opacity: 1 }} 
                    transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
                    className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden"
                >
                    {/* Table header toolbar */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 border-b border-border/50">
                        <div>
                            <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
                                <FileText className="w-5 h-5 text-muted-foreground" />
                                Student Fee Records
                            </h2>
                            <p className="text-xs text-muted-foreground mt-1 font-medium">Manage and view transaction details</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <select
                                value={filterClass}
                                onChange={e => setFilterClass(e.target.value)}
                                className="bg-muted border-none text-foreground text-xs rounded-lg px-3 py-2 font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
                            >
                                {['All', ...CLASSES].map(cls => (
                                    <option key={cls} value={cls}>{cls === 'All' ? 'All Classes' : cls}</option>
                                ))}
                            </select>
                            <button onClick={handleExport} className="flex items-center gap-1.5 px-3 py-2 bg-transparent border border-border text-foreground text-xs font-semibold rounded-lg hover:bg-muted transition-colors shadow-sm">
                                <Download className="w-3.5 h-3.5" /> Export
                            </button>
                            <button onClick={() => setShowPaymentModal(true)} className="flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg shadow-sm hover:bg-primary/90 transition-colors">
                                <Plus className="w-3.5 h-3.5" /> Add Payment
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-border/50">
                                    <th className="py-4 px-6 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Student Name</th>
                                    <th className="py-4 px-6 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Class / Grade</th>
                                    <th className="py-4 px-6 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Fee Type</th>
                                    <th className="py-4 px-6 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Parent Email</th>
                                    <th className="py-4 px-6 text-[11px] font-bold text-muted-foreground uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {filteredStudents.length > 0 ? filteredStudents.map(student => (
                                    <tr key={student.studentId || student.userId} className="hover:bg-muted/30 transition-colors group">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center shrink-0">
                                                    {student.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-sm">{student.name}</div>
                                                    <div className="text-[10px] text-muted-foreground font-mono mt-0.5 tracking-wider">#{student.studentId}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-muted text-foreground uppercase tracking-widest">
                                                Grade {student.class}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-xs text-muted-foreground font-medium">Tuition Fee</td>
                                        <td className="py-4 px-6 text-xs text-muted-foreground font-medium">{student.parentEmail}</td>
                                        <td className="py-4 px-6 text-right">
                                            <button
                                                onClick={() => router.push('/admin/students')}
                                                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                            >
                                                View <ArrowRight className="w-3.5 h-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="py-16 text-center text-muted-foreground text-sm">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <Search className="w-8 h-8 opacity-20" />
                                                <p>No records found matching your criteria.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                {/* ── PAYMENT ANALYTICS SECTION ── */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="mt-12 bg-card border border-border rounded-2xl p-8 shadow-sm"
                >
                    <div className="flex flex-col gap-4 mb-8 border-b border-border/50 pb-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                                    <IndianRupee className="w-5 h-5 text-primary animate-pulse" />
                                    Interactive Payment Analytics
                                </h2>
                                <p className="text-xs text-muted-foreground mt-1 font-medium font-sans">
                                    Filter and explore real-time fee payments, success ratios, and class progress.
                                </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                {/* Timeframe toggle */}
                                <div className="bg-muted p-1 rounded-xl flex items-center gap-1 border border-border/60">
                                    <button 
                                        onClick={() => {
                                            setAnalyticsTimeframe('7days');
                                            setHoveredPoint(null);
                                        }} 
                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${analyticsTimeframe === '7days' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                                    >
                                        7 Days
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setAnalyticsTimeframe('30days');
                                            setHoveredPoint(null);
                                        }} 
                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${analyticsTimeframe === '30days' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                                    >
                                        30 Days
                                    </button>
                                </div>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase bg-muted px-2.5 py-1.5 rounded-xl border border-border/60 flex items-center gap-1.5">
                                    <span className="live-dot" /> Live Analysis
                                </span>
                            </div>
                        </div>

                        {/* Class selector horizontal list */}
                        <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar -mx-2 px-2 scrollbar-none">
                            <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest shrink-0 mr-1">Class Filter:</span>
                            <button
                                onClick={() => {
                                    setAnalyticsClassFilter('All');
                                    setHoveredPoint(null);
                                }}
                                className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-all border shrink-0 ${analyticsClassFilter === 'All' ? 'bg-primary text-primary-foreground border-primary' : 'bg-transparent text-muted-foreground border-border hover:bg-muted'}`}
                            >
                                All Grades
                            </button>
                            {CLASSES.map(cls => (
                                <button
                                    key={cls}
                                    onClick={() => {
                                        setAnalyticsClassFilter(cls);
                                        setHoveredPoint(null);
                                    }}
                                    className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-all border shrink-0 ${analyticsClassFilter === cls ? 'bg-primary text-primary-foreground border-primary' : 'bg-transparent text-muted-foreground border-border hover:bg-muted'}`}
                                >
                                    Grade {cls}
                                </button>
                            ))}
                        </div>
                    </div>
 
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Column 1: SVG Revenue Area Chart */}
                        <div className="lg:col-span-2 bg-muted/20 border border-border/40 rounded-xl p-6 relative overflow-hidden">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-sm font-bold tracking-tight text-foreground">
                                    Revenue Trend ({analyticsTimeframe === '7days' ? 'Last 7 Days' : 'Last 30 Days'})
                                </h3>
                                {/* Dynamic HUD Panel */}
                                <div className="text-right h-5">
                                    {hoveredPoint ? (
                                        <motion.div 
                                            initial={{ opacity: 0, y: -5 }} 
                                            animate={{ opacity: 1, y: 0 }} 
                                            className="text-xs font-bold text-primary"
                                        >
                                            {hoveredPoint.label}: <span className="font-extrabold text-foreground">₹{hoveredPoint.amount.toLocaleString()}</span> ({hoveredPoint.count} tx)
                                        </motion.div>
                                    ) : (
                                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                            Period Total: <span className="text-foreground font-extrabold">₹{analytics.totalRevenue.toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* SVG Chart */}
                            <div className="relative w-full h-64 flex items-end">
                                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-50">
                                    <div className="border-b border-dashed border-border/80 w-full h-0" />
                                    <div className="border-b border-dashed border-border/80 w-full h-0" />
                                    <div className="border-b border-dashed border-border/80 w-full h-0" />
                                    <div className="border-b border-dashed border-border/80 w-full h-0" />
                                </div>
 
                                <svg className="w-full h-[90%] overflow-visible z-10" viewBox="0 0 500 200" preserveAspectRatio="none">
                                    <defs>
                                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="rgb(99, 102, 241)" stopOpacity="0.3"/>
                                            <stop offset="100%" stopColor="rgb(99, 102, 241)" stopOpacity="0.0"/>
                                        </linearGradient>
                                    </defs>
                                    
                                    {(() => {
                                        const maxAmount = Math.max(...analytics.dailyRevenue.map(d => d.amount), 1000);
                                        const points = analytics.dailyRevenue.map((d, i) => {
                                            const x = 20 + (i * (460 / (analytics.dailyRevenue.length - 1 || 1)));
                                            const y = 170 - (d.amount / maxAmount) * 140;
                                            return { x, y, label: d.label, amount: d.amount, count: d.count };
                                        });
 
                                        const dPath = points.reduce((acc, p, i) => 
                                            i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`, 
                                            ''
                                        );
 
                                        const dArea = points.length > 0 
                                            ? `${dPath} L ${points[points.length - 1].x} 190 L ${points[0].x} 190 Z`
                                            : '';
 
                                        return (
                                            <>
                                                {/* Gradient Area */}
                                                {dArea && (
                                                    <motion.path 
                                                        key={`area-${analyticsClassFilter}-${analyticsTimeframe}`}
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{ duration: 0.6 }}
                                                        d={dArea} 
                                                        fill="url(#chartGradient)" 
                                                    />
                                                )}
                                                
                                                {/* Line Path */}
                                                {dPath && (
                                                    <motion.path 
                                                        key={`line-${analyticsClassFilter}-${analyticsTimeframe}`}
                                                        initial={{ pathLength: 0 }}
                                                        animate={{ pathLength: 1 }}
                                                        transition={{ duration: 0.8, ease: "easeInOut" }}
                                                        d={dPath} 
                                                        fill="none" 
                                                        stroke="rgb(99, 102, 241)" 
                                                        strokeWidth="3.5"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                )}
 
                                                {/* Tooltip circles */}
                                                {points.map((p, i) => (
                                                    <g 
                                                        key={i} 
                                                        className="group/dot cursor-pointer"
                                                        onMouseEnter={() => setHoveredPoint({ index: i, label: p.label, amount: p.amount, count: p.count })}
                                                        onMouseLeave={() => setHoveredPoint(null)}
                                                    >
                                                        <motion.circle 
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: hoveredPoint?.index === i ? 1.4 : 1 }}
                                                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                                            cx={p.x} 
                                                            cy={p.y} 
                                                            r="5" 
                                                            fill="rgb(99, 102, 241)" 
                                                            stroke="white" 
                                                            strokeWidth="2" 
                                                        />
                                                        <circle 
                                                            cx={p.x} 
                                                            cy={p.y} 
                                                            r="16" 
                                                            fill="transparent" 
                                                        />
                                                    </g>
                                                ))}
                                            </>
                                        );
                                    })()}
                                </svg>
                            </div>
 
                            {/* X-Axis labels */}
                            <div className="flex justify-between px-2 mt-4 text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                                {analytics.dailyRevenue.map((d, i) => {
                                    const total = analytics.dailyRevenue.length;
                                    // If 30 days, only show labels every 5 days or first/last
                                    const shouldShow = total <= 7 || i === 0 || i === total - 1 || i % 5 === 0;
                                    return (
                                        <span 
                                            key={i} 
                                            style={{ 
                                                width: `${100 / total}%`, 
                                                textAlign: 'center',
                                                visibility: shouldShow ? 'visible' : 'hidden' 
                                            }}
                                        >
                                            {d.label}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
 
                        {/* Column 2: Payment Stats Rings & Breakdown */}
                        <div className="flex flex-col gap-6">
                            {/* Stat Card 1: Success Rate */}
                            <div className="bg-muted/20 border border-border/40 rounded-xl p-5 flex items-center justify-between hover:border-primary/30 transition-all duration-200">
                                <div>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Transaction Success</p>
                                    <motion.p 
                                        key={analytics.successRate}
                                        initial={{ scale: 0.9, opacity: 0.5 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="text-2xl font-bold tracking-tight"
                                    >
                                        {analytics.successRate.toFixed(1)}%
                                    </motion.p>
                                    <p className="text-[10px] text-emerald-500 font-semibold mt-1">Excellent gateway health</p>
                                </div>
                                <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="32" cy="32" r="26" stroke="currentColor" className="text-border" strokeWidth="4" fill="transparent" />
                                        <motion.circle 
                                            key={analytics.successRate}
                                            cx="32" cy="32" r="26" 
                                            stroke="rgb(99, 102, 241)" strokeWidth="4" fill="transparent" 
                                            strokeDasharray={2 * Math.PI * 26}
                                            initial={{ strokeDashoffset: 2 * Math.PI * 26 }}
                                            animate={{ strokeDashoffset: 2 * Math.PI * 26 * (1 - analytics.successRate / 100) }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                        />
                                    </svg>
                                    <span className="absolute text-[10px] font-extrabold text-foreground">{analytics.successRate.toFixed(0)}%</span>
                                </div>
                            </div>
 
                            {/* Stat Card 2: Average Transaction */}
                            <div className="bg-muted/20 border border-border/40 rounded-xl p-5 hover:border-primary/30 transition-all duration-200">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Avg. Payment Value</p>
                                <motion.p 
                                    key={analytics.avgPayment}
                                    initial={{ scale: 0.9, opacity: 0.5 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="text-2xl font-bold tracking-tight"
                                >
                                    ₹{analytics.avgPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                </motion.p>
                                <p className="text-[10px] text-muted-foreground font-medium mt-1">Per successful fee transaction</p>
                            </div>
 
                            {/* Stat Card 3: Online vs Manual split */}
                            <div className="bg-muted/20 border border-border/40 rounded-xl p-5 hover:border-primary/30 transition-all duration-200">
                                <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
                                    <span>Payment Method Split</span>
                                </div>
                                <div className="h-2.5 w-full bg-border rounded-full overflow-hidden flex">
                                    <motion.div 
                                        key={`online-${analytics.onlinePercent}`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${analytics.onlinePercent}%` }}
                                        transition={{ duration: 0.8 }}
                                        className="h-full bg-primary" 
                                        title={`Stripe Online: ${analytics.onlinePercent.toFixed(0)}%`}
                                    />
                                    <motion.div 
                                        key={`manual-${analytics.manualPercent}`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${analytics.manualPercent}%` }}
                                        transition={{ duration: 0.8, delay: 0.05 }}
                                        className="h-full bg-amber-500" 
                                        title={`Manual Admin: ${analytics.manualPercent.toFixed(0)}%`}
                                    />
                                </div>
                                <div className="flex justify-between mt-3 text-[10px] font-bold">
                                    <span className="text-primary flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-primary inline-block" />
                                        Stripe ({analytics.onlinePercent.toFixed(0)}%)
                                    </span>
                                    <span className="text-amber-500 flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                                        Manual ({analytics.manualPercent.toFixed(0)}%)
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
 
                    {/* Class-wise fee fulfillment */}
                    <div className="mt-8 border-t border-border/40 pt-8">
                        <h3 className="text-sm font-bold tracking-tight text-foreground mb-5">Class-wise Fee Collection Status</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {analytics.classFulfillment.map((item, idx) => (
                                <motion.div 
                                    key={`${item.className}-${analyticsClassFilter}`}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: 0.03 * idx }}
                                    className={`border rounded-xl p-4 flex flex-col justify-between transition-all duration-200 ${analyticsClassFilter === item.className ? 'bg-primary/5 border-primary shadow-sm' : 'bg-muted/10 border-border/40 hover:border-border-hover'}`}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <span className="text-xs font-bold text-foreground">Grade {item.className}</span>
                                            <span className="block text-[9px] text-muted-foreground font-semibold mt-0.5">{item.studentCount} student(s)</span>
                                        </div>
                                        <span className="text-xs font-extrabold text-primary">{item.percent.toFixed(0)}%</span>
                                    </div>
                                    
                                    <div className="h-1.5 w-full bg-border rounded-full overflow-hidden mb-3">
                                        <motion.div 
                                            key={`progress-${item.className}-${item.percent}`}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${item.percent}%` }}
                                            transition={{ duration: 0.8 }}
                                            className="h-full bg-primary" 
                                        />
                                    </div>
 
                                    <div className="flex justify-between text-[10px] font-bold text-muted-foreground">
                                        <span>Collected: ₹{item.collected.toLocaleString()}</span>
                                        <span>Target: ₹{item.expected.toLocaleString()}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* ── PAYMENT MODAL ── */}
                <AnimatePresence>
                    {showPaymentModal && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4" 
                            onClick={() => setShowPaymentModal(false)}
                        >
                            <motion.div 
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                className="bg-card rounded-2xl w-full max-w-md p-8 shadow-2xl border border-border" 
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h2 className="text-2xl font-bold tracking-tight">Record Payment</h2>
                                        <p className="text-xs text-muted-foreground mt-1 font-medium">Manually record a cash, cheque, or bank transfer.</p>
                                    </div>
                                    <button onClick={() => setShowPaymentModal(false)} className="text-muted-foreground hover:text-foreground transition-colors p-1.5 hover:bg-muted rounded-full">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                <form onSubmit={handleAddPayment} className="flex flex-col gap-5">
                                    <div>
                                        <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Select Student</label>
                                        <select required value={selectedStudentId} onChange={e => setSelectedStudentId(e.target.value)} className="w-full px-4 py-2.5 bg-muted border border-border text-foreground rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50">
                                            <option value="">— Choose Student —</option>
                                            {allStudents.map(s => <option key={s.studentId} value={s.studentId}>{s.name} (ID: {s.studentId})</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Amount (INR)</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-bold">₹</span>
                                            <input type="number" required min="1" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} className="w-full pl-8 pr-4 py-2.5 bg-muted border border-border text-foreground rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="5000" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Notes (Optional)</label>
                                        <textarea rows={3} value={paymentNote} onChange={e => setPaymentNote(e.target.value)} className="w-full px-4 py-2.5 bg-muted border border-border text-foreground rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y" placeholder="e.g. Cash payment received for Term 1" />
                                    </div>
                                    <div className="flex gap-3 mt-4">
                                        <button type="button" onClick={() => setShowPaymentModal(false)} className="flex-1 py-2.5 px-4 bg-transparent border border-border text-foreground rounded-lg text-sm font-semibold hover:bg-muted transition-colors">Cancel</button>
                                        <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-bold shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-50">
                                            {isSubmitting ? 'Recording…' : 'Save Payment'}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </Sidebar>
    );
}

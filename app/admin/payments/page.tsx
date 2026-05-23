'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import { Payment, StudentProfile } from '@/types';
import { useRouter } from 'next/navigation';
import { createReceipt } from '@/lib/receiptUtils';
import { RefreshCw, FileText, Trash2 } from 'lucide-react';
import { SCHOOL_CONFIG } from '@/lib/schoolConfig';
import { motion } from 'motion/react';

export default function PaymentsPage() {
    const { user, role, loading: authLoading } = useAuth();
    const router = useRouter();

    const [payments, setPayments] = useState<(Payment & { id: string })[]>([]);
    const [students, setStudents] = useState<Record<string, StudentProfile>>({});
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
            
            // Fetch students first
            const studentsSnap = await getDocs(collection(db, 'students'));
            const studentsMap: Record<string, StudentProfile> = {};
            studentsSnap.docs.forEach(docSnap => {
                const data = docSnap.data() as StudentProfile;
                const id = data.userId || docSnap.id;
                studentsMap[id] = data;
                if (data.studentId) {
                    studentsMap[data.studentId] = data;
                }
            });
            setStudents(studentsMap);

            // Fetch payments
            const q = query(collection(db, 'payments'));
            const querySnapshot = await getDocs(q);
            const list = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as (Payment & { id: string })[];

            list.sort((a, b) => b.createdAt - a.createdAt);

            setPayments(list);
        } catch (error) {
            console.error("Error fetching payments:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePayment = async (paymentId: string, stripeSessionId: string) => {
        if (!confirm('Are you sure you want to remove this payment record? This will also delete any associated receipt.')) {
            return;
        }

        try {
            setLoading(true);

            // 1. Find and delete associated receipts
            const receiptsRef = collection(db, 'receipts');
            const receiptsQuery = query(receiptsRef, where('transactionId', '==', stripeSessionId));
            const receiptsSnap = await getDocs(receiptsQuery);
            
            for (const receiptDoc of receiptsSnap.docs) {
                await deleteDoc(doc(db, 'receipts', receiptDoc.id));
            }

            // 2. Delete the payment document
            await deleteDoc(doc(db, 'payments', paymentId));

            alert('Payment record and associated receipt removed successfully.');
            await fetchPayments();
        } catch (error) {
            console.error('Error removing payment:', error);
            alert('Failed to remove payment record: ' + (error as Error).message);
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
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary border-r-transparent border-l-transparent border-b-transparent"></div>
            </div>
        );
    }

    return (
        <Sidebar>
            <motion.div 
                initial={{ y: -20, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }} 
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="sm:flex sm:items-center justify-between gap-6 mb-8"
            >
                <div className="sm:flex-auto">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-2">
                        Payment History
                    </h1>
                    <p className="text-muted-foreground font-medium">
                        All fee transactions processed by {SCHOOL_CONFIG.name}.
                    </p>
                </div>
                <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                    <button
                        type="button"
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-primary text-primary-foreground text-xs font-bold rounded-lg shadow-sm hover:bg-primary/90 transition-colors cursor-pointer"
                        onClick={fetchPayments}
                    >
                        <RefreshCw className="h-4 w-4" />
                        Refresh List
                    </button>
                </div>
            </motion.div>

            <motion.div 
                initial={{ y: 20, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }} 
                transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
                className="mt-8 flow-root"
            >
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-border/50 bg-muted/20">
                                        <th scope="col" className="py-4 pl-4 pr-3 text-left text-[11px] font-bold text-muted-foreground uppercase tracking-widest sm:pl-6">Student</th>
                                        <th scope="col" className="px-3 py-4 text-left text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Class</th>
                                        <th scope="col" className="px-3 py-4 text-left text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Payment Record</th>
                                        <th scope="col" className="px-3 py-4 text-left text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Amount</th>
                                        <th scope="col" className="px-3 py-4 text-left text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Status</th>
                                        <th scope="col" className="px-3 py-4 text-left text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Transaction ID</th>
                                        <th scope="col" className="relative py-4 pl-3 pr-4 sm:pr-6 text-right">
                                            <span className="sr-only">Actions</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50 bg-transparent">
                                    {payments.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="py-12 text-center text-sm text-muted-foreground">
                                                <div className="flex flex-col items-center justify-center py-10">
                                                    <p className="font-bold text-lg text-foreground">No payments found</p>
                                                    <p className="mt-1">Transactions will appear here once students process payments.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        payments.map((payment, index) => {
                                            const statusKey = (payment.paymentStatus || (payment as any).status || 'pending').toLowerCase();
                                            const studentInfo = students[payment.studentId] || students[payment.userId];
                                            const studentName = studentInfo?.name || 'Unknown Student';
                                            const studentClass = studentInfo?.class || 'N/A';
                                            const isStripe = !payment.stripeSessionId.startsWith('MANUAL');

                                            return (
                                                <tr key={payment.paymentId || payment.stripeSessionId || index} className="hover:bg-muted/30 transition-colors group">
                                                    <td className="whitespace-nowrap py-5 pl-4 pr-3 text-sm sm:pl-6">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center shrink-0">
                                                                {studentName.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <div className="font-semibold text-foreground text-sm">{studentName}</div>
                                                                <div className="text-[10px] text-muted-foreground font-mono mt-0.5 tracking-wider">#{payment.studentId}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-5 text-sm">
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded text-[10px] font-bold bg-muted text-foreground uppercase tracking-widest">
                                                            {studentClass !== 'N/A' ? `Grade ${studentClass}` : 'N/A'}
                                                        </span>
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-5 text-sm">
                                                        <div className="flex flex-col">
                                                            <div className="text-foreground font-medium text-xs">
                                                                {new Date(payment.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                            </div>
                                                            <div className="text-[10px] text-muted-foreground mt-0.5 font-semibold uppercase tracking-wider flex items-center gap-1">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                                                                {isStripe ? 'Online Card' : 'Manual Payment'}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-5 text-sm font-bold text-foreground">
                                                        ₹{payment.amount.toLocaleString()}
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-5 text-sm">
                                                        <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${
                                                            statusKey === 'success' || statusKey === 'paid' 
                                                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20' 
                                                            : statusKey === 'pending'
                                                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/20'
                                                            : 'bg-red-500/10 text-red-600 ring-1 ring-red-500/20'
                                                        }`}>
                                                            {statusKey}
                                                        </span>
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-5 text-xs text-muted-foreground font-mono">
                                                        {payment.stripeSessionId.substring(0, 18)}...
                                                    </td>
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
                                                                            const method = isStripe ? 'online_stripe' : 'manual_admin';
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
                                                            className="text-primary/70 hover:text-primary transition-colors p-2 hover:bg-muted rounded-lg inline-flex items-center gap-1.5 font-bold uppercase text-[10px] tracking-widest border border-border bg-card shadow-xs cursor-pointer"
                                                            title="View Receipt"
                                                        >
                                                            <FileText className="h-4 w-4" />
                                                            <span className="hidden sm:inline">Receipt</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeletePayment(payment.id, payment.stripeSessionId)}
                                                            className="text-red-500/70 hover:text-red-500 transition-colors p-2 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg inline-flex items-center gap-1.5 font-bold uppercase text-[10px] tracking-widest border border-red-500/20 bg-card shadow-xs cursor-pointer ml-2"
                                                            title="Remove Payment"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                            <span className="hidden sm:inline">Remove</span>
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
            </motion.div>
        </Sidebar>
    );
}

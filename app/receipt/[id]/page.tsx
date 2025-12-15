'use client';

import { useEffect, useState, use } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { Receipt } from '@/types';
import { useRouter } from 'next/navigation';

export default function ReceiptPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: receiptDocId } = use(params);
    const { user, role, loading: authLoading } = useAuth();
    const router = useRouter();

    const [receipt, setReceipt] = useState<Receipt | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            router.push('/login');
            return;
        }

        const fetchReceipt = async () => {
            try {
                setLoading(true);
                
                const docRef = doc(db, 'receipts', receiptDocId);
                const snap = await getDoc(docRef);

                if (!snap.exists()) {
                    setError('Receipt not found.');
                    setLoading(false);
                    return;
                }

                const data = snap.data() as Receipt;

                
                if (role === 'student') {
                    
                    
                    const q = query(collection(db, 'students'), where('userId', '==', user.uid));
                    const sSnap = await getDocs(q);

                    if (!sSnap.empty) {
                        const studentData = sSnap.docs[0].data();
                        if (studentData.studentId !== data.studentId) {
                            setError('Unauthorized to view this receipt.');
                            setLoading(false);
                            return;
                        }
                    } else {
                        
                        setError('Unauthorized.');
                        setLoading(false);
                        return;
                    }
                }

                setReceipt(data);
            } catch (err) {
                console.error(err);
                setError('Error fetching receipt.');
            } finally {
                setLoading(false);
            }
        };

        fetchReceipt();
    }, [user, role, authLoading, receiptDocId, router]);

    const handlePrint = () => {
        window.print();
    };

    if (loading || authLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-900 text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900 text-red-500">
                <div className="glass-card p-10 rounded-3xl text-center">
                    <h2 className="text-3xl font-bold mb-4">Error</h2>
                    <p className="text-slate-300">{error}</p>
                    <button onClick={() => router.back()} className="mt-6 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all">Go Back</button>
                </div>
            </div>
        );
    }

    if (!receipt) return null;

    return (
        <div className="min-h-screen bg-slate-900 p-4 md:p-8 print:bg-white print:p-0 selection:bg-emerald-500/30 font-sans">
            {}
            <div className="fixed inset-0 overflow-hidden pointer-events-none print:hidden z-0">
                <div className="absolute top-[10%] left-[10%] w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full"></div>
            </div>

            {}
            <div className="max-w-3xl mx-auto mb-8 flex justify-between items-center print:hidden relative z-10">
                <button
                    onClick={() => router.back()}
                    className="text-slate-400 hover:text-white transition-colors flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Back to Dashboard
                </button>
                <div className="space-x-4">
                    <button
                        onClick={handlePrint}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                        Print Receipt / Download PDF
                    </button>
                </div>
            </div>

            {}
            <div className="max-w-3xl mx-auto bg-white p-10 shadow-2xl rounded-none md:rounded-lg print:shadow-none print:w-full print:max-w-none relative z-10 text-slate-900">

                {}
                <div className="flex justify-between items-start border-b-2 border-slate-100 pb-8 mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="bg-emerald-600 text-white p-2 rounded-lg print:text-black print:bg-transparent print:p-0 print:text-emerald-800">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <h1 className="text-3xl font-bold text-slate-900">EduBill Institute</h1>
                        </div>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            123 Education Lane<br />
                            Knowledge City, KC 40001<br />
                            contact@edubill.com | +91 98765 43210
                        </p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-4xl font-extrabold text-slate-200 tracking-widest uppercase print:text-slate-300">Receipt</h2>
                        <p className="font-mono text-emerald-600 font-bold mt-2 text-lg">#{receipt.receiptNumber}</p>
                        <p className="text-slate-500 text-sm mt-1">Date: {new Date(receipt.paidAt).toLocaleDateString()}</p>
                    </div>
                </div>

                {}
                <div className="flex justify-between mb-8">
                    <div className="w-1/2">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Received From</h3>
                        <p className="text-xl font-bold text-slate-800">{receipt.studentName}</p>
                        <p className="text-slate-600 mt-1">Student ID: <span className="font-mono bg-slate-100 px-1 py-0.5 rounded">{receipt.studentId}</span></p>
                        <p className="text-slate-600">Class: {receipt.class}</p>
                    </div>
                    <div className="w-1/2 text-right">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Payment Details</h3>
                        <p className="text-slate-600">Method: <span className="capitalize font-medium">{receipt.paymentMode === 'manual_admin' ? 'Cash/Other' : 'Online'}</span></p>
                        <p className="text-slate-600 mt-1">Transaction ID:</p>
                        <p className="text-xs font-mono text-slate-500 break-all">{receipt.transactionId}</p>
                    </div>
                </div>

                {}
                <div className="mb-8">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Description</th>
                                <th className="py-3 px-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-slate-100">
                                <td className="py-5 px-4 text-slate-700 font-medium">
                                    {receipt.feeType}
                                </td>
                                <td className="py-5 px-4 text-right text-slate-900 font-bold">
                                    ₹{receipt.amountPaid.toLocaleString()}
                                </td>
                            </tr>
                        </tbody>
                        <tfoot>
                            <tr>
                                <td className="pt-4 px-4 text-right font-medium text-slate-500">Total Paid</td>
                                <td className="pt-4 px-4 text-right text-2xl font-bold text-emerald-600">₹{receipt.amountPaid.toLocaleString()}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {}
                <div className="flex justify-between items-end mt-20">
                    <div className="text-xs text-slate-400 max-w-sm">
                        <p>This is a computer-generated receipt and requires no signature.</p>
                        <p className="mt-1">Generated by: {receipt.generatedBy}</p>
                    </div>
                    <div className="text-center">
                        <div className="h-16 w-32 border-b border-slate-300 mb-2">
                            {}
                            <div className="w-full h-full flex items-end justify-center font-serif italic text-slate-400 opacity-50 pb-1">
                                Authorized Signature
                            </div>
                        </div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">EduBill Accounts</p>
                    </div>
                </div>

                {}
                <div className="hidden print:block fixed bottom-0 left-0 w-full text-center text-xs text-slate-400 p-4">
                    Printed on {new Date().toLocaleString()} | School Billing System
                </div>
            </div>

            <style jsx global>{`
                @media print {
                    @page { margin: 0; size: auto; }
                    body { background: white !important; -webkit-print-color-adjust: exact; }
                }
            `}</style>
        </div>
    );
}

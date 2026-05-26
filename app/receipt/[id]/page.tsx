'use client';

import { useEffect, useState, use } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { Receipt } from '@/types';
import { useRouter } from 'next/navigation';
import { downloadPDF } from '@/lib/pdf';
import { ArrowDownTrayIcon, PrinterIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { SCHOOL_CONFIG } from '@/lib/schoolConfig';

export default function ReceiptPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: receiptDocId } = use(params);
    const { user, role, loading: authLoading } = useAuth();
    const router = useRouter();

    const [receipt, setReceipt] = useState<Receipt | null>(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
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

    const handleDownload = async () => {
        if (!receipt) return;
        setDownloading(true);
        try {
            await downloadPDF('receipt-content', `Receipt-${receipt.receiptNumber}`);
        } catch (err) {
            console.error(err);
            alert('Failed to generate PDF. Please try printing to PDF instead.');
        } finally {
            setDownloading(false);
        }
    };

    if (loading || authLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-black text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-white">
                <div className="glass-card p-10 rounded-3xl text-center border border-yellow-500/20">
                    <h2 className="text-3xl font-black mb-4 uppercase tracking-tight">Error</h2>
                    <p className="text-white/40">{error}</p>
                    <button onClick={() => router.back()} className="mt-6 px-6 py-2 bg-white text-black font-black rounded-full hover:bg-gray-100 transition-all shadow-lg border border-yellow-500/30">Go Back</button>
                </div>
            </div>
        );
    }

    if (!receipt) return null;

    return (
        <div className="min-h-screen bg-black p-4 md:p-8 print:bg-white print:p-0 selection:bg-yellow-500/30 font-sans">
            <div className="fixed inset-0 overflow-hidden pointer-events-none print:hidden z-0">
                <div className="absolute top-[10%] left-[10%] w-[500px] h-[500px] bg-yellow-500/5 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] bg-white/5 blur-[120px] rounded-full"></div>
            </div>

            <div className="max-w-3xl mx-auto mb-8 flex flex-col sm:flex-row justify-between items-center print:hidden relative z-10 gap-4">
                <button
                    onClick={() => router.push(role === 'admin' ? '/admin/dashboard' : '/student/dashboard')}
                    className="text-white/40 hover:text-white transition-colors flex items-center gap-2 font-bold group"
                >
                    <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Dashboard
                </button>
                <div className="flex gap-3">
                    <button
                        onClick={handlePrint}
                        className="bg-white/5 hover:bg-white text-white hover:text-black px-5 py-2.5 rounded-xl font-bold border border-white/10 transition-all flex items-center gap-2 uppercase text-xs tracking-wider"
                    >
                        <PrinterIcon className="w-4 h-4" />
                        Print
                    </button>
                    <button
                        onClick={handleDownload}
                        disabled={downloading}
                        className="bg-white hover:bg-gray-100 text-black px-6 py-2.5 rounded-xl font-black shadow-lg border border-yellow-500/30 transition-all flex items-center gap-2 uppercase text-xs tracking-wider disabled:opacity-50"
                    >
                        {downloading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-black/20 border-t-black"></div>
                        ) : (
                            <ArrowDownTrayIcon className="w-4 h-4" />
                        )}
                        {downloading ? 'Generating...' : 'Download PDF'}
                    </button>
                </div>
            </div>

            <div id="receipt-content" className="max-w-3xl mx-auto bg-white p-10 shadow-2xl rounded-none md:rounded-3xl border border-yellow-500/30 print:border-none print:shadow-none print:w-full print:max-w-none relative z-10 text-black">
                <div className="flex justify-between items-start border-b-2 border-black/5 pb-8 mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="bg-black text-white p-2 rounded-lg border border-yellow-500/30 print:border-none">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <h1 className="text-3xl font-black text-black uppercase tracking-tight">{SCHOOL_CONFIG.name}</h1>
                        </div>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            {SCHOOL_CONFIG.address}<br />
                            {SCHOOL_CONFIG.email} | {SCHOOL_CONFIG.phone}
                        </p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-4xl font-black text-black/5 tracking-[0.2em] uppercase print:text-black/10">Receipt</h2>
                        <p className="font-mono text-black font-black mt-2 text-lg">#{receipt.receiptNumber}</p>
                        <p className="text-black/40 text-sm mt-1">Date: {new Date(receipt.paidAt).toLocaleDateString()}</p>
                    </div>
                </div>

                <div className="flex justify-between mb-8">
                    <div className="w-1/2">
                        <h3 className="text-xs font-black text-black/40 uppercase tracking-widest mb-2">Received From</h3>
                        <p className="text-xl font-black text-black uppercase">{receipt.studentName}</p>
                        <p className="text-black/60 mt-1">Student ID: <span className="font-mono bg-black/5 px-1 py-0.5 rounded italic">#{receipt.studentId}</span></p>
                        <p className="text-black/60">Class: {receipt.class}</p>
                    </div>
                    <div className="w-1/2 text-right">
                        <h3 className="text-xs font-black text-black/40 uppercase tracking-widest mb-2">Payment Details</h3>
                        <p className="text-black/60">Method: <span className="capitalize font-bold">{receipt.paymentMode === 'manual_admin' ? 'Manual' : 'Online'}</span></p>
                        <p className="text-black/60 mt-1">Status: <span className="uppercase font-black text-xs bg-black text-white px-2 py-1 rounded">{receipt.paymentStatus}</span></p>
                        <p className="text-black/60 mt-1">Transaction ID:</p>
                        <p className="text-[10px] font-mono text-black/40 break-all">{receipt.transactionId}</p>
                    </div>
                </div>

                <div className="mb-8">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-black/5 border-b border-black/10">
                                <th className="py-3 px-4 text-left text-xs font-black text-black/40 uppercase tracking-widest">Description</th>
                                <th className="py-3 px-4 text-right text-xs font-black text-black/40 uppercase tracking-widest">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-black/5">
                                <td className="py-5 px-4 text-black font-bold uppercase tracking-tight">
                                    {receipt.feeType}
                                </td>
                                <td className="py-5 px-4 text-right text-black font-black">
                                    ₹{receipt.amountPaid.toLocaleString()}
                                </td>
                            </tr>
                        </tbody>
                        <tfoot>
                            <tr>
                                <td className="pt-4 px-4 text-right font-bold text-black/40 uppercase text-xs">Total Paid</td>
                                <td className="pt-4 px-4 text-right text-2xl font-black text-black underline decoration-yellow-500 decoration-4 underline-offset-8">₹{receipt.amountPaid.toLocaleString()}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <div className="flex justify-between items-end mt-20">
                    <div className="text-[10px] text-black/30 max-w-sm italic">
                        <p>This is a computer-generated receipt and requires no physical signature.</p>
                        <p className="mt-1">Generated by: {receipt.generatedBy}</p>
                        <p className="mt-1">Receipt ID: {receipt.receiptId}</p>
                    </div>
                    <div className="text-center">
                        <div className="h-16 w-32 border-b-2 border-black/10 mb-2 relative">
                            <div className="w-full h-full flex items-end justify-center font-serif italic text-black/20 text-[8px] uppercase tracking-widest pb-1">
                                Authorized Signatory
                            </div>
                        </div>
                        <p className="text-[8px] font-black text-black/40 uppercase tracking-[0.2em]">Accounts Dept</p>
                    </div>
                </div>

                <div className="hidden print:block fixed bottom-0 left-0 w-full text-center text-xs text-slate-400 p-4">
                    Printed on {new Date().toLocaleString()} | School Billing System
                </div>
            </div>

            <style jsx global>{`
                @media print {
                    @page { margin: 0; size: auto; }
                    body { background: white !important; -webkit-print-color-adjust: exact; }
                    .print\:hidden { display: none !important; }
                }
            `}</style>
        </div>
    );
}

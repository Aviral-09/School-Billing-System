'use client';

import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { StudentProfile, FeeStructure } from '@/types';
import { useRouter } from 'next/navigation';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function PaymentPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [student, setStudent] = useState<StudentProfile | null>(null);
    const [feeDetails, setFeeDetails] = useState<FeeStructure | null>(null);
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);


    const [paymentMethod, setPaymentMethod] = useState<'card' | 'transfer' | 'wallet'>('card');

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login?redirect=/payment');
            return;
        }
        if (!user) return;
        const fetchData = async () => {
            const q = query(collection(db, 'students'), where('userId', '==', user.uid));
            const snap = await getDocs(q);
            if (!snap.empty) {
                const s = snap.docs[0].data() as StudentProfile;
                setStudent(s);
                if (s.feeStructure) {
                    setFeeDetails(s.feeStructure);
                } else {
                    const fSnap = await getDocs(query(collection(db, 'fees'), where('className', '==', s.class)));
                    if (!fSnap.empty) setFeeDetails(fSnap.docs[0].data() as FeeStructure);
                }
            }
        }
        fetchData();
    }, [user, authLoading, router]);

    const handleCheckout = async () => {
        if (!student || !feeDetails || !user) return;
        setLoading(true);
        console.log("Starting checkout for student:", student.studentId, "amount:", feeDetails.totalFee);

        try {

            const response = await fetch('/api/checkout_sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: feeDetails.totalFee,
                    studentId: student.studentId,
                    userId: user.uid,
                    feeType: 'Annual Fee'
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("Checkout Session API Error:", data.error);
                alert(`Payment initialization failed: ${data.error}`);
                setLoading(false);
                return;
            }

            console.log("Client Secret received (first 10 chars):", data.clientSecret?.substring(0, 10));
            setClientSecret(data.clientSecret);
        } catch (error) {
            console.error("Network or parsing error:", error);
            alert("Failed to initialize payment. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) return (
        <div className="flex h-screen items-center justify-center bg-[#f7f9fc] text-[#0f172a]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0ea5e9]"></div>
        </div>
    );


    if (clientSecret) {
        return (
            <div className="min-h-screen text-[#0f172a] bg-[#f7f9fc]">
                <Navbar />
                <div className="max-w-7xl mx-auto py-12 px-4">
                    <button onClick={() => setClientSecret(null)} className="mb-6 text-[#0ea5e9] hover:text-[#0284c7] flex items-center gap-2 transition-colors font-semibold">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Back to Details
                    </button>
                    <div className="bg-white rounded-3xl p-6 border border-[#e2e8f0] shadow-sm">
                        <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
                            <EmbeddedCheckout />
                        </EmbeddedCheckoutProvider>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f7f9fc] text-[#0f172a] font-sans selection:bg-[#0ea5e9]/30">
            <Navbar />

            <main className="max-w-7xl mx-auto p-4 md:p-8 lg:p-12">
                { }
                <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between">
                    <div>
                        <nav className="flex text-sm text-[#64748b] mb-2 items-center">
                            <span className="hover:text-[#0f172a] transition-colors cursor-pointer" onClick={() => router.push('/student/dashboard')}>Dashboard</span>
                            <span className="mx-2 text-[#94a3b8]">›</span>
                            <span className="hover:text-[#0f172a] transition-colors cursor-default">Billing</span>
                            <span className="mx-2 text-[#94a3b8]">›</span>
                            <span className="text-[#0ea5e9] font-bold">Checkout</span>
                        </nav>
                        <h1 className="text-4xl font-bold tracking-tight text-[#0f172a] mb-2">Make a Payment</h1>
                        <p className="text-[#64748b]">Securely pay tuition and school fees online.</p>
                    </div>

                    {student && (
                        <div className="mt-6 md:mt-0 flex items-center bg-white px-6 py-3 rounded-full border border-[#e2e8f0] shadow-sm">
                            <div className="h-10 w-10 flex items-center justify-center rounded-full bg-[#0ea5e9] text-white font-bold mr-4 shadow-sm">
                                {student.name.charAt(0)}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-[#0f172a]">{student.name}</p>
                                <p className="text-xs text-[#64748b] font-mono">ID: {student.studentId}</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    { }
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-3xl p-6 relative overflow-hidden group border border-[#e2e8f0] shadow-sm">
                            <div className="flex items-center mb-6">
                                <span className="bg-[#e0f2fe] p-3 rounded-xl text-[#0284c7] mr-4 shadow-sm">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                </span>
                                <h2 className="text-xl font-bold text-[#0f172a] tracking-tight">Fee Breakdown</h2>
                            </div>

                            {loading || !feeDetails ? (
                                <div className="animate-pulse space-y-4">
                                    <div className="h-4 bg-slate-100 rounded-full w-3/4"></div>
                                    <div className="h-4 bg-slate-100 rounded-full w-1/2"></div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {feeDetails && [
                                        { key: 'admissionFee', name: 'Admission Fee', desc: 'New Admission Charges' },
                                        { key: 'tuitionFee', name: 'Tuition Fee', desc: 'Curriculum & Education' },
                                        { key: 'examFee', name: 'Exam Fee', desc: 'Assessment & Evaluation' },
                                        { key: 'libraryFee', name: 'Library Fee', desc: 'Books & Reference Materials' },
                                        { key: 'computerFee', name: 'Computer Fee', desc: 'IT Labs & Infrastructure' },
                                        { key: 'transportFee', name: 'Transport Fee', desc: 'School Bus Facility' },
                                        { key: 'sportsFee', name: 'Sports Fee', desc: 'Physical Education & Athletics' },
                                        { key: 'miscFee', name: 'Misc Fee', desc: 'Other School Utilities' }
                                    ].map(({ key, name, desc }) => {
                                        const isEnabled = feeDetails.enabledComponents
                                            ? feeDetails.enabledComponents[key as keyof typeof feeDetails.enabledComponents]
                                            : (feeDetails[key as keyof FeeStructure] !== undefined);

                                        if (!isEnabled) return null;
                                        const val = Number(feeDetails[key as keyof FeeStructure] || 0);
                                        if (val <= 0) return null;

                                        return (
                                            <div key={key} className="flex justify-between items-start border-b border-[#f1f5f9] pb-4">
                                                <div>
                                                    <p className="font-semibold text-[#0f172a]">{name}</p>
                                                    <p className="text-xs text-[#64748b]">{desc}</p>
                                                </div>
                                                <p className="font-bold text-[#0f172a]">₹{val.toLocaleString()}</p>
                                            </div>
                                        );
                                    })}

                                    <div className="pt-4">
                                        <div className="flex justify-between items-center mb-1">
                                            <p className="text-[#64748b] font-bold uppercase text-[10px] tracking-widest">Total Amount Due</p>
                                            <p className="text-[10px] text-[#0ea5e9] uppercase tracking-widest font-bold">INR</p>
                                        </div>
                                        <p className="text-4xl font-bold text-[#0f172a] text-right">₹{feeDetails.totalFee.toLocaleString()}</p>
                                    </div>
                                </div>
                            )}
                            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#0ea5e9]/5 blur-[60px] rounded-full pointer-events-none group-hover:bg-[#0ea5e9]/10 transition-colors duration-500"></div>
                        </div>

                        { }
                        <div className="bg-white rounded-3xl p-6 flex items-start group hover:bg-[#f8fafc] transition-colors border border-[#e2e8f0] shadow-sm">
                            <div className="bg-[#e0f2fe] p-3 rounded-xl mr-4 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-8 h-8 text-[#0284c7]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                            </div>
                            <div>
                                <h3 className="text-[#0f172a] font-bold text-sm tracking-tight mb-1">Education Investment</h3>
                                <p className="text-sm text-[#64748b] leading-relaxed">Your payment contributes to the Grade {student?.class} curriculum excellence and facility maintenance.</p>
                            </div>
                        </div>
                                    { }
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-3xl p-8 h-full relative flex flex-col border border-[#e2e8f0] shadow-sm">
                            { }
                            <div className="grid grid-cols-3 gap-4 mb-10">
                                <button
                                    onClick={() => setPaymentMethod('card')}
                                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 ${paymentMethod === 'card' ? 'bg-[#f0f9ff] border-[#0ea5e9] shadow-sm' : 'bg-transparent border-[#e2e8f0] hover:bg-[#f8fafc] text-[#64748b] hover:text-[#0f172a]'}`}
                                >
                                    <svg className={`w-8 h-8 mb-3 ${paymentMethod === 'card' ? 'text-[#0ea5e9]' : 'text-[#94a3b8]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                                    <span className={`text-sm font-bold tracking-widest uppercase ${paymentMethod === 'card' ? 'text-[#0f172a]' : 'text-[#64748b]'}`}>Card</span>
                                </button>
                                <button
                                    onClick={() => setPaymentMethod('transfer')}
                                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 ${paymentMethod === 'transfer' ? 'bg-[#f0f9ff] border-[#0ea5e9] shadow-sm' : 'bg-transparent border-[#e2e8f0] hover:bg-[#f8fafc] text-[#64748b] hover:text-[#0f172a]'}`}
                                >
                                    <svg className={`w-8 h-8 mb-3 ${paymentMethod === 'transfer' ? 'text-[#0ea5e9]' : 'text-[#94a3b8]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                                    <span className={`text-sm font-bold tracking-widest uppercase ${paymentMethod === 'transfer' ? 'text-[#0f172a]' : 'text-[#64748b]'}`}>Transfer</span>
                                </button>
                                <button
                                    onClick={() => setPaymentMethod('wallet')}
                                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 ${paymentMethod === 'wallet' ? 'bg-[#f0f9ff] border-[#0ea5e9] shadow-sm' : 'bg-transparent border-[#e2e8f0] hover:bg-[#f8fafc] text-[#64748b] hover:text-[#0f172a]'}`}
                                >
                                    <svg className={`w-8 h-8 mb-3 ${paymentMethod === 'wallet' ? 'text-[#0ea5e9]' : 'text-[#94a3b8]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                                    <span className={`text-sm font-bold tracking-widest uppercase ${paymentMethod === 'wallet' ? 'text-[#0f172a]' : 'text-[#64748b]'}`}>Wallet</span>
                                </button>
                            </div>

                            {paymentMethod === 'card' && (
                                <div className="animate-fadeIn">
                                    { }
                                    <div className="relative w-full max-w-sm mx-auto mb-12 group perspective cursor-pointer">
                                        <div className="absolute inset-0 bg-[#0ea5e9] transform rotate-2 rounded-2xl opacity-10 blur-xl group-hover:opacity-20 transition-opacity duration-500"></div>
                                        <div className="relative bg-linear-to-br from-[#0f172a] to-[#1e293b] p-8 rounded-2xl h-60 flex flex-col justify-between shadow-2xl overflow-hidden group-hover:scale-[1.02] transition-transform duration-500">
                                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                                <svg className="h-32 w-32 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z" /></svg>
                                            </div>
                                            <div className="flex justify-between items-start relative z-10">
                                                <div className="w-14 h-9 bg-white/10 rounded-md backdrop-blur-md border border-white/10"></div>
                                                <span className="text-[10px] font-bold text-white/40 tracking-[0.2em] uppercase">Student Card</span>
                                            </div>
                                            <div className="space-y-6 relative z-10">
                                                <div className="flex space-x-4">
                                                    <div className="text-2xl font-mono tracking-widest text-[#38bdf8] drop-shadow-md">****</div>
                                                    <div className="text-2xl font-mono tracking-widest text-white/40">****</div>
                                                    <div className="text-2xl font-mono tracking-widest text-white/40">****</div>
                                                    <div className="text-2xl font-mono tracking-widest text-[#38bdf8] drop-shadow-md">4242</div>
                                                </div>
                                                <div className="flex justify-between text-xs text-white/60 uppercase tracking-widest">
                                                    <div>
                                                        <p className="mb-2 text-[8px] font-bold text-white/40">Card Holder</p>
                                                        <p className="text-white font-bold">{student?.name.toUpperCase() || 'STUDENT NAME'}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="mb-2 text-[8px] font-bold text-white/40">Expires</p>
                                                        <p className="text-white font-bold">12/25</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    { }
                                    <div className="bg-[#f8fafc] p-4 rounded-xl border border-dashed border-[#e2e8f0] mb-10 mx-auto max-w-md">
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0 mt-0.5">
                                                <svg className="h-5 w-5 text-[#0ea5e9]" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div className="ml-3 flex-1 md:flex md:justify-between">
                                                <p className="text-sm text-[#64748b]">
                                                    We use <strong className="text-[#0f172a]">Stripe</strong> for secure payments. You will be redirected to their secure checkout page to complete this transaction.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    { }
                                    <div className="mt-auto">
                                        <button
                                            onClick={handleCheckout}
                                            disabled={loading}
                                            className="group w-full flex justify-center py-4 px-4 rounded-xl relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.01] bg-linear-to-br from-[#0ea5e9] to-[#2563eb] text-white shadow-sm"
                                        >
                                            <span className="relative z-10 text-lg font-bold uppercase flex items-center gap-2">
                                                {loading ? (
                                                    <>
                                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Processing...
                                                    </>
                                                ) : (
                                                    <>Pay ₹{feeDetails?.totalFee.toLocaleString()}</>
                                                )}
                                            </span>
                                        </button>
                                        <div className="mt-6 flex justify-center items-center gap-2 text-[10px] uppercase tracking-wider text-[#94a3b8] font-bold">
                                            <svg className="w-4 h-4 text-[#0ea5e9]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                            <span>Secure 256-bit SSL Encryption via Stripe</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {paymentMethod !== 'card' && (
                                <div className="flex flex-col items-center justify-center py-20 text-center animate-fadeIn">
                                    <div className="h-28 w-28 rounded-full flex items-center justify-center mb-8 bg-[#f8fafc] text-[#0ea5e9] border border-[#e2e8f0]">
                                        {paymentMethod === 'transfer' ? (
                                            <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                                        ) : (
                                            <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                                        )}
                                    </div>
                                    <h3 className="text-3xl font-bold text-[#0f172a] mb-3 tracking-tight">Coming Soon</h3>
                                    <p className="text-[#64748b] max-w-sm text-lg leading-relaxed italic">{
                                        paymentMethod === 'transfer'
                                            ? 'Bank transfer payments will be enabled in the next update.'
                                             : 'Digital wallet integration is currently under development.'
                                    }</p>
                                </div>
                            )}

                        </div>
                    </div>        </div>
                </div>
            </main>
        </div>
    );
}

'use client';

import React, { useState } from 'react';

// Mock loadStripe promise
export const loadStripe = async (key: string) => {
    return {
        elements: () => ({}),
        confirmPayment: async () => ({}),
    };
};

export const EmbeddedCheckoutProvider = ({ stripe, options, children }: any) => {
    return <div className="stripe-mock-provider w-full py-4">{children}</div>;
};

export const EmbeddedCheckout = () => {
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);

    const handlePay = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(false);
        setLoading(true);

        setTimeout(() => {
            // Find student profile and fee from localStorage
            let studentId = "ST-12345";
            let amount = 19500;
            
            try {
                const stdStore = localStorage.getItem("mock_db_students");
                if (stdStore) {
                    const stds = JSON.parse(stdStore);
                    const keys = Object.keys(stds);
                    if (keys.length > 0) {
                        studentId = stds[keys[0]].studentId || studentId;
                    }
                }
                const feeStore = localStorage.getItem("mock_db_fees");
                if (feeStore) {
                    const fees = JSON.parse(feeStore);
                    const keys = Object.keys(fees);
                    if (keys.length > 0) {
                        amount = fees[keys[0]].totalFee || amount;
                    }
                }
            } catch (e) {
                console.error("Error reading storage for stripe mock:", e);
            }

            const mockSessionId = `sess_mock_${Date.now()}`;
            // Redirect to success route
            window.location.href = `/payment/success?session_id=${mockSessionId}&studentId=${studentId}&amount=${amount}`;
        }, 1500);
    };

    return (
        <div className="max-w-md mx-auto bg-[#0f172a] border-2 border-yellow-500/30 p-8 rounded-3xl text-white shadow-2xl relative overflow-hidden font-sans">
            <div className="absolute top-0 right-0 p-8 opacity-5">
                <svg className="h-32 w-32 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z" />
                </svg>
            </div>
            
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse"></span>
                        <h3 className="text-lg font-bold tracking-wider uppercase text-yellow-500">Sandbox Payment</h3>
                    </div>
                    <span className="text-[10px] bg-white text-black px-2.5 py-1 rounded-full font-black uppercase tracking-widest">
                        Test Mode
                    </span>
                </div>
                
                <form onSubmit={handlePay} className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-black text-white/50 uppercase tracking-widest mb-2">Cardholder Name</label>
                        <input 
                            type="text" 
                            required 
                            placeholder="Aarav Sharma"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 focus:border-yellow-500/50 rounded-xl px-4 py-3 text-white placeholder-white/20 outline-none transition-colors font-medium text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-white/50 uppercase tracking-widest mb-2">Card Number</label>
                        <div className="relative">
                            <input 
                                type="text" 
                                required 
                                maxLength={19}
                                placeholder="4242 4242 4242 4242"
                                value={cardNumber}
                                onChange={(e) => {
                                    // format card number
                                    const val = e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim();
                                    setCardNumber(val);
                                }}
                                className="w-full bg-white/5 border border-white/10 focus:border-yellow-500/50 rounded-xl px-4 py-3 text-white placeholder-white/20 outline-none transition-colors font-mono tracking-widest text-sm"
                            />
                            <div className="absolute right-3 top-3 text-xs text-yellow-500/80 font-black uppercase tracking-widest">
                                VISA
                            </div>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-white/50 uppercase tracking-widest mb-2">Expiry Date</label>
                            <input 
                                type="text" 
                                required 
                                placeholder="MM/YY"
                                maxLength={5}
                                value={expiry}
                                onChange={(e) => setExpiry(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 focus:border-yellow-500/50 rounded-xl px-4 py-3 text-white placeholder-white/20 outline-none transition-colors font-mono text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-white/50 uppercase tracking-widest mb-2">CVC / CVV</label>
                            <input 
                                type="password" 
                                required 
                                maxLength={3}
                                placeholder="•••"
                                value={cvv}
                                onChange={(e) => setCvv(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 focus:border-yellow-500/50 rounded-xl px-4 py-3 text-white placeholder-white/20 outline-none transition-colors font-mono text-sm"
                            />
                        </div>
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full py-4 rounded-xl font-black bg-yellow-500 text-black hover:bg-yellow-400 transition-colors uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-yellow-500/10 text-sm"
                    >
                        {loading ? (
                            <>
                                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></span>
                                Processing...
                            </>
                        ) : (
                            <>Confirm Payment &rarr;</>
                        )}
                    </button>
                </form>
                
                <p className="text-[9px] text-center text-white/30 mt-6 uppercase tracking-wider font-semibold leading-relaxed">
                    This is an isolated offline sandbox simulation. No transactions will contact Stripe servers. Use test card 4242...
                </p>
            </div>
        </div>
    );
};

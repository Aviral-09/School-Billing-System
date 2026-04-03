'use client';

import Link from 'next/link';
import { SCHOOL_CONFIG } from '@/lib/schoolConfig';
import {
    AcademicCapIcon,
    CurrencyDollarIcon,
    UserGroupIcon,
    ChartBarIcon,
    ShieldCheckIcon,
    ArrowRightIcon
} from '@heroicons/react/24/outline';

const features = [
    {
        icon: CurrencyDollarIcon,
        title: 'Fee Management',
        description: 'Track tuition, transport, and exam fees for all students with a unified dashboard.',
    },
    {
        icon: UserGroupIcon,
        title: 'Student Portals',
        description: 'Dedicated access for students to view balances, make payments, and download receipts.',
    },
    {
        icon: ChartBarIcon,
        title: 'Admin Analytics',
        description: 'Real-time revenue tracking, pending due reports, and class-wise fee summaries.',
    },
    {
        icon: ShieldCheckIcon,
        title: 'Secure Payments',
        description: 'End-to-end encrypted payments via Stripe with automatic digital receipt generation.',
    },
];

export default function HomePage() {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-yellow-500/30">

            {/* Top Bar */}
            <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-yellow-500/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-white p-2 rounded-xl border border-yellow-500/30">
                            <AcademicCapIcon className="w-6 h-6 text-black" />
                        </div>
                        <span className="text-xl font-bold text-white tracking-tight">
                            {SCHOOL_CONFIG.shortName} <span className="text-yellow-500">Portal</span>
                        </span>
                    </div>
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 bg-white hover:bg-gray-200 text-black px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg border border-yellow-500/30 transition-all active:scale-95"
                    >
                        Staff / Student Login
                        <ArrowRightIcon className="w-4 h-4" />
                    </Link>
                </div>
            </header>

            {/* Hero */}
            <section className="relative pt-24 pb-28 overflow-hidden">
                <div className="absolute top-20 left-1/4 w-72 h-72 bg-yellow-500/8 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-white/5 blur-[120px] rounded-full pointer-events-none" />

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-black uppercase tracking-widest mb-8">
                        Academic Year {SCHOOL_CONFIG.academicYear}
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-6 leading-tight">
                        {SCHOOL_CONFIG.name}
                    </h1>
                    <p className="text-lg md:text-xl text-slate-400 mb-4 leading-relaxed max-w-2xl mx-auto">
                        {SCHOOL_CONFIG.tagline}
                    </p>
                    <p className="text-sm text-slate-500 mb-12">
                        Internal Billing & Fee Management System
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/login"
                            className="w-full sm:w-auto px-10 py-5 bg-white hover:bg-gray-100 text-black font-black text-lg rounded-2xl shadow-2xl border border-yellow-500/30 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
                        >
                            Login to Portal
                            <ArrowRightIcon className="w-5 h-5" />
                        </Link>
                        <Link
                            href="/student/dashboard"
                            className="w-full sm:w-auto px-10 py-5 bg-transparent text-white font-bold text-lg rounded-2xl border border-yellow-500/20 hover:border-yellow-500/60 transition-all"
                        >
                            Student Dashboard
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-20 border-t border-yellow-500/10">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-yellow-500 font-bold uppercase tracking-widest text-xs mb-3">System Capabilities</h2>
                        <h3 className="text-4xl font-black text-white">Everything in one place</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((f) => (
                            <div
                                key={f.title}
                                className="glass-card p-8 rounded-[2rem] border border-yellow-500/20 hover:border-yellow-500/60 transition-all group"
                            >
                                <div className="bg-white/10 w-12 h-12 rounded-xl flex items-center justify-center mb-5 border border-yellow-500/20 group-hover:scale-110 transition-transform">
                                    <f.icon className="w-6 h-6 text-yellow-400" />
                                </div>
                                <h4 className="text-lg font-bold text-white mb-2">{f.title}</h4>
                                <p className="text-slate-400 text-sm leading-relaxed">{f.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-10 border-t border-yellow-500/10">
                <div className="max-w-7xl mx-auto px-4 text-center space-y-2">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <AcademicCapIcon className="w-5 h-5 text-yellow-500" />
                        <span className="font-bold text-white">{SCHOOL_CONFIG.name}</span>
                    </div>
                    <p className="text-slate-500 text-xs">{SCHOOL_CONFIG.address}</p>
                    <p className="text-slate-500 text-xs">{SCHOOL_CONFIG.email} &bull; {SCHOOL_CONFIG.phone}</p>
                    <p className="text-slate-600 text-xs mt-4">
                        © {new Date().getFullYear()} {SCHOOL_CONFIG.name}. Internal use only. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}

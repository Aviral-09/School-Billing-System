'use client';

import { useState, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { SCHOOL_CONFIG } from '@/lib/schoolConfig';
import {
    Squares2X2Icon as LayoutDashboardIcon,
    UsersIcon,
    CreditCardIcon,
    ArrowLeftOnRectangleIcon as LogOutIcon,
    Bars3Icon as MenuIcon,
    XMarkIcon as XIcon,
    AcademicCapIcon,
    ChevronRightIcon,
    BuildingLibraryIcon,
    ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';

interface SidebarProps {
    children: ReactNode;
}

export default function Sidebar({ children }: SidebarProps) {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const { user } = useAuth();

    const navigation = [
        { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboardIcon },
        { name: 'Fee Structures', href: '/admin/fee-structures', icon: ClipboardDocumentListIcon },
        { name: 'Class Management', href: '/admin/classes', icon: BuildingLibraryIcon },
        { name: 'Students', href: '/admin/students', icon: UsersIcon },
        { name: 'Payments', href: '/admin/payments', icon: CreditCardIcon },
    ];

    const toggleSidebar = () => setIsOpen(!isOpen);

    return (
        <div className="min-h-screen bg-[#f7f9fc] flex font-sans text-[#0f172a]">

            {/* Mobile overlay */}
            {isOpen && (
                <div
                    onClick={toggleSidebar}
                    className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
                />
            )}

            {/* ── SIDEBAR ── */}
            <aside 
                className={`fixed top-0 left-0 z-50 h-full w-64 lg:w-72 bg-white border-r border-[#e2e8f0] flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                {/* Logo */}
                <div className="px-6 py-6 border-b border-[#e2e8f0]">
                    <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer">
                        <div className="bg-linear-to-br from-[#0ea5e9] to-[#2563eb] rounded-xl p-2 shrink-0 shadow-sm">
                            <AcademicCapIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="font-bold text-lg text-[#0f172a] leading-tight tracking-tight">
                                {SCHOOL_CONFIG.shortName}
                            </p>
                            <p className="text-[10px] font-bold text-[#0ea5e9] uppercase tracking-widest mt-0.5">
                                Admin Panel
                            </p>
                        </div>
                    </Link>
                </div>

                {/* Nav links */}
                <nav className="flex-1 px-4 py-6 flex flex-col gap-1.5 overflow-y-auto">
                    <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest px-3 mb-3">Navigation</p>
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                                    isActive 
                                    ? 'bg-[#f0f9ff] text-[#0ea5e9]' 
                                    : 'text-[#64748b] hover:bg-[#f8fafc] hover:text-[#0f172a]'
                                }`}
                                onClick={() => setIsOpen(false)}
                            >
                                <item.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-[#0ea5e9]' : 'text-[#94a3b8]'}`} />
                                <span className="flex-1">{item.name}</span>
                                {isActive && <ChevronRightIcon className="w-4 h-4 opacity-50" />}
                            </Link>
                        );
                    })}
                </nav>

                {/* User profile + logout */}
                <div className="p-4 border-t border-[#e2e8f0]">
                    <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] mb-2">
                        <div className="w-9 h-9 rounded-full bg-linear-to-br from-[#0ea5e9] to-[#2563eb] flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm">
                            {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'A'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold text-[#0f172a] truncate">
                                {user?.displayName || 'Admin User'}
                            </p>
                            <p className="text-[10px] font-bold text-[#0ea5e9] uppercase tracking-wider truncate">
                                Administrator
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={async () => {
                            const { auth } = await import('@/lib/firebase');
                            if (typeof (auth as any).signOut === 'function') {
                                await (auth as any).signOut();
                            } else {
                                const { signOut } = await import('firebase/auth');
                                await signOut(auth as any);
                            }
                            window.location.href = '/login';
                        }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                        <LogOutIcon className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* ── MAIN CONTENT ── */}
            <div className="flex-1 flex flex-col min-h-screen lg:pl-72 transition-all duration-300 w-full">
                {/* Mobile header bar */}
                <header className="lg:hidden flex items-center justify-between px-5 py-4 bg-white border-b border-[#e2e8f0] sticky top-0 z-30 shadow-sm">
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer">
                        <div className="bg-linear-to-br from-[#0ea5e9] to-[#2563eb] rounded-lg p-1.5 shadow-sm">
                            <AcademicCapIcon className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold text-[15px] text-[#0f172a] tracking-tight">{SCHOOL_CONFIG.shortName} Admin</span>
                    </Link>
                    <button onClick={toggleSidebar} className="text-[#64748b] hover:text-[#0f172a] transition-colors p-1">
                        {isOpen ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
                    </button>
                </header>

                <main className="flex-1 p-6 md:p-8 lg:p-10 w-full">
                    {children}
                </main>
            </div>
        </div>
    );
}

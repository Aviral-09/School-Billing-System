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
    AcademicCapIcon
} from '@heroicons/react/24/outline';

interface SidebarProps {
    children: ReactNode;
}

export default function Sidebar({ children }: SidebarProps) {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const { user, role } = useAuth();

    const navigation = [
        { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboardIcon },
        { name: 'Students', href: '/admin/students', icon: UsersIcon },
        { name: 'Payments', href: '/admin/payments', icon: CreditCardIcon },
    ];

    const toggleSidebar = () => setIsOpen(!isOpen);

    return (
        <div className="min-h-screen bg-black">
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed top-0 left-0 z-50 h-full w-72 bg-black border-r border-yellow-500/20 
                transition-transform duration-300 ease-in-out lg:translate-x-0
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="p-8">
                        <div className="flex items-center gap-3">
                            <div className="bg-white p-2 rounded-xl shadow-lg border border-yellow-500/30">
                                <AcademicCapIcon className="w-6 h-6 text-black" />
                            </div>
                            <div>
                                <p className="text-base font-bold text-white leading-tight">
                                    {SCHOOL_CONFIG.shortName}
                                </p>
                                <p className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest">
                                    Admin Panel
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 space-y-2 mt-4">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`
                                        flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all group
                                        ${isActive
                                            ? 'bg-white/10 text-yellow-500 border border-yellow-500/20'
                                            : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}
                                    `}
                                >
                                    <item.icon className={`w-5 h-5 ${isActive ? 'text-yellow-500' : 'text-gray-500 group-hover:text-yellow-400'}`} />
                                    {item.name}
                                    {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(250,204,21,1)]" />}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Profile + Logout */}
                    <div className="p-4 border-t border-yellow-500/10">
                        <div className="flex items-center gap-3 px-4 py-4 rounded-2xl bg-white/5 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-yellow-500/20 text-black font-bold">
                                {user?.displayName ? user.displayName.charAt(0) : 'A'}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-bold text-white truncate">
                                    {user?.displayName || 'Admin User'}
                                </p>
                                <p className="text-[10px] text-yellow-500 uppercase font-bold tracking-widest">
                                    Administrator
                                </p>
                            </div>
                        </div>
                        <button
                            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 font-medium rounded-xl hover:bg-red-500/10 transition-colors"
                            onClick={async () => {
                                const { auth } = await import('@/lib/firebase');
                                await auth.signOut();
                                window.location.href = '/login';
                            }}
                        >
                            <LogOutIcon className="w-5 h-5" />
                            Logout
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Wrapper */}
            <div className="lg:pl-72 flex flex-col min-h-screen">
                {/* Mobile Header */}
                <header className="lg:hidden flex items-center justify-between p-4 bg-black border-b border-yellow-500/20">
                    <div className="flex items-center gap-3">
                        <AcademicCapIcon className="w-6 h-6 text-yellow-500" />
                        <span className="text-lg font-bold text-white">{SCHOOL_CONFIG.shortName} Admin</span>
                    </div>
                    <button onClick={toggleSidebar} className="p-2 text-gray-400">
                        {isOpen ? <XIcon /> : <MenuIcon />}
                    </button>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-6 md:p-10">
                    {children}
                </main>
            </div>
        </div>
    );
}

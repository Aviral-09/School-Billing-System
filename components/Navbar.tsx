'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { SCHOOL_CONFIG } from '@/lib/schoolConfig';
import {
    AcademicCapIcon,
    Bars3Icon as MenuIcon,
    XMarkIcon as XIcon,
    UserCircleIcon
} from '@heroicons/react/24/outline';

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user, role } = useAuth();

    return (
        <nav className="bg-black border-b border-yellow-500/20 sticky top-0 z-50 backdrop-blur-md bg-opacity-80">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="bg-white p-2 rounded-xl shadow-lg border border-yellow-500/30 group-hover:scale-110 transition-transform">
                                <AcademicCapIcon className="w-6 h-6 text-black" />
                            </div>
                            <span className="text-xl font-bold text-white tracking-tight">
                                {SCHOOL_CONFIG.shortName}{' '}
                                <span className="text-yellow-500">Portal</span>
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center space-x-8">
                        {user && role === 'student' && (
                            <>
                                <Link href="/student/dashboard" className="text-gray-400 hover:text-white transition-colors font-medium">
                                    My Dashboard
                                </Link>
                                <Link href="/payment" className="text-gray-400 hover:text-white transition-colors font-medium">
                                    Pay Fees
                                </Link>
                            </>
                        )}
                        {user && role === 'admin' && (
                            <Link href="/admin/dashboard" className="text-gray-400 hover:text-white transition-colors font-medium">
                                Admin Panel
                            </Link>
                        )}

                        {user ? (
                            <div className="flex items-center gap-4 pl-6 border-l border-white/10">
                                <div className="text-right">
                                    <p className="text-sm font-bold text-white leading-tight">
                                        {user.displayName || 'User'}
                                    </p>
                                    <p className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest">
                                        {role || 'Student'}
                                    </p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-yellow-500/20">
                                    <UserCircleIcon className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                className="bg-white hover:bg-gray-200 text-black px-6 py-2.5 rounded-xl font-bold shadow-lg border border-yellow-500/30 transition-all active:scale-95"
                            >
                                Login
                            </Link>
                        )}
                    </div>

                    {/* Mobile hamburger */}
                    <div className="md:hidden flex items-center">
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-400">
                            {isMenuOpen ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-black border-t border-yellow-500/20 p-4 space-y-4">
                    {user && role === 'student' && (
                        <>
                            <Link href="/student/dashboard" className="block px-4 py-3 text-gray-400 hover:text-white rounded-xl">
                                My Dashboard
                            </Link>
                            <Link href="/payment" className="block px-4 py-3 text-gray-400 hover:text-white rounded-xl">
                                Pay Fees
                            </Link>
                        </>
                    )}
                    {user && role === 'admin' && (
                        <Link href="/admin/dashboard" className="block px-4 py-3 text-gray-400 hover:text-white rounded-xl">
                            Admin Panel
                        </Link>
                    )}
                    {!user && (
                        <Link href="/login" className="block px-4 py-3 bg-white text-black rounded-xl text-center font-bold border border-yellow-500/30">
                            Login
                        </Link>
                    )}
                </div>
            )}
        </nav>
    );
}

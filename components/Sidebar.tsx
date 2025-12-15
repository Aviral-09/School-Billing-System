'use client';

import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
    HomeIcon,
    UsersIcon,
    BanknotesIcon,
    XMarkIcon,
    ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';

const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: HomeIcon },
    { name: 'Students', href: '/admin/students', icon: UsersIcon, current: false },
    { name: 'Payments', href: '/admin/payments', icon: BanknotesIcon, current: false },
];

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
}

export default function Sidebar({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { role } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = async () => {
        await auth.signOut();
        router.push('/login');
    };

    return (
        <>
            <div className="min-h-screen">
                <Transition.Root show={sidebarOpen} as={Fragment}>
                    <Dialog as="div" className="relative z-50 lg:hidden" onClose={setSidebarOpen}>
                        <Transition.Child
                            as={Fragment}
                            enter="transition-opacity ease-linear duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="transition-opacity ease-linear duration-300"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm" />
                        </Transition.Child>

                        <div className="fixed inset-0 flex">
                            <Transition.Child
                                as={Fragment}
                                enter="transition ease-in-out duration-300 transform"
                                enterFrom="-translate-x-full"
                                enterTo="translate-x-0"
                                leave="transition ease-in-out duration-300 transform"
                                leaveFrom="translate-x-0"
                                leaveTo="-translate-x-full"
                            >
                                <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                                    <div className="flex grow flex-col gap-y-5 overflow-y-auto glass px-6 pb-4">
                                        <div className="flex h-16 shrink-0 items-center gap-2 mt-4">
                                            <div className="bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-lg p-1.5 shadow-lg shadow-emerald-500/20">
                                                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                </svg>
                                            </div>
                                            <span className="text-xl font-bold text-white tracking-wide">SchoolBilling</span>
                                        </div>
                                        <nav className="flex flex-1 flex-col">
                                            <ul role="list" className="flex flex-1 flex-col gap-y-7">
                                                <li>
                                                    <ul role="list" className="-mx-2 space-y-2">
                                                        {navigation.map((item) => (
                                                            <li key={item.name}>
                                                                <Link
                                                                    href={item.href}
                                                                    className={classNames(
                                                                        pathname === item.href
                                                                            ? 'bg-white/10 text-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.1)]'
                                                                            : 'text-slate-400 hover:text-white hover:bg-white/5',
                                                                        'group flex gap-x-3 rounded-xl p-3 text-sm leading-6 font-semibold transition-all duration-200'
                                                                    )}
                                                                >
                                                                    <item.icon className={classNames(
                                                                        pathname === item.href ? 'text-emerald-400' : 'text-slate-500 group-hover:text-white',
                                                                        'h-6 w-6 shrink-0'
                                                                    )} aria-hidden="true" />
                                                                    {item.name}
                                                                </Link>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </li>
                                                <li className="mt-auto">
                                                    <button
                                                        onClick={handleLogout}
                                                        className="group -mx-2 flex gap-x-3 rounded-xl p-3 text-sm font-semibold leading-6 text-slate-400 hover:bg-white/5 hover:text-white w-full transition-colors"
                                                    >
                                                        <ArrowRightOnRectangleIcon className="h-6 w-6 shrink-0" aria-hidden="true" />
                                                        Logout
                                                    </button>
                                                </li>
                                            </ul>
                                        </nav>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </Dialog>
                </Transition.Root>

                {}
                <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
                    <div className="flex grow flex-col gap-y-5 overflow-y-auto glass m-4 rounded-3xl px-6 pb-4">
                        <div className="flex h-24 shrink-0 items-center gap-3">
                            <div className="bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-xl p-2 shadow-lg shadow-emerald-500/30">
                                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-white tracking-wide">SchoolBilling</h1>
                                <p className="text-xs text-slate-400">Admin Panel</p>
                            </div>
                        </div>
                        <nav className="flex flex-1 flex-col">
                            <ul role="list" className="flex flex-1 flex-col gap-y-7">
                                <li>
                                    <ul role="list" className="-mx-2 space-y-2">
                                        {navigation.map((item) => (
                                            <li key={item.name}>
                                                <Link
                                                    href={item.href}
                                                    className={classNames(
                                                        pathname === item.href
                                                            ? 'bg-white/10 text-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.15)] border border-white/5'
                                                            : 'text-slate-400 hover:text-white hover:bg-white/5',
                                                        'group flex gap-x-3 rounded-2xl p-3 text-sm leading-6 font-semibold transition-all duration-300 items-center'
                                                    )}
                                                >
                                                    <item.icon className={classNames(
                                                        pathname === item.href ? 'text-emerald-400' : 'text-slate-500 group-hover:text-white',
                                                        'h-5 w-5 shrink-0 transition-colors'
                                                    )} aria-hidden="true" />
                                                    {item.name}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                                <li className="mt-auto">
                                    <div className="rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-5 mb-6 border border-white/5 relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                        <div className="flex items-center gap-3 mb-3 relative z-10">
                                            <div className="bg-emerald-500/20 p-2 rounded-full">
                                                <svg className="h-5 w-5 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div>
                                                <span className="text-white font-semibold text-sm block">Need Help?</span>
                                                <span className="text-slate-400 text-xs">Check our docs</span>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleLogout}
                                        className="group -mx-2 flex gap-x-3 rounded-2xl p-3 text-sm font-semibold leading-6 text-slate-400 hover:bg-white/10 hover:text-white w-full transition-all items-center border border-transparent hover:border-white/5"
                                    >
                                        <ArrowRightOnRectangleIcon className="h-5 w-5 shrink-0" aria-hidden="true" />
                                        Logout
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </div>

                <div className="lg:pl-80 min-h-screen">
                    <main className="py-8">
                        <div className="px-4 sm:px-6 lg:px-8">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}

'use client';

import { Fragment } from 'react';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
}

export default function Navbar() {
    const { user, role } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = async () => {
        await auth.signOut();
        router.push('/login');
    };

    return (
        <Disclosure as="nav" className="glass-nav sticky top-0 z-50">
            {({ open }) => (
                <>
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 justify-between">
                            <div className="flex">
                                <div className="flex flex-shrink-0 items-center gap-2">
                                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg p-1.5 shadow-lg shadow-indigo-500/20">
                                        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                    </div>
                                    <span className="text-xl font-bold text-white tracking-wide">SchoolBillPro</span>
                                </div>
                                <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                                    <a
                                        href="/student/dashboard"
                                        className={classNames(
                                            pathname?.includes('/student/dashboard')
                                                ? 'border-indigo-400 text-white'
                                                : 'border-transparent text-slate-400 hover:border-slate-300 hover:text-slate-200',
                                            'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium transition-colors duration-200'
                                        )}
                                    >
                                        Dashboard
                                    </a>
                                    <a
                                        href="/payment"
                                        className={classNames(
                                            pathname?.includes('/payment')
                                                ? 'border-indigo-400 text-white'
                                                : 'border-transparent text-slate-400 hover:border-slate-300 hover:text-slate-200',
                                            'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium transition-colors duration-200'
                                        )}
                                    >
                                        Payments
                                    </a>
                                </div>
                            </div>
                            <div className="hidden sm:ml-6 sm:flex sm:items-center">
                                <Menu as="div" className="relative ml-3">
                                    <div>
                                        <Menu.Button className="flex rounded-full bg-white/10 p-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 border border-white/10 hover:bg-white/20 transition-colors">
                                            <span className="sr-only">Open user menu</span>
                                            <UserCircleIcon className="h-7 w-7 text-slate-300" aria-hidden="true" />
                                        </Menu.Button>
                                    </div>
                                    <Transition
                                        as={Fragment}
                                        enter="transition ease-out duration-200"
                                        enterFrom="transform opacity-0 scale-95"
                                        enterTo="transform opacity-100 scale-100"
                                        leave="transition ease-in duration-75"
                                        leaveFrom="transform opacity-100 scale-100"
                                        leaveTo="transform opacity-0 scale-95"
                                    >
                                        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-xl glass-card py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                            <div className="px-4 py-2 text-xs text-slate-400 border-b border-white/10">
                                                Signed in as <span className="font-semibold text-indigo-400">{role?.toUpperCase()}</span>
                                            </div>
                                            <Menu.Item>
                                                {({ active }) => (
                                                    <button
                                                        onClick={handleLogout}
                                                        className={classNames(active ? 'bg-white/10 text-white' : 'text-slate-300', 'block w-full px-4 py-2 text-left text-sm transition-colors')}
                                                    >
                                                        Sign out
                                                    </button>
                                                )}
                                            </Menu.Item>
                                        </Menu.Items>
                                    </Transition>
                                </Menu>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </Disclosure>
    );
}

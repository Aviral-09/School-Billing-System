'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { SCHOOL_CONFIG } from '@/lib/schoolConfig';
import {
    AcademicCapIcon,
    Bars3Icon as MenuIcon,
    XMarkIcon as XIcon,
    UserCircleIcon,
    ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user, role } = useAuth();
    const pathname = usePathname();

    return (
        <header className="nav-sticky">
            <div style={{ maxWidth: 'var(--page-max-width)', margin: '0 auto', padding: '0 32px', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

                {/* Logo */}
                <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                    <div style={{ background: 'var(--color-electric-violet)', borderRadius: 10, padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <AcademicCapIcon style={{ width: 18, height: 18, color: '#fff' }} />
                    </div>
                    <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 17, color: 'var(--color-midnight-ink)', letterSpacing: '-0.4px' }}>
                        {SCHOOL_CONFIG.shortName}<span style={{ color: 'var(--color-electric-violet)' }}> Portal</span>
                    </span>
                </Link>

                {/* Desktop nav */}
                <nav style={{ display: 'flex', alignItems: 'center', gap: 6 }} className="hidden-mobile">
                    {user && role === 'student' && (
                        <>
                            <Link href="/student/dashboard" className={`nav-link${pathname === '/student/dashboard' ? ' active' : ''}`}>My Dashboard</Link>
                            <Link href="/payment" className={`nav-link${pathname === '/payment' ? ' active' : ''}`}>Pay Fees</Link>
                        </>
                    )}
                    {user && role === 'admin' && (
                        <Link href="/admin/dashboard" className={`nav-link${pathname.startsWith('/admin') ? ' active' : ''}`}>Admin Panel</Link>
                    )}

                    {user ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 12, paddingLeft: 16, borderLeft: '1px solid var(--color-ghost-border)' }}>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-midnight-ink)', margin: 0 }}>{user.displayName || 'User'}</p>
                                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-electric-violet)', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>{role}</p>
                            </div>
                            <div style={{
                                width: 36, height: 36, borderRadius: '50%',
                                background: 'var(--color-violet-subtle)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                border: '1px solid var(--color-ghost-border)',
                            }}>
                                <UserCircleIcon style={{ width: 20, height: 20, color: 'var(--color-electric-violet)' }} />
                            </div>
                            <button
                                className="btn-ghost"
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
                                title="Sign out"
                                style={{ padding: '5px 8px' }}
                            >
                                <ArrowRightOnRectangleIcon style={{ width: 16, height: 16 }} />
                            </button>
                        </div>
                    ) : (
                        <Link href="/login" className="btn-primary" style={{ marginLeft: 8 }}>Sign In</Link>
                    )}
                </nav>

                {/* Mobile burger */}
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted-ash)', padding: 4 }}
                    id="mobile-menu-btn"
                >
                    {isMenuOpen ? <XIcon style={{ width: 22, height: 22 }} /> : <MenuIcon style={{ width: 22, height: 22 }} />}
                </button>
            </div>

            {/* Mobile drawer */}
            {isMenuOpen && (
                <div style={{ background: 'var(--color-paper-white)', borderTop: '1px solid var(--color-ghost-border)', padding: '12px 24px 20px' }}>
                    {user && role === 'student' && (
                        <>
                            <Link href="/student/dashboard" className="nav-link" style={{ display: 'block', marginBottom: 4 }}>My Dashboard</Link>
                            <Link href="/payment" className="nav-link" style={{ display: 'block', marginBottom: 4 }}>Pay Fees</Link>
                        </>
                    )}
                    {user && role === 'admin' && (
                        <Link href="/admin/dashboard" className="nav-link" style={{ display: 'block', marginBottom: 4 }}>Admin Panel</Link>
                    )}
                    {!user && <Link href="/login" className="btn-primary" style={{ display: 'block', textAlign: 'center', marginTop: 8 }}>Sign In</Link>}
                </div>
            )}

            <style>{`
                @media (max-width: 768px) {
                    .hidden-mobile { display: none !important; }
                    #mobile-menu-btn { display: flex !important; }
                }
            `}</style>
        </header>
    );
}

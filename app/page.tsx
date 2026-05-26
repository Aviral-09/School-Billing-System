'use client';

import { SCHOOL_CONFIG } from '@/lib/schoolConfig';
import { HeroFinancial } from '@/components/hero-financial';
import { motion } from 'motion/react';
import BorderGlow from '@/components/BorderGlow';
import { AcademicCapIcon } from '@heroicons/react/24/outline';
import { ProblemSolution } from '@/components/landing/ProblemSolution';
import { BentoGrid } from '@/components/landing/BentoGrid';
import { Testimonials } from '@/components/landing/Testimonials';
import { Pricing } from '@/components/landing/Pricing';
import { FAQ } from '@/components/landing/FAQ';

const InteractiveWallet = () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'relative', zIndex: 1 }}>
        <path d="M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" />
        <motion.path 
            variants={{ hover: { y: -3, stroke: "#38bdf8" } }}
            transition={{ type: "spring", stiffness: 300, damping: 10 }}
            d="M12 6V3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v3" 
            stroke="#7dd3fc"
        />
        <motion.path 
            variants={{ hover: { x: 2 } }}
            transition={{ type: "spring", stiffness: 300, damping: 10 }}
            d="M18 11h3v2h-3v-2z" 
        />
    </svg>
);

const InteractiveUsers = () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'relative', zIndex: 1 }}>
        <circle cx="9" cy="7" r="4" />
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <motion.g
            variants={{ hover: { x: 3, y: -1, stroke: "#38bdf8" } }}
            transition={{ type: "spring", stiffness: 200, damping: 12 }}
            stroke="#7dd3fc"
        >
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        </motion.g>
    </svg>
);

const InteractiveChart = () => (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 26, width: 26, justifyContent: 'center', position: 'relative', zIndex: 1 }}>
        <motion.div 
            variants={{ hover: { height: ["40%", "80%", "60%"] } }}
            transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
            style={{ width: 4, height: "40%", background: "#7dd3fc", borderRadius: 2 }}
        />
        <motion.div 
            variants={{ hover: { height: ["100%", "50%", "90%"] } }}
            transition={{ repeat: Infinity, duration: 1, ease: "easeInOut", delay: 0.1 }}
            style={{ width: 4, height: "80%", background: "#0ea5e9", borderRadius: 2, boxShadow: '0 0 8px rgba(14,165,233,0.4)' }}
        />
        <motion.div 
            variants={{ hover: { height: ["60%", "90%", "40%"] } }}
            transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut", delay: 0.2 }}
            style={{ width: 4, height: "60%", background: "#7dd3fc", borderRadius: 2 }}
        />
    </div>
);

const InteractiveShield = () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'relative', zIndex: 1 }}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <motion.path 
            initial={{ pathLength: 0 }}
            variants={{ hover: { pathLength: 1, stroke: "#38bdf8" } }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            d="M9 11l2 2 4-4"
            style={{ filter: 'drop-shadow(0 0 4px rgba(56,189,248,0.5))' }}
        />
    </svg>
);

const features = [
    {
        icon: InteractiveWallet,
        title: 'Fee Management',
        description: 'Track tuition, transport, and exam fees for all students with a unified dashboard.',
    },
    {
        icon: InteractiveUsers,
        title: 'Student Portals',
        description: 'Dedicated access for students to view balances, make payments, and download receipts.',
    },
    {
        icon: InteractiveChart,
        title: 'Admin Analytics',
        description: 'Real-time revenue tracking, pending due reports, and class-wise fee summaries.',
    },
    {
        icon: InteractiveShield,
        title: 'Secure Payments',
        description: 'End-to-end encrypted payments via Stripe with automatic digital receipt generation.',
    },
];

export default function HomePage() {
    return (
        <div style={{ minHeight: '100vh', background: '#ffffff' }}>

            {/* ── HERO ── */}
            <HeroFinancial />

            {/* ── FEATURES ── */}
            <section id="features" className="py-16 md:py-24 px-6 md:px-8 relative overflow-hidden" style={{ background: '#ffffff' }}>
                {/* Background decorative blobs */}
                <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(56,189,248,0.05) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(14,165,233,0.06) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

                <div style={{ maxWidth: 'var(--page-max-width)', margin: '0 auto', position: 'relative', zIndex: 10 }}>
                    <div style={{ position: 'relative', textAlign: 'center', marginBottom: 64 }}>
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 300, height: 150, background: 'radial-gradient(ellipse, rgba(56,189,248,0.15) 0%, transparent 70%)', zIndex: 0, pointerEvents: 'none' }} />
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            viewport={{ once: true, margin: "-50px" }}
                            style={{ position: 'relative', zIndex: 1 }}
                        >
                            <h2 style={{
                                fontFamily: 'var(--font-heading)',
                                fontSize: 'clamp(32px, 5vw, 48px)',
                                fontWeight: 600,
                                letterSpacing: '-0.04em',
                                color: '#0f172a',
                            }}>Everything in one place</h2>
                        </motion.div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
                        {features.map((f, index) => (
                            <motion.div 
                                key={f.title} 
                                initial="initial"
                                whileInView="animate"
                                whileHover="hover"
                                viewport={{ once: true, margin: "-50px" }}
                                variants={{
                                    initial: { opacity: 0, y: 40 },
                                    animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: index * 0.1 } },
                                    hover: { y: -8, transition: { duration: 0.4, ease: "easeOut" } }
                                }}
                            >
                                <BorderGlow
                                    edgeSensitivity={40}
                                    glowColor="200 90 60"
                                    backgroundColor="rgba(255, 255, 255, 0.9)"
                                    borderRadius={24}
                                    glowRadius={40}
                                    glowIntensity={1}
                                    coneSpread={30}
                                    animated={false}
                                    colors={['#38bdf8', '#7dd3fc', '#0ea5e9']}
                                    style={{ width: '100%', height: '100%', backdropFilter: 'blur(10px)', cursor: 'default' }}
                                >
                                    <div style={{ padding: 32, height: '100%', display: 'flex', flexDirection: 'column' }}>
                                        <motion.div 
                                            variants={{
                                                initial: { rotate: 0, scale: 1 },
                                                hover: { rotate: [0, -6, 6, -3, 0], scale: 1.05, transition: { duration: 0.6, ease: 'easeInOut' } }
                                            }}
                                            style={{
                                                width: 48, height: 48, borderRadius: 14,
                                                background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                marginBottom: 20,
                                                boxShadow: '0 8px 16px rgba(14,165,233,0.12), inset 0 2px 0 rgba(255,255,255,0.8)',
                                                position: 'relative',
                                                border: '1px solid #bae6fd'
                                            }}
                                        >
                                            {/* Localized Hover Glow Effect */}
                                            <motion.div
                                                variants={{
                                                    initial: { scale: 0, opacity: 0 },
                                                    hover: { scale: 1, opacity: 1, transition: { duration: 0.4 } }
                                                }}
                                                style={{
                                                    position: 'absolute',
                                                    inset: -20,
                                                    background: 'radial-gradient(circle, rgba(56,189,248,0.2) 0%, transparent 70%)',
                                                    filter: 'blur(8px)',
                                                    borderRadius: '50%',
                                                    zIndex: 0,
                                                }}
                                            />
                                            <f.icon />
                                        </motion.div>
                                        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 600, color: '#0f172a', marginBottom: 8, position: 'relative', letterSpacing: '-0.02em' }}>{f.title}</h3>
                                        <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, fontWeight: 400, position: 'relative' }}>{f.description}</p>
                                    </div>
                                </BorderGlow>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── PROBLEM / SOLUTION ── */}
            <ProblemSolution />

            {/* ── BENTO GRID ── */}
            <BentoGrid />

            {/* ── TESTIMONIALS ── */}
            <Testimonials />

            {/* ── PRICING ── */}
            <Pricing />

            {/* ── FAQ ── */}
            <FAQ />

            {/* ── ABOUT / SCHOOL LOCATION ── */}
            <section id="about" className="py-16 md:py-24 px-6 md:px-8 relative overflow-hidden" style={{
                background: '#ffffff',
                borderTop: '1px solid #e2e8f0',
            }}>
                <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, background: 'radial-gradient(circle, rgba(14,165,233,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />
                
                <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                    <div style={{ textAlign: 'center', marginBottom: 40 }}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            viewport={{ once: true }}
                        >
                            <h2 style={{
                                fontFamily: 'var(--font-heading)',
                                fontSize: 'clamp(32px, 5vw, 48px)',
                                fontWeight: 600,
                                color: '#0f172a',
                                letterSpacing: '-0.04em',
                                marginBottom: 12
                            }}>
                                School Location
                            </h2>
                            <p style={{
                                fontSize: 18,
                                color: '#64748b',
                                lineHeight: 1.6,
                                fontWeight: 400
                            }}>
                                Find our campus on Google Maps
                            </p>
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        viewport={{ once: true }}
                        style={{
                            width: '100%',
                            borderRadius: 24,
                            overflow: 'hidden',
                            boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(15, 23, 42, 0.04)',
                            border: '1px solid #e2e8f0',
                            backgroundColor: '#f8fafc',
                        }}
                    >
                        <div className="w-full h-[300px] md:h-[400px] lg:h-[450px] overflow-hidden">
                            <iframe 
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3501.8299754350933!2d77.4380803753585!3d28.634857475663548!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cee24c0d68333%3A0x32591bcfce3de944!2sSwami%20Dayanand%20Sarswati%20Public%20School!5e0!3m2!1sen!2sin!4v1779820165377!5m2!1sen!2sin" 
                                width="100%" 
                                height="100%" 
                                style={{ border: 0, display: 'block' }} 
                                allowFullScreen={true} 
                                loading="lazy" 
                                referrerPolicy="no-referrer-when-downgrade"
                            />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer style={{ padding: '28px 32px', background: 'var(--color-cloud-canvas)', borderTop: '1px solid var(--color-ghost-border)', textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 6 }}>
                    <div style={{ background: 'var(--color-electric-violet)', borderRadius: 6, padding: 4 }}>
                        <AcademicCapIcon style={{ width: 14, height: 14, color: '#fff' }} />
                    </div>
                    <span style={{ fontFamily: 'var(--font-heading)', fontSize: 14, fontWeight: 700, color: 'var(--color-midnight-ink)' }}>{SCHOOL_CONFIG.name}</span>
                </div>
                <p style={{ fontSize: 12, color: '#999', fontWeight: 500 }}>
                    © {new Date().getFullYear()} {SCHOOL_CONFIG.name}. Internal use only. All rights reserved.
                </p>
            </footer>
        </div>
    );
}

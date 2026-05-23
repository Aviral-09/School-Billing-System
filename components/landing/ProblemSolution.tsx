'use client';
import { motion } from 'motion/react';
import { FileText, PhoneOff, Folders, PieChart, Zap, BellRing, LayoutDashboard, BadgeCheck, ArrowRight, ArrowDown } from 'lucide-react';
import { useMediaQuery } from '@/components/use-media-query';

const painPoints = [
  { icon: FileText, text: 'Hours spent generating invoices manually' },
  { icon: PhoneOff, text: 'Chasing late payments via phone calls' },
  { icon: Folders, text: 'Fragmented spreadsheets across departments' },
  { icon: PieChart, text: 'No single view of outstanding dues' },
];

const solutions = [
  { icon: Zap, text: 'One-click invoice generation for all students' },
  { icon: BellRing, text: 'Automated SMS & email payment reminders' },
  { icon: LayoutDashboard, text: 'Unified real-time financial dashboard' },
  { icon: BadgeCheck, text: 'Instant due tracking with class-wise reports' },
];

export function ProblemSolution() {
  const isMobile = useMediaQuery('(max-width: 1024px)');

  return (
    <section className="py-16 md:py-24 px-6 md:px-8 relative overflow-hidden" style={{ background: '#f7f9fc' }}>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 800, height: 800, background: 'radial-gradient(circle, rgba(147,197,253,0.15) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ maxWidth: 'var(--page-max-width)', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 600, color: '#0f172a', letterSpacing: '-0.04em', marginBottom: 16 }}>
            From chaos to clarity
          </h2>
          <p style={{ fontSize: 18, color: '#64748b', maxWidth: 540, margin: '0 auto', lineHeight: 1.6, fontWeight: 400 }}>
            See how the modern billing system transforms your finance workflow from a manual headache to an automated breeze.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-8 lg:gap-12 items-center">
          {/* Before */}
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} viewport={{ once: true }}>
            <div style={{ background: '#ffffff', borderRadius: 24, padding: 32, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f8fafc', color: '#64748b', borderRadius: 99, padding: '6px 14px', fontSize: 12, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 24, border: '1px solid #e2e8f0' }}>
                <span style={{width: 6, height: 6, borderRadius: '50%', background: '#ef4444'}}></span> Before
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {painPoints.map((p, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1, duration: 0.6 }} viewport={{ once: true }} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', flexShrink: 0 }}>
                      <p.icon size={18} strokeWidth={1.5} />
                    </div>
                    <span style={{ fontSize: 15, color: '#64748b', lineHeight: 1.5, fontWeight: 500 }}>{p.text}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Arrow */}
          <motion.div initial={{ opacity: 0, scale: 0.5 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }} viewport={{ once: true }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.4)', color: '#fff' }}>
              {isMobile ? <ArrowDown size={24} strokeWidth={2} /> : <ArrowRight size={24} strokeWidth={2} />}
            </div>
          </motion.div>

          {/* After */}
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} viewport={{ once: true }}>
            <div style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f0f9ff 100%)', borderRadius: 24, padding: 32, border: '1px solid #bae6fd', boxShadow: '0 10px 40px -10px rgba(56, 189, 248, 0.15)' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#e0f2fe', color: '#0369a1', borderRadius: 99, padding: '6px 14px', fontSize: 12, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 24, border: '1px solid #bae6fd' }}>
                <span style={{width: 6, height: 6, borderRadius: '50%', background: '#0ea5e9', boxShadow: '0 0 8px #0ea5e9'}}></span> After
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {solutions.map((s, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 + 0.2, duration: 0.6 }} viewport={{ once: true }} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0ea5e9', flexShrink: 0 }}>
                      <s.icon size={18} strokeWidth={2} />
                    </div>
                    <span style={{ fontSize: 15, color: '#0f172a', lineHeight: 1.5, fontWeight: 600 }}>{s.text}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

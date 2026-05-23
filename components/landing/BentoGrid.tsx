'use client';
import { motion } from 'motion/react';
import { Zap, BarChart3, Smartphone, Bell, ShieldCheck } from 'lucide-react';

const InteractiveChart = () => (
  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 32, width: 36, justifyContent: 'center' }}>
    {[['40%','#bfdbfe',1.2],['85%','#3b82f6',1.0],['60%','#bfdbfe',1.4],['75%','#60a5fa',1.1]].map(([h, c, d], i) => (
      <motion.div key={i}
        animate={{ height: [`${h}`, i%2===0 ? '80%' : '50%', `${h}`] }}
        transition={{ repeat: Infinity, duration: Number(d), ease: 'easeInOut', delay: i * 0.15 }}
        style={{ width: 6, height: h as string, background: c as string, borderRadius: 4 }}
      />
    ))}
  </div>
);

export function BentoGrid() {
  return (
    <section className="py-16 md:py-24 px-6 md:px-8 relative overflow-hidden" style={{ background: '#ffffff' }}>
      <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: 800, height: 800, background: 'radial-gradient(circle, rgba(186,230,253,0.15) 0%, transparent 65%)', borderRadius: '50%', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 'var(--page-max-width)', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 600, color: '#0f172a', letterSpacing: '-0.04em', marginBottom: 16 }}>
            Built for every role
          </h2>
          <p style={{ fontSize: 18, color: '#64748b', maxWidth: 500, margin: '0 auto', lineHeight: 1.6, fontWeight: 400 }}>
            Powerful tools for administrators, perfectly transparent portals for parents.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Block 1 – Large: Automated Invoicing */}
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} viewport={{ once: true }}
            className="col-span-1 lg:col-span-2"
            style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', borderRadius: 32, padding: 'clamp(24px, 4vw, 40px)', border: '1px solid #bae6fd', position: 'relative', overflow: 'hidden', minHeight: 220 }}>
            <div style={{ position: 'absolute', bottom: -50, right: -50, width: 250, height: 250, background: 'radial-gradient(circle, rgba(56,189,248,0.15) 0%, transparent 70%)', borderRadius: '50%' }} />
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48, borderRadius: 14, background: '#ffffff', marginBottom: 20, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
              <Zap size={22} color="#0ea5e9" strokeWidth={1.5} />
            </div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 600, color: '#0f172a', marginBottom: 10, letterSpacing: '-0.02em' }}>Automated Invoicing</h3>
            <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.6, maxWidth: 400, fontWeight: 400 }}>Generate and dispatch fee invoices for every student in one click. Supports tuition, transport, exam, and activity fees with custom due dates.</p>
            {/* Mini invoice preview */}
            <div style={{ marginTop: 24, background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', borderRadius: 16, padding: '16px 20px', border: '1px solid rgba(255,255,255,0.6)', display: 'inline-flex', flexDirection: 'column', gap: 8, boxShadow: '0 10px 25px -5px rgba(14, 165, 233, 0.1)', width: '100%', maxWidth: 320 }}>
              {[['Tuition Fee','₹12,000'],['Transport Fee','₹1,500'],['Exam Fee','₹800']].map(([label, amt]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, fontSize: 13, fontWeight: 500 }}>
                  <span style={{ color: '#64748b' }}>{label}</span>
                  <span style={{ color: '#0f172a', fontWeight: 600 }}>{amt}</span>
                </div>
              ))}
              <div style={{ height: 1, background: '#e2e8f0', margin: '6px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, fontSize: 14 }}>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>Total</span>
                <span style={{ fontWeight: 700, color: '#0ea5e9' }}>₹14,300</span>
              </div>
            </div>
          </motion.div>

          {/* Block 2 – Analytics */}
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }} viewport={{ once: true }}
            className="col-span-1"
            style={{ background: '#ffffff', borderRadius: 32, padding: 'clamp(24px, 4vw, 32px)', border: '1px solid #f1f5f9', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 220 }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48, borderRadius: 14, background: '#f8fafc', marginBottom: 20, border: '1px solid #e2e8f0' }}>
                <InteractiveChart />
              </div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 600, color: '#0f172a', marginBottom: 8, letterSpacing: '-0.02em' }}>Live Analytics</h3>
              <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.5, fontWeight: 400 }}>Real-time revenue charts, class-wise breakdowns, and pending dues at a glance.</p>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              {[['₹2.4L','Collected', '#e0f2fe', '#0284c7'],['₹38K','Pending', '#f1f5f9', '#475569']].map(([val, lbl, bg, clr]) => (
                <div key={lbl} style={{ flex: 1, background: bg, borderRadius: 12, padding: '12px 14px' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: clr, letterSpacing: '-0.02em' }}>{val}</div>
                  <div style={{ fontSize: 12, color: clr, fontWeight: 500, opacity: 0.8 }}>{lbl}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Block 3 – Parent Portal */}
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }} viewport={{ once: true }}
            className="col-span-1"
            style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)', borderRadius: 32, padding: 'clamp(24px, 4vw, 32px)', position: 'relative', overflow: 'hidden', color: '#fff', minHeight: 200, boxShadow: '0 10px 30px -10px rgba(14, 165, 233, 0.4)' }}>
            <div style={{ position: 'absolute', top: -30, right: -30, width: 180, height: 180, background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} />
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.2)', marginBottom: 20, backdropFilter: 'blur(4px)' }}>
              <Smartphone size={22} color="#ffffff" strokeWidth={1.5} />
            </div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 600, color: '#ffffff', marginBottom: 8, letterSpacing: '-0.02em' }}>Parent Portal</h3>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 1.5, fontWeight: 400 }}>Parents view balances, pay securely, and download receipts from any device.</p>
            <div style={{ marginTop: 20, display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', borderRadius: 99, padding: '8px 16px', fontSize: 13, fontWeight: 500 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#6ee7b7', display: 'inline-block', boxShadow: '0 0 8px #6ee7b7' }} />
              Secure payments
            </div>
          </motion.div>

          {/* Block 4 – Reminders */}
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }} viewport={{ once: true }}
            className="col-span-1"
            style={{ background: '#ffffff', borderRadius: 32, padding: 'clamp(24px, 4vw, 32px)', border: '1px solid #f1f5f9', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.03)', minHeight: 200 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: 12, background: '#fffbeb', marginBottom: 20, border: '1px solid #fef3c7' }}>
              <Bell size={22} color="#d97706" strokeWidth={1.5} />
            </div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 600, color: '#0f172a', marginBottom: 8, letterSpacing: '-0.02em' }}>Smart Reminders</h3>
            <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.5, fontWeight: 400 }}>Automated SMS & email reminders dispatched before and after due dates.</p>
            <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[['3 days before due','📧 Email sent'],['Due date','📱 SMS sent']].map(([time, action]) => (
                <div key={time} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 500 }}>
                  <span style={{ color: '#94a3b8' }}>{time}</span><span style={{ color: '#059669' }}>{action}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Block 5 – Security */}
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }} viewport={{ once: true }}
            className="col-span-1"
            style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', borderRadius: 32, padding: 'clamp(24px, 4vw, 32px)', border: '1px solid #bbf7d0', minHeight: 200 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: 12, background: '#ffffff', marginBottom: 20, boxShadow: '0 2px 4px rgba(22,163,74,0.1)' }}>
              <ShieldCheck size={22} color="#16a34a" strokeWidth={1.5} />
            </div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 600, color: '#064e3b', marginBottom: 8, letterSpacing: '-0.02em' }}>Bank-Grade Security</h3>
            <p style={{ fontSize: 14, color: '#065f46', lineHeight: 1.5, fontWeight: 400, opacity: 0.9 }}>Stripe-powered PCI-compliant payments. Every transaction is encrypted end-to-end with instant digital receipts.</p>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

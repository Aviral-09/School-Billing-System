'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus } from 'lucide-react';

const faqs = [
  { q: 'How long does setup take?', a: 'Most schools are fully set up within a single day. Import your student roster via CSV, configure your fee structures, and you can send your first batch of invoices immediately.' },
  { q: 'Can parents pay without creating an account?', a: 'Yes. Parents receive a secure payment link via email or SMS and can complete payment without logging in. They can optionally create an account for a full history view.' },
  { q: 'Does it support multiple fee types?', a: 'Absolutely. You can configure tuition, transport, exam, library, sports, and custom activity fees — each with independent due dates and discount rules.' },
  { q: 'Is my school\'s data secure?', a: 'All data is stored encrypted at rest and in transit. Payments are processed via Stripe which is PCI-DSS Level 1 certified — the highest level of payment security.' },
  { q: 'Can I import existing student data?', a: 'Yes. We support CSV import for student records. Our template makes it easy to map existing spreadsheet columns to the system fields in minutes.' },
  { q: 'What happens if a parent doesn\'t pay on time?', a: 'The system automatically sends configurable reminder sequences (e.g., 3 days before, on due date, 3 days after). Administrators can also manually trigger reminders or view overdue reports.' },
];

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      viewport={{ once: true }}
      style={{ borderBottom: '1px solid #e2e8f0' }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '24px 0', background: 'none', border: 'none', cursor: 'pointer', gap: 20,
        }}
      >
        <span style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 600, color: open ? '#0ea5e9' : '#0f172a', textAlign: 'left', transition: 'color 0.2s ease', letterSpacing: '-0.01em' }}>{q}</span>
        <motion.div
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          style={{ width: 32, height: 32, borderRadius: '50%', background: open ? '#e0f2fe' : '#f8fafc', color: open ? '#0284c7' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: open ? '1px solid #bae6fd' : '1px solid #e2e8f0' }}
        >
          <Plus size={18} strokeWidth={2} />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <p style={{ paddingBottom: 24, fontSize: 16, color: '#475569', lineHeight: 1.7, fontWeight: 400 }}>{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function FAQ() {
  return (
    <section id="faq" className="py-16 md:py-24 px-6 md:px-8 relative overflow-hidden" style={{ background: '#ffffff' }}>
      <div style={{ position: 'absolute', top: 0, right: 0, width: 600, height: 600, background: 'radial-gradient(circle, rgba(147,197,253,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 800, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 56 }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 600, color: '#0f172a', letterSpacing: '-0.04em', marginBottom: 16 }}>
            Frequently asked questions
          </h2>
          <p style={{ fontSize: 18, color: '#64748b', lineHeight: 1.6, fontWeight: 400 }}>
            Everything you need to know before getting started.
          </p>
        </motion.div>

        <div>
          {faqs.map((faq, i) => <FAQItem key={i} q={faq.q} a={faq.a} index={i} />)}
        </div>
      </div>
    </section>
  );
}

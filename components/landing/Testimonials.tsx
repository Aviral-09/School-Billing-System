'use client';
import { motion } from 'motion/react';
import { Star } from 'lucide-react';

const testimonials = [
  {
    quote: "We cut invoice processing time from 3 days to under 10 minutes. The parent portal has been a game changer — no more phone calls about balances.",
    name: "Priya Sharma",
    role: "Finance Head, Delhi Public School",
    initials: "PS",
  },
  {
    quote: "The automated reminders alone recovered ₹4 lakhs in pending dues within the first month. The analytics dashboard gives us clarity we never had before.",
    name: "Rajesh Kumar",
    role: "Principal, Sunrise Academy, Pune",
    initials: "RK",
  },
  {
    quote: "Parents love paying from their phones and getting instant receipts. The staff spends less time on accounts and more time on what matters — students.",
    name: "Meena Iyer",
    role: "Administrator, Greenwood School",
    initials: "MI",
  },
  {
    quote: "Setup took less than a day. Importing student data, configuring fees, and sending the first batch of invoices was completely seamless.",
    name: "Arjun Nair",
    role: "IT Head, St. Xavier's High School",
    initials: "AN",
  },
];

export function Testimonials() {
  return (
    <section className="py-16 md:py-24 px-6 md:px-8 relative overflow-hidden" style={{ background: '#ffffff' }}>
      <div style={{ position: 'absolute', bottom: '-15%', left: '10%', width: 600, height: 600, background: 'radial-gradient(circle, rgba(147,197,253,0.1) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 'var(--page-max-width)', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 600, color: '#0f172a', letterSpacing: '-0.04em', marginBottom: 16 }}>
            Trusted by top schools
          </h2>
          <p style={{ fontSize: 18, color: '#64748b', lineHeight: 1.6, fontWeight: 400 }}>
            Real results from administrators and educators across the country.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true }}
              whileHover={{ y: -8, transition: { duration: 0.4, ease: "easeOut" } }}
              style={{
                background: '#ffffff',
                borderRadius: 24,
                padding: 'clamp(24px, 4vw, 36px)',
                border: '1px solid #f1f5f9',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                gap: 24,
                cursor: 'default',
              }}
            >
              {/* Stars */}
              <div style={{ display: 'flex', gap: 4 }}>
                {[...Array(5)].map((_, si) => (
                  <Star key={si} size={16} fill="#fbbf24" color="#fbbf24" />
                ))}
              </div>

              <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.7, flex: 1, fontWeight: 400 }}>
                "{t.quote}"
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#0284c7', fontSize: 14, fontWeight: 600, flexShrink: 0,
                  border: '1px solid #7dd3fc'
                }}>
                  {t.initials}
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#0f172a' }}>{t.name}</div>
                  <div style={{ fontSize: 13, color: '#64748b', fontWeight: 400 }}>{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

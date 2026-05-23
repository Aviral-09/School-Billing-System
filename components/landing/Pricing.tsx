'use client';
import { motion } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    price: '₹999',
    period: '/month',
    description: 'Perfect for small schools up to 200 students.',
    highlight: false,
    features: [
      'Up to 200 students',
      'Basic fee management',
      'Parent payment portal',
      'Email reminders',
      'Digital receipts',
      'Email support',
    ],
    cta: 'Get Started',
  },
  {
    name: 'Pro',
    price: '₹2,499',
    period: '/month',
    description: 'For growing schools that need powerful analytics.',
    highlight: true,
    badge: 'Most Popular',
    features: [
      'Up to 1,000 students',
      'Advanced fee structures',
      'Real-time analytics dashboard',
      'SMS + Email reminders',
      'Sibling discounts & scholarships',
      'Priority support',
    ],
    cta: 'Start Free Trial',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'Multi-branch schools with custom integrations.',
    highlight: false,
    features: [
      'Unlimited students',
      'Multi-branch management',
      'Custom fee categories',
      'API access & integrations',
      'Dedicated account manager',
      'SLA-backed support',
    ],
    cta: 'Contact Us',
    href: '#about',
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-16 md:py-24 px-6 md:px-8 relative overflow-hidden" style={{ background: '#f7f9fc' }}>
      <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 800, height: 600, background: 'radial-gradient(ellipse, rgba(147,197,253,0.15) 0%, transparent 65%)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 'var(--page-max-width)', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 600, color: '#0f172a', letterSpacing: '-0.04em', marginBottom: 16 }}>
            Simple, transparent pricing
          </h2>
          <p style={{ fontSize: 18, color: '#64748b', lineHeight: 1.6, fontWeight: 400 }}>
            No hidden fees. Cancel anytime.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, alignItems: 'start' }}>
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true }}
              whileHover={{ y: -8, transition: { duration: 0.4, ease: "easeOut" } }}
              style={{
                background: plan.highlight
                  ? 'linear-gradient(180deg, #0284c7 0%, #0ea5e9 100%)'
                  : '#ffffff',
                borderRadius: 32,
                padding: 'clamp(24px, 4vw, 40px)',
                border: plan.highlight ? '1px solid #38bdf8' : '1px solid #e2e8f0',
                boxShadow: plan.highlight
                  ? '0 20px 40px -10px rgba(14, 165, 233, 0.3)'
                  : '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'default',
              }}
            >
              {plan.highlight && (
                <div style={{ position: 'absolute', top: -50, right: -50, width: 250, height: 250, background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
              )}

              {plan.badge && (
                <div style={{ position: 'absolute', top: 24, right: 24, background: 'rgba(255,255,255,0.2)', color: '#ffffff', borderRadius: 99, padding: '4px 14px', fontSize: 12, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', backdropFilter: 'blur(8px)' }}>
                  {plan.badge}
                </div>
              )}

              <div style={{ marginBottom: 12, fontSize: 16, fontWeight: 600, color: plan.highlight ? 'rgba(255,255,255,0.9)' : '#64748b' }}>{plan.name}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 12 }}>
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: 48, fontWeight: 600, color: plan.highlight ? '#ffffff' : '#0f172a', letterSpacing: '-0.04em' }}>{plan.price}</span>
                <span style={{ fontSize: 15, color: plan.highlight ? 'rgba(255,255,255,0.7)' : '#94a3b8', fontWeight: 500 }}>{plan.period}</span>
              </div>
              <p style={{ fontSize: 15, color: plan.highlight ? 'rgba(255,255,255,0.8)' : '#64748b', marginBottom: 32, lineHeight: 1.6, minHeight: 48, fontWeight: 400 }}>{plan.description}</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 40 }}>
                {plan.features.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 15 }}>
                    <CheckCircle2 size={20} strokeWidth={2} color={plan.highlight ? '#bae6fd' : '#0ea5e9'} style={{ flexShrink: 0 }} />
                    <span style={{ color: plan.highlight ? '#ffffff' : '#475569', fontWeight: 500 }}>{f}</span>
                  </div>
                ))}
              </div>

              <a href={plan.href || "/login"} style={{
                display: 'block', textAlign: 'center',
                padding: '16px 24px', borderRadius: 16,
                fontSize: 16, fontWeight: 600, textDecoration: 'none',
                background: plan.highlight ? '#ffffff' : '#f1f5f9',
                color: plan.highlight ? '#0369a1' : '#0f172a',
                transition: 'all 0.2s ease',
                boxShadow: plan.highlight ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none',
              }}>
                {plan.cta}
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

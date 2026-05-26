'use client'
import React, { useState } from 'react'
import { useMediaQuery } from '@/components/use-media-query'
import {
  AcademicCapIcon,
  CurrencyRupeeIcon,
  CheckCircleIcon,
  ClockIcon,
  UserGroupIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  BellIcon,
  MagnifyingGlassIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline'

/* ─────────── Mock Data ─────────── */
const MONTHLY_FEES = [18, 32, 24, 38, 45, 54, 70, 58, 42, 35, 28, 15]
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const CUR_MONTH = 6 // July highlighted

const CLASS_COLLECTION = [
  { label: 'Class XII', pct: 88 },
  { label: 'Class XI',  pct: 74 },
  { label: 'Class X',   pct: 61 },
  { label: 'Class IX',  pct: 45 },
  { label: 'Class VIII',pct: 32 },
]

const RECENT_TXN = [
  { name: 'Priya Sharma',   cls: 'Class XII', amount: '₹18,500', status: 'Paid',    time: '2 min ago' },
  { name: 'Rahul Verma',    cls: 'Class X',   amount: '₹14,200', status: 'Paid',    time: '18 min ago' },
  { name: 'Ananya Singh',   cls: 'Class XI',  amount: '₹16,800', status: 'Pending', time: '1 hr ago' },
  { name: 'Dev Agarwal',    cls: 'Class IX',  amount: '₹12,500', status: 'Paid',    time: '3 hr ago' },
]

/* ─────────── Tiny bar chart ─────────── */
function MiniBarChart() {
  const max = Math.max(...MONTHLY_FEES)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 80, padding: '0 4px' }}>
      {MONTHLY_FEES.map((v, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <div
            title={`${MONTHS[i]}: ₹${v}k`}
            style={{
              width: '100%',
              height: `${(v / max) * 72}px`,
              borderRadius: '4px 4px 0 0',
              background: i === CUR_MONTH
                ? 'linear-gradient(to top, #5757f8, #8080fb)'
                : i < CUR_MONTH ? '#e8e8ff' : '#f0f0f0',
              transition: 'height 0.6s ease',
              cursor: 'pointer',
              position: 'relative',
            }}
          />
        </div>
      ))}
    </div>
  )
}

/* ─────────── Progress bar ─────────── */
function ProgressBar({ pct, color = '#5757f8' }: { pct: number; color?: string }) {
  return (
    <div style={{ background: '#f0f0f0', borderRadius: 99, height: 6, overflow: 'hidden', flex: 1 }}>
      <div
        style={{
          width: `${pct}%`,
          height: '100%',
          background: color,
          borderRadius: 99,
          transition: 'width 1s ease',
        }}
      />
    </div>
  )
}

/* ─────────── Status badge ─────────── */
function StatusBadge({ status }: { status: string }) {
  const isPaid = status === 'Paid'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      padding: '2px 8px', borderRadius: 99, fontSize: 10, fontWeight: 700,
      background: isPaid ? '#f0fdf4' : '#fffbeb',
      color: isPaid ? '#16a34a' : '#d97706',
    }}>
      {isPaid
        ? <CheckCircleIcon style={{ width: 10, height: 10 }} />
        : <ClockIcon style={{ width: 10, height: 10 }} />}
      {status}
    </span>
  )
}

/* ─────────── Dashboard View ─────────── */
function DashboardView({ isMobile }: { isMobile: boolean }) {
  return (
    <>
      {/* Welcome banner */}
      <div style={{
        background: 'linear-gradient(135deg, #5757f8 0%, #7b7bfa 60%, #9090fb 100%)',
        borderRadius: 12, padding: '14px 18px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', marginBottom: 2 }}>Good Morning, Admin ✨</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.75)' }}>Snapshot of fee collection & pending dues</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.35)', color: '#fff', borderRadius: 8, padding: '5px 10px', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>This Month ▾</button>
          <button style={{ background: '#fff', color: '#5757f8', borderRadius: 8, padding: '5px 10px', fontSize: 10, fontWeight: 700, cursor: 'pointer', border: 'none' }}>↑ Export</button>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: 10 }}>
        {[
          { icon: CurrencyRupeeIcon, iconBg: '#ededfd', iconColor: '#5757f8', label: 'Total Collected', value: '₹24.8L', sub: 'This academic year', trend: +12 },
          { icon: CheckCircleIcon,   iconBg: '#f0fdf4', iconColor: '#16a34a', label: 'Monthly Income',  value: '₹3.2L',  sub: 'May 2026',            trend: +8  },
          { icon: ClockIcon,         iconBg: '#fffbeb', iconColor: '#d97706', label: 'Pending Dues',    value: '₹1.4L',  sub: '47 students',          trend: -5  },
          { icon: UserGroupIcon,     iconBg: '#fef2f2', iconColor: '#dc2626', label: 'Paid Students',   value: '428',    sub: 'of 485 total',          trend: +4  },
        ].map(({ icon: Icon, iconBg, iconColor, label, value, sub, trend }) => (
          <div key={label} style={{ background: '#fff', borderRadius: 10, padding: '10px 12px', border: '1px solid #f0f0f4', transition: 'box-shadow 0.15s' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ background: iconBg, borderRadius: 7, padding: 6 }}>
                <Icon style={{ width: 13, height: 13, color: iconColor }} />
              </div>
              <span style={{ fontSize: 9, fontWeight: 700, color: trend > 0 ? '#16a34a' : '#dc2626', display: 'flex', alignItems: 'center', gap: 1 }}>
                {trend > 0
                  ? <ArrowUpIcon style={{ width: 9, height: 9 }} />
                  : <ArrowDownIcon style={{ width: 9, height: 9 }} />}
                {Math.abs(trend)}%
              </span>
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#202020', lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: 9, color: '#aaa', marginTop: 3, fontWeight: 500 }}>{sub}</div>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#888', marginTop: 5, letterSpacing: '0.02em' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.4fr 1fr', gap: 10 }}>
        {/* Bar chart */}
        <div style={{ background: '#fff', borderRadius: 10, padding: '12px 14px', border: '1px solid #f0f0f4' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#888' }}>Fee Collection Overview</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#202020', lineHeight: 1.2 }}>₹3,24,500</div>
              <div style={{ fontSize: 9, color: '#bbb', marginTop: 1 }}>● Total Fees  ○ Collected</div>
            </div>
            <button style={{ background: '#f5f5f5', border: '1px solid #ececec', borderRadius: 7, padding: '4px 8px', fontSize: 9, fontWeight: 700, color: '#888', cursor: 'pointer' }}>This Year ▾</button>
          </div>
          <MiniBarChart />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            {MONTHS.map(m => (
              <span key={m} style={{ fontSize: 7, color: '#ccc', fontWeight: 600, flex: 1, textAlign: 'center' }}>{m}</span>
            ))}
          </div>
        </div>

        {/* Progress / class-wise */}
        <div style={{ background: '#fff', borderRadius: 10, padding: '12px 14px', border: '1px solid #f0f0f4' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#888', marginBottom: 6 }}>Class-wise Collection</div>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#202020', marginBottom: 2 }}>485 <span style={{ fontSize: 10, color: '#16a34a', fontWeight: 700 }}>↑ 6.2%</span></div>
          <div style={{ fontSize: 9, color: '#bbb', marginBottom: 10 }}>Total students enrolled</div>
          {CLASS_COLLECTION.map(({ label, pct }) => (
            <div key={label} style={{ marginBottom: 7 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ fontSize: 9, fontWeight: 600, color: '#888' }}>{label}</span>
                <span style={{ fontSize: 9, fontWeight: 800, color: '#5757f8' }}>{pct}%</span>
              </div>
              <ProgressBar pct={pct} />
            </div>
          ))}
        </div>
      </div>

      {/* Recent transactions */}
      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #f0f0f4', overflow: 'hidden' }}>
        <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f7f5fd' }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#202020' }}>Recent Payments</div>
          <div style={{ display: 'flex', gap: 6 }}>
            <div style={{ background: '#f5f5f5', borderRadius: 6, padding: '3px 8px', display: 'flex', alignItems: 'center', gap: 4, fontSize: 9, color: '#999' }}>
              <MagnifyingGlassIcon style={{ width: 9, height: 9 }} /> Search students...
            </div>
            <button style={{ background: '#f5f5f5', border: '1px solid #ececec', borderRadius: 6, padding: '3px 8px', fontSize: 9, color: '#888', cursor: 'pointer', fontWeight: 700 }}>Sort ▾</button>
          </div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
          <thead>
            <tr style={{ background: '#f9f9fb' }}>
              {['Student', 'Class', 'Amount', 'Status', 'Time'].map(h => (
                <th key={h} style={{ padding: '6px 14px', textAlign: 'left', fontSize: 9, fontWeight: 700, color: '#bbb', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RECENT_TXN.map((txn, i) => (
              <tr key={i} style={{ borderTop: '1px solid #f7f5fd' }}>
                <td style={{ padding: '7px 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 22, height: 22, background: `hsl(${i * 60 + 220},70%,88%)`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, color: `hsl(${i * 60 + 220},60%,40%)`, flexShrink: 0 }}>
                    {txn.name.charAt(0)}
                  </div>
                  <span style={{ fontWeight: 600, color: '#333' }}>{txn.name}</span>
                </td>
                <td style={{ padding: '7px 14px', color: '#888', fontWeight: 500 }}>{txn.cls}</td>
                <td style={{ padding: '7px 14px', fontWeight: 800, color: '#202020' }}>{txn.amount}</td>
                <td style={{ padding: '7px 14px' }}><StatusBadge status={txn.status} /></td>
                <td style={{ padding: '7px 14px', color: '#bbb', fontSize: 9 }}>{txn.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

/* ─────────── Students View ─────────── */
function StudentsView() {
  const students = [
    { name: 'Arjun Mehta', class: 'Class XII-A', roll: '1201', status: 'Active' },
    { name: 'Sana Khan', class: 'Class XI-B', roll: '1105', status: 'Active' },
    { name: 'Rohan Gupta', class: 'Class X-A', roll: '1023', status: 'Inactive' },
    { name: 'Lisa Ray', class: 'Class IX-C', roll: '0912', status: 'Active' },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#202020' }}>Student Directory</div>
      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #f0f0f4', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
          <thead>
            <tr style={{ background: '#f9f9fb' }}>
              {['Name', 'Class', 'Roll No', 'Status'].map(h => (
                <th key={h} style={{ padding: '6px 14px', textAlign: 'left', fontSize: 9, fontWeight: 700, color: '#bbb', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.map((s, i) => (
              <tr key={i} style={{ borderTop: '1px solid #f7f5fd' }}>
                <td style={{ padding: '7px 14px', fontWeight: 600, color: '#333' }}>{s.name}</td>
                <td style={{ padding: '7px 14px', color: '#888' }}>{s.class}</td>
                <td style={{ padding: '7px 14px', color: '#bbb' }}>{s.roll}</td>
                <td style={{ padding: '7px 14px' }}>
                  <span style={{
                    padding: '2px 6px', borderRadius: 99, fontSize: 8, fontWeight: 700,
                    background: s.status === 'Active' ? '#f0fdf4' : '#fef2f2',
                    color: s.status === 'Active' ? '#16a34a' : '#dc2626',
                  }}>{s.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ─────────── Payments View ─────────── */
function PaymentsView() {
  const payments = [
    { id: 'PAY-101', student: 'Priya Sharma', amount: '₹18,500', method: 'Stripe', status: 'Success' },
    { id: 'PAY-102', student: 'Rahul Verma', amount: '₹14,200', method: 'Cash', status: 'Success' },
    { id: 'PAY-103', student: 'Ananya Singh', amount: '₹16,800', method: 'UPI', status: 'Pending' },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#202020' }}>Payment History</div>
      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #f0f0f4', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
          <thead>
            <tr style={{ background: '#f9f9fb' }}>
              {['Txn ID', 'Student', 'Amount', 'Method', 'Status'].map(h => (
                <th key={h} style={{ padding: '6px 14px', textAlign: 'left', fontSize: 9, fontWeight: 700, color: '#bbb', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {payments.map((p, i) => (
              <tr key={i} style={{ borderTop: '1px solid #f7f5fd' }}>
                <td style={{ padding: '7px 14px', color: '#bbb' }}>{p.id}</td>
                <td style={{ padding: '7px 14px', fontWeight: 600, color: '#333' }}>{p.student}</td>
                <td style={{ padding: '7px 14px', fontWeight: 800, color: '#202020' }}>{p.amount}</td>
                <td style={{ padding: '7px 14px', color: '#888' }}>{p.method}</td>
                <td style={{ padding: '7px 14px' }}>
                  <span style={{
                    padding: '2px 6px', borderRadius: 99, fontSize: 8, fontWeight: 700,
                    background: p.status === 'Success' ? '#f0fdf4' : '#fffbeb',
                    color: p.status === 'Success' ? '#16a34a' : '#d97706',
                  }}>{p.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ─────────── Receipts View ─────────── */
function ReceiptsView() {
  const receipts = [
    { id: 'RCP-2026-001', student: 'Priya Sharma', date: '17 May 2026' },
    { id: 'RCP-2026-002', student: 'Rahul Verma', date: '16 May 2026' },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#202020' }}>Generated Receipts</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        {receipts.map((r, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: 10, padding: 12, border: '1px solid #f0f0f4', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#202020' }}>{r.student}</div>
            <div style={{ fontSize: 9, color: '#bbb' }}>ID: {r.id}</div>
            <div style={{ fontSize: 9, color: '#aaa' }}>Date: {r.date}</div>
            <button style={{ background: '#ededfd', color: '#5757f8', border: 'none', borderRadius: 6, padding: '4px 8px', fontSize: 9, fontWeight: 700, cursor: 'pointer', marginTop: 4 }}>View Receipt</button>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─────────── Main component ─────────── */
export function DashboardPreview() {
  const [activeNav, setActiveNav] = useState('Dashboard')
  const isMobile = useMediaQuery('(max-width: 768px)')
  const navItems = ['Dashboard', 'Students', 'Payments', 'Receipts']

  return (
    <div style={{
      width: '100%',
      background: '#f7f9fc',
      borderRadius: 16,
      border: '1px solid #e8e8f0',
      boxShadow: '0 24px 80px rgba(87,87,248,0.12), 0 4px 24px rgba(0,0,0,0.06)',
      overflow: 'hidden',
      fontFamily: "'Inter', sans-serif",
      userSelect: 'none',
    }}>

      {/* ── Top Bar ── */}
      <div style={{
        background: '#fff',
        borderBottom: '1px solid #f0f0f4',
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <div style={{ background: '#5757f8', borderRadius: 8, padding: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <AcademicCapIcon style={{ width: 14, height: 14, color: '#fff' }} />
          </div>
          <span style={{ fontWeight: 800, fontSize: 13, color: '#202020', whiteSpace: 'nowrap' }}>SDS <span style={{ color: '#5757f8' }}>Admin</span></span>
        </div>

        {/* Nav - Only show on mobile to avoid repetition with sidebar on desktop */}
        {isMobile ? (
          <nav style={{ display: 'flex', gap: 2, overflowX: 'auto', paddingBottom: 4 }}>
            {navItems.map(item => (
              <button key={item} onClick={() => setActiveNav(item)} style={{
                padding: '4px 8px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 10, fontWeight: 600,
                background: activeNav === item ? '#ededfd' : 'transparent',
                color: activeNav === item ? '#5757f8' : '#888',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
              }}>{item}</button>
            ))}
          </nav>
        ) : (
          <div style={{ fontSize: 13, fontWeight: 700, color: '#202020' }}>
            {activeNav}
          </div>
        )}

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <div style={{ background: '#f5f5f5', border: '1px solid #ececec', borderRadius: 8, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: '#999' }}>
            <MagnifyingGlassIcon style={{ width: 10, height: 10 }} /> Search...
          </div>
          <div style={{ position: 'relative' }}>
            <BellIcon style={{ width: 16, height: 16, color: '#888' }} />
            <div style={{ width: 5, height: 5, background: '#5757f8', borderRadius: '50%', position: 'absolute', top: 0, right: 0 }} />
          </div>
          <div style={{ width: 22, height: 22, background: 'linear-gradient(135deg,#5757f8,#9090fb)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, color: '#fff' }}>A</div>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '150px 1fr', minHeight: 420 }}>

        {/* Sidebar - Hidden on mobile */}
        {!isMobile && (
          <aside style={{ background: '#fff', borderRight: '1px solid #f0f0f4', padding: '14px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#bbb', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 8px', marginBottom: 4 }}>Menu</div>
            {[
              { icon: Squares2X2Icon, label: 'Dashboard' },
              { icon: UserGroupIcon,   label: 'Students' },
              { icon: CurrencyRupeeIcon, label: 'Payments' },
              { icon: CheckCircleIcon, label: 'Receipts' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} onClick={() => setActiveNav(label)} style={{
                display: 'flex', alignItems: 'center', gap: 7, padding: '7px 10px', borderRadius: 8, cursor: 'pointer',
                background: activeNav === label ? '#ededfd' : 'transparent',
                color: activeNav === label ? '#5757f8' : '#888',
                fontSize: 11, fontWeight: 600,
                transition: 'background 0.12s',
              }}>
                <Icon style={{ width: 13, height: 13, flexShrink: 0 }} />
                {label}
              </div>
            ))}

            {/* CTA */}
            <div style={{ marginTop: 'auto', background: 'linear-gradient(135deg,#5757f8,#8080fb)', borderRadius: 10, padding: '12px 10px', color: '#fff' }}>
              <div style={{ fontSize: 10, fontWeight: 800, marginBottom: 2 }}>Academic Year</div>
              <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.9 }}>2025 – 2026</div>
              <div style={{ fontSize: 9, opacity: 0.7, marginTop: 4 }}>Term 2 Active</div>
            </div>
          </aside>
        )}

        {/* Main content */}
        <main style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto' }}>

          {activeNav === 'Dashboard' && <DashboardView isMobile={isMobile} />}
          {activeNav === 'Students' && <StudentsView />}
          {activeNav === 'Payments' && <PaymentsView />}
          {activeNav === 'Receipts' && <ReceiptsView />}

        </main>
      </div>
    </div>
  )
}

# 🏫 EduBill: Signature Monochromatic Billing System

EduBill is a high-performance, **premium-tier Full Stack Web Application** designed for modern educational institutes. It features a sophisticated **Signature Monochromatic Theme** with vibrant yellowish accents, offering a unique and professional user experience for managing student fees, automated invoicing, and real-time payments.

Built with **Next.js 14**, **Firebase (Firestore & Auth)**, and **Stripe Integration**, EduBill is engineered for security, speed, and visual excellence.

![Status](https://img.shields.io/badge/Status-Production%20Ready-success)
![Theme](https://img.shields.io/badge/Theme-Premium%20Monochromatic-yellow)
![Security](https://img.shields.io/badge/Security-Firebase%20Hardened-blue)

---

## 🌟 Key Innovations & Additions

### 🎨 Signature Visual Identity
- **Monochromatic Excellence**: A strictly curated black and white color palette for maximum readability and focus.
- **Vibrant Yellow Accents**: Strategic use of Yellow-500 for borders, active states, and call-to-actions, creating a high-contrast premium feel.
- **Glassmorphism & Micro-animations**: Advanced CSS-backdrop filters and shake animations for intuitive user feedback.

### 🧾 Multi-Channel Receipting
- **Instant Email Delivery**: Integrated **Nodemailer** for automatic receipt dispatch. After every successful payment, parents receive a beautifully formatted HTML email with an attached PDF.
- **High-Fidelity PDF Generation**: Powered by **jsPDF** and **html2canvas**, allowing students to download pixel-perfect receipts directly from their dashboard.
- **Server-Side Rendering**: Background PDF generation for email attachments, ensuring receipts are generated even if the user closes their browser.

### 🔐 Hardened Security & Idempotency
- **Webhook Deduplication**: Implemented a robust "Deduplication Layer" using a `stripeEvents` collection. This prevents duplicate processing of the same Stripe event, ensuring financial data integrity.
- **Full Lifecycle Tracking**: Payments now track through **Pending → Success → Failed → Cancelled** states for a complete audit trail.
- **Multi-Factor Authentication**: Native support for **Email + Password** and **Google OAuth**, with role-based redirection logic.

---

## 🚀 Features

### 👑 Admin Power Suite
- **Student Account Autopilot**: Admins can now create student accounts, set initial passwords, and instantiate profile data (Class, Section, Fees) in a single unified workflow.
- **Unified Analytics**: Monitor Total Revenue, Student Enrollment, and Pending Collections in real-time.
- **Manual Payment Override**: Record cash payments and generate digital receipts manually with the same professional branding.

### 🎓 Student Experience
- **Personalized Billing Dashboards**: Detailed breakdown of Tuition, Transport, and Exam fees with real-time payment status.
- **One-Click Payments**: Securely handle outstanding fees using Stripe's premium checkout experience.
- **Digital Receipt Archive**: A permanent, downloadable history of every transaction ever made.

---

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router, Server Components)
- **Styling**: Tailwind CSS (Custom Monochromatic Theme)
- **Database**: Cloud Firestore (with enhanced security rules)
- **Authentication**: Firebase Auth (Email/Pass + Google)
- **Payments**: Stripe API & Webhooks
- **Email Engine**: Nodemailer with HTML Templates
- **PDF Engine**: jsPDF & html2canvas

---

## 📂 Project Structure

```bash
/app
  /admin        # Student management & global financial logs
  /student      # Personal billing & payment history
  /login        # Hybrid Auth (Email & Google)
  /api/webhook  # Secured Stripe event handler (Idempotent)
  /payment      # Stripe Checkout orchestration
  /receipt      # Dynamic UI & PDF receipt generator
/lib            # Email, PDF (Server/Client), and Firebase utilities
/types          # Comprehensive TypeScript definitions
```

---

## 🚀 deployment & Installation

### 1. Environment Configuration
Create a `.env.local` file with the following keys:
```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY="..."
NEXT_PUBLIC_FIREBASE_PROJECT_ID="..."

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email (Nodemailer)
EMAIL_USER="your-institute-email@gmail.com"
EMAIL_PASS="your-app-specific-password"
```

### 2. Execution
```bash
npm install
npm run dev
```

---

## 🧪 Testing the Premium Flow
1. **Login**: Use the new Email/Password form or Google login.
2. **Admin**: Create a new student account to test the multi-doc instantiation.
3. **Payment**: Process a test Stripe transaction.
4. **Automation**: Check the console for `stripeEvents` deduplication and verify the **Email Receipt** delivered with the PDF attachment.
5. **Download**: Use the **"Download PDF"** button on the receipt page to verify client-side generation.

---

## 🌑 Aesthetic Philosophy
EduBill avoids generic "safe" designs. It embraces a high-contrast, dark-mode-first approach that conveys authority, technical precision, and modern excellence. Every border, animation, and transition is designed to create a "WOW" factor for both administrators and students.

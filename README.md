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

### 🧪 Zero-Dependency Local Mock Database
- **Local Storage Firebase Engine**: The application includes a custom Mock Firebase (`mock-firebase.ts`) that intercepts and simulates Firebase Authentication and Firestore DB interactions inside the browser's `localStorage`.
- **Dynamic Student Auth & Name Resolution**: Student credentials registered via the Admin Suite automatically populate the local user database, resolving the student's full name and unique `uid` rather than resorting to hardcoded accounts.
- **Unique ID Generation & List Stability**: Newly created students dynamically receive unique Student IDs (`ST-xxxxx`) mapped to their academic fees, and lists use robust fallback key parameters (`student.studentId || student.userId`) to guarantee React UI stability.

---

## 🚀 Features

### 👑 Admin Power Suite
- **Class-wise Fee Structure Management**: Add, update, duplicate, and delete custom fee structures with enable/disable switches for Admission, Tuition, Exam, Library, Computer, Transport, Sports, and Miscellaneous fee components. Prevents duplicates for class + session configurations.
- **Class Management & Bulk Operations**: Live enrollment and collection targets grouped by class. Supports bulk reassignment/copying of fee structures to all students in a class for a specific academic session with safety confirmation checks.
- **Student Account Autopilot**: Admins can create student accounts, assign them to academic sessions and classes, which automatically links the correct fee structures and sets total payable amounts.
- **Unified Analytics**: Monitor Total Revenue, Student Enrollment, and Pending Collections in real-time, calculated directly from granular student-level fee structures.
- **Manual Payment Override**: Record cash payments and generate digital receipts manually with the same professional branding.

### 🎓 Student Experience
- **Personalized Billing Dashboards**: Dynamic itemized breakdown of Tuition, Transport, Exam, and custom fees matching the student's assigned `feeStructure`.
- **One-Click Payments**: Securely handle outstanding fees using Stripe's premium checkout experience, automatically referencing the student's own payable fee balance.
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

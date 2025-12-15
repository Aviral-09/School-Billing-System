# 🏫 School Billing System

A rigorous, production-ready Full Stack Web Application for managing school fees, students, and real-time payments.
Built with **Next.js 14**, **Firebase (Auth & Firestore)**, and **Stripe**.

![Status](https://img.shields.io/badge/Status-Production%20Ready-success)
![Stack](https://img.shields.io/badge/Stack-Next.js%20%7C%20Firebase%20%7C%20Stripe-blue)

## 🌟 Features

### 🔐 Role-Based Access Control (RBAC)
- **Admin**:
  - View global Dashboards (Revenue, Total Students, Pending Payments).
  - Manage Student records.
  - Monitor real-time payment status.
- **Student**:
  - View personal fee structure (Tuition, Transport, Exam fees).
  - View payment history.
  - **Pay Online** via Stripe.

### ⚡ Real-Time Architecture
- **Instant Updates**: Using Firestore `onSnapshot`, user dashboards update immediately after a payment is made without page refreshes.
- **Secure Verification**: Server-side API verification of Stripe Checkout sessions to prevent fraud.

### 🎨 UI/UX
- **Modern Design**: Built with Tailwind CSS and Headless UI.
- **Responsive**: Fully functional on Mobile and Desktop.
- **Loading States**: Professional skeletons and loading indicators for all async actions.

---

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router, TypeScript)
- **Styling**: Tailwind CSS
- **Auth**: Firebase Google Authentication
- **Database**: Cloud Firestore (NoSQL)
- **Payments**: Stripe Checkout & Webhooks (Simulated via API verification)
- **Icons**: Heroicons

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/school-billing-system.git
cd school-billing-system
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory and add your keys:

```env
# Firebase (Get these from Firebase Console -> Project Settings)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# Stripe (Get these from Stripe Dashboard -> Developers -> API Keys)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

### 4. Database Seeding (First Run Only)
To create the first **Admin** and **Student** accounts without manually data-entering into Firestore:
1. Run the app: `npm run dev`
2. Go to: `http://localhost:3000/seed`
3. Click "Login & Make Me Admin".
4. (Optional) In an Incognito window, go to `/seed` again and "Make Me Student".
5. **Security Warning**: Delete `app/seed/page.tsx` before deploying to production.

### 5. Run Development Server
```bash
npm run dev
```
Visit `http://localhost:3000`.

---

## 📂 Project Structure

```bash
/app
  /admin        # Protected Admin Routes
  /student      # Protected Student Routes
  /login        # Authentication Entry
  /api          # Next.js API Routes (Stripe)
  /payment      # Payment Flow Pages
/components     # Reusable UI (Navbar, Sidebar, Cards)
/context        # Global Auth State (React Context)
/lib            # Firebase & Stripe Utility configurations
/types          # TypeScript Interface Definitions
```

## 🧪 Testing the Payment Flow
1. Log in as a **Student**.
2. Go to Dashboard. You will see "Pending Due".
3. Click **"Pay Now"**.
4. You will be redirected to Stripe.
5. Use Test Card: `4242 4242 4242 4242` (Date: Any future, CVC: Any).
6. Upon success, you are redirected back to the app.
7. Verify that "Pending Due" becomes "Total Paid" instantly.

---

## 🔒 Security Best Practices Implemented
- **Environment Variables**: API keys are never exposed in code.
- **Server-Side Verification**: Payments are verified by the server (`/api/verify_payment`) before updating the database.
- **Route Protection**: Custom Hooks (`useAuth`) and robust routing logic prevent unauthorized access.

export type UserRole = 'admin' | 'student';

export interface UserProfile {
    uid: string;
    name: string;
    email: string;
    role: UserRole;
}

export interface StudentProfile {
    studentId?: string; // Kept for legacy compatibility
    userId: string;
    name: string;
    email: string;
    class: string;
    section?: string;
    transportFee?: number;
    parentEmail?: string; // Kept for legacy compatibility
}

export interface FeeStructure {
    className: string;
    tuitionFee: number;
    transportFee: number;
    examFee: number;
    totalFee: number;
}

export interface Payment {
    paymentId: string;
    studentId: string;
    userId: string;
    amount: number;
    paymentStatus: 'pending' | 'success' | 'failed' | 'cancelled';
    stripeSessionId: string;
    createdAt: number;
    updatedAt: number;
}

export interface Receipt {
    receiptId: string;
    receiptNumber: string;
    studentId: string;
    userId: string;
    studentName: string;
    class: string;
    feeType: string;
    amountPaid: number;
    paymentMode: string;
    transactionId: string;
    paymentStatus: string;
    paidAt: number;
    generatedBy: string;
}

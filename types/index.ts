export type UserRole = 'admin' | 'student';

export interface UserProfile {
    uid: string;
    name: string;
    email: string;
    role: UserRole;
}

export interface StudentProfile {
    studentId: string; 
    name: string;
    class: string;
    parentEmail: string;
    userId: string; 
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
    amount: number;
    status: 'pending' | 'paid';
    stripeSessionId: string;
    createdAt: number; 
}

export interface Receipt {
    receiptId: string; 
    receiptNumber: string;
    studentId: string;
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

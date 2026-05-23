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
    feeStructure?: FeeStructure;
    totalPayable?: number;
    session?: string;
}

export interface FeeStructure {
    id?: string;
    className: string;
    session: string;
    admissionFee: number;
    tuitionFee: number;
    examFee: number;
    libraryFee: number;
    computerFee: number;
    transportFee: number;
    sportsFee: number;
    miscFee: number;
    totalFee: number;
    feeType: 'monthly' | 'quarterly' | 'yearly' | 'one-time';
    enabledComponents: {
        admissionFee: boolean;
        tuitionFee: boolean;
        examFee: boolean;
        libraryFee: boolean;
        computerFee: boolean;
        transportFee: boolean;
        sportsFee: boolean;
        miscFee: boolean;
    };
    createdAt?: number;
    updatedAt?: number;
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

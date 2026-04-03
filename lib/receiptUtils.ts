
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, getDoc } from 'firebase/firestore';
import { Receipt } from '@/types';
import { SCHOOL_CONFIG } from '@/lib/schoolConfig';


const generateReceiptNumber = (): string => {
    const year = new Date().getFullYear();
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${SCHOOL_CONFIG.shortName}-${year}-${timestamp}-${random}`;
};


export const createReceipt = async (
    paymentData: {
        amount: number;
        paymentId: string;
        method: string;
        status: string;
        transactionId: string
    },
    studentId: string,
    generatedBy: string = 'System'
): Promise<{ id: string, receipt: Receipt, student: any }> => {
    try {

        const studentRef = doc(db, 'students', studentId);
        const studentSnap = await getDoc(studentRef);

        if (!studentSnap.exists()) {
            throw new Error(`Student ${studentId} not found`);
        }

        const studentData = studentSnap.data();
        const userId = studentData.userId;


        const receiptNumber = generateReceiptNumber();
        const timestamp = Date.now();


        const receipt: Receipt = {
            receiptId: `RCP-${timestamp}`,
            receiptNumber,
            studentId: studentId,
            userId: userId,
            studentName: studentData.name || 'Unknown',
            class: studentData.class || 'Unknown',
            feeType: 'Tuition/Annual Fee',
            amountPaid: paymentData.amount,
            paymentMode: paymentData.method,
            transactionId: paymentData.transactionId,
            paymentStatus: paymentData.status,
            paidAt: timestamp,
            generatedBy: generatedBy
        };


        const docRef = await addDoc(collection(db, 'receipts'), receipt);
        return { id: docRef.id, receipt, student: studentData };
    } catch (error) {
        console.error("Error creating receipt:", error);
        throw error;
    }
};

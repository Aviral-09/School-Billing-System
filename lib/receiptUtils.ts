
import { db } from '@/lib/firebase';
import { collection, addDoc, query, orderBy, limit, getDocs, doc, getDoc } from 'firebase/firestore';
import { Receipt } from '@/types';


const generateReceiptNumber = async (): Promise<string> => {
    const year = new Date().getFullYear();
    const prefix = `SBS-${year}`;

    
    
    
    try {
        const q = query(
            collection(db, 'receipts'),
            orderBy('createdAt', 'desc'),
            limit(1)
        );
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            const lastReceipt = snapshot.docs[0].data() as Receipt;
            const lastNumber = lastReceipt.receiptNumber;
            
            const parts = lastNumber.split('-');
            if (parts.length === 3 && parts[1] === year.toString()) {
                const sequence = parseInt(parts[2], 10);
                if (!isNaN(sequence)) {
                    return `${prefix}-${String(sequence + 1).padStart(4, '0')}`;
                }
            }
        }
    } catch (e) {
        console.warn("Could not fetch last receipt number, starting fresh sequence.", e);
    }

    return `${prefix}-0001`;
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
): Promise<string> => {
    try {
        
        const studentRef = doc(db, 'students', studentId);
        const studentSnap = await getDoc(studentRef);

        if (!studentSnap.exists()) {
            throw new Error(`Student ${studentId} not found`);
        }

        const studentData = studentSnap.data();

        
        const receiptNumber = await generateReceiptNumber();
        const timestamp = Date.now();

        
        const receipt: Receipt = {
            receiptId: `RCP-${timestamp}`,
            receiptNumber,
            studentId: studentId,
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
        return docRef.id;
    } catch (error) {
        console.error("Error creating receipt:", error);
        throw error;
    }
};

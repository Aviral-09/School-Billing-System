import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { createReceipt } from '@/lib/receiptUtils';
import { generateServerReceiptPDF } from '@/lib/pdf_server';
import { sendReceiptEmail } from '@/lib/email';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    // apiVersion: '2025-01-27.acacia',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
    const payload = await req.text();
    const sig = req.headers.get('stripe-signature');

    let event: Stripe.Event;

    try {
        if (!sig || !endpointSecret) {
            console.error('Webhook Error: Missing signature or endpoint secret');
            return NextResponse.json({ error: 'Missing signature or endpoint secret' }, { status: 400 });
        }
        event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
    } catch (err: unknown) {
        const error = err as Error;
        console.error(`Webhook Error Verification Failed: ${error.message}`);
        return NextResponse.json({ error: `Webhook Error: ${error.message}` }, { status: 400 });
    }

    // Idempotency: Check if we've already processed this event
    try {
        const eventRef = doc(db, 'stripeEvents', event.id);
        const eventSnap = await getDoc(eventRef);

        if (eventSnap.exists()) {
            console.log(`Webhook Event ${event.id} already processed. Skipping.`);
            return NextResponse.json({ received: true, duplication: true });
        }

        console.log(`Received Webhook Event: ${event.type} (${event.id})`);

        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                if (session.payment_status === 'paid') {
                    await handlePaymentStatus(session.id, 'success');
                } else {
                    await handlePaymentStatus(session.id, 'failed');
                }
                break;
            }
            case 'checkout.session.expired': {
                const session = event.data.object as Stripe.Checkout.Session;
                await handlePaymentStatus(session.id, 'cancelled');
                break;
            }
            case 'payment_intent.payment_failed': {
                const paymentIntent = event.data.object as Stripe.PaymentIntent;
                const sessionId = paymentIntent.metadata?.sessionId;
                if (sessionId) {
                    await handlePaymentStatus(sessionId, 'failed');
                }
                break;
            }
            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        // Mark event as processed
        await setDoc(eventRef, {
            type: event.type,
            processedAt: Date.now(),
            status: 'processed'
        });

        return NextResponse.json({ received: true });
    } catch (err: unknown) {
        const error = err as Error;
        console.error(`Webhook Processing Error for ${event.type}: ${error.message}`);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

async function handlePaymentStatus(sessionId: string, status: 'success' | 'failed' | 'cancelled') {
    console.log(`Updating status for session ${sessionId} to ${status}`);

    const q = query(collection(db, 'payments'), where('stripeSessionId', '==', sessionId));
    const snap = await getDocs(q);

    if (snap.empty) {
        console.warn(`No payment record found for session ${sessionId}`);
        return;
    }

    const paymentDoc = snap.docs[0];
    const paymentData = paymentDoc.data();

    // Prevent overwriting a success status if we somehow get a late failure/expire
    if (paymentData.paymentStatus === 'success' && status !== 'success') {
        console.log(`Payment ${sessionId} is already marked as success. Skipping ${status} update.`);
        return;
    }

    await updateDoc(doc(db, 'payments', paymentDoc.id), {
        paymentStatus: status,
        updatedAt: Date.now()
    });

    if (status === 'success') {
        const receiptsQuery = query(collection(db, 'receipts'), where('transactionId', '==', sessionId));
        const receiptSnap = await getDocs(receiptsQuery);

        if (receiptSnap.empty) {
            console.log(`Generating receipt and sending email for session ${sessionId}`);
            const result = await createReceipt({
                amount: paymentData.amount,
                paymentId: paymentData.paymentId,
                method: 'online_stripe',
                status: 'paid',
                transactionId: sessionId
            }, paymentData.studentId, 'Stripe Webhook');

            // NEW: Send Email Receipt
            try {
                const pdfBuffer = generateServerReceiptPDF(result.receipt);
                // Use parentEmail from student profile, fall back to payment user email if needed
                const recipientEmail = result.student.parentEmail || '';

                if (recipientEmail) {
                    await sendReceiptEmail({
                        to: recipientEmail,
                        studentName: result.receipt.studentName,
                        receiptNumber: result.receipt.receiptNumber,
                        amount: result.receipt.amountPaid,
                        date: new Date(result.receipt.paidAt).toLocaleDateString(),
                        pdfBuffer
                    });
                } else {
                    console.warn(`No email found for student ${result.receipt.studentId}. Skipping email send.`);
                }
            } catch (emailErr) {
                console.error('Failed to send receipt email after creation:', emailErr);
            }
        } else {
            console.log(`Receipt already exists for session ${sessionId}`);
        }
    }
}

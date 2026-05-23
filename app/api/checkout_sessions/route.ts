import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock_placeholder');

export async function POST(req: NextRequest) {
    try {
        const { amount, studentId, userId, feeType } = await req.json();

        // Sandbox fallback if STRIPE_SECRET_KEY is missing
        if (!process.env.STRIPE_SECRET_KEY) {
            const mockSessionId = 'sess_mock_' + Date.now();
            await addDoc(collection(db, 'payments'), {
                paymentId: 'PAY-' + Date.now(),
                studentId: studentId,
                userId: userId || '',
                amount: Number(amount),
                paymentStatus: 'pending',
                stripeSessionId: mockSessionId,
                createdAt: Date.now(),
                updatedAt: Date.now()
            });
            return NextResponse.json({ clientSecret: 'cs_mock_secret_' + Date.now() });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'inr',
                        product_data: {
                            name: `School Fee: ${feeType}`,
                            description: `Student ID: ${studentId}`,
                        },
                        unit_amount: amount * 100,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            ui_mode: 'embedded',
            return_url: `${req.headers.get('origin')}/payment/return?session_id={CHECKOUT_SESSION_ID}&studentId=${studentId}&amount=${amount}`,
            metadata: {
                studentId,
                userId,
                feeType,
            },
        });

        // Create a pending payment record in Firestore
        // This allows us to track the payment even if the user closes the window
        await addDoc(collection(db, 'payments'), {
            paymentId: 'PAY-' + Date.now(),
            studentId: studentId,
            userId: userId || '',
            amount: Number(amount),
            paymentStatus: 'pending',
            stripeSessionId: session.id,
            createdAt: Date.now(),
            updatedAt: Date.now()
        });

        return NextResponse.json({ clientSecret: session.client_secret });
    } catch (err: unknown) {
        const error = err as Error;
        console.error('Stripe Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-06-20' as any,
});

export async function POST(req: NextRequest) {
    try {
        const { amount, studentId, feeType } = await req.json();

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
                feeType,
            },
        });

        return NextResponse.json({ clientSecret: session.client_secret });
    } catch (err: any) {
        console.error('Stripe Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

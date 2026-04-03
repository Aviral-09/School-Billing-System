import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    // apiVersion: '2025-01-27.acacia', 
});

export async function POST(req: NextRequest) {
    try {
        const { sessionId } = await req.json();

        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status === 'paid') {
            return NextResponse.json({ status: 'paid', payment_intent: session.payment_intent });
        } else {
            return NextResponse.json({ status: 'unpaid' }, { status: 400 });
        }
    } catch (err: unknown) {
        const error = err as Error;
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

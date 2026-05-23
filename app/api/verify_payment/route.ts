import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock_placeholder');

export async function POST(req: NextRequest) {
    try {
        const { sessionId } = await req.json();

        // Sandbox fallback if STRIPE_SECRET_KEY is missing
        if (!process.env.STRIPE_SECRET_KEY) {
            return NextResponse.json({ status: 'paid', payment_intent: 'pi_mock_intent' });
        }

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

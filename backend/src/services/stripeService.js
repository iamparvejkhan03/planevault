import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export class StripeService {
    // Create a Stripe customer
    static async createCustomer(email, name) {
        try {
            const customer = await stripe.customers.create({
                email,
                name,
                description: 'Auction website customer'
            });
            return customer;
        } catch (error) {
            throw new Error(`Stripe customer creation failed: ${error.message}`);
        }
    }

    // Verify card and save for future use (RECOMMENDED APPROACH)
    static async verifyAndSaveCard(customerId, paymentMethodId) {
        try {
            // 1. Attach payment method to customer
            await stripe.paymentMethods.attach(paymentMethodId, {
                customer: customerId,
            });

            // 2. Set as default payment method
            await stripe.customers.update(customerId, {
                invoice_settings: {
                    default_payment_method: paymentMethodId,
                },
            });

            // 3. Create Setup Intent to verify the card works
            const setupIntent = await stripe.setupIntents.create({
                customer: customerId,
                payment_method: paymentMethodId,
                payment_method_types: ['card'],
                usage: 'off_session', // For future payments without customer present
                confirm: true,
            });

            // 4. Verify the setup intent succeeded
            if (setupIntent.status !== 'succeeded') {
                throw new Error('Card verification failed');
            }

            // 5. Get payment method details for storage
            const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

            return {
                success: true,
                paymentMethod: {
                    id: paymentMethodId,
                    last4: paymentMethod.card.last4,
                    brand: paymentMethod.card.brand,
                    expMonth: paymentMethod.card.exp_month,
                    expYear: paymentMethod.card.exp_year,
                    country: paymentMethod.card.country,
                }
            };

        } catch (error) {
            throw new Error(`Card verification failed: ${error.message}`);
        }
    }

    // Create Payment Intent for bidding (when user wins)
    static async createBidPaymentIntent(customerId, amount, description) {
        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(amount * 100), // Convert to cents
                currency: 'usd',
                customer: customerId,
                description: description,
                payment_method_types: ['card'],
                capture_method: 'automatic', // Auto-capture payment
                setup_future_usage: 'off_session', // Allow future charges
                metadata: {
                    type: 'auction_win',
                    timestamp: new Date().toISOString()
                }
            });

            return paymentIntent;
        } catch (error) {
            throw new Error(`Payment intent creation failed: ${error.message}`);
        }
    }

    // Charge customer automatically when they win (using saved card)
    static async chargeCustomer(customerId, amount, description) {
        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(amount * 100),
                currency: 'usd',
                customer: customerId,
                description: description,
                payment_method_types: ['card'],
                off_session: true, // Important: charge without customer being present
                confirm: true, // Auto-confirm and capture
            });

            if (paymentIntent.status === 'succeeded') {
                return {
                    success: true,
                    paymentIntent: paymentIntent
                };
            } else {
                throw new Error(`Payment failed with status: ${paymentIntent.status}`);
            }
        } catch (error) {
            throw new Error(`Charge failed: ${error.message}`);
        }
    }

    // Get customer's saved payment methods
    static async getCustomerPaymentMethods(customerId) {
        try {
            const paymentMethods = await stripe.paymentMethods.list({
                customer: customerId,
                type: 'card',
            });

            return paymentMethods.data;
        } catch (error) {
            throw new Error(`Failed to get payment methods: ${error.message}`);
        }
    }

    // Refund a payment
    static async refundPayment(paymentIntentId) {
        try {
            const refund = await stripe.refunds.create({
                payment_intent: paymentIntentId,
            });
            return refund;
        } catch (error) {
            throw new Error(`Refund failed: ${error.message}`);
        }
    }
}
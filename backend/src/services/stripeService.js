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

    // Update the chargeCustomer method to capture existing payment intents
    static async capturePaymentIntent(paymentIntentId) {
        try {
            const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId);
            return paymentIntent;
        } catch (error) {
            throw new Error(`Payment capture failed: ${error.message}`);
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

    // Add this method to your existing StripeService class

    static async createBidPaymentIntent(customerId, amount, description) {
        try {
            // Get customer's default payment method
            const customer = await stripe.customers.retrieve(customerId);
            const defaultPaymentMethod = customer.invoice_settings?.default_payment_method;

            if (!defaultPaymentMethod) {
                throw new Error('No payment method found for customer');
            }

            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(amount * 100),
                currency: 'usd',
                customer: customerId,
                payment_method: defaultPaymentMethod, // Add this line
                description: description,
                payment_method_types: ['card'],
                capture_method: 'manual',
                setup_future_usage: 'off_session',
                confirm: true, // Add this line to confirm immediately
                metadata: {
                    type: 'bid_commission',
                    timestamp: new Date().toISOString()
                }
            });

            return paymentIntent;
        } catch (error) {
            throw new Error(`Payment intent creation failed: ${error.message}`);
        }
    }
}
// controllers/bidController.js
import { StripeService } from '../services/stripeService.js';
import User from '../models/User.js';

export const chargeWinningBidder = async (req, res) => {
    try {
        const { userId, amount, auctionId, description } = req.body;

        // Find user and verify they have payment method
        const user = await User.findById(userId);
        if (!user || !user.stripeCustomerId || !user.isPaymentVerified) {
            return res.status(400).json({
                success: false,
                message: 'User payment method not available'
            });
        }

        // Charge the customer automatically
        const chargeResult = await StripeService.chargeCustomer(
            user.stripeCustomerId,
            amount,
            description || `Winning bid for auction ${auctionId}`
        );

        if (chargeResult.success) {
            // Update your database - mark auction as paid, etc.
            await Auction.findByIdAndUpdate(auctionId, {
                status: 'paid',
                paymentIntentId: chargeResult.paymentIntent.id,
                paidAt: new Date()
            });

            return res.status(200).json({
                success: true,
                message: 'Payment processed successfully',
                data: {
                    paymentIntentId: chargeResult.paymentIntent.id,
                    amount: amount
                }
            });
        }

    } catch (error) {
        console.error('Charge error:', error);
        return res.status(400).json({
            success: false,
            message: `Payment failed: ${error.message}`
        });
    }
};

// Optional: Pre-authorize bid amount when user places bid
export const authorizeBidAmount = async (req, res) => {
    try {
        const { userId, amount, auctionId } = req.body;

        const user = await User.findById(userId);
        if (!user || !user.stripeCustomerId) {
            return res.status(400).json({
                success: false,
                message: 'User payment method not available'
            });
        }

        // Create payment intent (but don't capture yet)
        const paymentIntent = await StripeService.createBidPaymentIntent(
            user.stripeCustomerId,
            amount,
            `Bid authorization for auction ${auctionId}`
        );

        return res.status(200).json({
            success: true,
            message: 'Bid authorized',
            data: {
                paymentIntentId: paymentIntent.id,
                clientSecret: paymentIntent.client_secret
            }
        });

    } catch (error) {
        console.error('Bid authorization error:', error);
        return res.status(400).json({
            success: false,
            message: `Bid authorization failed: ${error.message}`
        });
    }
};

// Test charge controller (create a temporary route for testing)
export const testCharge = async (req, res) => {
    try {
        const userId = '68d3c193ff8daa10eed9f0f5';
        const amount = 10.00; // $10 test charge
        
        const user = await User.findById(userId);
        
        const chargeResult = await StripeService.chargeCustomer(
            user.stripeCustomerId,
            amount,
            'Test auction win charge'
        );
        
        res.json({ success: true, chargeResult });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// Enhanced Bidder Dashboard Stats with Analytics

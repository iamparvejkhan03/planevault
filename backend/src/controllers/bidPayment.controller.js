import BidPayment from '../models/bidPayment.model.js';
import Commission from '../models/commission.model.js';
import Auction from '../models/auction.model.js';
import User from '../models/user.model.js';
import { StripeService } from '../services/stripeService.js';

// Create payment intent when user places first bid
export const createBidPaymentIntent = async (req, res) => {
    try {
        const { auctionId, bidAmount } = req.body;
        const userId = req.user._id;

        // Validate auction
        const auction = await Auction.findById(auctionId);
        if (!auction) {
            return res.status(404).json({
                success: false,
                message: 'Auction not found'
            });
        }

        // Check if auction is active
        if (auction.status !== 'active') {
            return res.status(400).json({
                success: false,
                message: 'Auction is not active'
            });
        }

        // Get user with payment info
        const user = await User.findById(userId);
        if (!user || !user.stripeCustomerId || !user.isPaymentVerified) {
            return res.status(400).json({
                success: false,
                message: 'User payment method not verified'
            });
        }

        // Get commission amount for this category
        const commission = await Commission.findOne({ category: auction.category });
        if (!commission) {
            return res.status(400).json({
                success: false,
                message: 'Commission not set for this category'
            });
        }

        const commissionAmount = commission.commissionAmount;
        const totalAmount = commissionAmount; // Only charge commission amount for bidding

        // Check if user already has a payment intent for this auction
        const existingPayment = await BidPayment.findOne({
            auction: auctionId,
            bidder: userId,
            status: { $in: ['created', 'succeeded', 'requires_capture'] }
        });

        if (existingPayment) {
            return res.status(200).json({
                success: true,
                message: 'Payment intent already exists',
                data: {
                    paymentIntentId: existingPayment.paymentIntentId,
                    clientSecret: existingPayment.clientSecret,
                    requiresAction: false
                }
            });
        }

        // Create payment intent with Stripe
        const paymentIntent = await StripeService.createBidPaymentIntent(
            user.stripeCustomerId,
            totalAmount,
            `Bid commission for: ${auction.title}`
        );

        // Create bid payment record
        const bidPayment = await BidPayment.create({
            auction: auctionId,
            bidder: userId,
            bidAmount: bidAmount,
            commissionAmount: commissionAmount,
            totalAmount: totalAmount,
            paymentIntentId: paymentIntent.id,
            clientSecret: paymentIntent.client_secret,
            status: paymentIntent.status
        });

        res.status(200).json({
            success: true,
            message: 'Payment intent created successfully',
            data: {
                paymentIntentId: paymentIntent.id,
                clientSecret: paymentIntent.client_secret,
                requiresAction: true,
                bidPaymentId: bidPayment._id
            }
        });

    } catch (error) {
        console.error('Create bid payment intent error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while creating payment intent'
        });
    }
};

// Confirm payment intent (when user completes payment)
export const confirmBidPayment = async (req, res) => {
    try {
        const { paymentIntentId } = req.body;
        const userId = req.user._id;

        // Find the bid payment
        const bidPayment = await BidPayment.findOne({
            paymentIntentId: paymentIntentId,
            bidder: userId
        }).populate('auction');

        if (!bidPayment) {
            return res.status(404).json({
                success: false,
                message: 'Payment intent not found'
            });
        }

        // Update payment status to succeeded
        bidPayment.status = 'succeeded';
        await bidPayment.save();

        res.status(200).json({
            success: true,
            message: 'Payment confirmed successfully',
            data: {
                bidPaymentId: bidPayment._id,
                auctionId: bidPayment.auction._id
            }
        });

    } catch (error) {
        console.error('Confirm bid payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while confirming payment'
        });
    }
};

// Charge winner when auction ends
export const chargeWinningBidder = async (req, res) => {
    try {
        const { auctionId } = req.body;

        const auction = await Auction.findById(auctionId)
            .populate('winner')
            .populate('seller');

        if (!auction || !auction.winner) {
            return res.status(404).json({
                success: false,
                message: 'Auction or winner not found'
            });
        }

        // Get commission amount
        const commission = await Commission.findOne({ category: auction.category });
        if (!commission) {
            return res.status(400).json({
                success: false,
                message: 'Commission not set for this category'
            });
        }

        const commissionAmount = commission.commissionAmount;
        const finalAmount = commissionAmount;

        // Find the winning bid payment
        const winningBidPayment = await BidPayment.findOne({
            auction: auctionId,
            bidder: auction.winner._id,
            status: 'succeeded'
        });

        if (!winningBidPayment) {
            return res.status(400).json({
                success: false,
                message: 'No valid payment found for winner'
            });
        }

        // Charge the customer automatically
        const chargeResult = await StripeService.chargeCustomer(
            auction.winner.stripeCustomerId,
            finalAmount,
            `Winning bid commission for: ${auction.title}`
        );

        if (chargeResult.success) {
            // Update bid payment record
            winningBidPayment.chargeAttempted = true;
            winningBidPayment.chargeSucceeded = true;
            winningBidPayment.status = 'succeeded';
            await winningBidPayment.save();

            // Update auction with commission info
            auction.commissionAmount = commissionAmount;
            auction.paymentStatus = 'paid';
            await auction.save();

            return res.status(200).json({
                success: true,
                message: 'Winner charged successfully',
                data: {
                    paymentIntentId: chargeResult.paymentIntent.id,
                    amount: finalAmount,
                    auctionId: auction._id
                }
            });
        }

    } catch (error) {
        console.error('Charge winning bidder error:', error);
        res.status(400).json({
            success: false,
            message: `Payment failed: ${error.message}`
        });
    }
};

// Get user's bid payments for an auction
export const getUserBidPayments = async (req, res) => {
    try {
        const { auctionId } = req.params;
        const userId = req.user._id;

        const bidPayments = await BidPayment.find({
            auction: auctionId,
            bidder: userId
        }).populate('auction');

        res.status(200).json({
            success: true,
            data: { bidPayments }
        });

    } catch (error) {
        console.error('Get user bid payments error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching bid payments'
        });
    }
};

// export async function chargeWinningBidderDirect(auctionId) {
//     try {
//         const auction = await Auction.findById(auctionId).populate('winner');
//         if (!auction || !auction.winner) return;

//         const commission = await Commission.findOne({ category: auction.category });
//         if (!commission) return;

//         const commissionAmount = commission.commissionAmount;
//         const winningBidPayment = await BidPayment.findOne({
//             auction: auctionId,
//             bidder: auction.winner._id,
//             status: 'succeeded'
//         });

//         if (!winningBidPayment) return;

//         const chargeResult = await StripeService.chargeCustomer(
//             auction.winner.stripeCustomerId,
//             commissionAmount,
//             `Winning bid commission for: ${auction.title}`
//         );

//         if (chargeResult.success) {
//             winningBidPayment.chargeAttempted = true;
//             winningBidPayment.chargeSucceeded = true;
//             winningBidPayment.status = 'succeeded';
//             await winningBidPayment.save();

//             auction.commissionAmount = commissionAmount;
//             auction.paymentStatus = 'paid';
//             await auction.save();

//             console.log(`✅ Charged winner for auction ${auctionId}`);
//         }
//     } catch (error) {
//         console.error(`❌ Failed to charge winner for auction ${auctionId}:`, error.message);
//     }
// }

export async function chargeWinningBidderDirect(auctionId) {
    try {
        console.log('1. Starting chargeWinningBidderDirect for auction:', auctionId);

        const auction = await Auction.findById(auctionId).populate('winner');
        console.log('2. Auction found:', auction?._id, 'Winner:', auction?.winner?._id);

        if (!auction || !auction.winner) {
            console.log('3. No auction or winner - exiting');
            return;
        }

        const commission = await Commission.findOne({ category: auction.category });
        console.log('4. Commission found:', commission?.commissionAmount);

        if (!commission) {
            console.log('5. No commission found - exiting');
            return;
        }

        const commissionAmount = commission.commissionAmount;
        // const winningBidPayment = await BidPayment.findOne({
        //     auction: auctionId,
        //     bidder: auction.winner._id,
        //     status: 'succeeded'
        // });
        const winningBidPayment = await BidPayment.findOne({
            auction: auctionId,
            bidder: auction.winner._id,
            status: { $in: ['succeeded', 'requires_capture', 'created'] }
        });

        console.log('6. Winning bid payment found:', winningBidPayment?._id, 'Status:', winningBidPayment?.status);

        if (!winningBidPayment) {
            console.log('7. No winning bid payment found - exiting');
            return;
        }

        console.log('8. Attempting to capture payment intent:', winningBidPayment.paymentIntentId);
        const paymentIntent = await StripeService.capturePaymentIntent(
            winningBidPayment.paymentIntentId
        );

        console.log('9. Capture result status:', paymentIntent.status);

        if (paymentIntent.status === 'succeeded') {
            winningBidPayment.chargeAttempted = true;
            winningBidPayment.chargeSucceeded = true;
            winningBidPayment.status = 'succeeded';
            await winningBidPayment.save();

            auction.commissionAmount = commissionAmount;
            auction.paymentStatus = 'paid';
            await auction.save();

            console.log(`✅ Charged winner for auction ${auctionId}`);
        } else {
            console.log(`❌ Capture failed with status: ${paymentIntent.status}`);
        }
    } catch (error) {
        console.error(`❌ Failed to charge winner for auction ${auctionId}:`, error.message);
    }
}
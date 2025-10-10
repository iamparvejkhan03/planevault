import BidPayment from '../models/bidPayment.model.js';
import Commission from '../models/commission.model.js';
import Auction from '../models/auction.model.js';
import User from '../models/user.model.js';
import { StripeService } from '../services/stripeService.js';

// Create payment intent when user places first bid
// export const createBidPaymentIntent = async (req, res) => {
//     try {
//         const { auctionId, bidAmount } = req.body;
//         const userId = req.user._id;

//         // Validate auction
//         const auction = await Auction.findById(auctionId);
//         if (!auction) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Auction not found'
//             });
//         }

//         // Check if auction is active
//         if (auction.status !== 'active') {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Auction is not active'
//             });
//         }

//         // Get user with payment info
//         const user = await User.findById(userId);
//         if (!user || !user.stripeCustomerId || !user.isPaymentVerified) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'User payment method not verified'
//             });
//         }

//         // Get commission amount for this category
//         const commission = await Commission.findOne({ category: auction.category });
//         if (!commission) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Commission not set for this category'
//             });
//         }

//         const commissionAmount = commission.commissionAmount;
//         const totalAmount = commissionAmount; // Only charge commission amount for bidding

//         // Check if user already has a payment intent for this auction
//         const existingPayment = await BidPayment.findOne({
//             auction: auctionId,
//             bidder: userId,
//             status: { $in: ['created', 'succeeded', 'requires_capture'] }
//         });

//         if (existingPayment) {
//             return res.status(200).json({
//                 success: true,
//                 message: 'Payment intent already exists',
//                 data: {
//                     paymentIntentId: existingPayment.paymentIntentId,
//                     clientSecret: existingPayment.clientSecret,
//                     requiresAction: false
//                 }
//             });
//         }

//         // Create payment intent with Stripe
//         const paymentIntent = await StripeService.createBidPaymentIntent(
//             user.stripeCustomerId,
//             totalAmount,
//             `Bid commission for: ${auction.title}`
//         );

//         // Create bid payment record
//         const bidPayment = await BidPayment.create({
//             auction: auctionId,
//             bidder: userId,
//             bidAmount: bidAmount,
//             commissionAmount: commissionAmount,
//             totalAmount: totalAmount,
//             paymentIntentId: paymentIntent.id,
//             clientSecret: paymentIntent.client_secret,
//             status: paymentIntent.status
//         });

//         res.status(200).json({
//             success: true,
//             message: 'Payment intent created successfully',
//             data: {
//                 paymentIntentId: paymentIntent.id,
//                 clientSecret: paymentIntent.client_secret,
//                 requiresAction: true,
//                 bidPaymentId: bidPayment._id
//             }
//         });

//     } catch (error) {
//         console.error('Create bid payment intent error:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Internal server error while creating payment intent'
//         });
//     }
// };

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
        if (!user || !user.stripeCustomerId || !user.paymentMethodId) {
            return res.status(400).json({
                success: false,
                message: 'User payment method not setup'
            });
        }

        // Calculate authorization amount - $2500
        const authorizationAmount = 250000; // $2500 in cents

        // Check if user already has an authorization for this auction
        const existingPayment = await BidPayment.findOne({
            auction: auctionId,
            bidder: userId,
            type: 'bid_authorization',
            status: { $in: ['requires_capture', 'succeeded'] }
        });

        if (existingPayment) {
            return res.status(200).json({
                success: true,
                message: 'Payment authorization already exists',
                data: {
                    paymentIntentId: existingPayment.paymentIntentId,
                    clientSecret: existingPayment.clientSecret,
                    requiresAction: false
                }
            });
        }

        // Create authorization payment intent (manual capture)
        const paymentIntent = await StripeService.createBidAuthorizationIntent(
            user.stripeCustomerId,
            user.paymentMethodId,
            authorizationAmount,
            `Bid authorization for: ${auction.title}`
        );

        // Create bid payment record for authorization
        const bidPayment = await BidPayment.create({
            auction: auctionId,
            bidder: userId,
            bidAmount: bidAmount,
            commissionAmount: 0, // Will calculate later
            totalAmount: authorizationAmount / 100, // Store in dollars
            paymentIntentId: paymentIntent.id,
            clientSecret: paymentIntent.client_secret,
            status: paymentIntent.status,
            type: 'bid_authorization'
        });

        res.status(200).json({
            success: true,
            message: 'Payment authorization created successfully',
            data: {
                paymentIntentId: paymentIntent.id,
                clientSecret: paymentIntent.client_secret,
                requiresAction: paymentIntent.status === 'requires_action',
                bidPaymentId: bidPayment._id
            }
        });

    } catch (error) {
        console.error('Create bid payment intent error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while creating payment authorization'
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
//         console.log('1. Starting chargeWinningBidderDirect for auction:', auctionId);

//         const auction = await Auction.findById(auctionId).populate('winner');
//         console.log('2. Auction found:', auction?._id, 'Winner:', auction?.winner?._id);

//         if (!auction || !auction.winner) {
//             console.log('3. No auction or winner - exiting');
//             return;
//         }

//         const commission = await Commission.findOne({ category: auction.category });
//         console.log('4. Commission found:', commission?.commissionAmount);

//         if (!commission) {
//             console.log('5. No commission found - exiting');
//             return;
//         }

//         const commissionAmount = commission.commissionAmount;
//         // const winningBidPayment = await BidPayment.findOne({
//         //     auction: auctionId,
//         //     bidder: auction.winner._id,
//         //     status: 'succeeded'
//         // });
//         const winningBidPayment = await BidPayment.findOne({
//             auction: auctionId,
//             bidder: auction.winner._id,
//             status: { $in: ['succeeded', 'requires_capture', 'created'] }
//         });

//         console.log('6. Winning bid payment found:', winningBidPayment?._id, 'Status:', winningBidPayment?.status);

//         if (!winningBidPayment) {
//             console.log('7. No winning bid payment found - exiting');
//             return;
//         }

//         console.log('8. Attempting to capture payment intent:', winningBidPayment.paymentIntentId);
//         const paymentIntent = await StripeService.capturePaymentIntent(
//             winningBidPayment.paymentIntentId
//         );

//         console.log('9. Capture result status:', paymentIntent.status);

//         if (paymentIntent.status === 'succeeded') {
//             winningBidPayment.chargeAttempted = true;
//             winningBidPayment.chargeSucceeded = true;
//             winningBidPayment.status = 'succeeded';
//             await winningBidPayment.save();

//             auction.commissionAmount = commissionAmount;
//             auction.paymentStatus = 'paid';
//             await auction.save();

//             console.log(`✅ Charged winner for auction ${auctionId}`);
//         } else {
//             console.log(`❌ Capture failed with status: ${paymentIntent.status}`);
//         }
//     } catch (error) {
//         console.error(`❌ Failed to charge winner for auction ${auctionId}:`, error.message);
//     }
// }



// Add this helper function


// export async function chargeWinningBidderDirect(auctionId) {
//     try {
//         console.log('1. Starting chargeWinningBidderDirect for auction:', auctionId);

//         const auction = await Auction.findById(auctionId).populate('winner');
//         if (!auction || !auction.winner) {
//             console.log('3. No auction or winner - exiting');
//             return;
//         }

//         console.log('4. Final auction price:', auction.finalPrice);

//         // Calculate actual commission (5% with $10,000 cap for <$500k, 3% for >$500k)
//         let commissionRate;
//         let finalCommissionAmount;

//         if (auction.finalPrice <= 500000) {
//             commissionRate = 0.05;
//             const calculatedCommission = auction.finalPrice * commissionRate;
//             finalCommissionAmount = Math.min(calculatedCommission, 10000);
//         } else {
//             commissionRate = 0.03;
//             finalCommissionAmount = auction.finalPrice * commissionRate;
//         }

//         console.log(`5. Commission calculated: ${commissionRate * 100}% = $${finalCommissionAmount}`);

//         // Find the authorization payment
//         const authorizationPayment = await BidPayment.findOne({
//             auction: auctionId,
//             bidder: auction.winner._id,
//             type: 'bid_authorization',
//             status: { $in: ['requires_capture', 'succeeded'] }
//         });

//         if (!authorizationPayment) {
//             console.log('7. No authorization payment found - exiting');
//             return;
//         }

//         // CANCEL the original $2500 authorization (IMPORTANT!)
//         await StripeService.cancelPaymentIntent(authorizationPayment.paymentIntentId);
//         console.log('8. Cancelled original $2500 authorization');

//         // Update authorization payment status
//         authorizationPayment.status = 'canceled';
//         await authorizationPayment.save();

//         // Get winner's payment method
//         const winner = await User.findById(auction.winner._id);

//         // CREATE NEW PAYMENT for the actual commission amount
//         const paymentIntent = await StripeService.createPaymentIntent({
//             amount: Math.round(finalCommissionAmount * 100), // Actual commission in cents
//             currency: 'usd',
//             customer: winner.stripeCustomerId,
//             payment_method: winner.paymentMethodId,
//             confirm: true, // This will charge immediately
//             off_session: true,
//             metadata: {
//                 auctionId: auctionId.toString(),
//                 type: 'final_commission',
//                 finalPrice: auction.finalPrice,
//                 commissionRate: commissionRate,
//                 commissionType: auction.finalPrice <= 500000 ? '5%_capped' : '3%_uncapped'
//             }
//         });

//         console.log('9. New payment intent status:', paymentIntent.status);

//         if (paymentIntent.status === 'succeeded') {
//             // Create final payment record for the commission
//             const finalPayment = new BidPayment({
//                 auction: auctionId,
//                 bidder: auction.winner._id,
//                 bidAmount: auction.finalPrice,
//                 commissionAmount: finalCommissionAmount,
//                 totalAmount: finalCommissionAmount,
//                 paymentIntentId: paymentIntent.id,
//                 clientSecret: paymentIntent.client_secret,
//                 status: 'succeeded',
//                 chargeAttempted: true,
//                 chargeSucceeded: true,
//                 type: 'final_commission',
//                 commissionRate: commissionRate,
//                 commissionType: auction.finalPrice <= 500000 ? '5%_capped' : '3%_uncapped'
//             });
//             await finalPayment.save();

//             // Update auction
//             auction.commissionAmount = finalCommissionAmount;
//             auction.paymentStatus = 'paid';
//             await auction.save();

//             console.log(`✅ Charged actual commission $${finalCommissionAmount} for auction ${auctionId}`);

//         } else if (paymentIntent.status === 'requires_action') {
//             console.log('⚠️ Payment requires authentication - notifying winner');
//             // Handle 3D Secure requirement
//         }

//     } catch (error) {
//         console.error(`❌ Failed to charge winner for auction ${auctionId}:`, error.message);
//     }
// }

export async function chargeWinningBidderDirect(auctionId) {
    try {
        console.log('1. Starting chargeWinningBidderDirect for auction:', auctionId);

        const auction = await Auction.findById(auctionId).populate('winner');
        if (!auction || !auction.winner) {
            console.log('3. No auction or winner - exiting');
            return;
        }

        console.log('4. Final auction price:', auction.finalPrice);

        // Calculate actual commission (5% with $10,000 cap for <$500k, 3% for >$500k)
        let commissionRate;
        let finalCommissionAmount;

        if (auction.finalPrice <= 500000) {
            commissionRate = 0.05;
            const calculatedCommission = auction.finalPrice * commissionRate;
            finalCommissionAmount = Math.min(calculatedCommission, 10000);
        } else {
            commissionRate = 0.03;
            finalCommissionAmount = auction.finalPrice * commissionRate;
        }

        console.log(`5. Commission calculated: ${commissionRate * 100}% = $${finalCommissionAmount}`);

        // Find the authorization payment
        const authorizationPayment = await BidPayment.findOne({
            auction: auctionId,
            bidder: auction.winner._id,
            type: 'bid_authorization',
            status: { $in: ['requires_capture', 'succeeded'] }
        });

        if (!authorizationPayment) {
            console.log('7. No authorization payment found - exiting');
            return;
        }

        // Get winner's payment method
        const winner = await User.findById(auction.winner._id);

        // CREATE NEW PAYMENT for the actual commission amount
        const paymentIntent = await StripeService.createPaymentIntent({
            amount: Math.round(finalCommissionAmount * 100), // Actual commission in cents
            currency: 'usd',
            customer: winner.stripeCustomerId,
            payment_method: winner.paymentMethodId,
            confirm: true, // This will charge immediately
            off_session: true,
            metadata: {
                auctionId: auctionId.toString(),
                type: 'final_commission',
                finalPrice: auction.finalPrice,
                commissionRate: commissionRate,
                commissionType: auction.finalPrice <= 500000 ? '5%_capped' : '3%_uncapped'
            }
        });

        console.log('9. New payment intent status:', paymentIntent.status);

        if (paymentIntent.status === 'succeeded') {
            // ✅ ACTUAL COMMISSION SUCCEEDED - Cancel the $2500 authorization
            await StripeService.cancelPaymentIntent(authorizationPayment.paymentIntentId);
            console.log('✅ Actual commission charged - cancelled $2500 authorization');

            // Update authorization payment status
            authorizationPayment.status = 'canceled';
            await authorizationPayment.save();

            // Create final payment record for the commission
            const finalPayment = new BidPayment({
                auction: auctionId,
                bidder: auction.winner._id,
                bidAmount: auction.finalPrice,
                commissionAmount: finalCommissionAmount,
                totalAmount: finalCommissionAmount,
                paymentIntentId: paymentIntent.id,
                clientSecret: paymentIntent.client_secret,
                status: 'succeeded',
                chargeAttempted: true,
                chargeSucceeded: true,
                type: 'final_commission',
                commissionRate: commissionRate,
                commissionType: auction.finalPrice <= 500000 ? '5%_capped' : '3%_uncapped'
            });
            await finalPayment.save();

            // Update auction
            auction.commissionAmount = finalCommissionAmount;
            auction.paymentStatus = 'paid';
            await auction.save();

            console.log(`✅ Charged actual commission $${finalCommissionAmount} for auction ${auctionId}`);

        } else {
            // ❌ ACTUAL COMMISSION FAILED - Capture the $2500 authorization instead
            console.log('⚠️ Actual commission failed - capturing $2500 authorization instead');
            
            try {
                const capturedIntent = await StripeService.capturePaymentIntent(authorizationPayment.paymentIntentId);
                
                if (capturedIntent.status === 'succeeded') {
                    // Update authorization payment to show it was captured
                    authorizationPayment.status = 'succeeded';
                    authorizationPayment.chargeAttempted = true;
                    authorizationPayment.chargeSucceeded = true;
                    authorizationPayment.commissionAmount = 2500; // $2500 fallback
                    authorizationPayment.totalAmount = 2500;
                    await authorizationPayment.save();

                    // Update auction with fallback commission
                    auction.commissionAmount = 2500;
                    auction.paymentStatus = 'paid';
                    await auction.save();

                    console.log(`✅ Captured $2500 authorization as fallback commission for auction ${auctionId}`);
                }
            } catch (captureError) {
                console.error(`❌ Failed to capture $2500 authorization:`, captureError.message);
            }
        }

    } catch (error) {
        console.error(`❌ Failed to charge winner for auction ${auctionId}:`, error.message);
    }
}

function calculateBuyersPremium(finalPrice) {
    let commissionRate;
    let commissionAmount;
    let commissionType;

    if (finalPrice <= 500000) {
        // 5% commission with $10,000 cap for sales under $500,000
        commissionRate = 0.05;
        const calculatedCommission = finalPrice * commissionRate;
        commissionAmount = Math.min(calculatedCommission, 10000);
        commissionType = '5%_capped';
    } else {
        // 3% commission for sales over $500,000 (no cap)
        commissionRate = 0.03;
        commissionAmount = finalPrice * commissionRate;
        commissionType = '3%_uncapped';
    }

    return {
        commissionRate,
        commissionAmount,
        commissionType,
        finalPrice
    };
}

// Add this function to your bidPayment.controller.js
export async function cancelLosingBidderAuthorizations(auctionId, winnerId) {
    try {
        // Find all authorization payments EXCEPT the winner's
        const losingBidPayments = await BidPayment.find({
            auction: auctionId,
            bidder: { $ne: winnerId }, // Exclude winner
            type: 'bid_authorization',
            status: { $in: ['requires_capture', 'succeeded'] }
        }).populate('bidder');

        console.log(`Cancelling ${losingBidPayments.length} losing bidder authorizations`);

        let cancelledCount = 0;
        for (const payment of losingBidPayments) {
            try {
                await StripeService.cancelPaymentIntent(payment.paymentIntentId);
                payment.status = 'canceled';
                await payment.save();
                cancelledCount++;
                console.log(`✅ Cancelled authorization for losing bidder: ${payment.bidder._id}`);
            } catch (error) {
                console.error(`❌ Failed to cancel authorization for bidder ${payment.bidder._id}:`, error.message);
            }
        }

        console.log(`✅ Successfully cancelled ${cancelledCount} losing bidder authorizations`);
        return cancelledCount;

    } catch (error) {
        console.error('Error cancelling losing bidder authorizations:', error.message);
        return 0;
    }
}

// Add this function to your bidPayment.controller.js
export async function cancelAllBidderAuthorizations(auctionId) {
    try {
        console.log(`Cancelling all bidder authorizations for auction: ${auctionId}`);

        // Find ALL authorization payments for this auction
        const allAuthorizationPayments = await BidPayment.find({
            auction: auctionId,
            type: 'bid_authorization',
            status: { $in: ['requires_capture', 'succeeded'] }
        }).populate('bidder');

        console.log(`Found ${allAuthorizationPayments.length} authorization payments to cancel`);

        let cancelledCount = 0;
        for (const payment of allAuthorizationPayments) {
            try {
                await StripeService.cancelPaymentIntent(payment.paymentIntentId);
                payment.status = 'canceled';
                await payment.save();
                cancelledCount++;
                console.log(`✅ Cancelled authorization for bidder: ${payment.bidder._id}`);
            } catch (error) {
                console.error(`❌ Failed to cancel authorization for bidder ${payment.bidder._id}:`, error.message);
            }
        }

        console.log(`✅ Successfully cancelled ${cancelledCount} authorization payments for auction ${auctionId}`);
        return cancelledCount;

    } catch (error) {
        console.error('Error cancelling all bidder authorizations:', error.message);
        return 0;
    }
}
import Agenda from 'agenda';
import Auction from '../models/auction.model.js';
import backendAxios from '../utils/backendAxios.js';
import { cancelAllBidderAuthorizations, cancelLosingBidderAuthorizations, chargeWinningBidder, chargeWinningBidderDirect } from '../controllers/bidPayment.controller.js';
import { auctionEndedAdminEmail, auctionEndingSoonEmail, auctionListedEmail, auctionWonAdminEmail, paymentSuccessEmail, sendAuctionEndedSellerEmail, sendAuctionWonEmail } from '../utils/nodemailer.js';
import User from '../models/user.model.js';

class AgendaService {
    constructor() {
        this.agenda = new Agenda({
            db: { address: process.env.MONGODB_URI, collection: 'agendaJobs' },
            processEvery: '30 seconds' // Check for due jobs every 30 seconds
        });

        this.defineJobs();
    }

    defineJobs() {
        // Job to activate an auction at its start time
        this.agenda.define('activate auction', async (job) => {
            const { auctionId } = job.attrs.data;

            try {
                const auction = await Auction.findById(auctionId);
                if (auction && (auction.status === 'approved')) {
                    auction.status = 'active';
                    await auction.save();
                    await auction.populate('seller', 'email username firstName');

                    await auctionListedEmail(auction, auction.seller);
                    // console.log(`✅ Agenda: Activated auction ${auctionId}`);
                }
            } catch (error) {
                console.error('Agenda job error (activate auction):', error);
                // Job will retry based on Agenda's retry logic
            }
        });

        // Job to end an auction at its end time
        this.agenda.define('end auction', async (job) => {
            const { auctionId } = job.attrs.data;
            // console.log('Entered the auction end.');

            try {
                const auction = await Auction.findById(auctionId)
                    .populate('winner', 'email username firstName')
                    .populate('seller', 'email username firstName');
                // Add safety check - only end if current time is actually past end date
                if (auction && (auction.status === 'active' || auction.status === 'reserve_not_met') && new Date() >= auction.endDate) {
                    // if (auction && auction.status === 'active' && new Date() >= auction.endDate) {
                    await auction.endAuction();
                    // console.log(`✅ Agenda: Ended auction ${auctionId}`);
                    // console.log(auction.winner)

                    // await auction.populate('winner', 'email username firstName');
                    // await auction.populate('seller', 'email username firstName');

                    if (auction.winner) {
                        // console.log('Calling chargeWinningBidderDirect for winner:', auction.winner._id);
                        await chargeWinningBidderDirect(auctionId);
                        await cancelLosingBidderAuthorizations(auctionId, auction.winner._id);

                        const populateAuction = await Auction.findById(auctionId)
                            .populate('winner', 'email username firstName')
                            .populate('seller', 'email username firstName');

                        await sendAuctionWonEmail(populateAuction);
                        await paymentSuccessEmail(populateAuction.winner, populateAuction, populateAuction?.commissionAmount);

                        const adminUsers = await User.find({ userType: 'admin' });
                        for (const admin of adminUsers) {
                            await auctionWonAdminEmail(admin.email, populateAuction, populateAuction.winner);
                        }
                        return;
                    }
                    // console.log('Calling cancel all bidder');

                    await cancelAllBidderAuthorizations(auctionId);

                    await sendAuctionEndedSellerEmail(auction);

                    const adminUsers = await User.find({ userType: 'admin' });

                    for (const admin of adminUsers) {
                        await auctionEndedAdminEmail(admin.email, auction);
                    }
                } else if (auction && auction.status === 'active') {
                    // Auction was extended, reschedule the job
                    await this.scheduleAuctionEnd(auctionId, auction.endDate);
                    // console.log(`🔄 Agenda: Rescheduled auction ${auctionId} to ${auction.endDate}`);
                }
            } catch (error) {
                console.error('Agenda job error (end auction):', error);
            }
        });

        this.agenda.define('send ending soon notifications', async (job) => {
            try {
                const now = new Date();

                // Define both time thresholds
                const oneHourFromNow = new Date(now.getTime() + (60 * 60 * 1000)); // 1 hour from now
                const oneDayFromNow = new Date(now.getTime() + (24 * 60 * 60 * 1000)); // 1 day from now

                // Find auctions ending in the next hour OR next day
                const endingSoonAuctions = await Auction.find({
                    status: 'active',
                    $or: [
                        {
                            // Ending in next hour (1-hour notification)
                            endDate: {
                                $lte: oneHourFromNow,
                                $gt: now
                            }
                        },
                        {
                            // Ending in next day but after next hour (1-day notification)
                            endDate: {
                                $lte: oneDayFromNow,
                                $gt: oneHourFromNow
                            }
                        }
                    ]
                }).populate('bids.bidder', 'email username preferences');

                // Track which notifications we've sent to avoid duplicates
                const sentNotifications = new Set();

                for (const auction of endingSoonAuctions) {
                    // Calculate time remaining for this auction
                    const timeRemaining = auction.endDate - now;
                    const hoursRemaining = Math.ceil(timeRemaining / (60 * 60 * 1000));

                    let timeLabel;
                    if (timeRemaining <= 60 * 60 * 1000) {
                        timeLabel = 'Less than 1 hour';
                    } else if (timeRemaining <= 24 * 60 * 60 * 1000) {
                        timeLabel = hoursRemaining <= 1 ? '1 hour' : `${hoursRemaining} hours`;
                    } else {
                        const daysRemaining = Math.ceil(timeRemaining / (24 * 60 * 60 * 1000));
                        timeLabel = daysRemaining === 1 ? '1 day' : `${daysRemaining} days`;
                    }

                    // Get unique bidders who want notifications
                    const bidders = auction.bids
                        .map(bid => bid.bidder)
                        .filter((bidder, index, array) =>
                            bidder &&
                            array.findIndex(b => b._id.toString() === bidder._id.toString()) === index &&
                            bidder.preferences?.bidAlerts !== false
                        );

                    // Send to each bidder
                    for (const bidder of bidders) {
                        try {
                            // Create a unique key to prevent duplicate notifications
                            const notificationKey = `${auction._id}-${bidder._id}-${timeLabel}`;

                            if (!sentNotifications.has(notificationKey)) {
                                await auctionEndingSoonEmail(
                                    bidder.email,
                                    bidder.username,
                                    auction,
                                    timeLabel
                                );
                                sentNotifications.add(notificationKey);
                                console.log(`✅ Sent ${timeLabel} notification to ${bidder.email} for auction ${auction.title}`);
                            }
                        } catch (error) {
                            console.error(`Failed to send ending soon email to ${bidder.email}:`, error);
                        }
                    }
                }
            } catch (error) {
                console.error('Agenda job error (ending soon notifications):', error);
            }
        });
    }

    // Schedule auction activation job
    async scheduleAuctionActivation(auctionId, startDate) {
        await this.agenda.schedule(startDate, 'activate auction', { auctionId });
        // console.log(`📅 Scheduled activation for auction ${auctionId} at ${startDate}`);
    }

    // Schedule auction ending job
    async scheduleAuctionEnd(auctionId, endDate) {
        await this.agenda.schedule(endDate, 'end auction', { auctionId });
        // console.log(`📅 Scheduled ending for auction ${auctionId} at ${endDate}`);
    }

    // Cancel jobs if auction is deleted or modified
    async cancelAuctionJobs(auctionId) {
        await this.agenda.cancel({
            'data.auctionId': auctionId
        });
        console.log(`🗑️ Cancelled jobs for auction ${auctionId}`);
    }

    // Start Agenda
    async start() {
        await this.agenda.start();
        console.log('🕒 Agenda service started');
        await this.agenda.every('15 minutes', 'send ending soon notifications');
    }

    // Graceful shutdown
    async stop() {
        await this.agenda.stop();
        console.log('🛑 Agenda service stopped');
    }
}

export default new AgendaService();
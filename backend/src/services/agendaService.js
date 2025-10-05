import Agenda from 'agenda';
import Auction from '../models/auction.model.js';
import backendAxios from '../utils/backendAxios.js';
import { chargeWinningBidder, chargeWinningBidderDirect } from '../controllers/bidPayment.controller.js';
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

                        const populateAuction = await Auction.findById(auctionId)
                            .populate('winner', 'email username firstName')
                            .populate('seller', 'email username firstName');

                        await sendAuctionWonEmail(populateAuction);
                        await paymentSuccessEmail(populateAuction.winner, populateAuction, populateAuction?.commissionAmount);

                        const adminUsers = await User.find({ userType: 'admin' });
                        for (const admin of adminUsers) {
                            await auctionWonAdminEmail(admin.email, populateAuction, populateAuction.winner);
                        }
                    }

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
                const endingSoonTime = new Date(now.getTime() + (60 * 60 * 1000)); // 1 hour from now

                const endingSoonAuctions = await Auction.find({
                    status: 'active',
                    endDate: {
                        $lte: endingSoonTime,
                        $gt: now
                    }
                }).populate('bids.bidder', 'email username preferences');

                for (const auction of endingSoonAuctions) {
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
                            await auctionEndingSoonEmail(
                                bidder.email,
                                bidder.username,
                                auction,
                                'Less than 1 hour'
                            );
                        } catch (error) {
                            console.error(`Failed to send ending soon email to ${bidder.email}:`, error);
                        }
                    }
                }
            } catch (error) {
                console.error('Agenda job error (ending soon notifications):', error);
            }
        });

        // Add this job definition
        // this.agenda.define('charge auction winner', async (job) => {
        //     const { auctionId } = job.attrs.data;

        //     try {
        //         const auction = await Auction.findById(auctionId).populate('winner');
        //         if (auction && auction.status === 'ended' && auction.winner) {
        //             // Charge the winning bidder
        //             await backendAxios.post('/api/v1/bid-payments/charge-winner', {
        //                 auctionId: auctionId
        //             });
        //             console.log(`✅ Agenda: Charged winner for auction ${auctionId}`);
        //         }
        //     } catch (error) {
        //         console.error('Agenda job error (charge winner):', error);
        //     }
        // });
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

    // Schedule winner charging when auction ends
    // async scheduleWinnerCharging(auctionId) {
    //     const auction = await Auction.findById(auctionId);
    //     if (auction) {
    //         // Schedule charging 1 hour after auction ends (give time for processing)
    //         const chargeTime = new Date(auction.endDate);
    //         chargeTime.setHours(chargeTime.getHours() + 0);

    //         await this.agenda.schedule(chargeTime, 'charge auction winner', { auctionId });
    //         console.log(`📅 Scheduled winner charging for auction ${auctionId} at ${chargeTime}`);
    //     }
    // }

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
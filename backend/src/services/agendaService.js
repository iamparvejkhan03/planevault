import Agenda from 'agenda';
import Auction from '../models/auction.model.js';
import backendAxios from '../utils/backendAxios.js';
import { cancelAllBidderAuthorizations, cancelLosingBidderAuthorizations, chargeWinningBidder, chargeWinningBidderDirect } from '../controllers/bidPayment.controller.js';
import { auctionEndedAdminEmail, auctionEndingSoonEmail, auctionListedEmail, auctionWonAdminEmail, paymentSuccessEmail, sendAuctionEndedSellerEmail, sendAuctionWonEmail, sendBulkAuctionNotifications } from '../utils/nodemailer.js';
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
        // this.agenda.define('activate auction', async (job) => {
        //     const { auctionId } = job.attrs.data;

        //     try {
        //         const auction = await Auction.findById(auctionId);
        //         if (auction && (auction.status === 'approved')) {
        //             auction.status = 'active';
        //             await auction.save();
        //             await auction.populate('seller', 'email username firstName');

        //             await auctionListedEmail(auction, auction.seller);
        //             // console.log(`✅ Agenda: Activated auction ${auctionId}`);
        //         }
        //     } catch (error) {
        //         console.error('Agenda job error (activate auction):', error);
        //         // Job will retry based on Agenda's retry logic
        //     }
        // });

        // Job to activate an auction at its start time
        this.agenda.define('activate auction', async (job) => {
            const { auctionId } = job.attrs.data;

            try {
                const auction = await Auction.findById(auctionId);
                if (auction && (auction.status === 'approved')) {
                    auction.status = 'active';
                    await auction.save();
                    await auction.populate('seller', 'email username firstName');

                    // Send email to seller
                    await auctionListedEmail(auction, auction.seller);

                    // Send bulk notifications to all users (except admin and auction seller)
                    const allUsers = await User.find({
                        _id: { $ne: auction.seller._id }, // Exclude auction owner
                        userType: { $ne: 'admin' }, // Exclude admin users
                        isActive: true // Only active users
                    }).select('email username firstName preferences userType');

                    // Send bulk notifications
                    await sendBulkAuctionNotifications(allUsers, auction, auction.seller);

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
                    .populate('winner', 'email phone username firstName')
                    .populate('seller', 'email phone username firstName');
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
                            .populate('winner', 'email phone username firstName')
                            .populate('seller', 'email phone username firstName');

                        await sendAuctionWonEmail(populateAuction);
                        await paymentSuccessEmail(populateAuction.winner, populateAuction, populateAuction?.commissionAmount);
                        await sendAuctionEndedSellerEmail(populateAuction);

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

        // this.agenda.define('send ending soon notifications', async (job) => {
        //     try {
        //         const now = new Date();

        //         // Define multiple time thresholds
        //         const thirtyMinutesFromNow = new Date(now.getTime() + (30 * 60 * 1000)); // 30 minutes from now
        //         const twoHoursFromNow = new Date(now.getTime() + (2 * 60 * 60 * 1000)); // 2 hours from now
        //         const twentyFourHoursFromNow = new Date(now.getTime() + (24 * 60 * 60 * 1000)); // 24 hours from now

        //         // Find auctions ending within our thresholds
        //         const endingSoonAuctions = await Auction.find({
        //             status: 'active',
        //             $or: [
        //                 {
        //                     // Ending in next 30 minutes (30-minute notification)
        //                     endDate: {
        //                         $lte: thirtyMinutesFromNow,
        //                         $gt: now
        //                     }
        //                 },
        //                 {
        //                     // Ending in next 2 hours but after 30 minutes (2-hour notification)
        //                     endDate: {
        //                         $lte: twoHoursFromNow,
        //                         $gt: thirtyMinutesFromNow
        //                     }
        //                 },
        //                 {
        //                     // Ending in next 24 hours but after 2 hours (24-hour notification)
        //                     endDate: {
        //                         $lte: twentyFourHoursFromNow,
        //                         $gt: twoHoursFromNow
        //                     }
        //                 }
        //             ]
        //         }).populate('bids.bidder', 'email username preferences');

        //         // Track which notifications we've sent to avoid duplicates
        //         const sentNotifications = new Set();

        //         for (const auction of endingSoonAuctions) {
        //             // Calculate exact time remaining for this auction
        //             const timeRemaining = auction.endDate - now;
        //             const minutesRemaining = Math.ceil(timeRemaining / (60 * 1000));
        //             const hoursRemaining = Math.ceil(timeRemaining / (60 * 60 * 1000));

        //             // Determine which notification threshold this auction falls into
        //             let timeLabel;
        //             if (timeRemaining <= 30 * 60 * 1000) {
        //                 // 30 minutes or less
        //                 timeLabel = minutesRemaining <= 1 ? 'Less than 1 minute' :
        //                     minutesRemaining <= 5 ? 'Less than 5 minutes' :
        //                         minutesRemaining <= 30 ? `${minutesRemaining} minutes` : '30 minutes';
        //             } else if (timeRemaining <= 2 * 60 * 60 * 1000) {
        //                 // 2 hours or less (but more than 30 minutes)
        //                 timeLabel = hoursRemaining <= 1 ? '1 hour' : '2 hours';
        //             } else {
        //                 // 24 hours or less (but more than 2 hours)
        //                 const daysRemaining = Math.ceil(timeRemaining / (24 * 60 * 60 * 1000));
        //                 timeLabel = daysRemaining === 1 ? '24 hours' : `${daysRemaining} days`;
        //             }

        //             // Get unique bidders who want notifications
        //             const bidders = auction.bids
        //                 .map(bid => bid.bidder)
        //                 .filter((bidder, index, array) =>
        //                     bidder &&
        //                     array.findIndex(b => b._id.toString() === bidder._id.toString()) === index &&
        //                     bidder.preferences?.bidAlerts !== false
        //                 );

        //             // Send to each bidder
        //             for (const bidder of bidders) {
        //                 try {
        //                     // Create a unique key to prevent duplicate notifications for the same time threshold
        //                     const notificationKey = `${auction._id}-${bidder._id}-${timeLabel}`;

        //                     if (!sentNotifications.has(notificationKey)) {
        //                         await auctionEndingSoonEmail(
        //                             bidder.email,
        //                             bidder.username,
        //                             auction,
        //                             timeLabel
        //                         );
        //                         sentNotifications.add(notificationKey);
        //                         console.log(`✅ Sent ${timeLabel} notification to ${bidder.email} for auction ${auction.title}`);
        //                     }
        //                 } catch (error) {
        //                     console.error(`Failed to send ending soon email to ${bidder.email}:`, error);
        //                 }
        //             }
        //         }

        //         console.log(`📧 Sent ending soon notifications for ${endingSoonAuctions.length} auctions`);
        //     } catch (error) {
        //         console.error('Agenda job error (ending soon notifications):', error);
        //     }
        // });

        // this.agenda.define('send ending soon notifications', async (job) => {
        //     try {
        //         const now = new Date();

        //         // Define multiple time thresholds
        //         const thirtyMinutesFromNow = new Date(now.getTime() + (30 * 60 * 1000));
        //         const twoHoursFromNow = new Date(now.getTime() + (2 * 60 * 60 * 1000));
        //         const twentyFourHoursFromNow = new Date(now.getTime() + (24 * 60 * 60 * 1000));

        //         // Find auctions ending within our thresholds that haven't had notifications sent yet
        //         const endingSoonAuctions = await Auction.find({
        //             status: 'active',
        //             $or: [
        //                 {
        //                     // Ending in exactly 30 minutes (±15 minutes window)
        //                     endDate: {
        //                         $lte: thirtyMinutesFromNow,
        //                         $gte: new Date(now.getTime() + (15 * 60 * 1000)) // 15 minutes from now
        //                     },
        //                     'notifications.ending30min': { $ne: true } // Not sent yet
        //                 },
        //                 {
        //                     // Ending in exactly 2 hours (±15 minutes window)
        //                     endDate: {
        //                         $lte: twoHoursFromNow,
        //                         $gte: new Date(now.getTime() + (105 * 60 * 1000)) // 1 hour 45 minutes from now
        //                     },
        //                     'notifications.ending2hour': { $ne: true } // Not sent yet
        //                 },
        //                 {
        //                     // Ending in exactly 24 hours (±15 minutes window)
        //                     endDate: {
        //                         $lte: twentyFourHoursFromNow,
        //                         $gte: new Date(now.getTime() + (1425 * 60 * 1000)) // 23 hours 45 minutes from now
        //                     },
        //                     'notifications.ending24hour': { $ne: true } // Not sent yet
        //                 }
        //             ]
        //         }).populate('bids.bidder', 'email username preferences');

        //         for (const auction of endingSoonAuctions) {
        //             // Calculate exact time remaining for this auction
        //             const timeRemaining = auction.endDate - now;
        //             const minutesRemaining = Math.ceil(timeRemaining / (60 * 1000));

        //             // Determine which notification threshold this auction falls into
        //             let notificationType, timeLabel;

        //             if (minutesRemaining <= 45 && minutesRemaining >= 15) {
        //                 // 30-minute notification window (30 minutes ±15 minutes)
        //                 notificationType = 'ending30min';
        //                 timeLabel = '30 minutes';
        //             } else if (minutesRemaining <= 135 && minutesRemaining >= 105) {
        //                 // 2-hour notification window (2 hours ±15 minutes)
        //                 notificationType = 'ending2hour';
        //                 timeLabel = '2 hours';
        //             } else if (minutesRemaining <= 1455 && minutesRemaining >= 1425) {
        //                 // 24-hour notification window (24 hours ±15 minutes)
        //                 notificationType = 'ending24hour';
        //                 timeLabel = '24 hours';
        //             } else {
        //                 // Skip if not in any precise notification window
        //                 continue;
        //             }

        //             // Get unique bidders who want notifications
        //             const bidders = auction.bids
        //                 .map(bid => bid.bidder)
        //                 .filter((bidder, index, array) =>
        //                     bidder &&
        //                     array.findIndex(b => b._id.toString() === bidder._id.toString()) === index &&
        //                     bidder.preferences?.bidAlerts !== false
        //                 );

        //             // Send to each bidder
        //             for (const bidder of bidders) {
        //                 try {
        //                     await auctionEndingSoonEmail(
        //                         bidder.email,
        //                         bidder.username,
        //                         auction,
        //                         timeLabel
        //                     );
        //                     console.log(`✅ Sent ${timeLabel} notification to ${bidder.email} for auction ${auction.title}`);
        //                 } catch (error) {
        //                     console.error(`Failed to send ending soon email to ${bidder.email}:`, error);
        //                 }
        //             }

        //             // Mark this notification as sent in the auction document
        //             await Auction.findByIdAndUpdate(auction._id, {
        //                 $set: {
        //                     [`notifications.${notificationType}`]: true,
        //                     [`notifications.${notificationType}SentAt`]: new Date()
        //                 }
        //             });
        //         }

        //         console.log(`📧 Sent ending soon notifications for ${endingSoonAuctions.length} auctions`);
        //     } catch (error) {
        //         console.error('Agenda job error (ending soon notifications):', error);
        //     }
        // });

        this.agenda.define('send ending soon notifications', async (job) => {
            try {
                const now = new Date();

                // Define multiple time thresholds
                const thirtyMinutesFromNow = new Date(now.getTime() + (30 * 60 * 1000));
                const twoHoursFromNow = new Date(now.getTime() + (2 * 60 * 60 * 1000));
                const twentyFourHoursFromNow = new Date(now.getTime() + (24 * 60 * 60 * 1000));

                // Find auctions ending within our thresholds that haven't had notifications sent yet
                const endingSoonAuctions = await Auction.find({
                    status: 'active',
                    $or: [
                        {
                            // Ending in exactly 30 minutes (±15 minutes window)
                            endDate: {
                                $lte: thirtyMinutesFromNow,
                                $gte: new Date(now.getTime() + (15 * 60 * 1000)) // 15 minutes from now
                            },
                            'notifications.ending30min': { $ne: true } // Not sent yet
                        },
                        {
                            // Ending in exactly 2 hours (±15 minutes window)
                            endDate: {
                                $lte: twoHoursFromNow,
                                $gte: new Date(now.getTime() + (105 * 60 * 1000)) // 1 hour 45 minutes from now
                            },
                            'notifications.ending2hour': { $ne: true } // Not sent yet
                        },
                        {
                            // Ending in exactly 24 hours (±15 minutes window)
                            endDate: {
                                $lte: twentyFourHoursFromNow,
                                $gte: new Date(now.getTime() + (1425 * 60 * 1000)) // 23 hours 45 minutes from now
                            },
                            'notifications.ending24hour': { $ne: true } // Not sent yet
                        }
                    ]
                }).populate('seller', 'email username preferences userType'); // Populate seller to exclude them

                for (const auction of endingSoonAuctions) {
                    // Calculate exact time remaining for this auction
                    const timeRemaining = auction.endDate - now;
                    const minutesRemaining = Math.ceil(timeRemaining / (60 * 1000));

                    // Determine which notification threshold this auction falls into
                    let notificationType, timeLabel;

                    if (minutesRemaining <= 45 && minutesRemaining >= 15) {
                        // 30-minute notification window (30 minutes ±15 minutes)
                        notificationType = 'ending30min';
                        timeLabel = '30 minutes';
                    } else if (minutesRemaining <= 135 && minutesRemaining >= 105) {
                        // 2-hour notification window (2 hours ±15 minutes)
                        notificationType = 'ending2hour';
                        timeLabel = '2 hours';
                    } else if (minutesRemaining <= 1455 && minutesRemaining >= 1425) {
                        // 24-hour notification window (24 hours ±15 minutes)
                        notificationType = 'ending24hour';
                        timeLabel = '24 hours';
                    } else {
                        // Skip if not in any precise notification window
                        continue;
                    }

                    // Find ALL users who should receive notifications (excluding auction seller, admins, and opted-out users)
                    const allUsers = await User.find({
                        _id: { $ne: auction.seller._id }, // Exclude auction owner
                        userType: { $ne: 'admin' }, // Exclude admin users
                        'preferences.bidAlerts': { $ne: false }, // Exclude users who opted out
                        isActive: true // Only active users
                    }).select('email username preferences userType');

                    // Send to each user
                    for (const user of allUsers) {
                        try {
                            await auctionEndingSoonEmail(
                                user.email,
                                user.username,
                                auction,
                                timeLabel
                            );
                            console.log(`✅ Sent ${timeLabel} notification to ${user.email} (${user.userType}) for auction ${auction.title}`);
                        } catch (error) {
                            console.error(`Failed to send ending soon email to ${user.email}:`, error);
                        }
                    }

                    // Mark this notification as sent in the auction document
                    await Auction.findByIdAndUpdate(auction._id, {
                        $set: {
                            [`notifications.${notificationType}`]: true,
                            [`notifications.${notificationType}SentAt`]: new Date()
                        }
                    });

                    console.log(`📧 Sent ${timeLabel} notifications for auction "${auction.title}" to ${allUsers.length} users`);
                }

                console.log(`📧 Completed ending soon notifications for ${endingSoonAuctions.length} auctions`);
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
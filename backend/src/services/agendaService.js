import Agenda from 'agenda';
import Auction from '../models/auction.model.js';

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
                if (auction && auction.status === 'draft') {
                    auction.status = 'active';
                    await auction.save();
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
                const auction = await Auction.findById(auctionId);
                if (auction && auction.status === 'active') {
                    await auction.endAuction();
                    console.log(`✅ Agenda: Ended auction ${auctionId}`);
                }
            } catch (error) {
                console.error('Agenda job error (end auction):', error);
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
    }

    // Graceful shutdown
    async stop() {
        await this.agenda.stop();
        console.log('🛑 Agenda service stopped');
    }
}

export default new AgendaService();
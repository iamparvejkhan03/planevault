// models/watchlist.model.js
import { Schema, model } from 'mongoose';

const watchlistSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    auction: {
        type: Schema.Types.ObjectId,
        ref: 'Auction',
        required: true
    },
    addedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Prevent duplicate entries
watchlistSchema.index({ user: 1, auction: 1 }, { unique: true });

// Index for common queries
watchlistSchema.index({ user: 1 });
watchlistSchema.index({ auction: 1 });

const Watchlist = model('Watchlist', watchlistSchema);

export default Watchlist;
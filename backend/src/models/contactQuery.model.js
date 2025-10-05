// models/contactQuery.model.js
import { Schema, model } from 'mongoose';

const contactQuerySchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        trim: true
    },
    userType: {
        type: String,
        enum: ['bidder', 'seller'],
        required: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['new', 'in-progress', 'resolved', 'closed'],
        default: 'new'
    },
    category: {
        type: String,
        enum: ['bidding', 'listing', 'account', 'payment', 'technical', 'general', 'fees', 'platform', 'post-auction'],
        default: 'general'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    assignedTo: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    notes: {
        type: String,
        trim: true,
        default: ''
    },
    response: {
        type: String,
        trim: true,
        default: ''
    },
    respondedAt: {
        type: Date
    },
    ipAddress: {
        type: String,
        trim: true
    },
    userAgent: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Indexes for efficient queries
contactQuerySchema.index({ status: 1, createdAt: -1 });
contactQuerySchema.index({ email: 1, createdAt: -1 });
contactQuerySchema.index({ userType: 1 });
contactQuerySchema.index({ category: 1 });

// Virtual for query ID
contactQuerySchema.virtual('queryId').get(function() {
    return `UQ${this._id.toString().slice(-6).toUpperCase()}`;
});

const ContactQuery = model('ContactQuery', contactQuerySchema);

export default ContactQuery;
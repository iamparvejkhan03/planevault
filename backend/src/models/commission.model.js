import { Schema, model } from 'mongoose';

const commissionSchema = new Schema({
    category: {
        type: String,
        enum: ['Aircraft', 'Engines & Parts', 'Memorabilia'],
        required: true,
        unique: true
    },
    commissionAmount: { 
        type: Number,
        required: true,
        min: 0
    },
    description: {
        type: String,
        default: ''
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

const Commission = model('Commission', commissionSchema);

export default Commission;
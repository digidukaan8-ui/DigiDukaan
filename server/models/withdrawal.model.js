import mongoose, { Schema } from 'mongoose';

const withdrawalSchema = new Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },

    status: {
      type: String,
      enum: ['PENDING', 'COMPLETED', 'REJECTED'],
      default: 'COMPLETED',
      required: true,
    },

    processedAt: {
      type: Date,
      default: null,
    },

    payoutMethod: {
      type: String,
      default: 'Bank Transfer',
    },
    
    notes: {
      type: String,
    }
  },
  {
    timestamps: true,
  }
);

const Withdrawal = mongoose.model('Withdrawal', withdrawalSchema);
export default Withdrawal;
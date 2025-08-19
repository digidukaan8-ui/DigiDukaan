import mongoose from "mongoose";

const storeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  img: {
    url: {
      type: String,
      required: true,
      trim: true,
    },
    publicId: {
      type: String,
      required: true,
      trim: true,
    },
  },
  description: {
    type: String,
    trim: true,
  },
  category: [
    {
      type: String,
      trim: true
    }
  ],
  addresses: [
    {
      addressLine1: {
        type: String,
        required: true,
        trim: true,
      },
      addressLine2: {
        type: String,
        trim: true,
      },
      city: {
        type: String,
        required: true,
        trim: true,
      },
      state: {
        type: String,
        required: true,
        trim: true,
      },
      pincode: {
        type: String,
        required: true,
        trim: true,
      }
    }
  ],
}, { timestamps: true });

const Store = mongoose.model("Store", storeSchema);

export default Store;
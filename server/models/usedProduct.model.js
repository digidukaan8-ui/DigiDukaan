import mongoose from "mongoose";

function capitalizeFirst(str) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

const usedProductSchema = new mongoose.Schema({
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Store",
    required: true
  },

  title: {
    type: String,
    required: true,
    trim: true
  },

  description: {
    type: String,
    required: true,
    trim: true
  },

  category: {
    name: { type: String, required: true, trim: true, set: capitalizeFirst },
    slug: { type: String, required: true, trim: true }
  },

  subCategory: {
    name: { type: String, required: true, trim: true, set: capitalizeFirst },
    slug: { type: String, required: true, trim: true }
  },

  condition: {
    type: String,
    enum: ["new", "like new", "used", "refurbished"],
    required: true
  },

  price: {
    type: Number,
    required: true
  },

  isNegotiable: {
    type: Boolean,
    default: false
  },

  img: [
    {
      url: { type: String, required: true },
      publicId: { type: String, required: true }
    }
  ],

  video: {
    url: { type: String },
    publicId: { type: String }
  },

  brand: { type: String, trim: true },

  attributes: [
    {
      key: { type: String, required: true },
      value: { type: String, required: true }
    }
  ],

  billAvailable: { type: Boolean, default: false },

  isSold: { type: Boolean, default: false },

  discount: {
    percentage: { type: Number, min: 0, max: 100, default: null },
    amount: { type: Number, min: 0, default: null }
  },

  delivery: {
    type: {
      type: String,
      enum: ["pickup", "shipping", "both"],
      default: "pickup"
    },
    pickupLocation: {
      address: { type: String },
      city: { type: String },
      state: { type: String },
      pincode: { type: String }
    },
    shippingLocations: [
      {
        shippingArea: {
          type: String,
          required: true,
          enum: [
            "Country",
            "State",
            "District",
            "City",
            "Town",
            "Village",
            "Suburb",
            "Area",
            "Taluka",
            "Tehsil",
            "Locality",
            "Street",
            "Landmark",
            "Pincode",
          ],
          trim: true,
          required: true,
          set: capitalizeFirst,
        },
        areaName: {
          type: String,
          required: true,
          trim: true,
          set: capitalizeFirst,
        },
        shippingCharge: {
          type: Number,
          default: 0
        }
      }
    ]
  },

  tags: { type: [String], default: [] }
}, { timestamps: true });

usedProductSchema.index({ storeId: 1, "category.slug": 1, "subCategory.slug": 1 });

const UsedProduct = mongoose.model("UsedProduct", usedProductSchema);

export default UsedProduct;
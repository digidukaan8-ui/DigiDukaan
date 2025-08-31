import mongoose from "mongoose";

function capitalizeFirst(str) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

const deliveryZoneSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    deliveryArea: {
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
    deliveryCharge: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

deliveryZoneSchema.index(
  { storeId: 1, areaName: 1 },
  { unique: true }
);

const DeliveryZone = mongoose.model("DeliveryZone", deliveryZoneSchema);

export default DeliveryZone;
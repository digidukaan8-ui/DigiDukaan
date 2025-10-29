import DeliveryZone from "../models/deliveryzone.model.js";
import CityMapping from "../models/citymapping.model.js";
import mongoose from "mongoose";

const _getLocationData = async (location) => {
  const searchLocation = location.trim().toLowerCase();
  const baseLocation = searchLocation
    .replace(/\s*(east|west|north|south|central)\s*/gi, '')
    .trim();
  const locationRegex = new RegExp(baseLocation.split(' ').join('\\s*'), 'i');
  const isPincode = /^\d{6}$/.test(searchLocation);

  const cityMapping = await CityMapping.findOne({
    $or: [
      { name: searchLocation },
      { name: baseLocation },
      { pincodes: searchLocation }
    ]
  });

  let zoneSearchQuery;
  let productAreaMatchArray = [];
  let productPincodeMatchArray = [];
  let productCityMatchArray = [];

  if (cityMapping) {
    productAreaMatchArray = [
      ...cityMapping.areas.map(area => new RegExp(area.split(' ').join('\\s*'), 'i')),
      new RegExp(cityMapping.name.split(' ').join('\\s*'), 'i')
    ];
    productPincodeMatchArray = cityMapping.pincodes.map(p => p.toString());
    productCityMatchArray = [new RegExp(cityMapping.name.split(' ').join('\\s*'), 'i')];

    zoneSearchQuery = {
      $or: [
        { areaName: { $in: productAreaMatchArray } },
        { areaName: { $in: productPincodeMatchArray } }
      ]
    };
  } else {
    zoneSearchQuery = {
      areaName: locationRegex
    };

    productAreaMatchArray = [locationRegex];
    productPincodeMatchArray = isPincode ? [searchLocation] : [];
    productCityMatchArray = [locationRegex];
  }

  const storeZones = await DeliveryZone.find(zoneSearchQuery).select("storeId");
  const storeIds = [...new Set(storeZones.map((z) => z.storeId.toString()))];
  const mappedStoreIds = storeIds.map(id => new mongoose.Types.ObjectId(id));

  const usedProductOrConditions = [
    { "delivery.pickupLocation.pincode": { $in: productPincodeMatchArray } },
    { "delivery.pickupLocation.city": { $in: productCityMatchArray } },
    { "delivery.pickupLocation.address": locationRegex },
    {
      "delivery.shippingLocations": {
        $elemMatch: {
          $or: [
            { areaName: { $in: productAreaMatchArray } },
            { areaName: { $in: productPincodeMatchArray } }
          ]
        }
      }
    }
  ];

  return {
    mappedStoreIds: mappedStoreIds,
    usedProductOrConditions: usedProductOrConditions
  };
};

export default _getLocationData;
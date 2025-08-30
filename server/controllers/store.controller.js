import DeliveryZone from '../models/deliveryzone.model.js';
import Store from '../models/store.model.js';
import uploadToCloudinary from '../utils/cloudinary.config.js';

const createStore = async (req, res) => {
    try {
        let { userId, name, description, category, addresses } = req.body;

        const storeExists = await Store.findOne({ userId });
        if (storeExists) {
            return res.status(400).json({ success: false, message: "Store already exists, can't create new" });
        }

        if (typeof category === "string") {
            try {
                category = JSON.parse(category);
            } catch (err) {
                return res.status(400).json({ success: false, message: "Invalid category format" });
            }
        }

        if (typeof addresses === "string") {
            try {
                addresses = JSON.parse(addresses);
            } catch (err) {
                return res.status(400).json({ success: false, message: "Invalid addresses format" });
            }
        }

        let imgData = null;
        if (req.file) {
            const result = await uploadToCloudinary(req.file.path);
            if (result) {
                imgData = {
                    url: result.secure_url,
                    publicId: result.public_id
                };
            } else {
                return res.status(501).json({ success: false, message: 'Failed to upload Image' });
            }
        }

        const store = new Store({
            userId,
            name,
            description,
            category,
            addresses,
            img: imgData
        });

        await store.save();

        const data = {
            _id: store._id,
            userId,
            name,
            description,
            category,
            addresses,
            img: imgData.url,
        }

        return res.status(201).json({ success: true, data: data });
    } catch (error) {
        console.error('Error in createStore controller: ', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

const addDeliveryZone = async (req, res) => {
    try {
        const { storeId, deliveryArea, areaName } = req.body;

        const store = await Store.findById(storeId);
        if (!store) {
            return res.status(404).json({ success: false, message: 'Store not found' });
        }

        const newDeliveryZone = new DeliveryZone({
            storeId,
            deliveryArea,
            areaName
        });

        await newDeliveryZone.save();

        const data = {
            _id: newDeliveryZone._id,
            storeId,
            deliveryArea,
            areaName
        };

        return res.status(201).json({ success: true, message: 'Delivery Zone added successfully', data });
    } catch (error) {
        console.error('Error in Delivery Zone controller: ', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

export { createStore, addDeliveryZone };
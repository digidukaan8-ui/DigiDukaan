import DeliveryZone from '../models/deliveryzone.model.js';
import Store from '../models/store.model.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary.config.js';

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


        return res.status(201).json({ success: true, message: 'Store created successfully', data: store });
    } catch (error) {
        console.error('Error in createStore controller: ', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

const updateStore = async (req, res) => {
    try {
        let { storeId, name, description, category, addresses, img } = req.body;

        const store = await Store.findById(storeId);
        if (!store) {
            return res.status(404).json({ success: false, message: "Store not found" });
        }

        if (typeof category === "string") {
            try {
                category = JSON.parse(category);
            } catch {
                return res.status(400).json({ success: false, message: "Invalid category format" });
            }
        }

        if (typeof addresses === "string") {
            try {
                addresses = JSON.parse(addresses);
            } catch {
                return res.status(400).json({ success: false, message: "Invalid addresses format" });
            }
        }

        let updatedImg = store.img;

        if (req.files?.img && req.files.img.length > 0) {
            const filePath = req.files.img[0].path;

            if (store.img?.publicId) {
                await deleteFromCloudinary(store.img.publicId);
            }

            const result = await uploadToCloudinary(filePath);
            if (!result) {
                return res.status(501).json({ success: false, message: "Failed to upload image" });
            }

            updatedImg = {
                url: result.secure_url,
                publicId: result.public_id,
            };
        }
        else if (img) {
            try {
                updatedImg = typeof img === "string" ? JSON.parse(img) : img;
            } catch {
                return res.status(400).json({ success: false, message: "Invalid image format" });
            }
        }

        store.name = name;
        store.description = description;
        store.category = category;
        store.addresses = addresses;
        store.img = updatedImg;

        await store.save();

        return res.json({
            success: true,
            message: "Store updated successfully",
            data: store,
        });
    } catch (error) {
        console.error("Error in Update Store controller: ", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const addDeliveryZone = async (req, res) => {
    try {
        const { storeId, deliveryArea, areaName, deliveryCharge } = req.body;

        const store = await Store.findById(storeId);
        if (!store) {
            return res.status(404).json({ success: false, message: 'Store not found' });
        }

        const newDeliveryZone = new DeliveryZone({
            storeId,
            deliveryArea,
            areaName,
            deliveryCharge
        });

        await newDeliveryZone.save();

        return res.status(201).json({ success: true, message: 'Delivery Zone added successfully', data: newDeliveryZone });
    } catch (error) {
        console.error('Error in Delivery Zone controller: ', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

const updateDeliveryZone = async (req, res) => {
    try {
        const { id, deliveryArea, areaName, deliveryCharge } = req.body;

        const updatedZone = await DeliveryZone.findByIdAndUpdate(
            id,
            { $set: { deliveryArea, areaName, deliveryCharge } },
            { new: true }
        );

        if (!updatedZone) {
            return res.status(404).json({ success: false, message: 'Delivery Zone not found' });
        }

        return res.status(200).json({ success: true, message: 'Delivery zone updated successfully', data: updatedZone });
    } catch (error) {
        console.error('Error in Updating Delivery Zone controller: ', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const removeDeliveryZone = async (req, res) => {
    try {
        const { id } = req.body;
        const result = await DeliveryZone.deleteOne({ _id: id });

        if (result.deletedCount === 0) {
            return res.status(404).json({ success: false, message: 'Delivery Zone not found' });
        }

        return res.status(200).json({ success: true, message: 'Delivery zone removed successfully' });
    } catch (error) {
        console.error('Error in Remove Delivery Zone controller: ', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export { createStore, updateStore, addDeliveryZone, updateDeliveryZone, removeDeliveryZone };
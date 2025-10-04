import DeliveryZone from '../models/deliveryzone.model.js';
import Store from '../models/store.model.js';
import Product from '../models/product.model.js';
import UsedProduct from '../models/usedProduct.model.js';
import Order from '../models/order.model.js';
import Review from '../models/review.model.js';
import View from '../models/view.model.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary.config.js';

const createStore = async (req, res) => {
    try {
        let { name, description, category, addresses } = req.body;
        const userId = req.user._id;

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
        if (req.files?.img && req.files.img.length > 0) {
            const filePath = req.files.img[0].path;

            const result = await uploadToCloudinary(filePath);
            if (!result) {
                return res.status(501).json({ success: false, message: "Failed to upload image" });
            }

            imgData = {
                url: result.secure_url,
                publicId: result.public_id,
            };
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
        let { name, description, category, addresses, img } = req.body;
        const { storeId } = req.params;

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

        store.name = name || store.name;
        store.description = description || store.description;
        store.category = category || store.category;
        store.addresses = addresses || store.addresses;
        store.img = updatedImg || store.img;

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
        const { deliveryArea, areaName, deliveryCharge, deliveryDays } = req.body;
        const { storeId } = req.params;

        const store = await Store.findById(storeId);
        if (!store) {
            return res.status(404).json({ success: false, message: 'Store not found' });
        }

        const newDeliveryZone = new DeliveryZone({
            storeId,
            deliveryArea,
            areaName,
            deliveryCharge,
            deliveryDays
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
        const { deliveryArea, areaName, deliveryCharge, deliveryDays } = req.body;
        const { zoneId } = req.params;
        const updatedZone = await DeliveryZone.findByIdAndUpdate(
            zoneId,
            { $set: { deliveryArea, areaName, deliveryCharge, deliveryDays } },
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
        const { zoneId } = req.params;
        const result = await DeliveryZone.findByIdAndDelete(zoneId);

        if (!result) {
            return res.status(404).json({ success: false, message: 'Delivery Zone not found' });
        }

        return res.status(200).json({ success: true, message: 'Delivery zone removed successfully' });
    } catch (error) {
        console.error('Error in Remove Delivery Zone controller: ', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const getStoreInfo = async (req, res) => {
    try {
        const { storeId } = req.params;
        if (!storeId) {
            return res.status(400).json({ success: false, message: 'Store Id is required' });
        }

        const newProductCount = await Product.countDocuments({ storeId });
        const usedProductCount = await UsedProduct.countDocuments({ storeId });
        const orderCount = await Order.countDocuments({ storeId });
        const reviewCount = await Review.countDocuments({ storeId });

        const newProducts = await Product.find({ storeId }, { _id: 1 });
        const usedProducts = await UsedProduct.find({ storeId }, { _id: 1 });

        const allProductIds = [
            ...newProducts.map(p => p._id),
            ...usedProducts.map(p => p._id),
        ];

        let viewCount = 0;
        if (allProductIds.length > 0) {
            viewCount = await View.countDocuments({
                productIds: { $in: allProductIds }
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Store information fetched successfully',
            data: {
                newProductCount,
                usedProductCount,
                viewCount,
                orderCount,
                reviewCount
            }
        });
    } catch (error) {
        console.error('Error in Get Store Info controller: ', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const getStoreDeliveryCharge = async (req, res) => {
    try {
        let storeIds = req.body;

        if (typeof storeIds === "string") {
            try {
                storeIds = JSON.parse(storeIds);
            } catch (error) {
                return res.status(400).json({ success: false, message: "Invalid storeIds format" });
            }
        }

        if (!Array.isArray(storeIds) || storeIds.length === 0) {
            return res.status(400).json({ success: false, message: "storeIds must be a non-empty array" });
        }

        const deliveryCharge = await DeliveryZone.find({ storeId: { $in: storeIds } });

        return res.status(200).json({ success: true, message: "Store delivery charge fetched successfully", data: deliveryCharge });
    } catch (error) {
        console.error("Error in Get Store Delivery Charge controller: ", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export { createStore, updateStore, addDeliveryZone, updateDeliveryZone, removeDeliveryZone, getStoreInfo, getStoreDeliveryCharge };
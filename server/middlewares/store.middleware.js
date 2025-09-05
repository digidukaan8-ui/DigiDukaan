import User from "../models/user.model.js";

const handleCreateStore = async (req, res, next) => {
    try {
        let { name, description, category, addresses } = req.body;
        const userId = req.user._id;

        if (addresses) {
            try {
                addresses = JSON.parse(addresses);
            } catch (err) {
                return res.status(400).json({ success: false, message: "Invalid addresses format" });
            }
        }

        if (category) {
            try {
                category = JSON.parse(category);
            } catch (err) {
                return res.status(400).json({ success: false, message: "Invalid category format" });
            }
        }

        if (!userId || !name || !description || !category || category.length === 0 || !addresses || addresses.length === 0) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        if (typeof userId !== "string" || typeof name !== "string" || typeof description !== "string") {
            return res.status(400).json({ success: false, message: "Invalid input format" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ success: false, message: 'User not found' });
        }

        if (!Array.isArray(category) || category.length === 0) {
            return res.status(400).json({ success: false, message: "Category must be a non-empty array" });
        }

        if (!Array.isArray(addresses) || addresses.length === 0) {
            return res.status(400).json({ success: false, message: "Addresses must be a non-empty array" });
        }

        if (!req.files?.img || req.files.img.length === 0) {
            return res.status(400).json({ success: false, message: "Image is required" });
        }

        return next();
    } catch (error) {
        console.error("Error in createStore middleware: ", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const handleUpdateStore = async (req, res, next) => {
    try {
        let { name, description, category, addresses } = req.body;
        const { storeId } = req.params;

        if (addresses) {
            try {
                addresses = JSON.parse(addresses);
            } catch (err) {
                return res.status(400).json({ success: false, message: "Invalid addresses format" });
            }
        }

        if (category) {
            try {
                category = JSON.parse(category);
            } catch (err) {
                return res.status(400).json({ success: false, message: "Invalid category format" });
            }
        }

        if (!storeId || !name || !description || !category?.length || !addresses?.length) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        if (typeof storeId !== "string" || typeof name !== "string" || typeof description !== "string") {
            return res.status(400).json({ success: false, message: "Invalid input format" });
        }

        if (!Array.isArray(category) || category.length === 0) {
            return res.status(400).json({ success: false, message: "Category must be a non-empty array" });
        }

        if (!Array.isArray(addresses) || addresses.length === 0) {
            return res.status(400).json({ success: false, message: "Addresses must be a non-empty array" });
        }

        if ((!req.files?.img || req.files.img.length === 0) && !req.body.img) {
            return res.status(400).json({ success: false, message: "Image is required" });
        }

        return next();
    } catch (error) {
        console.error("Error in updateStore middleware: ", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};


const handleDeliveryZone = async (req, res, next) => {
    try {
        const { deliveryArea, areaName, deliveryCharge } = req.body;
        const { storeId } = req.params;

        if (!storeId || !deliveryArea || !areaName) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        if (typeof (storeId) !== 'string' || typeof (deliveryArea) !== 'string' || typeof (areaName) !== 'string' || typeof (deliveryCharge) !== 'number') {
            return res.status(400).json({ success: false, message: 'Invalid input format' });
        }

        return next();
    } catch (error) {
        console.error("Error in Delivery Zone middleware: ", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

const handleUpdateDeliveryZone = async (req, res, next) => {
    try {
        const { deliveryArea, areaName, deliveryCharge } = req.body;
        const { zoneId } = req.params;

        if (!zoneId || !deliveryArea || !areaName) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        if (typeof (zoneId) !== 'string' || typeof (deliveryArea) !== 'string' || typeof (areaName) !== 'string' || typeof (deliveryCharge) !== 'number') {
            return res.status(400).json({ success: false, message: 'Invalid input format' });
        }

        return next();
    } catch (error) {
        console.error("Error in Update Delivery Zone middleware: ", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export { handleCreateStore, handleUpdateStore, handleDeliveryZone, handleUpdateDeliveryZone };
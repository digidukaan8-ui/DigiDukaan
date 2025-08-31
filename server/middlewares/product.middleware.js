import Store from "../models/store.model.js";

const handleAddProduct = async (req, res, next) => {
    try {
        let { title, description, category, subCategory, price, discount, stock, attributes, brand, tags, deliveryCharge } = req.body;
        const { storeId } = req.params;

        if (attributes && typeof attributes === "string") {
            try {
                attributes = JSON.parse(attributes);
            } catch (err) {
                return res.status(400).json({ success: false, message: "Invalid attributes format" });
            }
        }

        if (tags && typeof tags === "string") {
            try {
                tags = JSON.parse(tags);
            } catch (err) {
                return res.status(400).json({ success: false, message: "Invalid tags format" });
            }
        }

        if (discount && typeof discount === "string") {
            try {
                discount = JSON.parse(discount);
            } catch (err) {
                return res.status(400).json({ success: false, message: "Invalid discount format" });
            }
        }

        if (!storeId || !title || !description || !category || !subCategory || !price || !stock || !attributes) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        if (
            typeof storeId !== 'string' ||
            typeof title !== 'string' ||
            typeof category !== 'string' ||
            typeof description !== 'string' ||
            typeof subCategory !== 'string'
        ) {
            return res.status(400).json({ success: false, message: 'Invalid input format for required fields' });
        }

        if (brand && typeof brand !== "string") {
            return res.status(400).json({ success: false, message: "Invalid brand format" });
        }

        if (tags && !Array.isArray(tags)) {
            return res.status(400).json({ success: false, message: "Tags must be an array" });
        }

        if (discount && typeof discount === "object") {
            if (discount.percentage && (typeof discount.percentage !== "number" || discount.percentage < 0 || discount.percentage > 100)) {
                return res.status(400).json({ success: false, message: "Invalid discount percentage" });
            }
            if (discount.amount && (typeof discount.amount !== "number" || discount.amount < 0)) {
                return res.status(400).json({ success: false, message: "Invalid discount amount" });
            }
        }

        const store = await Store.findById(storeId);
        if (!store) {
            return res.status(400).json({ success: false, message: 'Store not found' });
        }

        if (!req.files?.img || req.files.img.length < 1) {
            return res.status(400).json({ success: false, message: "At least one image is required" });
        }

        if (req.files?.video && req.files.video.length > 1) {
            return res.status(400).json({ success: false, message: "Only one video allowed" });
        }

        req.body.attributes = attributes;
        req.body.tags = tags || [];
        req.body.discount = discount || {};

        return next();
    } catch (error) {
        console.error('Error in Add Product middleware: ', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const hadnleUpdateProduct = async (req, res, next) => {
    try {
        let { title, description, category, subCategory, price, discount, stock, attributes, brand, tags } = req.body;
        const { productId } = req.params;

        if (attributes && typeof attributes === "string") {
            try {
                attributes = JSON.parse(attributes);
            } catch (err) {
                return res.status(400).json({ success: false, message: "Invalid attributes format" });
            }
        }

        if (tags && typeof tags === "string") {
            try {
                tags = JSON.parse(tags);
            } catch (err) {
                return res.status(400).json({ success: false, message: "Invalid tags format" });
            }
        }

        if (discount && typeof discount === "string") {
            try {
                discount = JSON.parse(discount);
            } catch (err) {
                return res.status(400).json({ success: false, message: "Invalid discount format" });
            }
        }

        if (!productId || !title || !description || !category || !subCategory || !price || !stock || !attributes) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        if (
            typeof productId !== 'string' ||
            typeof title !== 'string' ||
            typeof category !== 'string' ||
            typeof description !== 'string' ||
            typeof subCategory !== 'string'
        ) {
            return res.status(400).json({ success: false, message: 'Invalid input format for required fields' });
        }

        if (brand && typeof brand !== "string") {
            return res.status(400).json({ success: false, message: "Invalid brand format" });
        }

        if (tags && !Array.isArray(tags)) {
            return res.status(400).json({ success: false, message: "Tags must be an array" });
        }

        if (discount && typeof discount === "object") {
            if (discount.percentage && (typeof discount.percentage !== "number" || discount.percentage < 0 || discount.percentage > 100)) {
                return res.status(400).json({ success: false, message: "Invalid discount percentage" });
            }
            if (discount.amount && (typeof discount.amount !== "number" || discount.amount < 0)) {
                return res.status(400).json({ success: false, message: "Invalid discount amount" });
            }
        }

        if (!req.files?.img || req.files.img.length < 1) {
            return res.status(400).json({ success: false, message: "At least one image is required" });
        }

        if (req.files?.video && req.files.video.length > 1) {
            return res.status(400).json({ success: false, message: "Only one video allowed" });
        }

        req.body.attributes = attributes;
        req.body.tags = tags || [];
        req.body.discount = discount || {};

        return next();
    } catch (error) {
        console.error('Error in Update Product middleware: ', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

export { handleAddProduct, hadnleUpdateProduct };
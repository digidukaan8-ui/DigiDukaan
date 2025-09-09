import Product from "../models/product.model.js";
import Store from "../models/store.model.js";
import { isValidCategory, isValidSubCategory, isValidUsedProductCategory, isValidUsedProductSubCategory } from "../utils/category.util.js";

const handleAddProduct = async (req, res, next) => {
    try {
        let { title, description, category, subCategory, unit, price, discount, stock, attributes, brand, tags, deliveryCharge } = req.body;

        const { storeId } = req.params;

        if (attributes && typeof attributes === "string") {
            try {
                attributes = JSON.parse(attributes);
            } catch {
                return res.status(400).json({ success: false, message: "Invalid attributes format" });
            }
        }

        if (tags && typeof tags === "string") {
            try {
                tags = JSON.parse(tags);
            } catch {
                return res.status(400).json({ success: false, message: "Invalid tags format" });
            }
        }

        if (discount && typeof discount === "string") {
            try {
                discount = JSON.parse(discount);
            } catch {
                return res.status(400).json({ success: false, message: "Invalid discount format" });
            }
        }

        if (!storeId || !title || !description || !category || !subCategory || !price || !stock || !attributes || !unit) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        if (
            typeof storeId !== "string" ||
            typeof title !== "string" ||
            typeof description !== "string" ||
            typeof category !== "string" ||
            typeof subCategory !== "string" ||
            typeof unit !== "string"
        ) {
            return res.status(400).json({ success: false, message: "Invalid input format for required fields" });
        }

        if (!isValidCategory(category)) {
            return res.status(400).json({ success: false, message: "Invalid category" });
        }

        if (!isValidSubCategory(category, subCategory)) {
            return res.status(400).json({ success: false, message: "Invalid subcategory for the selected category" });
        }

        if (brand && typeof brand !== "string") {
            return res.status(400).json({ success: false, message: "Invalid brand format" });
        }

        if (tags && !Array.isArray(tags)) {
            return res.status(400).json({ success: false, message: "Tags must be an array" });
        }

        if (discount && typeof discount === "object") {
            if (
                discount.percentage &&
                (typeof discount.percentage !== "number" || discount.percentage < 0 || discount.percentage > 100)
            ) {
                return res.status(400).json({ success: false, message: "Invalid discount percentage" });
            }
            if (
                discount.amount &&
                (typeof discount.amount !== "number" || discount.amount < 0)
            ) {
                return res.status(400).json({ success: false, message: "Invalid discount amount" });
            }
        }

        deliveryCharge = Number(deliveryCharge) || 0;
        if (deliveryCharge < 0) {
            return res.status(400).json({ success: false, message: "Invalid delivery charge format" });
        }

        const store = await Store.findById(storeId);
        if (!store) {
            return res.status(400).json({ success: false, message: "Store not found" });
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
        console.error("Error in Add Product middleware: ", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const handleUpdateProduct = async (req, res, next) => {
    try {
        let { title, description, category, subCategory, unit, price, discount, stock, attributes, brand, tags, deliveryCharge } = req.body;
        const { productId } = req.params;

        if (attributes && typeof attributes === "string") {
            try { attributes = JSON.parse(attributes); }
            catch { return res.status(400).json({ success: false, message: "Invalid attributes format" }); }
        }

        if (tags && typeof tags === "string") {
            try { tags = JSON.parse(tags); }
            catch { return res.status(400).json({ success: false, message: "Invalid tags format" }); }
        }

        if (discount && typeof discount === "string") {
            try { discount = JSON.parse(discount); }
            catch { return res.status(400).json({ success: false, message: "Invalid discount format" }); }
        }

        if (!productId || !title || !description || !category || !subCategory || price == null || stock == null || !attributes || !unit) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        if ([title, category, description, subCategory, unit].some(v => typeof v !== "string")) {
            return res.status(400).json({ success: false, message: "Invalid input format for required fields" });
        }

        if (!isValidCategory(category)) {
            return res.status(400).json({ success: false, message: "Invalid category" });
        }

        if (!isValidSubCategory(category, subCategory)) {
            return res.status(400).json({ success: false, message: "Invalid subcategory for the selected category" });
        }

        price = Number(price);
        if (typeof price !== "number" || price < 0) {
            return res.status(400).json({ success: false, message: "Invalid price format" });
        }

        stock = Number(stock);
        if (typeof stock !== "number" || stock < 0) {
            return res.status(400).json({ success: false, message: "Invalid stock format" });
        }

        deliveryCharge = Number(deliveryCharge);
        if (isNaN(deliveryCharge) || deliveryCharge < 0) {
            return res.status(400).json({ success: false, message: "Invalid delivery charge format" });
        }

        if (brand && typeof brand !== "string") {
            return res.status(400).json({ success: false, message: "Invalid brand format" });
        }

        if (tags && !Array.isArray(tags)) {
            return res.status(400).json({ success: false, message: "Tags must be an array" });
        }

        if (!attributes || !Array.isArray(attributes) || !attributes.every(attr => typeof attr === "object" && attr.key && attr.value)) {
            return res.status(400).json({ success: false, message: "Attributes must be a valid object" });
        }

        if (discount && typeof discount === "object") {
            if (discount.percentage != null) {
                if (typeof discount.percentage !== "number" || discount.percentage < 0 || discount.percentage > 100) {
                    return res.status(400).json({ success: false, message: "Invalid discount percentage" });
                }
            }

            if (discount.amount != null) {
                if (typeof discount.amount !== "number" || discount.amount < 0) {
                    return res.status(400).json({ success: false, message: "Invalid discount amount" });
                }
            }
        }

        req.body.attributes = attributes;
        req.body.tags = tags || [];
        req.body.discount = discount || {};

        return next();
    } catch (error) {
        console.error("Error in Update Product middleware: ", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const handleAddUsedProduct = async (req, res, next) => {
    try {
        let { title, description, category, subCategory, unit, price, condition, attributes, brand, tags, isNegotiable, billAvailable, delivery, discount } = req.body;
        const { storeId } = req.params;
        if (typeof attributes === "string") attributes = JSON.parse(attributes);
        if (typeof tags === "string") tags = JSON.parse(tags);
        if (typeof discount === "string") discount = JSON.parse(discount);
        if (typeof delivery === "string") delivery = JSON.parse(delivery);

        if (!title || !description || !category || !subCategory || !price || !condition || !attributes || !unit) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        isNegotiable = Boolean(isNegotiable);
        billAvailable = Boolean(billAvailable);
        if (
            typeof title !== "string" ||
            typeof description !== "string" ||
            typeof category !== "string" ||
            typeof subCategory !== "string" ||
            typeof condition !== "string" ||
            typeof isNegotiable !== "boolean" ||
            typeof billAvailable !== "boolean" ||
            typeof unit !== "string"
        ) {
            return res.status(400).json({ success: false, message: "Invalid types for required fields" });
        }

        if (!isValidUsedProductCategory(category)) return res.status(400).json({ success: false, message: "Invalid category" });
        if (!isValidUsedProductSubCategory(category, subCategory)) return res.status(400).json({ success: false, message: "Invalid subcategory" });

        if (brand && typeof brand !== "string") return res.status(400).json({ success: false, message: "Invalid brand format" });
        if (tags && !Array.isArray(tags)) return res.status(400).json({ success: false, message: "Tags must be an array" });

        if (!Array.isArray(attributes) || attributes.some(a => !a.key || !a.value)) {
            return res.status(400).json({ success: false, message: "Invalid attributes format" });
        }

        if (discount) {
            if (discount.percentage != null && (typeof discount.percentage !== "number" || discount.percentage < 0 || discount.percentage > 100)) {
                return res.status(400).json({ success: false, message: "Invalid discount percentage" });
            }
            if (discount.amount != null && (typeof discount.amount !== "number" || discount.amount < 0)) {
                return res.status(400).json({ success: false, message: "Invalid discount amount" });
            }
        }

        if (delivery) {
            const { type, pickupLocation, shippingLocations } = delivery;

            if ((!shippingLocations || shippingLocations.length === 0) && !pickupLocation) {
                return res.status(400).json({ success: false, message: "Either pickupLocation or shippingLocations is required" });
            }

            if (!type || typeof type !== "string") {
                return res.status(400).json({ success: false, message: "Invalid delivery type" });
            }

            if (pickupLocation) {
                if (typeof pickupLocation !== "object") {
                    return res.status(400).json({ success: false, message: "Invalid pickupLocation" });
                }

                const { address, city, state, pincode } = pickupLocation;
                if (!address || !city || !state || !pincode) {
                    return res.status(400).json({ success: false, message: "Invalid pickupLocation details" });
                }
            }

            if (shippingLocations && Array.isArray(shippingLocations)) {
                for (const loc of shippingLocations) {
                    if (
                        !loc.shippingArea || typeof loc.shippingArea !== "string" ||
                        !loc.areaName || typeof loc.areaName !== "string" ||
                        loc.shippingCharge == null || isNaN(Number(loc.shippingCharge))
                    ) {
                        return res.status(400).json({ success: false, message: "Invalid shipping location details" });
                    }
                    loc.shippingCharge = Number(loc.shippingCharge);
                }
            } else if (shippingLocations) {
                return res.status(400).json({ success: false, message: "Invalid shippingLocations format" });
            }
        }

        if (isNaN(Number(price))) return res.status(400).json({ success: false, message: "Price must be a number" });
        price = Number(price);

        const store = await Store.findById(storeId);
        if (!store) return res.status(400).json({ success: false, message: "Store not found" });

        if (!req.files?.img || req.files.img.length < 1) {
            return res.status(400).json({ success: false, message: "At least one image is required" });
        }
        if (req.files?.video && req.files.video.length > 1) {
            return res.status(400).json({ success: false, message: "Only one video allowed" });
        }

        return next();
    } catch (error) {
        console.error("Error in Adding Used Product middleware: ", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

const handleUpdateUsedProduct = async (req, res, next) => {
    try {
        let { title, description, category, subCategory, unit, price, discount, attributes, brand, tags, condition, isNegotiable, billAvailable, delivery } = req.body;
        const { usedProductId } = req.params;

        if (typeof attributes === "string") attributes = JSON.parse(attributes);
        if (typeof tags === "string") tags = JSON.parse(tags);
        if (typeof discount === "string") discount = JSON.parse(discount);
        if (typeof delivery === "string") delivery = JSON.parse(delivery);

        if (!usedProductId || !title || !description || !category || !subCategory || !price || !condition || !attributes || !unit) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        isNegotiable = Boolean(isNegotiable);
        billAvailable = Boolean(billAvailable);
        if (
            typeof title !== "string" ||
            typeof usedProductId !== "string" ||
            typeof description !== "string" ||
            typeof category !== "string" ||
            typeof subCategory !== "string" ||
            typeof condition !== "string" ||
            typeof unit !== "string" ||
            typeof isNegotiable !== "boolean" ||
            typeof billAvailable !== "boolean"
        ) {
            return res.status(400).json({ success: false, message: "Invalid types for required fields" });
        }

        if (!isValidUsedProductCategory(category)) return res.status(400).json({ success: false, message: "Invalid category" });
        if (!isValidUsedProductSubCategory(category, subCategory)) return res.status(400).json({ success: false, message: "Invalid subcategory" });

        if (brand && typeof brand !== "string") return res.status(400).json({ success: false, message: "Invalid brand format" });
        if (tags && !Array.isArray(tags)) return res.status(400).json({ success: false, message: "Tags must be an array" });

        if (!Array.isArray(attributes) || attributes.some(a => !a.key || !a.value)) {
            return res.status(400).json({ success: false, message: "Invalid attributes format" });
        }

        if (discount) {
            if (discount.percentage != null && (typeof discount.percentage !== "number" || discount.percentage < 0 || discount.percentage > 100)) {
                return res.status(400).json({ success: false, message: "Invalid discount percentage" });
            }
            if (discount.amount != null && (typeof discount.amount !== "number" || discount.amount < 0)) {
                return res.status(400).json({ success: false, message: "Invalid discount amount" });
            }
        }

        if (delivery) {
            const { type, pickupLocation, shippingLocations } = delivery;

            if ((!shippingLocations || shippingLocations.length === 0) && !pickupLocation) {
                return res.status(400).json({ success: false, message: "Either pickupLocation or shippingLocations is required" });
            }

            if (!type || typeof type !== "string") {
                return res.status(400).json({ success: false, message: "Invalid delivery type" });
            }

            if (pickupLocation) {
                if (typeof pickupLocation !== "object") {
                    return res.status(400).json({ success: false, message: "Invalid pickupLocation" });
                }

                const { address, city, state, pincode } = pickupLocation;
                if (!address || !city || !state || !pincode) {
                    return res.status(400).json({ success: false, message: "Invalid pickupLocation details" });
                }
            }

            if (shippingLocations && Array.isArray(shippingLocations)) {
                for (const loc of shippingLocations) {
                    if (
                        !loc.shippingArea || typeof loc.shippingArea !== "string" ||
                        !loc.areaName || typeof loc.areaName !== "string" ||
                        loc.shippingCharge == null || isNaN(Number(loc.shippingCharge))
                    ) {
                        return res.status(400).json({ success: false, message: "Invalid shipping location details" });
                    }
                    loc.shippingCharge = Number(loc.shippingCharge);
                }
            } else if (shippingLocations) {
                return res.status(400).json({ success: false, message: "Invalid shippingLocations format" });
            }
        }

        if (isNaN(Number(price))) return res.status(400).json({ success: false, message: "Price must be a number" });
        price = Number(price);

        return next();
    } catch (error) {
        console.error("Error in Updating Used Product middleware: ", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

const handleAddToCart = async (req, res, next) => {
    try {
        let { quantity } = req.body;
        const { productId } = req.params;

        if (!productId || !quantity) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        quantity = Number(quantity);
        if (typeof productId !== "string" || isNaN(quantity)) {
            return res.status(400).json({ success: false, message: 'Invalid format' });
        }

        if (quantity < 1) {
            return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        return next();
    } catch (error) {
        console.error("Error in Add To Cart middleware: ", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const handleUpdateCart = (req, res, next) => {
    try {
        let { quantity } = req.body;
        const { cartId } = req.params;

        if (!cartId || !quantity) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        quantity = Number(quantity);
        if (typeof cartId !== "string" || isNaN(quantity)) {
            return res.status(400).json({ success: false, message: 'Invalid format' });
        }

        if (quantity < 1) {
            return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
        }

        return next();
    } catch (error) {
        console.error("Error in Update Cart middleware: ", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export { handleAddProduct, handleUpdateProduct, handleAddUsedProduct, handleUpdateUsedProduct, handleAddToCart, handleUpdateCart };
import Store from "../models/store.model.js";
import Product from "../models/product.model.js";
import DeliveryZone from "../models/deliveryzone.model.js";
import UsedProduct from "../models/usedProduct.model.js";
import Cart from "../models/cart.model.js"
import Wishlist from "../models/wishlist.model.js";
import View from "../models/view.model.js";
import Review from "../models/review.model.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinary.config.js";
import { isValidCategory, isValidUsedProductCategory, isValidSubCategory, isValidUsedProductSubCategory } from '../utils/category.util.js'
import { message } from "./user.controller.js";

const MAX_VIEWS = 100;

const addProduct = async (req, res) => {
    try {
        const { title, description, category, subCategory, unit, price, stock, brand, deliveryCharge } = req.body;
        const { storeId } = req.params;
        const attributes = req.body.attributes;
        const tags = req.body.tags;
        const discount = req.body.discount;

        const imgFiles = req.files.img || [];
        const uploadedImages = [];

        for (let file of imgFiles) {
            const result = await uploadToCloudinary(file.path);
            if (result) {
                uploadedImages.push({
                    url: result.secure_url,
                    publicId: result.public_id
                });
            } else {
                return res.status(501).json({ success: false, message: 'Failed to upload image' });
            }
        }

        let videoData = null;
        if (req.files.video && req.files.video[0]) {
            const result = await uploadToCloudinary(req.files.video[0].path, 'video');
            if (result) {
                videoData = {
                    url: result.secure_url,
                    publicId: result.public_id
                };
            } else {
                return res.status(501).json({ success: false, message: 'Failed to upload video' });
            }
        }

        const product = new Product({
            storeId,
            title,
            description,
            category: { name: category, slug: category.toLowerCase().replace(/\s+/g, '-') },
            subCategory: { name: subCategory, slug: subCategory.toLowerCase().replace(/\s+/g, '-') },
            img: uploadedImages,
            video: videoData,
            price,
            discount,
            stock,
            attributes,
            brand,
            tags,
            deliveryCharge,
            unit
        });

        await product.save();

        return res.status(201).json({ success: true, message: 'Product added successfully', data: product });
    } catch (error) {
        console.error('Error in Add Product controller: ', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const getProduct = async (req, res) => {
    try {
        const { storeId } = req.params;

        const storeExist = await Store.findById(storeId);
        if (!storeExist) {
            return res.status(404).json({ success: false, message: 'Store not found' });
        }

        const products = await Product.find({ storeId });
        if (products.length === 0) {
            return res.status(200).json({ success: true, message: 'No products found for this store', data: [] });
        }

        return res.status(200).json({ success: true, message: 'Product fetched successfully', data: products });
    } catch (error) {
        console.error('Error in Get Product controller: ', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

const updateProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        let { title, description, category, subCategory, unit, price, stock, brand, deliveryCharge, attributes, tags, discount, removedImg, keptImg, video } = req.body;

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

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        if (removedImg) {
            try {
                const toDelete = typeof removedImg === "string" ? JSON.parse(removedImg) : removedImg;
                for (const del of Array.isArray(toDelete) ? toDelete : []) {
                    if (del?.publicId) {
                        await deleteFromCloudinary(del.publicId);
                    }
                }
            } catch {
                return res.status(400).json({ success: false, message: "Invalid removedImg format" });
            }
        }

        let keptImages = [];
        if (keptImg) {
            try {
                const parsed = typeof keptImg === "string" ? JSON.parse(keptImg) : keptImg;
                keptImages = (Array.isArray(parsed) ? parsed : []).filter(
                    (im) => im?.url && im?.publicId
                );
            } catch {
                return res.status(400).json({ success: false, message: "Invalid images format" });
            }
        }

        const newImages = [];
        if (req.files?.img && req.files.img.length > 0) {
            for (const file of req.files.img) {
                const result = await uploadToCloudinary(file.path);
                if (!result) {
                    return res.status(501).json({ success: false, message: "Failed to upload image" });
                }
                newImages.push({
                    url: result.secure_url,
                    publicId: result.public_id,
                });
            }
        }

        const updatedImages = [...keptImages, ...newImages];

        if (updatedImages.length < 1) {
            return res.status(400).json({ success: false, message: "At least 1 image is required" });
        }
        if (updatedImages.length > 5) {
            return res.status(400).json({ success: false, message: "Maximum 5 images allowed" });
        }

        let updatedVideo = product.video || null;

        if (req.files?.video && req.files.video[0]) {
            if (product.video?.publicId) {
                await deleteFromCloudinary(product.video.publicId);
            }

            const result = await uploadToCloudinary(req.files.video[0].path, "video");
            if (!result) {
                return res.status(501).json({ success: false, message: "Failed to upload video" });
            }

            updatedVideo = {
                url: result.secure_url,
                publicId: result.public_id
            };
        } else if (video) {
            try {
                updatedVideo = typeof video === "string" ? JSON.parse(video) : video;
            } catch {
                return res.status(400).json({ success: false, message: "Invalid video format" });
            }
        }

        product.title = title || product.title;
        product.description = description || product.description;
        product.category = category ? { name: category, slug: category.toLowerCase().replace(/\s+/g, "-") } : product.category;
        product.subCategory = subCategory ? { name: subCategory, slug: subCategory.toLowerCase().replace(/\s+/g, "-") } : product.subCategory;
        product.img = updatedImages;
        product.video = updatedVideo;
        product.price = price || product.price;
        product.discount = discount || product.discount;
        product.stock = stock || product.stock;
        product.attributes = attributes || product.attributes;
        product.brand = brand || product.brand;
        product.tags = tags || product.tags;
        product.deliveryCharge = deliveryCharge || product.deliveryCharge;
        product.unit = unit || product.unit;

        await product.save();

        return res.json({
            success: true,
            message: "Product updated successfully",
            data: product,
        });
    } catch (error) {
        console.error("Error in Update Product controller: ", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const removeProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const result = await Product.findByIdAndDelete(productId);

        if (!result) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        return res.status(200).json({ success: true, message: 'Product removed successfully' });
    } catch (error) {
        console.error('Error in Remove Product controller: ', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

const changeAvailability = async (req, res) => {
    try {
        const { productId } = req.params;
        const { isAvailable } = req.body;

        const product = await Product.findByIdAndUpdate(
            productId,
            { isAvailable },
            { new: true }
        );

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        return res.status(200).json({ success: true, message: 'Product availability updated successfully', data: product });
    } catch (error) {
        console.error('Error in changing availability: ', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const addUsedProduct = async (req, res) => {
    try {
        let { title, description, category, subCategory, unit, price, condition, brand, delivery, isNegotiable, billAvailable, attributes, tags, discount } = req.body;
        const { storeId } = req.params;

        if (typeof attributes === "string") attributes = JSON.parse(attributes);
        if (typeof tags === "string") tags = JSON.parse(tags);
        if (typeof discount === "string") discount = JSON.parse(discount);
        if (typeof delivery === "string") delivery = JSON.parse(delivery);

        const imgFiles = req.files.img || [];
        const uploadedImages = [];

        for (let file of imgFiles) {
            const result = await uploadToCloudinary(file.path);
            if (result) {
                uploadedImages.push({
                    url: result.secure_url,
                    publicId: result.public_id
                });
            } else {
                return res.status(501).json({ success: false, message: 'Failed to upload image' });
            }
        }

        let videoData = null;
        if (req.files.video && req.files.video[0]) {
            const result = await uploadToCloudinary(req.files.video[0].path, 'video');
            if (result) {
                videoData = {
                    url: result.secure_url,
                    publicId: result.public_id
                };
            } else {
                return res.status(501).json({ success: false, message: 'Failed to upload video' });
            }
        }

        const product = new UsedProduct({
            storeId,
            title,
            description,
            category: { name: category, slug: category.toLowerCase().replace(/\s+/g, '-') },
            subCategory: { name: subCategory, slug: subCategory.toLowerCase().replace(/\s+/g, '-') },
            img: uploadedImages,
            video: videoData,
            price,
            discount,
            attributes,
            brand,
            tags,
            delivery,
            isNegotiable,
            billAvailable,
            condition,
            unit
        });

        await product.save();

        return res.status(201).json({ success: true, message: 'Used product added successfully', data: product });
    } catch (error) {
        console.error('Error in Add Used Product controller: ', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

const getUsedProduct = async (req, res) => {
    try {
        const { storeId } = req.params;

        const storeExist = await Store.findById(storeId);
        if (!storeExist) {
            return res.status(404).json({ success: false, message: 'Store not found' });
        }

        const products = await UsedProduct.find({ storeId });
        if (products.length === 0) {
            return res.status(200).json({ success: true, message: 'No products found for this store', data: [] });
        }

        return res.status(200).json({ success: true, message: 'Product fetched successfully', data: products });
    } catch (error) {
        console.error('Error in Get Used Product controller: ', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

const updateUsedProduct = async (req, res) => {
    try {
        const { usedProductId } = req.params;
        let { title, description, category, subCategory, unit, price, condition, brand, delivery, attributes, tags, discount, removedImg, keptImg, video, isNegotiable, billAvailable } = req.body;

        if (typeof attributes === "string") attributes = JSON.parse(attributes);
        if (typeof tags === "string") tags = JSON.parse(tags);
        if (typeof discount === "string") discount = JSON.parse(discount);
        if (typeof delivery === "string") delivery = JSON.parse(delivery);

        const product = await UsedProduct.findById(usedProductId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        if (removedImg) {
            try {
                const toDelete = typeof removedImg === "string" ? JSON.parse(removedImg) : removedImg;
                for (const del of Array.isArray(toDelete) ? toDelete : []) {
                    if (del?.publicId) {
                        await deleteFromCloudinary(del.publicId);
                    }
                }
            } catch {
                return res.status(400).json({ success: false, message: "Invalid removedImg format" });
            }
        }

        let keptImages = [];
        if (keptImg) {
            try {
                const parsed = typeof keptImg === "string" ? JSON.parse(keptImg) : keptImg;
                keptImages = (Array.isArray(parsed) ? parsed : []).filter(
                    (im) => im?.url && im?.publicId
                );
            } catch {
                return res.status(400).json({ success: false, message: "Invalid images format" });
            }
        }

        const newImages = [];
        if (req.files?.img && req.files.img.length > 0) {
            for (const file of req.files.img) {
                const result = await uploadToCloudinary(file.path);
                if (!result) {
                    return res.status(501).json({ success: false, message: "Failed to upload image" });
                }
                newImages.push({
                    url: result.secure_url,
                    publicId: result.public_id,
                });
            }
        }

        const updatedImages = [...keptImages, ...newImages];

        if (updatedImages.length < 1) {
            return res.status(400).json({ success: false, message: "At least 1 image is required" });
        }
        if (updatedImages.length > 5) {
            return res.status(400).json({ success: false, message: "Maximum 5 images allowed" });
        }

        let updatedVideo = product.video || null;

        if (req.files?.video && req.files.video[0]) {
            if (product.video?.publicId) {
                await deleteFromCloudinary(product.video.publicId);
            }

            const result = await uploadToCloudinary(req.files.video[0].path, "video");
            if (!result) {
                return res.status(501).json({ success: false, message: "Failed to upload video" });
            }

            updatedVideo = {
                url: result.secure_url,
                publicId: result.public_id
            };
        } else if (video) {
            try {
                updatedVideo = typeof video === "string" ? JSON.parse(video) : video;
            } catch {
                return res.status(400).json({ success: false, message: "Invalid video format" });
            }
        }

        product.title = title || product.title;
        product.description = description || product.description;
        product.category = category ? { name: category, slug: category.toLowerCase().replace(/\s+/g, "-") } : product.category;
        product.subCategory = subCategory ? { name: subCategory, slug: subCategory.toLowerCase().replace(/\s+/g, "-") } : product.subCategory;
        product.img = updatedImages;
        product.video = updatedVideo;
        product.price = price || product.price;
        product.discount = discount || product.discount;
        product.condition = condition || product.condition;
        product.attributes = attributes || product.attributes;
        product.brand = brand || product.brand;
        product.tags = tags || product.tags;
        product.delivery = delivery || product.delivery;
        product.isNegotiable = isNegotiable || product.isNegotiable;
        product.billAvailable = billAvailable || product.billAvailable;
        product.unit = unit || product.unit;

        await product.save();

        return res.json({
            success: true,
            message: "Used Product updated successfully",
            data: product,
        });
    } catch (error) {
        console.error('Error in Update Used Product controller: ', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

const removeUsedProduct = async (req, res) => {
    try {
        const { usedProductId } = req.params;
        const result = await UsedProduct.findByIdAndDelete(usedProductId);

        if (!result) {
            return res.status(404).json({ success: false, message: 'Used Product not found' });
        }

        return res.status(200).json({ success: true, message: 'Used Product removed successfully' });
    } catch (error) {
        console.error('Error in Remove Used Product controller: ', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

const getProducts = async (req, res) => {
    try {
        const locations = req.body;

        if (!Array.isArray(locations) || locations.length === 0) {
            return res.status(400).json({ success: false, message: "Locations array required" });
        }

        const storeZones = await DeliveryZone.find({
            areaName: { $in: locations }
        }).select("storeId");

        const storeIds = storeZones.map((z) => z.storeId);

        if (storeIds.length === 0) {
            return res.status(200).json({
                success: true,
                stores: [],
                productsByCategory: [],
                usedProductsByCategory: []
            });
        }

        const productPipeline = [
            {
                $match: {
                    storeId: { $in: storeIds },
                    isAvailable: true
                }
            },
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: "$category.slug",
                    products: { $push: "$$ROOT" }
                }
            },
            {
                $project: {
                    products: { $slice: ["$products", 10] }
                }
            }
        ];

        const usedProductPipeline = [
            {
                $match: {
                    $and: [
                        { isSold: false },
                        { paid: true },
                        {
                            $or: [
                                { "delivery.pickupLocation.state": { $in: locations } },
                                { "delivery.pickupLocation.city": { $in: locations } },
                                { "delivery.pickupLocation.pincode": { $in: locations } },
                                { "delivery.shippingLocations.areaName": { $in: locations } }
                            ]
                        }
                    ]
                }
            },
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: "$category.slug",
                    products: { $push: "$$ROOT" }
                }
            },
            {
                $project: {
                    products: { $slice: ["$products", 10] }
                }
            }
        ];

        const aggregatedProducts = await Product.aggregate(productPipeline);
        const aggregatedUsedProducts = await UsedProduct.aggregate(usedProductPipeline);

        const productsByCategory = aggregatedProducts.map((item) => ({
            [item._id]: item.products
        }));

        const usedProductsByCategory = aggregatedUsedProducts.map((item) => ({
            [item._id]: item.products
        }));

        const usedStoreIds = aggregatedUsedProducts.flatMap((cat) =>
            cat.products.map((p) => p.storeId.toString())
        );

        const allStoreIds = [...new Set([...storeIds.map(String), ...usedStoreIds])];

        const stores = await Store.find({ _id: { $in: allStoreIds } });

        return res.status(200).json({
            success: true,
            stores,
            productsByCategory,
            usedProductsByCategory
        });
    } catch (error) {
        console.error("Error in Get Product controller: ", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const getProductById = async (req, res) => {
    try {
        const { productId } = req.params;
        if (!productId) {
            return res.status(400).json({ success: false, message: 'Product id is required' });
        }

        let product = await Product.findById(productId);
        if (!product) {
            product = await UsedProduct.findById(productId);
            if (!product) {
                return res.status(404).json({ success: false, message: 'Product not found' });
            }
        }

        return res.status(200).json({ success: true, message: 'Product fetched successfully', data: product })
    } catch (error) {
        console.error("Error in Get Product By Id controller: ", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

const getViewedProducts = async (req, res) => {
    try {
        const user = req.user;

        const view = await View.findOne({ userId: user._id });
        if (!view || !view.productIds.length) {
            return res.status(200).json({ success: true, newProductViewed: [], usedProductViewed: [] });
        }

        const productIds = view.productIds;
        const newProductViewed = await Product.find({ _id: { $in: productIds } });
        const usedProductViewed = await UsedProduct.find({ _id: { $in: productIds } });

        return res.status(200).json({
            success: true,
            newProductViewed,
            usedProductViewed,
        });
    } catch (error) {
        console.error("Error in getViewedProducts:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const getWishlistProducts = async (req, res) => {
    try {
        const user = req.user;

        const wishlist = await Wishlist.findOne({ userId: user._id });
        if (!wishlist || !wishlist.productIds.length) {
            return res.status(200).json({ success: true, newProductWishlist: [], usedProductWishlist: [] });
        }

        const productIds = wishlist.productIds;
        const newProductWishlist = await Product.find({ _id: { $in: productIds } });
        const usedProductWishlist = await UsedProduct.find({ _id: { $in: productIds } });

        const data = { _id: wishlist._id, productIds: wishlist.productIds }

        return res.status(200).json({
            success: true,
            data,
            newProductWishlist,
            usedProductWishlist,
        });
    } catch (error) {
        console.error("Error in Get Wishlist Products: ", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const getCartProducts = async (req, res) => {
    try {
        const user = req.user;

        const cartItems = await Cart.find({ userId: user._id })
            .populate({
                path: "productId",
                select: "title description unit price img discount stock deliveryCharge storeId subCategory",
                populate: {
                    path: "storeId",
                    select: "name"
                }
            });

        return res.status(200).json({
            success: true,
            message: "Cart products fetched successfully",
            data: cartItems,
        });
    } catch (error) {
        console.error("Error in Get Cart Product controller: ", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const getReview = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user._id;

        if (!productId) {
            return res.status(400).json({ success: false, message: 'Product Id is required' });
        }

        const review = await Review.findOne({ userId, productId });
        return res.status(200).json({ success: true, message: 'Review fetched successfully', data: review });
    } catch (error) {
        console.error('Error in Get Review controller: ', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

const getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!productId) {
            return res.status(400).json({ success: false, message: 'Product Id is required' });
        }

        const reviews = await Review.find({ productId }).populate('userId', 'username name avatar');

        return res.status(200).json({ success: true, message: 'Review fetched successfully', data: reviews });
    } catch (error) {
        console.error('Error in Get Product Reviews controller: ', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const addViewedProduct = async (req, res) => {
    try {
        const user = req.user;
        const { productId } = req.params;

        if (!productId) {
            return res.status(400).json({ success: false, message: 'Product id is required' });
        }

        let view = await View.findOne({ userId: user._id });

        if (!view) {
            view = await View.create({ userId: user._id, productIds: [productId] });
        } else {
            view.productIds = view.productIds.filter(
                (id) => id.toString() !== productId
            );

            view.productIds.unshift(productId);

            if (view.productIds.length > MAX_VIEWS) {
                view.productIds = view.productIds.slice(0, MAX_VIEWS);
            }

            await view.save();
        }

        return res.json({ success: true, data: view });
    } catch (error) {
        console.error("Error in addViewedProduct:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const addWishlistProduct = async (req, res) => {
    try {
        const user = req.user;
        const { productId } = req.params;

        if (!productId) {
            return res.status(400).json({ success: false, message: "Product id is required" });
        }

        let product = await Product.findById(productId);
        if (!product) {
            product = await UsedProduct.findById(productId);
            if (!product) {
                return res.status(404).json({ success: false, message: "Product not found" });
            }
        }

        let wishlist = await Wishlist.findOne({ userId: user._id });

        if (wishlist) {
            if (wishlist.productIds.includes(productId)) {
                return res.status(400).json({ success: false, message: "Product already in wishlist" });
            }
            wishlist.productIds.push(productId);
            await wishlist.save();
        } else {
            wishlist = new Wishlist({
                userId: user._id,
                productIds: [productId],
            });
            await wishlist.save();
        }

        const data = {
            _id: wishlist._id,
            productIds: wishlist.productIds
        }

        return res.status(201).json({ success: true, message: "Product added to wishlist", data });
    } catch (error) {
        console.error("Error in Add Wishlist Product controller: ", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const addCartProduct = async (req, res) => {
    try {
        const { quantity } = req.body;
        const { productId } = req.params;
        const user = req.user;

        const existing = await Cart.findOne({ userId: user._id, productId });
        if (existing) {
            return res.status(400).json({ success: false, message: "Product already in cart" });
        }

        let cartItem = await Cart.create({ userId: user._id, productId, quantity });

        cartItem = await Cart.findById(cartItem._id)
            .populate({
                path: "productId",
                select: "title description unit price img discount stock deliveryCharge storeId subCategory",
                populate: {
                    path: "storeId",
                    select: "name"
                }
            });

        return res.status(201).json({
            success: true,
            message: "Product added to cart successfully",
            data: cartItem,
        });
    } catch (error) {
        console.error("Error in Add Cart Product controller: ", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const addReview = async (req, res) => {
    try {
        const { productId, rating, text, imageTitle, videoTitle } = req.body;
        const userId = req.user._id;

        const reviewExist = await Review.findOne({ userId, productId });
        if (reviewExist) {
            return res.status(400).json({ success: false, message: 'Review already added' });
        }

        let imageData = null;
        let videoData = null;

        if (req.files?.image && req.files.image.length > 0) {
            const imgFile = req.files.image[0];
            const uploadRes = await uploadToCloudinary(imgFile.path);
            if (uploadRes) {
                imageData = {
                    url: uploadRes.secure_url,
                    publicId: uploadRes.public_id,
                    title: imageTitle,
                };
            }
        }

        if (req.files?.video && req.files.video.length > 0) {
            const vidFile = req.files.video[0];
            const uploadRes = await uploadToCloudinary(vidFile.path);
            if (uploadRes) {
                videoData = {
                    url: uploadRes.secure_url,
                    publicId: uploadRes.public_id,
                    title: videoTitle,
                };
            }
        }

        const review = new Review({
            userId,
            productId,
            rating,
            text,
            img: imageData,
            videos: videoData,
        });

        await review.save();

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        product.reviews.push(review._id);

        const currentTotal = product.rating.totalRating || 0;
        const currentAvg = product.rating.avgRating || 0;

        const newTotal = currentTotal + 1;
        const newAvg = ((currentAvg * currentTotal) + rating) / newTotal;

        product.rating.avgRating = Number(newAvg.toFixed(1));
        product.rating.totalRating = newTotal;

        await product.save();

        res.status(201).json({ success: true, message: "Review added successfully", data: review });
    } catch (error) {
        console.error('Error in Add Review controller: ', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const removeViewedProduct = async (req, res) => {
    try {
        const { viewId, productId } = req.params;

        const view = await View.findById(viewId);
        if (!view) return res.status(404).json({ success: false, message: "No viewed products found" });

        view.productIds = view.productIds.filter(id => id.toString() !== productId);
        await view.save();

        return res.json({ success: true, data: view });
    } catch (error) {
        console.error("Error in removeViewedProduct:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const removeWishlistProduct = async (req, res) => {
    try {
        const { wishlistId, productId } = req.params;

        if (!productId || !wishlistId) {
            return res.status(400).json({ success: false, message: "Product id is required" });
        }

        const wishlist = await Wishlist.findById(wishlistId);
        if (!wishlist) {
            return res.status(404).json({ success: false, message: "Wishlist not found" });
        }

        if (!wishlist.productIds.includes(productId)) {
            return res.status(404).json({ success: false, message: "Product not in wishlist" });
        }

        wishlist.productIds = wishlist.productIds.filter(
            (id) => id.toString() !== productId.toString()
        );

        await wishlist.save();

        return res.status(200).json({ success: true, message: "Product removed from wishlist", data: wishlist, });
    } catch (error) {
        console.error("Error in Remove Wishlist Product controller: ", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const removeCartProduct = async (req, res) => {
    try {
        const { cartId } = req.params;
        const user = req.user;

        if (!cartId) {
            return res.status(400).json({ success: false, message: 'Cart id is required' });
        }

        const cartItem = await Cart.findOneAndDelete({ _id: cartId, userId: user._id });

        if (!cartItem) {
            return res.status(404).json({ success: false, message: 'Cart product not found' });
        }

        return res.status(200).json({ success: true, message: 'Product removed from cart successfully' });
    } catch (error) {
        console.error('Error in Remove Cart Product controller: ', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const removeReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        if (!reviewId) {
            return res.status(400).json({ success: false, message: 'Review Id is required' });
        }

        const review = await Review.findByIdAndDelete(reviewId);
        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }

        const product = await Product.findById(review.productId);
        if (product) {
            product.reviews = product.reviews.filter(id => id.toString() !== reviewId.toString());

            const allReviews = await Review.find({ productId: product._id });
            if (allReviews.length > 0) {
                const totalRating = allReviews.reduce((sum, r) => sum + (r.rating || 0), 0);
                product.averageRating = totalRating / allReviews.length;
            } else {
                product.averageRating = 0;
            }

            product.totalReviews = allReviews.length;
            await product.save();
        }

        return res.status(200).json({ success: true, message: 'Review removed successfully' });
    } catch (error) {
        console.error('Error in Remove Review controller:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const updateCart = async (req, res) => {
    try {
        const { quantity } = req.body;
        const { cartId } = req.params;

        const cartItem = await Cart.findByIdAndUpdate(
            { _id: cartId, userId: req.user._id },
            { quantity },
            { new: true }
        );

        if (!cartItem) {
            return res.status(404).json({ success: false, message: 'Cart Product not found' });
        }

        return res.status(200).json({ success: true, message: 'Cart updated successfully', cartItem });
    } catch (error) {
        console.error('Error in Update Cart controller: ', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const updateReview = async (req, res) => {
    try {
        const { rating, text, imageTitle, videoTitle, imageData, videoData, deletedMedia } = req.body;
        const { reviewId } = req.params;
        const oldReview = await Review.findById(reviewId);
        if (!oldReview) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }

        let imageDataToSave = oldReview.img || null;
        let videoDataToSave = oldReview.video || null;

        let mediaToDelete = [];
        if (deletedMedia) {
            mediaToDelete = typeof deletedMedia === 'string' ? JSON.parse(deletedMedia) : deletedMedia;
        }

        if (mediaToDelete && mediaToDelete.length > 0) {
            for (const publicId of mediaToDelete) {
                try {
                    await deleteFromCloudinary(publicId);
                } catch (error) {
                    console.error('Error deleting from Cloudinary:', error);
                }
            }
        }

        if (req.files?.image && req.files.image.length > 0) {
            const imgFile = req.files.image[0];
            const uploadRes = await uploadToCloudinary(imgFile.path);
            if (uploadRes) {
                imageDataToSave = {
                    url: uploadRes.secure_url,
                    publicId: uploadRes.public_id,
                    title: imageTitle || '',
                };
            }
        } else if (imageData) {
            const parsedImageData = typeof imageData === 'string' ? JSON.parse(imageData) : imageData;
            imageDataToSave = parsedImageData;
        } else if (req.body.image === 'null' || req.body.image === null) {
            imageDataToSave = null;
        }

        if (req.files?.video && req.files.video.length > 0) {
            const vidFile = req.files.video[0];
            const uploadRes = await uploadToCloudinary(vidFile.path);
            if (uploadRes) {
                videoDataToSave = {
                    url: uploadRes.secure_url,
                    publicId: uploadRes.public_id,
                    title: videoTitle || '',
                };
            }
        } else if (videoData) {
            const parsedVideoData = typeof videoData === 'string' ? JSON.parse(videoData) : videoData;
            videoDataToSave = parsedVideoData;
        } else if (req.body.video === 'null' || req.body.video === null) {
            videoDataToSave = null;
        }

        const updatedReview = await Review.findByIdAndUpdate(
            reviewId,
            {
                rating: Number(rating),
                text: text || null,
                img: imageDataToSave,
                video: videoDataToSave,
            },
            { new: true }
        );

        if (Number(rating) !== oldReview.rating) {
            const product = await Product.findById(oldReview.productId);
            if (product) {
                const allReviews = await Review.find({ productId: product._id });
                if (allReviews.length > 0) {
                    const total = allReviews.reduce((sum, r) => sum + (r.rating || 0), 0);
                    const avg = total / allReviews.length;
                    product.rating.avgRating = Number(avg.toFixed(1));
                    product.rating.totalRating = allReviews.length;
                    await product.save();
                } else {
                    product.rating.avgRating = 0;
                    product.rating.totalRating = 0;
                    await product.save();
                }
            }
        }

        res.status(200).json({ success: true, message: "Review updated successfully", data: updatedReview });
    } catch (error) {
        console.error('Error in Update Review controller: ', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const getProductByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = 20;

        if (!category || typeof category !== "string") {
            return res.status(400).json({ success: false, message: 'Category is required' })
        }

        let products = [];
        let total = 0;
        const capitalized = category.charAt(0).toUpperCase() + category.slice(1);

        if (isValidCategory(capitalized)) {
            total = await Product.countDocuments({ "category.slug": category, "isAvailable": true });
            products = await Product.find({ "category.slug": category, "isAvailable": true })
                .skip((page - 1) * limit)
                .limit(limit);
        } else if (isValidUsedProductCategory(category)) {
            total = await UsedProduct.countDocuments({ "category.slug": category, "isSold": false, "paid": true });
            products = await UsedProduct.find({ "category.slug": category, "isSold": false, "paid": true })
                .skip((page - 1) * limit)
                .limit(limit);
        } else {
            return res.status(400).json({ success: false, message: "Invalid category" });
        }

        return res.status(200).json({
            success: true,
            message: 'Products fetched successfully',
            data: products,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error in Get Product by Category controller: ', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const searchProducts = async (req, res) => {
    try {
        const query = req.query.q;

        if (!query) {
            return res.status(200).json([]);
        }

        const searchQuery = {
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
                { brand: { $regex: query, $options: 'i' } },
                { 'category.name': { $regex: query, $options: 'i' } },
                { 'subCategory.name': { $regex: query, $options: 'i' } },
                { tags: { $regex: query, $options: 'i' } }
            ]
        };

        const newProducts = await Product.find(searchQuery).limit(5);
        const usedProducts = await UsedProduct.find(searchQuery).limit(5);

        res.status(200).json({ success: true, message: 'Product searched successfully', newProducts, usedProducts });
    } catch (error) {
        console.error("Search Error:", error);
        res.status(500).json({ message: 'Server error during search' });
    }
};

export {
    addProduct, getProduct, updateProduct, removeProduct, changeAvailability,
    addUsedProduct, getUsedProduct, updateUsedProduct, removeUsedProduct,
    getProducts, getViewedProducts, getWishlistProducts, getCartProducts, getReview,
    addViewedProduct, addWishlistProduct, addCartProduct, addReview,
    removeViewedProduct, removeWishlistProduct, removeCartProduct, removeReview,
    updateCart, updateReview,
    getProductById, getProductByCategory, getProductReviews,
    searchProducts
};
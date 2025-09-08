import Store from "../models/store.model.js";
import Product from "../models/product.model.js";
import DeliveryZone from "../models/deliveryzone.model.js";
import UsedProduct from "../models/usedProduct.model.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinary.config.js";

const addProduct = async (req, res) => {
    try {
        const { title, description, category, subCategory, price, stock, brand, deliveryCharge } = req.body;
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
            deliveryCharge
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
        let { title, description, category, subCategory, price, stock, brand, deliveryCharge, attributes, tags, discount, removedImg, keptImg, video } = req.body;

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
        let { title, description, category, subCategory, price, condition, brand, delivery, isNegotiable, billAvailable, attributes, tags, discount } = req.body;
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
            condition
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
        let { title, description, category, subCategory, price, condition, brand, delivery, attributes, tags, discount, removedImg, keptImg, video, isNegotiable, billAvailable } = req.body;

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
      { $match: { storeId: { $in: storeIds } } },
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
      { $match: { storeId: { $in: storeIds } } },
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

    const [aggregatedProducts, aggregatedUsedProducts] = await Promise.all([
      Product.aggregate(productPipeline),
      UsedProduct.aggregate(usedProductPipeline)
    ]);

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

const getViewedProducts = async (req, res) => {
    try {

    } catch (error) {
        console.error('Error in Get Viewed Product controller: ', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

const getWishlistProducts = async (req, res) => {
    try {

    } catch (error) {
        console.error('Error in Get Wishlist Product controller: ', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

const getCartProducts = async (req, res) => {
    try {

    } catch (error) {
        console.error('Error in Get Cart Product controller: ', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

const getReview = async (req, res) => {
    try {

    } catch (error) {
        console.error('Error in Get Review controller: ', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

const addViewedProduct = async (req, res) => {
    try {

    } catch (error) {
        console.error('Error in Add Viewed Product controller: ', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

const addWishlistProduct = async (req, res) => {
    try {

    } catch (error) {
        console.error('Error in Add Wishlist Product controller: ', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

const addCartProduct = async (req, res) => {
    try {

    } catch (error) {
        console.error('Error in Add Cart Product controller: ', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

const addReview = async (req, res) => {
    try {

    } catch (error) {
        console.error('Error in Add Review controller: ', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

const removeViewedProduct = async (req, res) => {
    try {

    } catch (error) {
        console.error('Error in Remove Viewed Product controller: ', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

const removeWishlistProduct = async (req, res) => {
    try {

    } catch (error) {
        console.error('Error in Remove Wishlist Product controller: ', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

const removeCartProduct = async (req, res) => {
    try {

    } catch (error) {
        console.error('Error in Remove Cart Product controller: ', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

const removeReview = async (req, res) => {
    try {

    } catch (error) {
        console.error('Error in Remove Review controller: ', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

const updateReview = async (req, res) => {
    try {

    } catch (error) {
        console.error('Error in Update Review controller: ', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

export {
    addProduct, getProduct, updateProduct, removeProduct, changeAvailability,
    addUsedProduct, getUsedProduct, updateUsedProduct, removeUsedProduct,
    getProducts, getViewedProducts, getWishlistProducts, getCartProducts, getReview,
    addViewedProduct, addWishlistProduct, addCartProduct, addReview,
    removeViewedProduct, removeWishlistProduct, removeCartProduct, removeReview,
    updateReview
};
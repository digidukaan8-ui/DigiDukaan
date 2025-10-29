import Product from "../models/product.model.js";
import UsedProduct from "../models/usedProduct.model.js";
import View from "../models/view.model.js"; 
import Order from "../models/order.model.js"; 
import _getLocationData from "../utils/location.util.js"

const getSimilarProducts = async (req, res) => {
    try {
        const { productId, location } = req.params;

        const currentProduct = await Product.findById(productId).select('subCategory');

        if (!currentProduct) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        
        const { mappedStoreIds } = await _getLocationData(location);

        const similarProducts = await Product.find({
            subCategory: currentProduct.subCategory,
            _id: { $ne: productId },
            storeId: { $in: mappedStoreIds },
            isAvailable: true
        })
        .limit(10);

        return res.status(200).json({ success: true, data: similarProducts, message: 'Similar products fetched successfully' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error fetching similar products', error: error.message });
    }
};

const getSimilarBrandProducts = async (req, res) => {
    try {
        const { productId, location } = req.params;

        const currentProduct = await Product.findById(productId).select('brand');

        if (!currentProduct) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        const { mappedStoreIds } = await _getLocationData(location);
        
        let similarBrandProducts = [];
        if (currentProduct.brand) {
            similarBrandProducts = await Product.find({
                brand: currentProduct.brand,
                _id: { $ne: productId },
                storeId: { $in: mappedStoreIds },
                isAvailable: true
            })
            .limit(10);
        }

        return res.status(200).json({ success: true, data: similarBrandProducts, message: 'Similar brand products fetched successfully' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error fetching similar brand products', error: error.message });
    }
};

const getRelatedProducts = async (req, res) => {
    try {
        const { productId, location } = req.params;

        const currentProduct = await Product.findById(productId).select('category');

        if (!currentProduct) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        
        const { mappedStoreIds } = await _getLocationData(location);

        const relatedProducts = await Product.find({
            'category.name': currentProduct.category.name,
            _id: { $ne: productId },
            storeId: { $in: mappedStoreIds },
            isAvailable: true
        })
        .limit(10);

        return res.status(200).json({ success: true, data: relatedProducts, message: 'Related products fetched successfully' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error fetching related products' });
    }
};

const getSimilarUsedProducts = async (req, res) => {
    try {
        const { productId, location } = req.params;

        const currentProduct = await UsedProduct.findById(productId).select('subCategory');

        if (!currentProduct) {
            return res.status(404).json({ success: false, message: 'Used Product not found' });
        }

        const { mappedStoreIds } = await _getLocationData(location);

        const similarUsedProducts = await UsedProduct.find({
            'subCategory.slug': currentProduct.subCategory.slug,
            _id: { $ne: productId },
            storeId: { $in: mappedStoreIds },
            isSold: false,
            paid: true
        })
        .limit(10);

        return res.status(200).json({ success: true, data: similarUsedProducts, message: 'Similar used products fetched successfully' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error fetching similar used products', error: error.message });
    }
};

const getSimilarBrandUsedProducts = async (req, res) => {
    try {
        const { productId, location } = req.params;

        const currentProduct = await UsedProduct.findById(productId).select('brand');

        if (!currentProduct) {
            return res.status(404).json({ success: false, message: 'Used Product not found' });
        }

        const { mappedStoreIds } = await _getLocationData(location);

        let similarBrandUsedProducts = [];
        if (currentProduct.brand) {
            similarBrandUsedProducts = await UsedProduct.find({
                brand: currentProduct.brand,
                _id: { $ne: productId },
                storeId: { $in: mappedStoreIds },
                isSold: false,
                paid: true
            })
            .limit(10);
        }

        return res.status(200).json({ success: true, data: similarBrandUsedProducts, message: 'Similar brand used products fetched successfully' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error fetching similar brand used products', error: error.message });
    }
};

const getRelatedUsedProducts = async (req, res) => {
    try {
        const { productId, location } = req.params;

        const currentProduct = await UsedProduct.findById(productId).select('category');

        if (!currentProduct) {
            return res.status(404).json({ success: false, message: 'Used Product not found' });
        }

        const { mappedStoreIds } = await _getLocationData(location);

        const relatedUsedProducts = await UsedProduct.find({
            'category.slug': currentProduct.category.slug,
            _id: { $ne: productId },
            storeId: { $in: mappedStoreIds },
            isSold: false,
            paid: true
        })
        .limit(10);

        return res.status(200).json({ success: true, data: relatedUsedProducts, message: 'Related used products fetched successfully' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error fetching related used products' });
    }
};

const getBestRatedProducts = async (req, res) => {
    try {
        const { location } = req.params; 

        if (!location || !location.trim()) {
             return res.status(400).json({ success: false, message: 'Location is required' });
        }
        
        const { mappedStoreIds } = await _getLocationData(location);

        if (mappedStoreIds.length === 0) {
            return res.status(200).json({ success: true, data: [], message: 'No products found in this location' });
        }

        const bestRatedProducts = await Product.find({
            storeId: { $in: mappedStoreIds },
            isAvailable: true,
            'rating.totalRating': { $gte: 1 }
        })
        .sort({ 'rating.avgRating': -1 }) 
        .limit(20);

        return res.status(200).json({ success: true, data: bestRatedProducts, message: 'Best rated products fetched successfully' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error fetching best rated products' });
    }
};

const getMostViewedProducts = async (req, res) => {
    try {
        const { location } = req.params;
        
        if (!location || !location.trim()) {
            return res.status(400).json({ success: false, message: 'Location is required' });
        }
        
        const { mappedStoreIds } = await _getLocationData(location);

        if (mappedStoreIds.length === 0) {
            return res.status(200).json({ success: true, data: [], message: 'No products found in this location' });
        }
        
        const viewCounts = await View.aggregate([
            { $unwind: "$productIds" }, 
            {
                $group: {
                    _id: '$productIds',
                    viewCount: { $sum: 1 }
                }
            },
            { $sort: { viewCount: -1 } },
            { $limit: 100 } 
        ]);

        const topProductIds = viewCounts.map(v => v._id);
        
        if (topProductIds.length === 0) {
             return res.status(200).json({ success: true, data: [], message: 'No viewed products found' });
        }

        const products = await Product.find({ 
            _id: { $in: topProductIds }, 
            storeId: { $in: mappedStoreIds }, 
            isAvailable: true
        });
        
        const mostViewedProducts = products.map(product => {
            const viewData = viewCounts.find(v => v._id.toString() === product._id.toString());
            return {
                ...product.toObject(),
                viewCount: viewData ? viewData.viewCount : 0
            };
        });

        mostViewedProducts.sort((a, b) => b.viewCount - a.viewCount);
        const finalResults = mostViewedProducts.slice(0, 20);

        return res.status(200).json({ success: true, data: finalResults, message: 'Most viewed products fetched successfully' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error fetching most viewed products' });
    }
};

const getBestSellers = async (req, res) => {
    try {
        const { location } = req.params;
        
        if (!location || !location.trim()) {
             return res.status(400).json({ success: false, message: 'Location is required' });
        }
        
        const { mappedStoreIds } = await _getLocationData(location);

        if (mappedStoreIds.length === 0) {
            return res.status(200).json({ success: true, data: [], message: 'No products found in this location' });
        }
        
        const salesData = await Order.aggregate([
            { 
                $match: { 
                    storeId: { $in: mappedStoreIds },
                    paymentStatus: 'SUCCESS'
                } 
            },
            { 
                $unwind: '$products'
            },
            {
                $group: {
                    _id: '$products.productId',
                    totalSales: { $sum: '$products.quantity' }
                }
            },
            { $sort: { totalSales: -1 } },
            { $limit: 20 }
        ]);

        const productIds = salesData.map(s => s._id);

        const products = await Product.find({ 
            _id: { $in: productIds },
            isAvailable: true
        });

        const bestSellers = products.map(product => {
            const salesInfo = salesData.find(s => s._id.toString() === product._id.toString());
            return {
                ...product.toObject(),
                totalSales: salesInfo ? salesInfo.totalSales : 0
            };
        });

        bestSellers.sort((a, b) => b.totalSales - a.totalSales);

        return res.status(200).json({ success: true, data: bestSellers, message: 'Best sellers fetched successfully' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error fetching best sellers', error: error.message });
    }
};

export { getBestRatedProducts, getBestSellers, getMostViewedProducts, getRelatedProducts, getSimilarProducts, getSimilarBrandProducts, getSimilarUsedProducts, getSimilarBrandUsedProducts, getRelatedUsedProducts };
import Product from "../models/product.model.js";
import Delivery from "../models/deliveryzone.model.js";
import View from "../models/view.model.js";

const getSimilarProducts = async (req, res) => {
  try {
    const { productId } = req.params;

    const currentProduct = await Product.findById(productId).select('subcategory');

    if (!currentProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const similarProducts = await Product.find({
      subcategory: currentProduct.subcategory,
      _id: { $ne: productId }
    })
      .select('name price rating image subcategory category')
      .limit(10);

    return res.status(200).json({
      success: true,
      data: similarProducts,
      message: 'Similar products fetched successfully'
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching similar products',
      error: error.message
    });
  }
};

const getRelatedProducts = async (req, res) => {
  try {
    const { productId } = req.params;

    const currentProduct = await Product.findById(productId).select('category');

    if (!currentProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const relatedProducts = await Product.find({
      category: currentProduct.category,
      _id: { $ne: productId }
    })
      .select('name price rating image subcategory category')
      .limit(10);

    return res.status(200).json({
      success: true,
      data: relatedProducts,
      message: 'Related products fetched successfully'
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching related products',
      error: error.message
    });
  }
};

const getBestRatedProducts = async (req, res) => {
  try {
    const { location } = req.body;

    if (!location || (!location.city && !location.state)) {
      return res.status(400).json({
        success: false,
        message: 'Location (city or state) is required'
      });
    }

    const locationQuery = {};
    if (location.city) {
      locationQuery.city = location.city;
    }
    if (location.state) {
      locationQuery.state = location.state;
    }

    const deliveries = await Delivery.find(locationQuery)
      .distinct('productId');

    const bestRatedProducts = await Product.find({
      _id: { $in: deliveries }
    })
      .select('name price rating image category subcategory')
      .sort({ rating: -1 })
      .limit(10);

    return res.status(200).json({
      success: true,
      data: bestRatedProducts,
      message: 'Best rated products fetched successfully'
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching best rated products',
      error: error.message
    });
  }
};

const getMostViewedProducts = async (req, res) => {
  try {
    const { location } = req.body;

    if (!location || (!location.city && !location.state)) {
      return res.status(400).json({
        success: false,
        message: 'Location (city or state) is required'
      });
    }

    const locationQuery = {};
    if (location.city) {
      locationQuery['location.city'] = location.city;
    }
    if (location.state) {
      locationQuery['location.state'] = location.state;
    }

    const viewCounts = await View.aggregate([
      { $match: locationQuery },
      {
        $group: {
          _id: '$productId',
          viewCount: { $sum: 1 }
        }
      },
      { $sort: { viewCount: -1 } },
      { $limit: 10 }
    ]);

    const productIds = viewCounts.map(v => v._id);

    const products = await Product.find({
      _id: { $in: productIds }
    }).select('name price rating image category subcategory');

    const mostViewedProducts = products.map(product => {
      const viewData = viewCounts.find(v => v._id.toString() === product._id.toString());
      return {
        ...product.toObject(),
        viewCount: viewData ? viewData.viewCount : 0
      };
    });

    mostViewedProducts.sort((a, b) => b.viewCount - a.viewCount);

    return res.status(200).json({
      success: true,
      data: mostViewedProducts,
      message: 'Most viewed products fetched successfully'
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching most viewed products',
      error: error.message
    });
  }
};

const getBestSellers = async (req, res) => {
  try {
    const { location } = req.body;

    if (!location || (!location.city && !location.state)) {
      return res.status(400).json({
        success: false,
        message: 'Location (city or state) is required'
      });
    }

    const locationQuery = {};
    if (location.city) {
      locationQuery.city = location.city;
    }
    if (location.state) {
      locationQuery.state = location.state;
    }

    const salesData = await Delivery.aggregate([
      { $match: locationQuery },
      {
        $group: {
          _id: '$productId',
          totalSales: { $sum: '$quantity' }
        }
      },
      { $sort: { totalSales: -1 } },
      { $limit: 10 }
    ]);

    const productIds = salesData.map(s => s._id);

    const products = await Product.find({
      _id: { $in: productIds }
    }).select('name price rating image category subcategory');

    const bestSellers = products.map(product => {
      const salesInfo = salesData.find(s => s._id.toString() === product._id.toString());
      return {
        ...product.toObject(),
        totalSales: salesInfo ? salesInfo.totalSales : 0
      };
    });

    bestSellers.sort((a, b) => b.totalSales - a.totalSales);

    return res.status(200).json({
      success: true,
      data: bestSellers,
      message: 'Best sellers fetched successfully'
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching best sellers',
      error: error.message
    });
  }
};

export { getBestRatedProducts, getBestSellers, getMostViewedProducts, getRelatedProducts, getSimilarProducts };
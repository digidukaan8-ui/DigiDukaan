<meta name='viewport' content='width=device-width, initial-scale=1'/><script>const Product = require('../models/Product');
const Delivery = require('../models/Delivery');
const View = require('../models/View');

// 1. Get Similar Products (same subcategory)
const getSimilarProducts = async (req, res) => {
  try {
    const { productId } = req.params;

    // Fetch the current product to get its subcategory
    const currentProduct = await Product.findById(productId).select('subcategory');
    
    if (!currentProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Find similar products with the same subcategory, excluding the current product
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

// 2. Get Related Products (same category, different product)
const getRelatedProducts = async (req, res) => {
  try {
    const { productId } = req.params;

    // Fetch the current product to get its category
    const currentProduct = await Product.findById(productId).select('category');
    
    if (!currentProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Find related products with the same category, excluding the current product
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

// 3. Get Best Rated Products by Location
const getBestRatedProducts = async (req, res) => {
  try {
    const { location } = req.body;

    if (!location || (!location.city && !location.state)) {
      return res.status(400).json({
        success: false,
        message: 'Location (city or state) is required'
      });
    }

    // Build location query
    const locationQuery = {};
    if (location.city) {
      locationQuery.city = location.city;
    }
    if (location.state) {
      locationQuery.state = location.state;
    }

    // Find deliveries matching the location to get product IDs
    const deliveries = await Delivery.find(locationQuery)
      .distinct('productId');

    // Find products that are deliverable to this location and sort by rating
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

// 4. Get Most Viewed Products by Location
const getMostViewedProducts = async (req, res) => {
  try {
    const { location } = req.body;

    if (!location || (!location.city && !location.state)) {
      return res.status(400).json({
        success: false,
        message: 'Location (city or state) is required'
      });
    }

    // Build location query for views
    const locationQuery = {};
    if (location.city) {
      locationQuery['location.city'] = location.city;
    }
    if (location.state) {
      locationQuery['location.state'] = location.state;
    }

    // Aggregate views by product and count them
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

    // Extract product IDs
    const productIds = viewCounts.map(v => v._id);

    // Fetch the actual product details
    const products = await Product.find({
      _id: { $in: productIds }
    }).select('name price rating image category subcategory');

    // Map products with their view counts
    const mostViewedProducts = products.map(product => {
      const viewData = viewCounts.find(v => v._id.toString() === product._id.toString());
      return {
        ...product.toObject(),
        viewCount: viewData ? viewData.viewCount : 0
      };
    });

    // Sort by view count (since MongoDB aggregation order might not be preserved)
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

// 5. Get Best Sellers by Location
const getBestSellers = async (req, res) => {
  try {
    const { location } = req.body;

    if (!location || (!location.city && !location.state)) {
      return res.status(400).json({
        success: false,
        message: 'Location (city or state) is required'
      });
    }

    // Build location query for deliveries
    const locationQuery = {};
    if (location.city) {
      locationQuery.city = location.city;
    }
    if (location.state) {
      locationQuery.state = location.state;
    }

    // Aggregate deliveries by product and calculate total sales
    const salesData = await Delivery.aggregate([
      { $match: locationQuery },
      {
        $group: {
          _id: '$productId',
          totalSales: { $sum: '$quantity' } // Assuming quantity field exists in Delivery
        }
      },
      { $sort: { totalSales: -1 } },
      { $limit: 10 }
    ]);

    // Extract product IDs
    const productIds = salesData.map(s => s._id);

    // Fetch the actual product details
    const products = await Product.find({
      _id: { $in: productIds }
    }).select('name price rating image category subcategory');

    // Map products with their sales data
    const bestSellers = products.map(product => {
      const salesInfo = salesData.find(s => s._id.toString() === product._id.toString());
      return {
        ...product.toObject(),
        totalSales: salesInfo ? salesInfo.totalSales : 0
      };
    });

    // Sort by total sales (to maintain correct order)
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

module.exports = {
  getSimilarProducts,
  getRelatedProducts,
  getBestRatedProducts,
  getMostViewedProducts,
  getBestSellers
};</script>

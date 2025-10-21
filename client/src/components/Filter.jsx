<meta name='viewport' content='width=device-width, initial-scale=1'/>import { useState, useEffect } from 'react';
import { ShoppingCart, Heart, Star, Filter, X, ChevronDown, Search, Tag, Package } from 'lucide-react';

// Simulated API call function
const fetchProducts = async () => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return [
    {
      id: 1,
      name: 'Premium Wireless Headphones',
      category: 'Electronics',
      subCategory: 'Audio',
      brand: 'SoundMax',
      price: 12999,
      originalPrice: 15999,
      discount: 19,
      color: 'Black',
      weight: '250g',
      rating: 4.5,
      reviews: 128,
      inStock: true,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80'
    },
    {
      id: 2,
      name: 'Smart Fitness Watch',
      category: 'Electronics',
      subCategory: 'Wearables',
      brand: 'FitTech',
      price: 8999,
      originalPrice: 11999,
      discount: 25,
      color: 'Blue',
      weight: '45g',
      rating: 4.7,
      reviews: 256,
      inStock: true,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80'
    },
    {
      id: 3,
      name: 'Leather Laptop Bag',
      category: 'Accessories',
      subCategory: 'Bags',
      brand: 'UrbanStyle',
      price: 3499,
      originalPrice: 4999,
      discount: 30,
      color: 'Brown',
      weight: '800g',
      rating: 4.3,
      reviews: 89,
      inStock: true,
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80'
    },
    {
      id: 4,
      name: 'Running Shoes Pro',
      category: 'Footwear',
      subCategory: 'Sports',
      brand: 'SprintX',
      price: 5999,
      originalPrice: 7999,
      discount: 25,
      color: 'Red',
      weight: '320g',
      rating: 4.6,
      reviews: 342,
      inStock: false,
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80'
    }
  ];
};

const ProductListing = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [filters, setFilters] = useState({
    category: 'All',
    subCategory: 'All',
    brand: 'All',
    minPrice: 0,
    maxPrice: 50000,
    color: 'All',
    weightRange: 'All',
    availability: 'All',
    minRating: 0
  });

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, products, searchTerm]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await fetchProducts();
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...products];

    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filters.category !== 'All') filtered = filtered.filter(p => p.category === filters.category);
    if (filters.subCategory !== 'All') filtered = filtered.filter(p => p.subCategory === filters.subCategory);
    if (filters.brand !== 'All') filtered = filtered.filter(p => p.brand === filters.brand);
    if (filters.color !== 'All') filtered = filtered.filter(p => p.color === filters.color);
    if (filters.availability !== 'All') filtered = filtered.filter(p => filters.availability === 'In Stock' ? p.inStock : !p.inStock);
    if (filters.minRating > 0) filtered = filtered.filter(p => p.rating >= filters.minRating);

    filtered = filtered.filter(p => p.price >= filters.minPrice && p.price <= filters.maxPrice);

    setFilteredProducts(filtered);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const resetFilters = () => {
    setFilters({
      category: 'All',
      subCategory: 'All',
      brand: 'All',
      minPrice: 0,
      maxPrice: 50000,
      color: 'All',
      weightRange: 'All',
      availability: 'All',
      minRating: 0
    });
    setSearchTerm('');
  };

  const categories = ['All', ...new Set(products.map(p => p.category))];
  const subCategories = ['All', ...new Set(products.map(p => p.subCategory))];
  const brands = ['All', ...new Set(products.map(p => p.brand))];
  const colors = ['All', ...new Set(products.map(p => p.color))];

  const ProductCard = ({ product }) => (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-neutral-800 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
      <div className="relative overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {product.discount > 0 && (
          <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
            {product.discount}% OFF
          </div>
        )}
        {!product.inStock && (
          <div className="absolute top-3 right-3 bg-gray-800 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
            Out of Stock
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">{product.name}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{product.brand}</p>
        <div className="flex items-center gap-1 mb-3">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-semibold">{product.rating}</span>
          <span className="text-xs text-gray-500">({product.reviews})</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">₹{product.price}</span>
            {product.discount > 0 && (
              <span className="text-sm text-gray-500 line-through ml-2">₹{product.originalPrice}</span>
            )}
          </div>
          <button
            disabled={!product.inStock}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
              product.inStock ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            {product.inStock ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) return <div className="text-center text-gray-500 py-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Product Catalog</h1>
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProducts.length > 0 ? (
            filteredProducts.map(product => <ProductCard key={product.id} product={product} />)
          ) : (
            <div className="text-center col-span-full py-16 text-gray-600 dark:text-gray-400">
              No products found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductListing;

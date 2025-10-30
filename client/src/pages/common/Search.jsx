import { useState, useEffect } from 'react';
import { useSearchParams, useLocation } from "react-router-dom";
import { ShoppingBag, Box, SearchIcon } from 'lucide-react';
import { QuickView, Card, UsedProductCard, Location } from "../../components/index";

function Search() {
    const location = useLocation();
    const searchResults = location.state?.results || null;
    const [searchQuery, setSearchQuery] = useState(location.state?.query || '');

    const [productsData, setProductsData] = useState({
        newProducts: [],
        usedProducts: []
    });

    const [hasSearched, setHasSearched] = useState(false);

    useEffect(() => {
        if (searchResults) {
            const newProds = searchResults.newProducts || [];
            const usedProds = searchResults.usedProducts || [];

            setProductsData({
                newProducts: newProds,
                usedProducts: usedProds
            });
            setHasSearched(true);
            setSearchQuery(location.state?.query || "");
        }
    }, [searchResults]);

    const [searchParams, setSearchParams] = useSearchParams();
    const [quickViewProduct, setQuickViewProduct] = useState(null);

    const activeTab = searchParams.get("show") || "new";

    const productsToShow = activeTab === "used"
        ? productsData.usedProducts
        : productsData.newProducts;

    const ProductComponent = activeTab === "used" ? UsedProductCard : Card;

    const totalResults = productsData.newProducts.length + productsData.usedProducts.length;

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-neutral-950 pt-30 pb-20">
            <Location />

            {!hasSearched && (
                <div className="flex flex-col items-center justify-center py-20 pt-32 text-gray-600 dark:text-gray-300">
                    <SearchIcon size={64} className="mb-4 opacity-50" />
                    <p className="text-2xl font-semibold mb-2">Start Your Search</p>
                    <p className="text-base text-gray-500 dark:text-gray-400">Use the search bar above to find new and used products.</p>
                </div>
            )}

            {hasSearched && totalResults > 0 && (
                <h1 className="text-2xl sm:text-3xl font-bold text-center mb-8 pt-10 text-gray-800 dark:text-gray-100">
                    Search Results for: <span className="text-sky-600 dark:text-sky-400">"{searchQuery}"</span>
                </h1>
            )}

            {hasSearched && totalResults === 0 && (
                <div className="flex flex-col items-center justify-center py-20 pt-32 text-gray-600 dark:text-gray-300">
                    <SearchIcon size={64} className="mb-4 opacity-50" />
                    <p className="text-2xl font-semibold mb-2">No Results Found</p>
                    <p className="text-base text-gray-500 dark:text-gray-400">
                        We couldn't find any products matching "{searchQuery}".
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                        Try using different keywords or check your spelling.
                    </p>
                </div>
            )}

            {hasSearched && totalResults > 0 && (
                <div className="flex flex-wrap justify-center gap-4 pb-8 pt-4">
                    {["new", "used"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setSearchParams({ show: tab }, { replace: true })}
                            className={`text-base sm:text-lg px-6 py-2.5 rounded-xl font-bold transition-all duration-300 ease-in-out border border-black dark:border-white ${activeTab === tab
                                ? "bg-blue-600 text-white shadow-md"
                                : "bg-white dark:bg-neutral-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800"
                                }`}
                        >
                            {tab === "new" ? (
                                <span className="flex items-center gap-2 cursor-pointer">
                                    <ShoppingBag size={16} /> New Products ({productsData.newProducts.length})
                                </span>
                            ) : (
                                <span className="flex items-center gap-2 cursor-pointer">
                                    <Box size={16} /> Used Products ({productsData.usedProducts.length})
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            )}

            {hasSearched && totalResults > 0 && (
                <div className="w-full px-4 sm:px-8">
                    {productsToShow.length > 0 ? (
                        <div className="flex items-baseline justify-center flex-wrap gap-10 pt-2">
                            {productsToShow.map((product) => (
                                <div key={product._id} className="flex-shrink-0 w-[280px] md:w-[320px]">
                                    <ProductComponent
                                        product={product}
                                        userRole="buyer"
                                        onQuickView={() => setQuickViewProduct(product)}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-gray-500 dark:text-gray-400">
                            {activeTab === "new" ? (
                                <ShoppingBag size={48} className="mb-4 opacity-50" />
                            ) : (
                                <Box size={48} className="mb-4 opacity-50" />
                            )}
                            <p className="text-xl font-semibold mb-2">
                                No {activeTab === "new" ? "New" : "Used"} Products Found
                            </p>
                            <p className="text-sm text-center max-w-md">
                                We couldn't find any {activeTab === "new" ? "new" : "used"} products matching "{searchQuery}".
                            </p>
                            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                                Try switching to the {activeTab === "new" ? "used" : "new"} products tab or search with different keywords.
                            </p>
                        </div>
                    )}
                </div>
            )}

            <QuickView
                product={quickViewProduct}
                type={activeTab}
                isOpen={!!quickViewProduct}
                onClose={() => setQuickViewProduct(null)}
            />
        </div>
    );
}

export default Search;
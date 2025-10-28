import { useState, useEffect } from 'react';
import { getRelatedProducts, getSimilarProducts, getSimilarBrandProducts } from "../api/recommendation";
import useAuthStore from '../store/auth';
import { Card, QuickView } from "../components/index";

function RecommendProduct({ id }) {
    const { user } = useAuthStore();
    const [products, setProducts] = useState({
        similarProducts: [],
        relatedProducts: [],
        similarBrandProducts: []
    });
    const [quickViewProduct, setQuickViewProduct] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const [similarResult, relatedResult, similarBrandResult] = await Promise.all([
                    getSimilarProducts(id),
                    getRelatedProducts(id),
                    getSimilarBrandProducts(id),
                ]);

                setProducts({
                    similarProducts: Array.isArray(similarResult) ? similarResult : [],
                    relatedProducts: Array.isArray(relatedResult) ? relatedResult : [],
                    similarBrandProducts: Array.isArray(similarBrandResult) ? similarBrandResult : [],
                });
            } catch (error) {
                setProducts({ similarProducts: [], relatedProducts: [], similarBrandResult: [] });
            }
        }

        if (id && user?.role === "buyer") {
            fetchProducts();
        }
    }, [id]);

    if (user?.role === "seller" || user?.role === "admin") {
        return null;
    }

    const hasProducts = products.similarProducts.length > 0 || products.relatedProducts.length > 0;
    if (!hasProducts) {
        return null;
    }

    const renderProductSection = (title, productList) => {
        if (!productList || productList.length === 0) {
            return null;
        }

        return (
            <div className="py-4">
                <div className="flex items-center justify-between mx-4 p-4 mb-4 border-b border-black dark:border-white">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">
                        {title}
                    </h2>
                </div>

                <div className="flex items-start gap-4 sm:gap-6 pt-2 overflow-x-auto hide-scrollbar scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-neutral-700 scrollbar-track-transparent px-4">
                    {productList.map((product) => (
                        <div key={product._id} className="flex-shrink-0 w-[320px]">
                            <Card
                                product={product}
                                userRole="buyer"
                                onQuickView={() => setQuickViewProduct(product)}
                            />
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <>
            <div className="bg-gray-100 dark:bg-neutral-950 pb-10">
                {renderProductSection(`More From ${products.similarBrandProducts[0]?.brand}`, products.similarBrandProducts)}
                {renderProductSection("Similar Products", products.similarProducts)}
                {renderProductSection("Related Products", products.relatedProducts)}
            </div>
            <QuickView
                product={quickViewProduct}
                type={"new"}
                isOpen={!!quickViewProduct}
                onClose={() => setQuickViewProduct(null)}
            />
        </>
    );
}

export default RecommendProduct;
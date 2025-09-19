import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { getProductByCategory } from "../../api/product";
import useLoaderStore from "../../store/loader";
import { Card, UsedProductCard } from "../../components";

function Category() {
    const { startLoading, stopLoading } = useLoaderStore();
    const [searchParams, setSearchParams] = useSearchParams();

    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);
    const [loading, setLoading] = useState(false);

    const slug = searchParams.get("slug");
    const type = searchParams.get("show") || "new";

    const fetchProducts = async (slug, page) => {
        setLoading(true);
        startLoading("fetching");
        try {
            const res = await getProductByCategory(slug, page, type);
            if (res.success) {
                setProducts(res.data);
                setTotalPages(res.pagination.pages);
                setTotalProducts(res.pagination.total);
            }
        } finally {
            setLoading(false);
            stopLoading();
        }
    };

    useEffect(() => {
        if (slug) fetchProducts(slug, page);
    }, [slug, page, type]);

    useEffect(() => {
        setPage(1);
    }, [slug, type]);

    return (
        <section className="w-full bg-gray-100 dark:bg-neutral-950 pt-30 text-black dark:text-white">
            <p className="mb-4 px-5 text-gray-700 dark:text-gray-300 text-lg">
                Showing results for <span className="font-semibold capitalize">{slug}</span> -
                <span className="font-medium text-blue-600 dark:text-blue-400"> {totalProducts} products</span> found
            </p>

            {products.length === 0 && !loading && <p className="h-screen">No products found!</p>}

            <div className="flex justify-around items-center flex-wrap gap-6 px-5">
                {products.map((product) =>
                    type === "used" ? (
                        <UsedProductCard key={product._id} product={product} userRole="buyer" />
                    ) : (
                        <Card key={product._id} product={product} userRole="buyer" />
                    )
                )}
            </div>

            <div className="flex justify-center items-center gap-2 mt-6 pb-10 flex-wrap">
                <button
                    disabled={page === 1}
                    onClick={() => setPage((prev) => prev - 1)}
                    className="px-4 py-2 rounded-l-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-neutral-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                    Previous
                </button>

                {(() => {
                    const pages = [];
                    let start = Math.max(1, page - 2);
                    let end = Math.min(totalPages, start + 4);

                    start = Math.max(1, end - 4);

                    for (let p = start; p <= end; p++) {
                        pages.push(
                            <button
                                key={p}
                                onClick={() => setPage(p)}
                                className={`px-4 py-2 border-t border-b border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-neutral-800 transition ${page === p
                                    ? "bg-blue-600 text-white border-blue-600 dark:bg-blue-500"
                                    : "bg-white dark:bg-neutral-900 text-gray-700 dark:text-gray-300"
                                    }`}
                            >
                                {p}
                            </button>
                        );
                    }

                    if (start > 1) {
                        pages.unshift(
                            <span key="start-ellipsis" className="px-2 py-2">
                                ...
                            </span>
                        );
                    }
                    if (end < totalPages) {
                        pages.push(
                            <span key="end-ellipsis" className="px-2 py-2">
                                ...
                            </span>
                        );
                    }

                    return pages;
                })()}

                <button
                    disabled={page === totalPages}
                    onClick={() => setPage((prev) => prev + 1)}
                    className="px-4 py-2 rounded-r-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-neutral-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                    Next
                </button>
            </div>
        </section>
    );
}

export default Category;
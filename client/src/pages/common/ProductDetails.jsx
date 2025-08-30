import { Star, ShoppingCart, Tag, Video } from "lucide-react";
import useProductStore from "../../store/product";

const ProductDetails = ({ product }) => {
    if (!product) return <p>No product found</p>;

    const discountedPrice =
        product.discount?.percentage || product.discount?.amount
            ? product.discount?.amount
                ? product.price - product.discount.amount
                : product.price - (product.price * product.discount.percentage) / 100
            : product.price;

    return (
        <div className="max-w-6xl mx-auto p-6 pt-40 grid grid-cols-1 md:grid-cols-2 gap-8 bg-white dark:bg-gray-900 dark:text-gray-100 rounded-2xl shadow-lg">
            {/* LEFT: Images & Video */}
            <div className="space-y-4">
                {/* Main Image */}
                <img
                    src={product.img[0]?.url}
                    alt={product.title}
                    className="w-full h-96 object-cover rounded-lg"
                />

                {/* Other Images */}
                <div className="flex gap-2 overflow-x-auto">
                    {product.img.slice(1).map((image, i) => (
                        <img
                            key={i}
                            src={image.url}
                            alt={`Product ${i}`}
                            className="w-24 h-24 object-cover rounded-lg border"
                        />
                    ))}
                </div>

                {/* Video */}
                {product.video?.url && (
                    <div className="relative">
                        <video
                            src={product.video.url}
                            controls
                            className="rounded-lg w-full"
                        />
                        <div className="absolute top-2 left-2 bg-black/50 text-white p-1 rounded flex items-center gap-1">
                            <Video size={16} /> Video
                        </div>
                    </div>
                )}
            </div>

            {/* RIGHT: Details */}
            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-3xl font-bold">{product.title}</h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        {product.category?.name} → {product.subCategory?.name}
                    </p>
                </div>

                {/* Price */}
                <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-green-600">
                        ₹{discountedPrice}
                    </span>
                    {discountedPrice !== product.price && (
                        <span className="line-through text-gray-500">
                            ₹{product.price}
                        </span>
                    )}
                    {product.discount?.percentage && (
                        <span className="text-sm text-red-500">
                            {product.discount.percentage}% OFF
                        </span>
                    )}
                </div>

                {/* Stock */}
                <p
                    className={`font-semibold ${product.stock > 0 ? "text-green-600" : "text-red-600"
                        }`}
                >
                    {product.stock > 0 ? `In Stock (${product.stock})` : "Out of Stock"}
                </p>

                {/* Rating */}
                <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                        <Star
                            key={i}
                            size={20}
                            className={
                                i < Math.round(product.rating)
                                    ? "text-yellow-400 fill-yellow-400"
                                    : "text-gray-400"
                            }
                        />
                    ))}
                    <span className="ml-2 text-sm">{product.rating}/5</span>
                </div>

                {/* Description */}
                <p className="text-gray-700 dark:text-gray-300">{product.description}</p>

                {/* Attributes */}
                <div>
                    <h2 className="text-lg font-semibold mb-2">Specifications</h2>
                    <ul className="grid grid-cols-2 gap-2">
                        {product.attributes?.map((attr, i) => (
                            <li
                                key={i}
                                className="border rounded-lg p-2 dark:border-gray-600"
                            >
                                <strong>{attr.key}:</strong> {attr.value}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                    {product.tags?.map((tag, i) => (
                        <span
                            key={i}
                            className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-lg text-sm flex items-center gap-1"
                        >
                            <Tag size={14} /> {tag}
                        </span>
                    ))}
                </div>

                {/* Variants */}
                {product.variants?.length > 0 && (
                    <div>
                        <h2 className="text-lg font-semibold mb-2">Variants</h2>
                        <div className="flex gap-2 flex-wrap">
                            {product.variants.map((variant, i) => (
                                <button
                                    key={i}
                                    className="border px-3 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                                >
                                    {variant.title || "Variant"}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Reviews */}
                <div>
                    <h2 className="text-lg font-semibold mb-2">Reviews</h2>
                    {product.reviews?.length > 0 ? (
                        <ul className="space-y-2">
                            {product.reviews.map((review, i) => (
                                <li
                                    key={i}
                                    className="border rounded-lg p-2 dark:border-gray-600"
                                >
                                    {typeof review === "string"
                                        ? review
                                        : JSON.stringify(review, null, 2)}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500">No reviews yet.</p>
                    )}
                </div>

                {/* Add to Cart */}
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition">
                    <ShoppingCart size={20} /> Add to Cart
                </button>
            </div>
        </div>
    );
};

export default ProductDetails;
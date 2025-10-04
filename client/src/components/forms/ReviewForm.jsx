import { useEffect, useState } from "react";
import { FiStar } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";

const MAX_IMAGE_SIZE_MB = 10;
const MAX_VIDEO_SIZE_MB = 50;

const StarRating = ({ rating, setRating }) => {
  return (
    <div className="flex space-x-0.5">
      {[...Array(5)].map((_, index) => {
        const currentRating = index + 1;
        return (
          <FiStar
            key={index}
            size={24}
            className={`cursor-pointer transition-colors ${currentRating <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300 dark:text-gray-600"
              }`}
            onClick={() => setRating(currentRating)}
          />
        );
      })}
    </div>
  );
};

export default function ReviewForm() {
 const { state } = useLocation();
const [rating, setRating] = useState(0);
const navigate = useNavigate();

const defaultProduct = {
  id: state?.productId,
  title: state?.productName,
  img: state?.img,
};

useEffect(() => {
  if (!state || !state.productId || !state.productName) {
    navigate('/', { replace: true });
  }
}, []);

  const [includeText, setIncludeText] = useState(true);
  const [includeImage, setIncludeImage] = useState(false);
  const [includeVideo, setIncludeVideo] = useState(false);

  const [reviewText, setReviewText] = useState("");

  const [imageTitle, setImageTitle] = useState("");
  const [reviewImage, setReviewImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const [videoTitle, setVideoTitle] = useState("");
  const [reviewVideo, setReviewVideo] = useState(null);
  const [previewVideo, setPreviewVideo] = useState(null);

  const product = defaultProduct;

  const handleFileChange = (e, setFileState, setPreviewState, maxMB, type) => {
    const file = e.target.files[0];
    if (!file) {
      setFileState(null);
      setPreviewState(null);
      return;
    }

    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxMB) {
      console.error(`Error: ${type} size should not exceed ${maxMB}MB.`);
      setFileState(null);
      setPreviewState(null);
      e.target.value = '';
      return;
    }

    setFileState(file);
    setPreviewState(URL.createObjectURL(file));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const reviewData = {
      productId: product.id,
      rating,
      text: includeText ? reviewText.trim() : undefined,

      imageTitle: includeImage && reviewImage ? imageTitle.trim() : undefined,
      imageFile: includeImage ? reviewImage : undefined,

      videoTitle: includeVideo && reviewVideo ? videoTitle.trim() : undefined,
      videoFile: includeVideo ? reviewVideo : undefined,
    };

    console.log("Review Submitted:", reviewData);
  };

  const isTextValid = !includeText || reviewText.trim().length > 0;
  const isImageValid = !includeImage || (imageTitle.trim().length > 0 && reviewImage !== null);
  const isVideoValid = !includeVideo || (videoTitle.trim().length > 0 && reviewVideo !== null);

  const isAnyContentIncluded = includeText || includeImage || includeVideo;

  const isFormValid = rating > 0 && isAnyContentIncluded && isTextValid && isImageValid && isVideoValid;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 pb-20 pt-40 px-4 sm:px-6 md:px-8">
      <div className="max-w-xl mx-auto">
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-black dark:border-white shadow-xl p-4 sm:p-6 md:p-8">
          <h2 className="text-2xl text-center font-bold mb-6 text-gray-900 dark:text-gray-100">
            Add Review
          </h2>

          <div className="flex items-center space-x-4 p-4 mb-6 border border-gray-200 dark:border-neutral-700 rounded-lg bg-gray-50 dark:bg-neutral-800">
            <img
              src={product.img}
              alt={product.title}
              className="w-24 h-24 object-cover rounded-md flex-shrink-0"
            />
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">{product.title}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Product ID: {product.id}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            <div>
              <label htmlFor="reviewRating" className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">
                Your Rating
              </label>
              <input
                id="reviewRating"
                type="number"
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                min="1"
                max="5"
                required
                className="absolute w-0 h-0 opacity-0 pointer-events-none"
              />
              <StarRating rating={rating} setRating={setRating} />
            </div>

            <div>
              <label htmlFor="label" className="block mb-3 font-medium text-sm text-gray-700 dark:text-gray-300">
                Select Content Types
                <input id="label" className="hidden" />
              </label>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center cursor-pointer" onClick={() => setIncludeText(!includeText)}>
                  <input
                    id="checkText"
                    type="checkbox"
                    checked={includeText}
                    onChange={(e) => setIncludeText(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
                  />
                  <label htmlFor="checkText" className="ms-2 text-gray-700 dark:text-gray-300 cursor-pointer select-none">Text Review</label>
                </div>
                <div className="flex items-center cursor-pointer" onClick={() => setIncludeImage(!includeImage)}>
                  <input
                    id="checkImage"
                    type="checkbox"
                    checked={includeImage}
                    onChange={(e) => setIncludeImage(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
                  />
                  <label htmlFor="checkImage" className="ms-2 text-gray-700 dark:text-gray-300 cursor-pointer select-none">Image</label>
                </div>
                <div className="flex items-center cursor-pointer" onClick={() => setIncludeVideo(!includeVideo)}>
                  <input
                    id="checkVideo"
                    type="checkbox"
                    checked={includeVideo}
                    onChange={(e) => setIncludeVideo(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
                  />
                  <label htmlFor="checkVideo" className="ms-2 text-gray-700 dark:text-gray-300 cursor-pointer select-none">Video</label>
                </div>
              </div>
            </div>

            {includeText && (
              <div className="border border-dashed border-gray-300 dark:border-neutral-700 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Text Review</h3>
                <label htmlFor="reviewContentText" className="sr-only">Write Review</label>
                <textarea
                  id="reviewContentText"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="w-full border border-black dark:border-white p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-neutral-800 placeholder:text-gray-400 dark:placeholder:text-gray-500 dark:text-white outline-none transition text-sm"
                  rows="4"
                  placeholder="Enter your text review..."
                  required={includeText}
                />
              </div>
            )}

            {includeImage && (
              <div className="p-4 border border-gray-200 dark:border-neutral-700 rounded-lg bg-gray-50 dark:bg-neutral-800 space-y-3">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Image Details</h3>

                <label htmlFor="imageTitle" className="block mb-1.5 font-medium text-sm text-gray-700 dark:text-gray-300">
                  Image Title (max 100 chars)
                </label>
                <input
                  id="imageTitle"
                  type="text"
                  value={imageTitle}
                  maxLength={100}
                  onChange={(e) => setImageTitle(e.target.value)}
                  className="w-full border border-black dark:border-white p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:focus:border-transparent bg-gray-50 dark:bg-neutral-800 dark:text-white outline-none transition text-sm"
                  placeholder="Title for the image..."
                  required={includeImage}
                />

                <label htmlFor="reviewContentImage" className="block mb-1.5 font-medium text-sm text-gray-700 dark:text-gray-300">
                  Upload Image (Max {MAX_IMAGE_SIZE_MB}MB)
                </label>
                <input
                  id="reviewContentImage"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, setReviewImage, setPreviewImage, MAX_IMAGE_SIZE_MB, 'Image')}
                  className="w-full cursor-pointer border border-black dark:border-white p-2.5 rounded-lg bg-gray-50 dark:bg-neutral-800 dark:text-white text-sm file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-blue-50 dark:file:bg-blue-900/20 file:text-blue-600 dark:file:text-blue-400 file:cursor-pointer"
                  required={includeImage}
                />
                {previewImage && (
                  <div className="mt-4 p-3 border border-gray-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-900">
                    <p className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">Image Preview:</p>
                    <img src={previewImage} alt="Preview" className="rounded-lg max-h-60 w-full border border-gray-300 dark:border-neutral-600 object-contain" />
                  </div>
                )}
              </div>
            )}

            {includeVideo && (
              <div className="p-4 border border-gray-200 dark:border-neutral-700 rounded-lg bg-gray-50 dark:bg-neutral-800 space-y-3">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Video Details</h3>

                <label htmlFor="videoTitle" className="block mb-1.5 font-medium text-sm text-gray-700 dark:text-gray-300">
                  Video Title (max 100 chars)
                </label>
                <input
                  id="videoTitle"
                  type="text"
                  value={videoTitle}
                  maxLength={100}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  className="w-full border border-black dark:border-white p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:focus:border-transparent bg-gray-50 dark:bg-neutral-800 dark:text-white outline-none transition text-sm"
                  placeholder="Title for the video..."
                  required={includeVideo}
                />

                <label htmlFor="reviewContentVideo" className="block mb-1.5 font-medium text-sm text-gray-700 dark:text-gray-300">
                  Upload Video (Max {MAX_VIDEO_SIZE_MB}MB)
                </label>
                <input
                  id="reviewContentVideo"
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleFileChange(e, setReviewVideo, setPreviewVideo, MAX_VIDEO_SIZE_MB, 'Video')}
                  className="w-full cursor-pointer border border-black dark:border-white p-2.5 rounded-lg bg-gray-50 dark:bg-neutral-800 dark:text-white text-sm file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-blue-50 dark:file:bg-blue-900/20 file:file:text-blue-600 dark:file:text-blue-400 file:cursor-pointer"
                  required={includeVideo}
                />
                {previewVideo && (
                  <div className="mt-4 p-3 border border-gray-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-900">
                    <p className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">Video Preview:</p>
                    <video src={previewVideo} controls className="rounded-lg max-h-60 w-full border border-gray-300 dark:border-neutral-600 object-contain" />
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-center pt-4">
              <button
                type="submit"
                disabled={!isFormValid}
                className={`px-8 py-2.5 rounded-lg font-medium cursor-pointer text-sm transition border border-black dark:border-white 
                    ${isFormValid
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-gray-300 dark:bg-neutral-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  }`}
              >
                Submit Review
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
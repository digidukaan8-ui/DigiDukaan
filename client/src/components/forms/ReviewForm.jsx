import { useEffect, useState } from "react";
import { Star, Check, FileText, ImageIcon, Video, X, Trash2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { addReview, getReview, updateReview, removeReview } from "../../api/product.js";
import useLoaderStore from "../../store/loader.js";
import { toast } from 'react-hot-toast';

const MAX_IMAGE_SIZE_MB = 10;
const MAX_VIDEO_SIZE_MB = 50;

const StarRating = ({ rating, setRating, disabled = false }) => {
  return (
    <div className="flex space-x-1 justify-center">
      {[...Array(5)].map((_, index) => {
        const currentRating = index + 1;
        return (
          <Star
            key={index}
            size={28}
            className={`transition-all ${disabled ? "cursor-not-allowed" : "cursor-pointer hover:scale-110"
              } ${currentRating <= rating
                ? "text-yellow-500 fill-yellow-500"
                : "text-gray-300 dark:text-gray-600"
              }`}
            onClick={() => !disabled && setRating(currentRating)}
          />
        );
      })}
    </div>
  );
};

export default function ReviewForm() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { startLoading, stopLoading } = useLoaderStore();

  const [existingReview, setExistingReview] = useState(null);
  const [rating, setRating] = useState(0);
  const [ratingConfirmed, setRatingConfirmed] = useState(false);

  const [includeText, setIncludeText] = useState(false);
  const [includeImage, setIncludeImage] = useState(false);
  const [includeVideo, setIncludeVideo] = useState(false);

  const [reviewText, setReviewText] = useState("");

  const [imageTitle, setImageTitle] = useState("");
  const [reviewImage, setReviewImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [originalImageData, setOriginalImageData] = useState(null);
  const [imageChanged, setImageChanged] = useState(false);

  const [videoTitle, setVideoTitle] = useState("");
  const [reviewVideo, setReviewVideo] = useState(null);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [originalVideoData, setOriginalVideoData] = useState(null);
  const [videoChanged, setVideoChanged] = useState(false);

  useEffect(() => {
    if (!state || !state.productId || !state.productName || !state.img) {
      navigate('/', { replace: true });
    }
  }, [state, navigate]);

  const product = {
    id: state?.productId,
    title: state?.productName,
    img: state?.img,
  };

  useEffect(() => {
    const fetchReview = async () => {
      const result = await getReview(state?.productId);
      if (result?.success && result?.data) {
        setExistingReview(result.data);
        setRating(result.data.rating);
        setRatingConfirmed(true);

        if (result.data.text) {
          setIncludeText(true);
          setReviewText(result.data.text);
        }

        if (result.data.img) {
          setIncludeImage(true);
          setImageTitle(result.data.img.title);
          setPreviewImage(result.data.img.url);
          setReviewImage(result.data.img.url);
          setOriginalImageData(result.data.img);
        }

        if (result.data.video) {
          setIncludeVideo(true);
          setVideoTitle(result.data.video.title);
          setPreviewVideo(result.data.video.url);
          setReviewVideo(result.data.video.url);
          setOriginalVideoData(result.data.video);
        }
      }
    };
    fetchReview();
  }, [state?.productId]);

  const handleFileChange = (e, setFileState, setPreviewState, maxMB, type, setChangedFlag) => {
    const file = e.target.files[0];
    if (!file) {
      return;
    }

    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxMB) {
      alert(`${type} size should not exceed ${maxMB}MB.`);
      e.target.value = "";
      return;
    }

    setFileState(file);
    setPreviewState(URL.createObjectURL(file));
    if (setChangedFlag) {
      setChangedFlag(true);
    }
  };

  const handleRemoveImage = () => {
    setReviewImage(null);
    setPreviewImage(null);
    setImageTitle("");
    setImageChanged(true);
  };

  const handleRemoveVideo = () => {
    setReviewVideo(null);
    setPreviewVideo(null);
    setVideoTitle("");
    setVideoChanged(true);
  };

  const handleConfirmRating = () => {
    if (rating > 0) {
      setRatingConfirmed(true);
    }
  };

  const handleEditRating = () => {
    setRatingConfirmed(false);
  };

  const handleSubmit = async () => {
    if (!isFormValid) return;

    const reviewData = {
      productId: product.id,
      rating,
      text: includeText ? reviewText.trim() : null,
      imageTitle: includeImage && reviewImage ? imageTitle.trim() : null,
      image: includeImage ? reviewImage : null,
      videoTitle: includeVideo && reviewVideo ? videoTitle.trim() : null,
      video: includeVideo ? reviewVideo : null,
    };

    try {
      if (existingReview) {
        startLoading('updateReview');
        const updateData = {
          productId: product.id,
          rating,
          text: includeText ? reviewText.trim() : null,
        };
        if (includeImage && reviewImage) {
          if (imageChanged) {
            updateData.image = reviewImage;
            updateData.imageTitle = imageTitle.trim();
          } else if (originalImageData) {
            if (imageTitle.trim() !== originalImageData.title) {
              updateData.image = {
                ...originalImageData,
                title: imageTitle.trim()
              };
            } else {
              updateData.image = originalImageData;
            }
          }
        } else if (!includeImage && originalImageData) {
          updateData.image = null;
        }

        if (includeVideo && reviewVideo) {
          if (videoChanged) {
            updateData.video = reviewVideo;
            updateData.videoTitle = videoTitle.trim();
          } else if (originalVideoData) {
            if (videoTitle.trim() !== originalVideoData.title) {
              updateData.video = {
                ...originalVideoData,
                title: videoTitle.trim()
              };
            } else {
              updateData.video = originalVideoData;
            }
          }
        } else if (!includeVideo && originalVideoData) {
          updateData.video = null;
        }

        const deletedMedia = [];
        if (!includeImage && originalImageData?.publicId) {
          deletedMedia.push(originalImageData.publicId);
        } else if (imageChanged && originalImageData?.publicId && reviewImage instanceof File) {
          deletedMedia.push(originalImageData.publicId);
        }

        if (!includeVideo && originalVideoData?.publicId) {
          deletedMedia.push(originalVideoData.publicId);
        } else if (videoChanged && originalVideoData?.publicId && reviewVideo instanceof File) {
          deletedMedia.push(originalVideoData.publicId);
        }

        if (deletedMedia.length > 0) {
          updateData.deletedMedia = deletedMedia;
        }

        const result = await updateReview(updateData, existingReview._id);
        if (result.success) {
          toast.success('Review updated successfully');
          navigate(-1);
        }
      } else {
        startLoading('addReview');
        const result = await addReview(reviewData);
        if (result.success) {
          toast.success('Review added successfully');
          navigate(-1);
        }
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      stopLoading();
    }
  };

  const deleteReviewHandler = async () => {
    if (!existingReview) return;

    const confirmed = window.confirm('Are you sure you want to delete this review?');
    if (!confirmed) return;

    try {
      startLoading('removeReview');
      const result = await removeReview(existingReview._id);
      if (result.success) {
        toast.success('Review removed successfully');
        navigate(-1);
      }
    } catch (error) {
      toast.error('Failed to remove review');
    } finally {
      stopLoading();
    }
  };

  const isTextValid = !includeText || reviewText.trim().length > 0;
  const isImageValid =
    !includeImage || (imageTitle.trim().length > 0 && reviewImage !== null);
  const isVideoValid =
    !includeVideo || (videoTitle.trim().length > 0 && reviewVideo !== null);

  const isFormValid = rating > 0 && isTextValid && isImageValid && isVideoValid;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 pt-40 pb-20 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex justify-center items-center w-full">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {existingReview ? 'Edit Review' : 'Add Review'}
              </h2>
            </div>
            {existingReview && (
              <button
                type="button"
                onClick={deleteReviewHandler}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm flex items-center gap-2 cursor-pointer transition"
              >
                <Trash2 size={18} />
                Delete Review
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 p-4 mb-6 border border-gray-200 dark:border-neutral-700 rounded-lg bg-gray-50 dark:bg-neutral-800">
            <img
              src={product.img}
              alt={product.title}
              className="w-20 h-20 object-cover rounded-lg"
            />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                {product.title}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                ID: {product.id}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {!ratingConfirmed ? (
              <div className="border-2 border-gray-200 dark:border-neutral-700 rounded-lg p-6 bg-gray-50 dark:bg-neutral-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 text-center">
                  Rate this product
                </h3>
                <StarRating rating={rating} setRating={setRating} />
                {rating > 0 && (
                  <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-3">
                    {rating === 5 && "Excellent!"}
                    {rating === 4 && "Very Good!"}
                    {rating === 3 && "Good"}
                    {rating === 2 && "Fair"}
                    {rating === 1 && "Poor"}
                  </p>
                )}
                <div className="flex justify-center mt-6">
                  <button
                    type="button"
                    onClick={handleConfirmRating}
                    disabled={rating === 0}
                    className={`px-6 py-2.5 cursor-pointer rounded-lg font-medium text-sm flex items-center gap-2 ${rating > 0
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-gray-300 dark:bg-neutral-700 text-gray-500 cursor-not-allowed"
                      }`}
                  >
                    <Check size={18} />
                    Confirm Rating
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="border-2 border-green-500 rounded-lg p-4 bg-green-50 dark:bg-green-900/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-2">
                        <Check className="text-green-600" size={20} />
                        Your Rating
                      </h3>
                      <StarRating rating={rating} setRating={setRating} disabled={true} />
                    </div>
                    <button
                      type="button"
                      onClick={handleEditRating}
                      className="px-4 py-2 text-sm cursor-pointer font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg"
                    >
                      Edit
                    </button>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-neutral-700 pt-6">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4 text-center">
                    Add more details (Optional)
                  </h3>

                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <button
                      type="button"
                      onClick={() => setIncludeText(!includeText)}
                      className={`p-4 rounded-lg cursor-pointer border-2 transition ${includeText
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-neutral-700"
                        }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <FileText size={24} className="text-gray-700 dark:text-gray-300" />
                        <span className="text-xs font-medium text-gray-900 dark:text-gray-100">Text</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIncludeImage(!includeImage)}
                      className={`p-4 rounded-lg cursor-pointer border-2 transition ${includeImage
                        ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                        : "border-gray-200 dark:border-neutral-700"
                        }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <ImageIcon size={24} className="text-gray-700 dark:text-gray-300" />
                        <span className="text-xs font-medium text-gray-900 dark:text-gray-100">Image</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIncludeVideo(!includeVideo)}
                      className={`p-4 rounded-lg cursor-pointer border-2 transition ${includeVideo
                        ? "border-pink-500 bg-pink-50 dark:bg-pink-900/20"
                        : "border-gray-200 dark:border-neutral-700"
                        }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Video size={24} className="text-gray-700 dark:text-gray-300" />
                        <span className="text-xs font-medium text-gray-900 dark:text-gray-100">Video</span>
                      </div>
                    </button>
                  </div>

                  {includeText && (
                    <div className="border border-gray-200 dark:border-neutral-700 rounded-lg p-4 mb-4 bg-gray-50 dark:bg-neutral-800">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Text Review</h4>
                      <textarea
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        className="w-full border border-gray-300 dark:border-neutral-600 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white outline-none text-sm resize-none"
                        rows="4"
                        placeholder="Write your review..."
                      />
                    </div>
                  )}

                  {includeImage && (
                    <div className="border border-gray-200 dark:border-neutral-700 rounded-lg p-4 mb-4 bg-gray-50 dark:bg-neutral-800">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Image</h4>
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={imageTitle}
                          maxLength={100}
                          onChange={(e) => setImageTitle(e.target.value)}
                          className="w-full border border-gray-300 dark:border-neutral-600 p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white outline-none text-sm"
                          placeholder="Image title..."
                        />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleFileChange(
                              e,
                              setReviewImage,
                              setPreviewImage,
                              MAX_IMAGE_SIZE_MB,
                              "Image",
                              setImageChanged
                            )
                          }
                          className="w-full cursor-pointer text-sm text-gray-900 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-purple-100 file:text-purple-700 dark:file:bg-purple-900/30 dark:file:text-purple-400 hover:file:bg-purple-200"
                        />
                        {previewImage && (
                          <div className="mt-3 relative">
                            <img
                              src={previewImage}
                              alt="Preview"
                              className="rounded-lg max-h-48 w-full object-contain border border-gray-300 dark:border-neutral-600"
                            />
                            <button
                              type="button"
                              onClick={handleRemoveImage}
                              className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full cursor-pointer transition"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {includeVideo && (
                    <div className="border border-gray-200 dark:border-neutral-700 rounded-lg p-4 mb-4 bg-gray-50 dark:bg-neutral-800">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Video</h4>
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={videoTitle}
                          maxLength={100}
                          onChange={(e) => setVideoTitle(e.target.value)}
                          className="w-full border border-gray-300 dark:border-neutral-600 p-2.5 rounded-lg focus:ring-2 focus:ring-pink-500 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white outline-none text-sm"
                          placeholder="Video title..."
                        />
                        <input
                          type="file"
                          accept="video/*"
                          onChange={(e) =>
                            handleFileChange(
                              e,
                              setReviewVideo,
                              setPreviewVideo,
                              MAX_VIDEO_SIZE_MB,
                              "Video",
                              setVideoChanged
                            )
                          }
                          className="w-full text-sm cursor-pointer text-gray-900 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-pink-100 file:text-pink-700 dark:file:bg-pink-900/30 dark:file:text-pink-400 hover:file:bg-pink-200"
                        />
                        {previewVideo && (
                          <div className="mt-3 relative">
                            <video
                              src={previewVideo}
                              controls
                              className="rounded-lg max-h-48 w-full object-contain border border-gray-300 dark:border-neutral-600"
                            />
                            <button
                              type="button"
                              onClick={handleRemoveVideo}
                              className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full cursor-pointer transition"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-center mt-6">
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={!isFormValid}
                      className={`px-8 py-3 cursor-pointer rounded-lg font-semibold ${isFormValid
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-gray-300 dark:bg-neutral-700 text-gray-500 cursor-not-allowed"
                        }`}
                    >
                      {existingReview ? 'Update Review' : 'Submit Review'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
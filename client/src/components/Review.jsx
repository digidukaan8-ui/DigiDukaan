import { useState, useEffect } from 'react';
import { Star, Quote, Play, ChevronLeft, ChevronRight, Image as ImageIcon, Video as VideoIcon, FileText } from 'lucide-react';
import { getProductReviews } from '../api/product';

const Review = ({ id }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [playingVideo, setPlayingVideo] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  const reviewsPerPage = 6;

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProductReviews(id);

      if (data?.success && Array.isArray(data?.data)) {
        setReviews(data.data);
      } else if (Array.isArray(data)) {
        setReviews(data);
      } else if (data?.reviews && Array.isArray(data.reviews)) {
        setReviews(data.reviews);
      } else {
        setReviews([]);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
      setError('Failed to load reviews');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const groupReviewsByUser = () => {
    const grouped = {};
    reviews.forEach(review => {
      const userId = review.userId?._id || review.userId;
      if (!grouped[userId]) {
        grouped[userId] = {
          user: review.userId,
          reviews: []
        };
      }
      grouped[userId].reviews.push(review);
    });
    return Object.values(grouped);
  };

  const getFilteredReviews = () => {
    const grouped = groupReviewsByUser();
    if (activeTab === 'all') return grouped;

    return grouped.filter(group =>
      group.reviews.some(r => {
        if (activeTab === 'text') return r.text && !r.img && !r.video;
        if (activeTab === 'image') return r.img;
        if (activeTab === 'video') return r.video;
        return false;
      })
    );
  };

  const filteredReviews = getFilteredReviews();
  const totalPages = Math.ceil(filteredReviews.length / reviewsPerPage);

  const getCurrentReviews = () => {
    const start = currentPage * reviewsPerPage;
    return filteredReviews.slice(start, start + reviewsPerPage);
  };

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < rating
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-gray-300 dark:text-gray-600'
              }`}
          />
        ))}
      </div>
    );
  };

  const ReviewCard = ({ userReviews }) => {
    const user = userReviews.user;
    const userName = user?.name || 'Anonymous';
    const username = user?.username || '@anonymous';
    const textReview = userReviews.reviews.find(r => r.text && !r.img && !r.video);
    const imageReview = userReviews.reviews.find(r => r.img);
    const videoReview = userReviews.reviews.find(r => r.video);
    const mainReview = userReviews.reviews[0];

    return (
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-neutral-800 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-neutral-800 dark:to-neutral-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {user?.avatar ? (
                <img
                  src={user.avatar.url}
                  alt={userName}
                  className="w-14 h-14 rounded-full object-cover shadow-lg border-2 border-white dark:border-neutral-700"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {userName.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">
                  {userName}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {username} • Verified Buyer
                </p>
              </div>
            </div>
            <div className="text-right">
              {renderStars(mainReview.rating)}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {new Date(mainReview.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {textReview && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <FileText className="w-5 h-5" />
                <span className="font-semibold text-sm">Review</span>
              </div>
              <div className="relative">
                <Quote className="absolute -top-2 -left-2 w-8 h-8 text-blue-200 dark:text-blue-900 opacity-50" />
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed pl-6 italic">
                  "{textReview.text}"
                </p>
              </div>
            </div>
          )}

          {imageReview && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <ImageIcon className="w-5 h-5" />
                <span className="font-semibold text-sm">Photo Review</span>
              </div>
              <div className="relative rounded-xl overflow-hidden group cursor-pointer">
                <img
                  src={imageReview.img.url}
                  alt={imageReview.img.title || 'Review image'}
                  className="w-full h-72 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    {imageReview.img.title && (
                      <p className="text-white font-medium text-lg">
                        {imageReview.img.title}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              {imageReview.img.title && (
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                  {imageReview.img.title}
                </p>
              )}
            </div>
          )}

          {videoReview && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-pink-600 dark:text-pink-400">
                <VideoIcon className="w-5 h-5" />
                <span className="font-semibold text-sm">Video Review</span>
              </div>
              <div className="relative rounded-xl overflow-hidden">
                {playingVideo === videoReview._id ? (
                  <video
                    src={videoReview.video.url}
                    controls
                    autoPlay
                    className="w-full h-72 object-cover bg-black rounded-xl"
                    onEnded={() => setPlayingVideo(null)}
                  />
                ) : (
                  <div
                    className="relative cursor-pointer group"
                    onClick={() => setPlayingVideo(videoReview._id)}
                  >
                    <video
                      src={videoReview.video.url}
                      className="w-full h-72 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-300 flex items-center justify-center">
                      <div className="w-20 h-20 rounded-full bg-white/95 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-2xl">
                        <Play className="w-10 h-10 text-gray-900 ml-1" fill="currentColor" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {videoReview.video.title && (
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                  {videoReview.video.title}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const getReviewStats = () => {
    let textCount = 0, imageCount = 0, videoCount = 0;
    reviews.forEach(r => {
      if (r.text && !r.img && !r.video) textCount++;
      if (r.img) imageCount++;
      if (r.video) videoCount++;
    });
    return { textCount, imageCount, videoCount };
  };

  const stats = getReviewStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-neutral-950 dark:to-neutral-900 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="h-12 bg-gray-200 dark:bg-neutral-800 rounded-xl w-80 mx-auto mb-4 animate-pulse" />
            <div className="h-6 bg-gray-200 dark:bg-neutral-800 rounded-lg w-96 mx-auto animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-gray-200 dark:border-neutral-800 animate-pulse">
                <div className="h-64 bg-gray-200 dark:bg-neutral-800 rounded-xl mb-4" />
                <div className="h-4 bg-gray-200 dark:bg-neutral-800 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 dark:bg-neutral-800 rounded w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-neutral-950 dark:to-neutral-900 py-16 px-4 flex items-center justify-center">
        <div className="text-center bg-white dark:bg-neutral-900 p-12 rounded-2xl shadow-xl border border-gray-200 dark:border-neutral-800">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-red-600 dark:text-red-400 text-xl font-semibold mb-4">{error}</p>
          <button
            onClick={loadReviews}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition shadow-lg hover:shadow-xl"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-neutral-950 dark:to-neutral-900 py-16 px-4 flex items-center justify-center">
        <div className="text-center bg-white dark:bg-neutral-900 p-12 rounded-2xl shadow-xl border border-gray-200 dark:border-neutral-800">
          <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Star className="w-12 h-12 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            No Reviews Yet
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Be the first to review this product!
          </p>
        </div>
      </div>
    );
  }

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-neutral-950 dark:to-neutral-900 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Customer Reviews
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
            See what our customers have to say about their experience
          </p>
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-7 h-7 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">{averageRating}</span>
            <span className="text-gray-600 dark:text-gray-400 text-lg">({reviews.length} {reviews.length === 1 ? "review" : "reviews"})</span>
          </div>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button
              onClick={() => {
                setActiveTab('all');
                setCurrentPage(0);
              }}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === 'all'
                  ? 'bg-blue-600 text-white shadow-lg scale-105'
                  : 'bg-white dark:bg-neutral-900 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800'
                }`}
            >
              All Reviews ({reviews.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('text');
                setCurrentPage(0);
              }}
              className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${activeTab === 'text'
                  ? 'bg-blue-600 text-white shadow-lg scale-105'
                  : 'bg-white dark:bg-neutral-900 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800'
                }`}
            >
              <FileText className="w-4 h-4" />
              Text ({stats.textCount})
            </button>
            <button
              onClick={() => {
                setActiveTab('image');
                setCurrentPage(0);
              }}
              className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${activeTab === 'image'
                  ? 'bg-green-600 text-white shadow-lg scale-105'
                  : 'bg-white dark:bg-neutral-900 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800'
                }`}
            >
              <ImageIcon className="w-4 h-4" />
              Photos ({stats.imageCount})
            </button>
            <button
              onClick={() => {
                setActiveTab('video');
                setCurrentPage(0);
              }}
              className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${activeTab === 'video'
                  ? 'bg-pink-600 text-white shadow-lg scale-105'
                  : 'bg-white dark:bg-neutral-900 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800'
                }`}
            >
              <VideoIcon className="w-4 h-4" />
              Videos ({stats.videoCount})
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {getCurrentReviews().map((userReviews, idx) => (
            <ReviewCard key={idx} userReviews={userReviews} />
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={prevPage}
              disabled={currentPage === 0}
              className={`p-3 rounded-full border-2 transition-all ${currentPage === 0
                  ? 'bg-gray-100 dark:bg-neutral-900 text-gray-400 dark:text-gray-600 border-gray-200 dark:border-neutral-800 cursor-not-allowed'
                  : 'bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-neutral-700 hover:bg-blue-50 dark:hover:bg-neutral-800 hover:shadow-lg hover:scale-110'
                }`}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <div className="flex gap-2">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i)}
                  className={`w-12 h-12 rounded-full font-bold transition-all ${i === currentPage
                      ? 'bg-blue-600 text-white shadow-xl scale-125'
                      : 'bg-white dark:bg-neutral-900 text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800 hover:scale-110'
                    }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              onClick={nextPage}
              disabled={currentPage === totalPages - 1}
              className={`p-3 rounded-full border-2 transition-all ${currentPage === totalPages - 1
                  ? 'bg-gray-100 dark:bg-neutral-900 text-gray-400 dark:text-gray-600 border-gray-200 dark:border-neutral-800 cursor-not-allowed'
                  : 'bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-neutral-700 hover:bg-blue-50 dark:hover:bg-neutral-800 hover:shadow-lg hover:scale-110'
                }`}
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Review;
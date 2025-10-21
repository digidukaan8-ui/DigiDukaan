<meta name='viewport' content='width=device-width, initial-scale=1'/>import { useState, useEffect } from 'react';
import { Star, Quote, Play, ChevronLeft, ChevronRight } from 'lucide-react';

// Simulated API call function
const fetchReviews = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return [
    {
      id: 1,
      type: 'text',
      name: 'Sarah Mitchell',
      title: 'Product Designer',
      rating: 5,
      text: 'This product exceeded all my expectations! The quality is outstanding and the customer service was incredibly helpful throughout the entire process. Highly recommend to anyone looking for a reliable solution.',
      date: '2025-10-15'
    },
    {
      id: 2,
      type: 'image',
      name: 'James Rodriguez',
      title: 'Software Engineer',
      rating: 5,
      imageUrl: 'https://images.unsplash.com/photo-1560807707-8cc77767d783?w=800&q=80',
      caption: 'Amazing results after just 2 weeks of use!',
      date: '2025-10-12'
    },
    {
      id: 3,
      type: 'video',
      name: 'Emily Chen',
      title: 'Content Creator',
      rating: 5,
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?w=800&q=80',
      date: '2025-10-10'
    },
    {
      id: 4,
      type: 'text',
      name: 'Michael Zhang',
      title: 'Marketing Manager',
      rating: 4,
      text: 'Great product overall! The interface is intuitive and easy to use. Only minor issue was the initial setup, but support team helped me through it quickly.',
      date: '2025-10-08'
    },
    {
      id: 5,
      type: 'image',
      name: 'Olivia Thompson',
      title: 'Photographer',
      rating: 5,
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
      caption: 'Perfect quality and design. Exactly what I needed!',
      date: '2025-10-05'
    },
    {
      id: 6,
      type: 'text',
      name: 'David Park',
      title: 'Business Owner',
      rating: 5,
      text: 'Fantastic investment for my business. The ROI has been incredible and my team loves using it. The features are exactly what we needed to streamline our workflow.',
      date: '2025-10-03'
    }
  ];
};

const ReviewsSection = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [playingVideo, setPlayingVideo] = useState(null);

  const reviewsPerPage = 3;
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const data = await fetchReviews();
      setReviews(data);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentReviews = () => {
    const start = currentPage * reviewsPerPage;
    return reviews.slice(start, start + reviewsPerPage);
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
            className={`w-4 h-4 ${
              i < rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        ))}
      </div>
    );
  };

  const TextReview = ({ review }) => (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-gray-200 dark:border-neutral-800 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
            {review.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {review.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {review.title}
            </p>
          </div>
        </div>
        <Quote className="w-8 h-8 text-blue-500 opacity-20" />
      </div>
      
      <div className="mb-3">{renderStars(review.rating)}</div>
      
      <p className="text-gray-700 dark:text-gray-300 leading-relaxed flex-grow">
        {review.text}
      </p>
      
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
        {new Date(review.date).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}
      </p>
    </div>
  );

  const ImageReview = ({ review }) => (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-neutral-800 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
      <div className="relative overflow-hidden group">
        <img
          src={review.imageUrl}
          alt={`Review by ${review.name}`}
          className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white font-bold text-lg">
            {review.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {review.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {review.title}
            </p>
          </div>
        </div>
        
        <div className="mb-3">{renderStars(review.rating)}</div>
        
        <p className="text-gray-700 dark:text-gray-300 italic flex-grow">
          "{review.caption}"
        </p>
        
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
          {new Date(review.date).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>
    </div>
  );

  const VideoReview = ({ review }) => (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-neutral-800 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
      <div className="relative">
        {playingVideo === review.id ? (
          <video
            src={review.videoUrl}
            controls
            autoPlay
            className="w-full h-64 object-cover bg-black"
            onEnded={() => setPlayingVideo(null)}
          />
        ) : (
          <div 
            className="relative cursor-pointer group"
            onClick={() => setPlayingVideo(review.id)}
          >
            <img
              src={review.thumbnail}
              alt={`Video review by ${review.name}`}
              className="w-full h-64 object-cover"
            />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-300 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                <Play className="w-8 h-8 text-gray-900 ml-1" />
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-orange-600 flex items-center justify-center text-white font-bold text-lg">
            {review.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {review.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {review.title}
            </p>
          </div>
        </div>
        
        <div className="mb-3">{renderStars(review.rating)}</div>
        
        <p className="text-gray-700 dark:text-gray-300 flex-grow">
          Watch {review.name}'s video review
        </p>
        
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
          {new Date(review.date).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>
    </div>
  );

  const renderReview = (review) => {
    switch (review.type) {
      case 'text':
        return <TextReview review={review} />;
      case 'image':
        return <ImageReview review={review} />;
      case 'video':
        return <VideoReview review={review} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="h-10 bg-gray-200 dark:bg-neutral-800 rounded-lg w-64 mx-auto mb-4 animate-pulse" />
            <div className="h-6 bg-gray-200 dark:bg-neutral-800 rounded-lg w-96 mx-auto animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-gray-200 dark:border-neutral-800 animate-pulse">
                <div className="h-48 bg-gray-200 dark:bg-neutral-800 rounded-lg mb-4" />
                <div className="h-4 bg-gray-200 dark:bg-neutral-800 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 dark:bg-neutral-800 rounded w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Customer Reviews
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            See what our customers have to say about their experience
          </p>
          <div className="flex items-center justify-center gap-2 mt-6">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">4.9</span>
            <span className="text-gray-600 dark:text-gray-400">({reviews.length} reviews)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {getCurrentReviews().map((review) => (
            <div key={review.id}>
              {renderReview(review)}
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-12">
            <button
              onClick={prevPage}
              disabled={currentPage === 0}
              className={`p-3 rounded-full border transition-all ${
                currentPage === 0
                  ? 'bg-gray-100 dark:bg-neutral-900 text-gray-400 dark:text-gray-600 border-gray-200 dark:border-neutral-800 cursor-not-allowed'
                  : 'bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800 hover:shadow-md'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex gap-2">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i)}
                  className={`w-10 h-10 rounded-full font-semibold transition-all ${
                    i === currentPage
                      ? 'bg-blue-600 text-white shadow-md scale-110'
                      : 'bg-white dark:bg-neutral-900 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              onClick={nextPage}
              disabled={currentPage === totalPages - 1}
              className={`p-3 rounded-full border transition-all ${
                currentPage === totalPages - 1
                  ? 'bg-gray-100 dark:bg-neutral-900 text-gray-400 dark:text-gray-600 border-gray-200 dark:border-neutral-800 cursor-not-allowed'
                  : 'bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800 hover:shadow-md'
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewsSection;

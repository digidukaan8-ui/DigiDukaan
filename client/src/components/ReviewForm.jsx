import { useState } from "react";

export default function ReviewForm() {
  const [reviewType, setReviewType] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [preview, setPreview] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    const reviewData = {
      type: reviewType,
      title: reviewType !== "text" ? title : undefined,
      content,
    };

    console.log("Review Submitted:", reviewData);
    alert("Review submitted! Check console for data");
  };

  // File preview
  const handleFileChange = (file) => {
    setContent(file);
    if (file) {
      const fileURL = URL.createObjectURL(file);
      setPreview(fileURL);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-lg rounded-2xl">
      <h2 className="text-xl font-semibold mb-4">Add Review</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Select Review Type */}
        <div>
          <label className="block text-sm font-medium mb-1">Review Type</label>
          <select
            value={reviewType}
            onChange={(e) => {
              setReviewType(e.target.value);
              setTitle("");
              setContent("");
              setPreview(null);
            }}
            className="w-full p-2 border rounded-lg"
            required
          >
            <option value="">-- Select Type --</option>
            <option value="text">Text</option>
            <option value="image">Image</option>
            <option value="video">Video</option>
          </select>
        </div>

        {/* Title for Image/Video */}
        {(reviewType === "image" || reviewType === "video") && (
          <div>
            <label className="block text-sm font-medium mb-1">
              Title (max 100 chars)
            </label>
            <input
              type="text"
              value={title}
              maxLength={100}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded-lg"
              placeholder="Enter title..."
              required
            />
          </div>
        )}

        {/* Text Review */}
        {reviewType === "text" && (
          <div>
            <label className="block text-sm font-medium mb-1">Write Review</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-2 border rounded-lg"
              rows="4"
              placeholder="Enter your review..."
              required
            />
          </div>
        )}

        {/* Image Upload */}
        {reviewType === "image" && (
          <div>
            <label className="block text-sm font-medium mb-1">Upload Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e.target.files[0])}
              className="w-full p-2 border rounded-lg"
              required
            />
          </div>
        )}

        {/* Video Upload */}
        {reviewType === "video" && (
          <div>
            <label className="block text-sm font-medium mb-1">Upload Video</label>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => handleFileChange(e.target.files[0])}
              className="w-full p-2 border rounded-lg"
              required
            />
          </div>
        )}

        {/* Preview Section */}
        {(content || preview) && (
          <div className="p-4 border rounded-lg bg-gray-50 mt-4">
            <h3 className="font-semibold mb-2">Preview</h3>
            {title && <p className="mb-2">📌 <b>{title}</b></p>}
            {reviewType === "text" && <p>{content}</p>}
            {reviewType === "image" && preview && (
              <img src={preview} alt="Preview" className="rounded-lg max-h-60" />
            )}
            {reviewType === "video" && preview && (
              <video src={preview} controls className="rounded-lg max-h-60" />
            )}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Submit Review
        </button>
      </form>
    </div>
  );
}

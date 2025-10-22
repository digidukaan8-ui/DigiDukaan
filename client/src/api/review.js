import toast from 'react-hot-toast';
import logoutHelper from '../utils/logoutHelper';

const addReview = async (data) => {
    try {
        let body;
        let headers = { "Content-Type": "application/json" };

        if ((data.image instanceof File) || data.video instanceof File) {
            const formData = new FormData();
            formData.append('productId', data.productId);
            formData.append('rating', data.rating);
            formData.append('text', data.text);
            formData.append('imageTitle', data.imageTitle);
            formData.append('videoTitle', data.videoTitle);
            if (data.img) {
                formData.append("image", data.image);
            }
            if (data.video) {
                formData.append("video", data.video);
            }
            body = formData;
            headers = {};
        } else {
            body = JSON.stringify({
                productId: data.productId,
                rating: data.rating,
                text: data.text,
            });
        }

        const response = await fetch("http://localhost:3000/api/buyers/review", {
            method: "POST",
            credentials: "include",
            headers,
            body,
        });

        const result = await response.json();

        if (!result.success) {
            logoutHelper(result.message);
            toast.error(result.message || "Failed to add review");
            throw new Error(result.message || "Failed to add review");
        }

        return result;
    } catch (error) {
        console.error("Error in adding review: ", error);
        throw error;
    }
};

export { addReview };
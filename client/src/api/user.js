import { toast } from 'react-hot-toast'
import useAuthStore from '../store/auth';
import useStore from '../store/store';
import useProductStore from '../store/product';
import useDeliveryStore from '../store/deliveryZone';
import useUsedProductStore from '../store/usedProduct';
import useCartStore from '../store/cart';
import useWishlistStore from '../store/wishlist';
import useAddressStore from '../store/address';

const registerUser = async (data) => {
    try {
        const response = await fetch('http://localhost:3000/api/users/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (!result.success) {
            toast.error(result.message || 'Registration failed');
            throw new Error(result.message || 'Failed to register user');
        }

        return result;
    } catch (error) {
        console.error("Error in registering user: ", error);
        throw error;
    }
}

const loginUser = async (data) => {
    try {
        const response = await fetch('http://localhost:3000/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (!result.success) {
            toast.error(result.message || 'Login failed');
            throw new Error(result.message || 'Failed to Login user');
        }

        useAuthStore.getState().login(result.data);
        if (result.store != null) {
            useStore.getState().addDetails(result.store);
        }

        if (result.deliveryZone != null) {
            useDeliveryStore.getState().setZones(result.deliveryZone);
        }

        return result;
    } catch (error) {
        console.error("Error in login user: ", error);
        throw error;
    }
}

const logoutUser = async () => {
    try {
        const response = await fetch('http://localhost:3000/api/users/logout', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
        });

        const result = await response.json();
        if (result.success) {
            useAuthStore.getState().logout();
            useStore.getState().clearStore();
            useProductStore.getState().clearProducts();
            useDeliveryStore.getState().clearZones();
            useUsedProductStore.getState().clearUsedProducts();
            useCartStore.getState().clearCart();
            useWishlistStore.getState().clearWishlist();
            useAddressStore.getState().clearAddress();
        }

        return result;
    } catch (error) {
        console.error("Error in logout user: ", error);
        throw error;
    }
}

const sendOtp = async (email, captchaToken) => {
    try {
        const response = await fetch('http://localhost:3000/api/users/send-otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(email, captchaToken)
        });

        const data = await response.json();
        if (!data.success) {
            toast.error(result.message || 'Failed to send otp');
            throw new Error(result.message || 'Failed to send otp');
        }

        return data;
    } catch (error) {
        console.error("Error in get otp: ", error);
        throw error;
    }
}

const verifyOtp = async (data) => {
    try {
        const response = await fetch('http://localhost:3000/api/users/verify-otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        if (!result.success) {
            toast.error(result.message || 'Failed to verify otp');
            throw new Error(result.message || 'Failed to verify otp');
        }

        return result;
    } catch (error) {
        console.error("Error in verify otp: ", error);
        throw error;
    }
}

const resetPassword = async (data) => {
    try {
        const response = await fetch('http://localhost:3000/api/users/reset-password', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        if (!result.success) {
            toast.error(result.message || 'Failed to verify otp');
            throw new Error(result.message || 'Failed to verify otp');
        }

        return result;
    } catch (error) {
        console.error("Error in new password: ", error);
        throw error;
    }
}

const sendMessage = async (message) => {
    try {
        const response = await fetch('http://localhost:3000/api/users/contact', {
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify(message)
        });

        const data = await response.json();
        if (!data.success) {
            toast.error(data.message || 'Failed to send message');
            throw new Error(data.message || 'Failed to send message');
        }

        return data;
    } catch (error) {
        console.error("Error in sending message: ", error);
        throw error;
    }
}

const changeAvatar = async (img) => {
    try {
        const formData = new FormData();
        formData.append('img', img);
        const response = await fetch('http://localhost:3000/api/users/avatar', {
            method: 'PUT',
            credentials: 'include',
            body: formData
        });

        const result = await response.json();
        if (!result.success) {
            toast.error(result.message || 'Failed to change avatar');
            throw new Error(result.message || 'Failed to change avatar');
        }

        return result;
    } catch (error) {
        console.error("Error in changing avatar: ", error);
        throw error;
    }
}

const removeAvatar = async () => {
    try {
        const response = await fetch('http://localhost:3000/api/users/avatar', {
            method: 'DELETE',
            credentials: 'include',
        });

        const result = await response.json();
        if (!result.success) {
            toast.error(result.message || 'Failed to remove avatar');
            throw new Error(result.message || 'Failed to remove avatar');
        }

        return result;
    } catch (error) {
        console.error("Error in removing avatar: ", error);
        throw error;
    }
}

const updateProfile = async (data) => {
    try {
        const response = await fetch('http://localhost:3000/api/users/update', {
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'PUT',
            credentials: 'include',
            body: JSON.stringify(data),
        });

        const result = await response.json();
        if (!result.success) {
            toast.error(result.message || 'Failed to update profile');
            throw new Error(result.message || 'Failed to update profile');
        }

        return result;
    } catch (error) {
        console.error("Error in update profile: ", error);
        throw error;
    }
}

export { registerUser, loginUser, logoutUser, sendOtp, verifyOtp, resetPassword, sendMessage, changeAvatar, removeAvatar, updateProfile };
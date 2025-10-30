import toast from 'react-hot-toast';
import logoutHelper from '../utils/logoutHelper';

const addOrder = async (data) => {
    try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/payments/order`, {
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'POST',
            credentials: 'include',
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!result.success) {
            logoutHelper(result.message);
            toast.error(result.message || "Failed to create order");
            throw new Error(result.message || "Failed to create order");
        }

        const { payment_session_id, order_id } = result.data;

        if (!payment_session_id) {
            toast.error("Payment session id missing");
            return;
        }

        if (!window.Cashfree) {
            toast.error("Cashfree SDK not loaded yet");
            return;
        }

        const cashfree = new window.Cashfree({ mode: "sandbox" });

        cashfree.checkout({
            paymentSessionId: payment_session_id,
            redirectTarget: "_self",
            onSuccess: async (event) => {
                console.log("Payment success event:", event);
                toast.success("Payment successful!");
                window.location.href = `/order-confirmation?orderId=${order_id}`;
            },
            onFailure: async (event) => {
                console.error("Payment failed event:", event);
                toast.error("Payment failed. Please try again.");
            },
        });

        return result;
    } catch (error) {
        console.error("Error in add Order:", error);
        toast.error("Something went wrong in payment");
        throw error;
    }
}

const getStoreCharges = async (storeIds) => {
    try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/buyers/store/deliveryCharge`, {
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'POST',
            credentials: 'include',
            body: JSON.stringify(storeIds),
        });

        const result = await response.json();

        if (!result.success) {
            logoutHelper(result.message);
            toast.error(result.message || "Failed to get store charges");
            throw new Error(result.message || "Failed to get store charges");
        }

        return result;
    } catch (error) {
        console.error("Error in get store charges:", error);
        throw error;
    }
}

const verifyOrder = async (orderId) => {
    try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/payments/verify/${orderId}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
        });

        const result = await res.json();

        if (!result.success) {
            logoutHelper(result.message);
            toast.error(result.message || "Failed to verify orders");
            throw new Error(result.message || "Failed to verify orders");
        }

        return result;
    } catch (error) {
        console.error("Error in verify order:", error);
        throw error;
    }
};

const getOrders = async () => {
    try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/buyers/orders`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
        });

        const result = await res.json();

        if (!result.success) {
            logoutHelper(result.message);
            toast.error(result.message || "Failed to verify orders");
            throw new Error(result.message || "Failed to verify orders");
        }

        return result;
    } catch (error) {
        console.error("Error in get orders:", error);
        throw error;
    }
};

const getOrdersCount = async () => {
    try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/buyers/orders/count`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
        });

        const result = await res.json();

        if (!result.success) {
            logoutHelper(result.message);
            toast.error(result.message || "Failed to get orders count");
            throw new Error(result.message || "Failed to get orders count");
        }

        return result;
    } catch (error) {
        console.error("Error in get orders count:", error);
        throw error;
    }
};

const cancelOrder = async (orderId) => {
    try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/buyers/orders/cancel/${orderId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
        });

        const result = await res.json();

        if (!result.success) {
            logoutHelper(result.message);
            toast.error(result.message || "Failed to cancel order");
            throw new Error(result.message || "Failed to cancel order");
        }

        return result;
    } catch (error) {
        console.error("Error in cancel order:", error);
        throw error;
    }
}

const updateOrderStatus = async (orderId, status) => {
    try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/sellers/orders/status/${orderId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ status })
        });

        const result = await res.json();

        if (!result.success) {
            logoutHelper(result.message);
            toast.error(result.message || "Failed to update order status");
            throw new Error(result.message || "Failed to update order status");
        }

        return result;
    } catch (error) {
        console.error("Error in update order status:", error);
        throw error;
    }
}

const getOrderForInvoice = async (orderId) => {
    try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/buyers/orders/invoice/${orderId}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
        });

        const result = await res.json();

        if (!result.success) {
            logoutHelper(result.message);
            toast.error(result.message || "Failed to get orders invoice");
            throw new Error(result.message || "Failed to get orders invoice");
        }

        return result;
    } catch (error) {
        console.error("Error in get orders invoice:", error);
        throw error;
    }
};

export { addOrder, getStoreCharges, verifyOrder, getOrders, getOrdersCount, cancelOrder, updateOrderStatus, getOrderForInvoice };
import toast from 'react-hot-toast';
import logoutHelper from '../utils/logoutHelper';

const addOrder = async (data) => {
    try {
        const response = await fetch(`http://localhost:3000/api/payments/order`, {
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
        const response = await fetch(`http://localhost:3000/api/buyers/store/deliveryCharge`, {
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
        const res = await fetch(`http://localhost:3000/api/payments/verify/${orderId}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
        });

        const result = await res.json();

        if (!result.success) {
            toast.error("Payment not completed");
            console.log("Verification failed:", result.data);
        }

        return result;
    } catch (error) {
        console.error("Error verifying payment:", error);
        toast.error("Something went wrong while verifying payment");
    }
};

export { addOrder, getStoreCharges, verifyOrder };
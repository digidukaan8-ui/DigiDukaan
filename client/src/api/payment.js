import toast from "react-hot-toast";
import logoutHelper from "../utils/logoutHelper";

const payNow = async (data) => {
    try {
        const res = await fetch(
            "http://localhost:3000/api/payments/used-product/create-order",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(data),
            }
        );

        const result = await res.json();

        if (!result.success) {
            logoutHelper(result.message);
            toast.error(result.message || "Failed to create order");
            throw new Error(result.message || "Failed to create order");
        }

        const { payment_session_id } = result.data;

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
            },
            onFailure: async (event) => {
                console.error("Payment failed event:", event);
            },
        });
    } catch (error) {
        console.error("Error to create order:", error);
        toast.error("Something went wrong in payment");
    }
};

const verifyPayment = async (orderId, productId) => {
    try {
        const res = await fetch("http://localhost:3000/api/payments/used-product/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ orderId, productId }),
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

export { payNow, verifyPayment };
import { create } from "zustand";
import { persist } from "zustand/middleware";

const useCartStore = create(
  persist(
    (set, get) => ({
      cart: [],

      setCart: (cart) => set({ cart }),

      addToCart: (product) => {
        const cart = get().cart;
        const existing = cart.find((item) => item.productId === product.productId);
        if (existing) {
          const updatedCart = cart.map((item) =>
            item.productId === product.productId
              ? { ...item, quantity: item.quantity + product.quantity }
              : item
          );
          set({ cart: updatedCart });
        } else {
          set({ cart: [...cart, product] });
        }
      },

      updateCart: (cartId, quantity) => {
        const cart = get().cart;
        const updatedCart = cart.map((item) =>
          item._id === cartId ? { ...item, quantity } : item
        );
        set({ cart: updatedCart });
      },

      removeFromCart: (cartId) => {
        const cart = get().cart.filter((item) => item._id !== cartId);
        set({ cart });
      },

      getIdFromCart: () => {
        return get().cart.map(item => item.productId._id);
      },

      clearCart: () => set({ cart: [] }),
    }),
    {
      name: "cart-storage",
      partialize: (state) => ({ cart: state.cart }),
    }
  )
);

export default useCartStore;
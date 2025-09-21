import { create } from "zustand";
import { persist } from "zustand/middleware";

const useCartStore = create(
  persist(
    (set, get) => ({
      cart: [],
      isFetched: false,

      setCart: (cart) => set({ cart, isFetched: true }),

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

      clearCart: () => set({ cart: [], isFetched: false }),

      getCartLength: () => { return get().cart.length },
    }),

    {
      name: "cart-storage",
      partialize: (state) => ({ cart: state.cart, isFetched: state.isFetched }),
    }
  )
);

export default useCartStore;
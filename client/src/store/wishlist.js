import { create } from "zustand";
import { persist } from "zustand/middleware";

const useWishlistStore = create(
  persist(
    (set, get) => ({
      wishlist: { _id: null, productIds: [] },

      setWishlist: (wishlist) => set({ wishlist }),

      addToWishlist: (wishlistId, productId) => {
        const wishlist = get().wishlist;
        if (!wishlist._id) {
          set({ wishlist: { _id: wishlistId, productIds: [productId] } });
          return;
        }
        if (!wishlist.productIds.includes(productId)) {
          set({
            wishlist: {
              ...wishlist,
              productIds: [...wishlist.productIds, productId],
            },
          });
        }
      },

      removeFromWishlist: (productId) => {
        const wishlist = get().wishlist;
        if (!wishlist._id) return;
        set({
          wishlist: {
            ...wishlist,
            productIds: wishlist.productIds.filter((id) => id !== productId),
          },
        });
      },

      getIdsFromWishlist: () => {
        const wishlist = get().wishlist;
        return wishlist && wishlist.productIds ? wishlist.productIds : [];
      },

      clearWishlist: () =>
        set({ wishlist: { _id: null, productIds: [] } }),
    }),
    {
      name: "wishlist-storage",
      partialize: (state) => ({ wishlist: state.wishlist }),
    }
  )
);

export default useWishlistStore;
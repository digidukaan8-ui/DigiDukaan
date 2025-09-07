import { create } from "zustand";
import { persist } from "zustand/middleware";

const useCategoryProductStore = create(
  persist(
    (set, get) => ({
      categories: [],

      setAllCategories: (data) => set({ categories: data }),

      setCategoryProducts: (category, products) =>
        set((state) => {
          const existing = state.categories.find((c) => c[category]);
          if (existing) {
            return {
              categories: state.categories.map((c) =>
                c[category] ? { [category]: products } : c
              ),
            };
          }
          return { categories: [...state.categories, { [category]: products }] };
        }),

      addProductToCategory: (category, product) =>
        set((state) => {
          const existing = state.categories.find((c) => c[category]);
          if (existing) {
            return {
              categories: state.categories.map((c) =>
                c[category] ? { [category]: [...c[category], product] } : c
              ),
            };
          }
          return {
            categories: [...state.categories, { [category]: [product] }],
          };
        }),

      clearCategories: () => set({ categories: [] }),

      getProductById: (id) => {
        const categories = get().categories;
        for (const categoryObj of categories) {
          const [_, products] = Object.entries(categoryObj)[0];
          const found = products.find((p) => p._id === id);
          if (found) return found;
        }
        return null;
      },
    }),
    {
      name: "category-products-storage",
      partialize: (state) => ({
        categories: state.categories,
      }),
    }
  )
);

export default useCategoryProductStore;
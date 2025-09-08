import { create } from "zustand";
import { persist } from "zustand/middleware";

const useUsedCategoryProductStore = create(
  persist(
    (set, get) => ({
      usedProductCategories: [],

      setAllUsedCategories: (data) => set({ usedProductCategories: data }),

      setCategoryUsedProducts: (category, products) =>
        set((state) => {
          const existing = state.usedProductCategories.find((c) => c[category]);
          if (existing) {
            return {
              usedProductCategories: state.usedProductCategories.map((c) =>
                c[category] ? { [category]: products } : c
              ),
            };
          }
          return {
            usedProductCategories: [
              ...state.usedProductCategories,
              { [category]: products },
            ],
          };
        }),

      addUsedProductToCategory: (category, product) =>
        set((state) => {
          const existing = state.usedProductCategories.find((c) => c[category]);
          if (existing) {
            return {
              usedProductCategories: state.usedProductCategories.map((c) =>
                c[category] ? { [category]: [...c[category], product] } : c
              ),
            };
          }
          return {
            usedProductCategories: [
              ...state.usedProductCategories,
              { [category]: [product] },
            ],
          };
        }),

      clearUsedCategories: () => set({ usedProductCategories: [] }),

      getUsedProductById: (id) => {
        const categories = get().usedProductCategories;
        for (const categoryObj of categories) {
          const [_, products] = Object.entries(categoryObj)[0];
          const found = products.find((p) => p._id === id);
          if (found) return found;
        }
        return null;
      },
    }),
    {
      name: "category-used-products-storage",
      storage: {
        getItem: (name) => {
          const item = sessionStorage.getItem(name);
          return item ? JSON.parse(item) : null;
        },
        setItem: (name, value) => {
          sessionStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => sessionStorage.removeItem(name),
      },
      partialize: (state) => ({
        usedProductCategories: state.usedProductCategories,
      }),
    }
  )
);

export default useUsedCategoryProductStore;
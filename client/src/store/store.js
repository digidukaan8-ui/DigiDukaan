import { create } from "zustand";
import { persist } from "zustand/middleware";

const useStore = create(
  persist(
    (set) => ({
      store: null,
      addDetails: (data) => set({ store: data }),
      updateStoreDetails: (data) =>
        set((state) => ({
          store: { ...state.store, ...data },
        })),
      clearStore: () => set({ store: null })
    }),
    {
      name: "store-storage",
      partialize: (state) => ({
        store: state.store,
      }),
    }
  )
);

export default useStore;
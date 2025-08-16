import { create } from "zustand";

const useLoaderStore = create((set) => ({
  isLoading: false,
  variant: "default",

  startLoading: (variant = "default") => set({ isLoading: true, variant }),
  stopLoading: () => set({ isLoading: false, variant: "default" }),
}));

export default useLoaderStore;
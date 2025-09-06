import { create } from "zustand";
import { persist } from "zustand/middleware";

const useLocationStore = create(
  persist(
    (set, get) => ({
      location: {},
      editedLocation: {},

      setLocation: (data) =>
        set({ location: data, editedLocation: data }),

      setEditedLocation: (data) =>
        set((state) => ({ editedLocation: { ...state.editedLocation, ...data } })),

      resetEdited: () => set({ editedLocation: get().location }),

      clearLocation: () => set({ location: {}, editedLocation: {} }),
    }),
    {
      name: "location-storage",
      partialize: (state) => ({
        location: state.location,
        editedLocation: state.editedLocation, 
      }),
      onRehydrateStorage: () => (state) => {
        if (state.location && !state.editedLocation) {
          state.editedLocation = { ...state.location };
        }
      },
    }
  )
);

export default useLocationStore;

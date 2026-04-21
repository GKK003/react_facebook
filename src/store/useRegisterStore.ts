import { create } from "zustand";

type OpenSelect = "month" | "day" | "year" | "gender" | null;

type RegisterUIState = {
  openSelect: OpenSelect;
  setOpenSelect: (e: OpenSelect) => void;
};

export const useRegisterStore = create<RegisterUIState>((set) => ({
  openSelect: null,
  setOpenSelect: (e) => set({ openSelect: e }),
}));

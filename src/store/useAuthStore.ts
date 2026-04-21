import { create } from "zustand";

type Profile = {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
};

type AuthState = {
  email: string;
  password: string;

  profiles: Profile[];
  showProfiles: boolean;

  popup: boolean;
  selectedProfile: Profile | null;
  popupPassword: string;

  setEmail: (e: string) => void;
  setPassword: (e: string) => void;
  setProfiles: (e: Profile[]) => void;
  setShowProfiles: (e: boolean) => void;
  setPopup: (e: boolean) => void;
  setSelectedProfile: (e: Profile | null) => void;
  setPopupPassword: (e: string) => void;

  loadProfiles: () => void;
  saveProfile: (profile: Profile) => void;
  resetLoginForm: () => void;
  closePopup: () => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  email: "",
  password: "",
  profiles: [],
  showProfiles: false,
  popup: false,
  selectedProfile: null,
  popupPassword: "",

  setEmail: (e) => set({ email: e }),
  setPassword: (e) => set({ password: e }),
  setProfiles: (e) => set({ profiles: e }),
  setShowProfiles: (e) => set({ showProfiles: e }),
  setPopup: (e) => set({ popup: e }),
  setSelectedProfile: (e) => set({ selectedProfile: e }),
  setPopupPassword: (e) => set({ popupPassword: e }),

  loadProfiles: () => {
    const stored = JSON.parse(localStorage.getItem("profiles") || "[]");
    set({ profiles: stored, showProfiles: stored.length > 0 });
  },

  saveProfile: (profile) => {
    const stored = JSON.parse(localStorage.getItem("profiles") || "[]");
    const filtered = stored.filter((p: Profile) => p.uid !== profile.uid);
    const updated = [profile, ...filtered].slice(0, 2);
    localStorage.setItem("profiles", JSON.stringify(updated));
    set({ profiles: updated });
  },

  resetLoginForm: () => set({ email: "", password: "" }),

  closePopup: () =>
    set({ popup: false, selectedProfile: null, popupPassword: "" }),
}));

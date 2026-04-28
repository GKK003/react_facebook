import { create } from "zustand";

type Profile = {
  uid: string;
  name: string;
  email: string;
  photoURL?: string | null;
};

type AuthState = {
  profiles: Profile[];
  showProfiles: boolean;
  popup: boolean;
  selectedProfile: Profile | null;

  setProfiles: (e: Profile[]) => void;
  setShowProfiles: (e: boolean) => void;
  setPopup: (e: boolean) => void;
  setSelectedProfile: (e: Profile | null) => void;

  loadProfiles: () => void;
  saveProfile: (profile: Profile) => void;
  closePopup: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  profiles: [],
  showProfiles: false,
  popup: false,
  selectedProfile: null,

  setProfiles: (e) => set({ profiles: e }),
  setShowProfiles: (e) => set({ showProfiles: e }),
  setPopup: (e) => set({ popup: e }),
  setSelectedProfile: (e) => set({ selectedProfile: e }),

  loadProfiles: () => {
    if (typeof window === "undefined") return;
    const stored = JSON.parse(localStorage.getItem("profiles") || "[]");
    set({ profiles: stored, showProfiles: stored.length > 0 });
  },

  saveProfile: (profile) => {
    if (typeof window === "undefined") return;
    const stored = JSON.parse(localStorage.getItem("profiles") || "[]");
    const filtered = stored.filter((p: Profile) => p.uid !== profile.uid);
    const updated = [profile, ...filtered].slice(0, 2);
    localStorage.setItem("profiles", JSON.stringify(updated));
    set({ profiles: updated });
  },

  closePopup: () => set({ popup: false, selectedProfile: null }),
}));

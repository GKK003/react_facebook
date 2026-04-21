import { create } from "zustand";

type Birthday = {
  day: string;
  month: string;
  year: string;
};

type Errors = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  birthday: string;
  gender: string;
};

type OpenSelect = "month" | "day" | "year" | "gender" | null;

type RegisterState = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  birthday: Birthday;
  gender: string;

  openSelect: OpenSelect;
  errors: Errors;

  setFirstName: (e: string) => void;
  setLastName: (e: string) => void;
  setEmail: (e: string) => void;
  setPassword: (e: string) => void;
  setBirthday: (e: Birthday) => void;
  setGender: (e: string) => void;
  setOpenSelect: (e: OpenSelect) => void;
  setErrors: (e: Errors) => void;

  resetForm: () => void;
};

const defaultErrors: Errors = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  birthday: "",
  gender: "",
};

export const useRegisterStore = create<RegisterState>((set) => ({
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  birthday: { day: "", month: "", year: "" },
  gender: "",
  openSelect: null,
  errors: defaultErrors,

  setFirstName: (e) => {
    if (/^[A-Za-z]*$/.test(e)) set({ firstName: e });
  },
  setLastName: (e) => {
    if (/^[A-Za-z]*$/.test(e)) set({ lastName: e });
  },
  setEmail: (e) => set({ email: e }),
  setPassword: (e) => set({ password: e }),
  setBirthday: (e) => set({ birthday: e }),
  setGender: (e) => set({ gender: e }),
  setOpenSelect: (e) => set({ openSelect: e }),
  setErrors: (e) => set({ errors: e }),

  resetForm: () =>
    set({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      birthday: { day: "", month: "", year: "" },
      gender: "",
      openSelect: null,
      errors: defaultErrors,
    }),
}));

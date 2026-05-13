"use client";

import { useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { loginSchema } from "@/schemas/loginSchema";
import Image from "next/image";
import NoProfile from "@/assets/images/noprofile.webp";
import { useAuthStore } from "@/store/useAuthStore";

type PopupFormValues = {
  password: string;
};

type Props = {
  onLogin: (email: string, password: string) => void;
};

export default function ProfilePopup({ onLogin }: Props) {
  const { selectedProfile, closePopup, popup } = useAuthStore();
  const popupRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PopupFormValues>({
    resolver: yupResolver(loginSchema.pick(["password"])),
  });

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        closePopup();
      }
    };

    if (popup) document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [popup]);

  if (!selectedProfile) return null;

  const onSubmit = (data: PopupFormValues) => {
    onLogin(selectedProfile.email, data.password);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div
        ref={popupRef}
        className="bg-white w-[500px] rounded-2xl pt-10 pb-6 px-8 relative shadow-xl"
      >
        <button
          onClick={closePopup}
          className="absolute top-4 right-4 text-[22px] text-gray-500 hover:text-black cursor-pointer"
        >
          ×
        </button>

        <div className="flex flex-col items-center">
          <div className="w-[100px] h-[100px] rounded-full overflow-hidden bg-gray-300 mb-4">
            <Image
              src={selectedProfile.photoURL || NoProfile}
              alt="profile"
              width={100}
              height={100}
              className="w-full h-full object-cover"
              unoptimized
            />
          </div>

          <h2 className="text-[22px] font-semibold mb-4">
            {selectedProfile.name}
          </h2>

          <div className="w-full mb-4">
            <input
              type="password"
              placeholder="Password"
              {...register("password")}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit(onSubmit)()}
              className={`w-full h-[50px] px-4 rounded-xl border outline-none transition-all duration-150
    ${
      errors.password
        ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
        : "border-[#ccd0d5] hover:border-black focus:border-[#1877F2] focus:ring-2 focus:ring-[#e7f3ff]"
    }`}
            />
            {errors.password && (
              <p className="text-red-500 text-[13px] mt-1">
                ❗ {errors.password.message}
              </p>
            )}
          </div>

          <button
            onClick={handleSubmit(onSubmit)}
            className="w-full h-[45px] bg-[#1877F2] text-white rounded-full hover:bg-[#166FE5] active:scale-[0.98] transition cursor-pointer"
          >
            Log in
          </button>

          <p className="mt-4 text-[14px] text-gray-500 cursor-pointer hover:underline">
            Forgotten password?
          </p>
        </div>
      </div>
    </div>
  );
}

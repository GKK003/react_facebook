"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import NoProfile from "@/assets/images/noprofile.webp";
import { useAuthStore } from "@/store/useAuthStore";

type Props = {
  onLogin: () => void;
};

export default function ProfilePopup({ onLogin }: Props) {
  const {
    selectedProfile,
    popupPassword,
    setPopupPassword,
    closePopup,
    popup,
  } = useAuthStore();
  const popupRef = useRef<HTMLDivElement>(null);

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
          <Image
            src={selectedProfile.photoURL || NoProfile}
            alt="profile"
            width={110}
            height={110}
            className="rounded-full mb-4 object-cover"
          />

          <h2 className="text-[22px] font-semibold mb-4">
            {selectedProfile.name}
          </h2>

          <input
            type="password"
            placeholder="Password"
            value={popupPassword}
            onChange={(e) => setPopupPassword(e.target.value)}
            className="w-full h-[50px] px-4 rounded-xl border border-[#ccd0d5] outline-none hover:border-black focus:border-[#1877F2] focus:ring-2 focus:ring-[#e7f3ff] mb-4"
          />

          <button
            onClick={onLogin}
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

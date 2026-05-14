"use client";

import Image from "next/image";
import Link from "next/link";
import NoProfile from "@/assets/images/noprofile.webp";
import { useAuthStore } from "@/store/useAuthStore";

export default function ProfileList() {
  const { profiles, setShowProfiles, setSelectedProfile, setPopup } =
    useAuthStore();

  return (
    <>
      <h2 className="text-[18px] font-semibold mb-6 text-center">
        Log in to Facebook
      </h2>

      <div className="flex flex-col gap-4 px-4">
        {profiles.map((profile) => (
          <div
            key={profile.uid}
            className="flex items-center justify-between p-3 hover:bg-gray-100 rounded-xl cursor-pointer"
            onClick={() => {
              setSelectedProfile(profile);
              setPopup(true);
            }}
          >
            <div className="flex items-center gap-3">
              <Image
                src={profile.photoURL || NoProfile}
                alt={profile.name}
                width={55}
                height={55}
                className="w-[55px] h-[55px] rounded-full object-cover"
                unoptimized
              />
              <span>{profile.name}</span>
            </div>
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              width={20}
              height={20}
              aria-hidden="true"
              className="text-[#1c1e21] rotate-270"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M4.341 7.247a1 1 0 0 0-.094 1.412l7 8a1 1 0 0 0 1.506 0l7-8a1 1 0 0 0-1.506-1.318L12 14.482l-6.247-7.14a1 1 0 0 0-1.412-.094z"
              />
            </svg>{" "}
          </div>
        ))}

        <button
          onClick={() => setShowProfiles(false)}
          className="w-full h-[45px] border rounded-full mt-4 hover:bg-gray-100 active:bg-gray-200 cursor-pointer"
        >
          Use another profile
        </button>

        <Link
          href="/Register"
          className="w-full h-[45px] flex items-center justify-center border border-[#1877F2] text-[#1877F2] rounded-full hover:bg-[#f0f2f5] active:bg-[#e4e6eb]"
        >
          Create new account
        </Link>
      </div>
    </>
  );
}

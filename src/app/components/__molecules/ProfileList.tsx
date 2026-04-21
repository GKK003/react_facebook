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
                src={NoProfile}
                alt="no profile pic"
                width={55}
                height={55}
                className="rounded-full"
              />
              <span>{profile.name}</span>
            </div>
            <span>{">"}</span>
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

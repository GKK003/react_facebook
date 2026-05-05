"use client";

import Image from "next/image";

interface CreatePostBoxProps {
  user: {
    displayName: string | null;
    photoURL: string | null;
  } | null;
  onOpen: () => void;
}

export default function CreatePostBox({ user, onOpen }: CreatePostBoxProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#ced0d4] px-4 py-3 md:h-[90px]  ">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-300 flex-shrink-0">
          {user?.photoURL ? (
            <Image
              src={user.photoURL}
              alt={user.displayName || "Profile"}
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-[#1877f2] flex items-center justify-center text-white font-semibold text-lg">
              {user?.displayName?.[0]?.toUpperCase() || "U"}
            </div>
          )}
        </div>

        <button
          onClick={onOpen}
          className="flex-1 bg-[#f0f2f5] hover:bg-[#e4e6ea] transition-colors rounded-full px-4 py-2.5 text-left text-[#8a8d91] text-[15px] md:h-17 md:rounded-2xl truncate"
        >
          What's on your mind, {user?.displayName?.split(" ")[0] || "you"}?
        </button>

        <div className="flex items-center gap-1">
          <button
            onClick={onOpen}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#f0f2f5] transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="#f3425f" className="w-6 h-6">
              <path d="M15 8v8H5V8h10m1-2H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4V7c0-.55-.45-1-1-1z" />
            </svg>
          </button>

          <button
            onClick={onOpen}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#f0f2f5] transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="#45bd62" className="w-6 h-6">
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
            </svg>
          </button>

          <button
            onClick={onOpen}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#f0f2f5] transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="#f7b928" className="w-6 h-6">
              <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

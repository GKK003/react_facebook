"use client";

import Image from "next/image";
import Link from "next/link";

import FriendsIcon from "@/assets/Homepage Icons/Friends.png";
import MemoriesIcon from "@/assets/Homepage Icons/Memories.png";
import SavedIcon from "@/assets/Homepage Icons/Saved.png";
import GroupsIcon from "@/assets/Homepage Icons/Groups.png";
import ReelsIcon from "@/assets/Homepage Icons/Reels.png";
import MarketplaceIcon from "@/assets/Homepage Icons/Marketplace.png";
import AdsManagerIcon from "@/assets/Homepage Icons/AdsManager.png";
import BirthdaysIcon from "@/assets/Homepage Icons/Birthdays.png";
import MetaAiIcon from "@/assets/Homepage Icons/MetaAi.png";

const NAV_ITEMS = [
  { label: "Meta AI", icon: MetaAiIcon, href: "" },
  { label: "Friends", icon: FriendsIcon, href: "/friends" },
  { label: "Memories", icon: MemoriesIcon, href: "" },
  { label: "Saved", icon: SavedIcon, href: "/saved" },
  { label: "Groups", icon: GroupsIcon, href: "/groups" },
  { label: "Reels", icon: ReelsIcon, href: "" },
  { label: "Marketplace", icon: MarketplaceIcon, href: "" },
  { label: "Ads Manager", icon: AdsManagerIcon, href: "" },
  { label: "Birthdays", icon: BirthdaysIcon, href: "" },
];

interface LeftSidebarProps {
  user: {
    displayName: string | null;
    photoURL: string | null;
  } | null;
}

export default function LeftSidebar({ user }: LeftSidebarProps) {
  return (
    <div className="flex flex-col w-[360px] sticky top-[56px] h-[calc(100vh-56px)] overflow-y-auto scrollbar-hide px-2 pb-4 lg:hidden">
      <Link
        href="/profile"
        className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-[#f2f2f2] transition-colors mt-2"
      >
        <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-gray-300">
          {user?.photoURL ? (
            <Image
              src={user.photoURL}
              alt={user.displayName || "Profile"}
              width={36}
              height={36}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-400 flex items-center justify-center text-white text-sm font-semibold">
              {user?.displayName?.[0]?.toUpperCase() || "U"}
            </div>
          )}
        </div>
        <span className="text-[15px] font-semibold text-[#050505]">
          {user?.displayName || "User"}
        </span>
      </Link>
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-[#e4e6ea] transition-colors"
        >
          <div className="w-9 h-9 flex items-center justify-center flex-shrink-0">
            <Image
              src={item.icon}
              alt={item.label}
              width={36}
              height={36}
              className="w-9 h-9 object-contain"
            />
          </div>
          <span className="text-[15px] font-semibold text-[#050505]">
            {item.label}
          </span>
        </Link>
      ))}
      <button className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-[#f2f2f2] transition-colors w-full text-left">
        <div className="w-9 h-9 rounded-full bg-[#e4e6ea] flex items-center justify-center flex-shrink-0">
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5 text-[#050505]"
          >
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </div>
        <span className="text-[15px] font-semibold text-[#050505]">
          See more
        </span>
      </button>
      <hr className="my-2 border-[#ccc]" />
      <div className="px-2 py-1">
        <div className="flex items-center justify-between">
          <span className="text-[17px] font-semibold text-[#606770]">
            Your shortcuts
          </span>
          <button className="text-[14px] font-semibold text-[#1877f2]  hover:underline px-2 py-1 cursor-pointer">
            Edit
          </button>
        </div>
      </div>
      <hr className="my-2 border-[#ccc]" />
      <div className="px-2 mt-2">
        <p className="text-[12px] text-[#8a8d91] leading-5">
          Privacy · Terms · Advertising · Ad Choices · Cookies · More
        </p>
      </div>
    </div>
  );
}

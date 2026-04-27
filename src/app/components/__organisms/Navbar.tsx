"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/firebase";

import FbLogo from "@/assets/images/fblogo.png";

interface NavbarProps {
  user: {
    displayName: string | null;
    photoURL: string | null;
  } | null;
  activePage?: "home" | "watch" | "marketplace" | "groups" | "gaming";
}

interface UserResult {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  photoURL?: string | null;
}

const NAV_TABS = [
  {
    id: "home",
    href: "/feed",
    icon: (active: boolean) => (
      <svg
        viewBox="0 0 24 24"
        fill={active ? "#1877f2" : "none"}
        stroke={active ? "#1877f2" : "#606770"}
        strokeWidth={2}
        className="w-6 h-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 12l2-2 7-7 7 7 2 2M5 10v10a1 1 0 001 1h3m10-11v10a1 1 0 01-1 1h-3m-6 0v-4a1 1 0 011-1h2a1 1 0 011 1v4"
        />
      </svg>
    ),
  },
  {
    id: "watch",
    href: "",
    icon: (active: boolean) => (
      <svg
        viewBox="0 0 24 24"
        fill={active ? "#1877f2" : "none"}
        stroke={active ? "#1877f2" : "#606770"}
        strokeWidth={2}
        className="w-6 h-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 10l4.5-2A1 1 0 0121 9v6a1 1 0 01-1.5.9L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    id: "marketplace",
    href: "",
    icon: (active: boolean) => (
      <svg
        viewBox="0 0 24 24"
        fill={active ? "#1877f2" : "none"}
        stroke={active ? "#1877f2" : "#606770"}
        strokeWidth={2}
        className="w-6 h-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-2 2c-.6.6-.2 1.7.7 1.7H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
    ),
  },
  {
    id: "groups",
    href: "",
    icon: (active: boolean) => (
      <svg
        viewBox="0 0 24 24"
        fill={active ? "#1877f2" : "none"}
        stroke={active ? "#1877f2" : "#606770"}
        strokeWidth={2}
        className="w-6 h-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17 20h5v-2a3 3 0 00-5.3-1.8M17 20H7m10 0v-2M7 20H2v-2a3 3 0 015.3-1.8M7 20v-2m0 0a5 5 0 019.3 0M15 7a3 3 0 11-6 0"
        />
      </svg>
    ),
  },
  {
    id: "gaming",
    href: "",
    icon: (active: boolean) => (
      <svg
        viewBox="0 0 24 24"
        fill={active ? "#1877f2" : "none"}
        stroke={active ? "#1877f2" : "#606770"}
        strokeWidth={2}
        className="w-6 h-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M11 4a2 2 0 114 0v1h4v4h-1a2 2 0 100 4h1v4h-4v-1a2 2 0 10-4 0v1H7v-4H6a2 2 0 110-4h1V5h4V4z"
        />
      </svg>
    ),
  },
];

export default function Navbar({ user, activePage = "home" }: NavbarProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showMessenger, setShowMessenger] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [searching, setSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setSearching(true);
    setShowResults(true);

    try {
      const snapshot = await getDocs(collection(db, "users"));
      const q = query.toLowerCase();
      const results = snapshot.docs
        .map((doc) => ({ uid: doc.id, ...doc.data() }) as UserResult)
        .filter((u) => {
          const full = `${u.firstName} ${u.lastName}`.toLowerCase();
          return full.includes(q) || u.email?.toLowerCase().includes(q);
        });
      setSearchResults(results);
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm h-[56px] flex items-center px-4 max-md:px-2">
      <div className="flex items-center gap-2 flex-shrink-0">
        <Link href="/feed">
          <Image
            src={FbLogo}
            alt="Facebook"
            width={40}
            height={40}
            className="w-10 h-10"
          />
        </Link>

        <div ref={searchRef} className="relative">
          <div className="w-[240px] h-[40px] bg-[#f0f2f5] rounded-full flex items-center gap-2 px-3 max-md:w-[40px] max-md:justify-center">
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-4 h-4 text-[#8a8d91] flex-shrink-0"
            >
              <path d="M15.5 14h-.79l-.28-.27A6.5 6.5 0 109.5 16c1.6 0 3-.6 4.2-1.6l.3.3v.8l5 5L20.5 19l-5-5z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
              placeholder="Search Facebook"
              className="bg-transparent outline-none text-[15px] text-[#050505] placeholder-[#8a8d91] w-full max-md:hidden"
            />
          </div>

          {showResults && (
            <div className="absolute top-[44px] left-0 w-[360px] bg-white rounded-lg shadow-xl border border-[#ced0d4] py-2 z-50">
              {searching ? (
                <div className="px-4 py-3 text-[14px] text-[#8a8d91]">
                  Searching...
                </div>
              ) : searchResults.length === 0 ? (
                <div className="px-4 py-3 text-[14px] text-[#8a8d91]">
                  No results for "{searchQuery}"
                </div>
              ) : (
                searchResults.map((u) => (
                  <Link
                    key={u.uid}
                    href={`/profile/${u.uid}`}
                    onClick={() => setShowResults(false)}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-[#f0f2f5] transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-300 flex-shrink-0">
                      {u.photoURL ? (
                        <Image
                          src={u.photoURL}
                          alt={u.firstName}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#1877f2] flex items-center justify-center text-white font-semibold">
                          {u.firstName?.[0]?.toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-[15px] font-semibold text-[#050505]">
                        {u.firstName} {u.lastName}
                      </p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-center flex-1 gap-1 px-4 max-md:hidden">
        {NAV_TABS.map((tab) => (
          <Link
            key={tab.id}
            href={tab.href}
            className={`relative flex items-center justify-center w-[116px] h-[48px] rounded-lg hover:bg-[#f0f2f5] ${activePage === tab.id ? "border-[#1877f2]" : ""}`}
          >
            {tab.icon(activePage === tab.id)}
            {activePage === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#1877f2]" />
            )}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-2 ml-auto max-md:gap-1">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="w-10 h-10 rounded-full bg-[#e4e6ea] hover:bg-[#d8dadf] flex items-center justify-center"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5">
            <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
          </svg>
        </button>
        <button
          onClick={() => setShowMessenger(!showMessenger)}
          className="w-10 h-10 rounded-full bg-[#e4e6ea] hover:bg-[#d8dadf] flex items-center justify-center"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5">
            <path d="M12 2C6 2 2 6 2 11.5c0 3 1.2 5.5 3.2 7.2l.1 2c0 .5.5.9 1 .7l2-1c.2 0 .4-.1.6 0 .6.2 1.2.3 1.9.3 6 0 10-4 10-9.5S18 2 12 2z" />
          </svg>
        </button>
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="w-10 h-10 rounded-full bg-[#e4e6ea] hover:bg-[#d8dadf] flex items-center justify-center"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5">
            <path d="M12 22a2 2 0 002-2h-4a2 2 0 002 2zm6-6v-5c0-3-1.6-5.5-4.5-6.3V4a1.5 1.5 0 10-3 0v.7C7.6 5.5 6 8 6 11v5l-2 2v1h16v-1l-2-2z" />
          </svg>
        </button>
        <Link href="/profile">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-300 hover:opacity-90">
            {user?.photoURL ? (
              <Image
                src={user.photoURL}
                alt="profile"
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#1877f2] flex items-center justify-center text-white font-semibold">
                {user?.displayName?.[0]?.toUpperCase() || "U"}
              </div>
            )}
          </div>
        </Link>
      </div>
    </div>
  );
}

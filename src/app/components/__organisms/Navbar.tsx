"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

import { auth, db } from "@/firebase/firebase";
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

interface FriendRequest {
  id: string;
  fromUid: string;
  toUid: string;
  fromName: string;
  fromPhoto?: string | null;
  status: "pending" | "accepted";
  createdAt?: any;
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
  const [currentUid, setCurrentUid] = useState<string | null>(null);

  const [showMenu, setShowMenu] = useState(false);
  const [showMessenger, setShowMessenger] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [searching, setSearching] = useState(false);

  const [showSearchPopup, setShowSearchPopup] = useState(false);

  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [requestActionLoading, setRequestActionLoading] = useState<
    string | null
  >(null);

  const searchRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const searchPopupInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const messengerRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const messengerButtonRef = useRef<HTMLButtonElement>(null);
  const notificationsButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setCurrentUid(firebaseUser?.uid || null);
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    if (!currentUid) {
      setFriendRequests([]);
      return;
    }

    const q = query(
      collection(db, "friendRequests"),
      where("toUid", "==", currentUid),
      where("status", "==", "pending"),
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const data = snap.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as FriendRequest[];

        data.sort((a, b) => {
          const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
          const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
          return bTime - aTime;
        });

        setFriendRequests(data);
      },
      (err) => {
        console.error("Friend requests listener error:", err);
      },
    );

    return () => unsub();
  }, [currentUid]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;

      if (searchRef.current && !searchRef.current.contains(target)) {
        setShowResults(false);
      }

      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(target)
      ) {
        setShowMenu(false);
      }

      if (
        messengerRef.current &&
        !messengerRef.current.contains(target) &&
        messengerButtonRef.current &&
        !messengerButtonRef.current.contains(target)
      ) {
        setShowMessenger(false);
      }

      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(target) &&
        notificationsButtonRef.current &&
        !notificationsButtonRef.current.contains(target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (showSearchPopup) {
      setTimeout(() => searchPopupInputRef.current?.focus(), 0);
    }
  }, [showSearchPopup]);

  const handleSearch = async (value: string) => {
    setSearchQuery(value);

    if (value.trim().length < 2) {
      setSearchResults([]);
      setShowResults(true);
      return;
    }

    setSearching(true);
    setShowResults(true);

    try {
      const snapshot = await getDocs(collection(db, "users"));
      const q = value.toLowerCase();

      const results = snapshot.docs
        .map(
          (docSnap) => ({ uid: docSnap.id, ...docSnap.data() }) as UserResult,
        )
        .filter((u) => {
          const full = `${u.firstName || ""} ${u.lastName || ""}`.toLowerCase();
          return full.includes(q) || u.email?.toLowerCase().includes(q);
        });

      setSearchResults(results);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setSearching(false);
    }
  };

  const openSearchPopup = () => {
    setShowSearchPopup(true);
    setShowMenu(false);
    setShowMessenger(false);
    setShowNotifications(false);
    setShowResults(true);
  };

  const closeSearchPopup = () => {
    setShowSearchPopup(false);
    setShowResults(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleAcceptRequest = async (request: FriendRequest) => {
    setRequestActionLoading(request.id);

    try {
      await updateDoc(doc(db, "friendRequests", request.id), {
        status: "accepted",
      });
    } catch (err) {
      console.error("Accept friend request error:", err);
      alert("Could not accept request.");
    } finally {
      setRequestActionLoading(null);
    }
  };

  const handleDeleteRequest = async (request: FriendRequest) => {
    setRequestActionLoading(request.id);

    try {
      await deleteDoc(doc(db, "friendRequests", request.id));
    } catch (err) {
      console.error("Delete friend request error:", err);
      alert("Could not delete request.");
    } finally {
      setRequestActionLoading(null);
    }
  };

  return (
    <>
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
            <button
              onClick={openSearchPopup}
              className="hidden lg:flex w-10 h-10 rounded-full bg-[#f0f2f5] items-center justify-center hover:bg-[#e4e6eb]"
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5 text-[#606770]"
              >
                <path d="M15.5 14h-.79l-.28-.27A6.5 6.5 0 109.5 16c1.6 0 3-.6 4.2-1.6l.3.3v.8l5 5L20.5 19l-5-5z" />
              </svg>
            </button>

            <div className="w-[240px] h-[40px] bg-[#f0f2f5] rounded-full flex items-center gap-2 px-3 lg:hidden">
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
                onFocus={() => setShowResults(true)}
                placeholder="Search Facebook"
                className="bg-transparent outline-none text-[15px] text-[#050505] placeholder-[#8a8d91] w-full"
              />
            </div>

            {showResults && !showSearchPopup && (
              <div className="absolute top-[44px] left-0 w-[360px] bg-white rounded-lg shadow-xl border border-[#ced0d4] py-2 z-50">
                {searching ? (
                  <div className="px-4 py-3 text-[14px] text-[#8a8d91]">
                    Searching...
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="px-4 py-3 text-[14px] text-[#8a8d91]">
                    {searchQuery.trim().length < 2
                      ? ""
                      : `No results for "${searchQuery}"`}
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
                            alt={u.firstName || "User"}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full bg-[#1877f2] flex items-center justify-center text-white font-semibold">
                            {u.firstName?.[0]?.toUpperCase() || "U"}
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

        <div className="flex items-center justify-center flex-1 gap-1 px-4 md:hidden">
          {NAV_TABS.map((tab) => (
            <Link
              key={tab.id}
              href={tab.href}
              className={`relative flex items-center justify-center w-[116px] h-[48px] lg:w-[70px] lg:h-[40px] rounded-lg hover:bg-[#f0f2f5] ${
                activePage === tab.id ? "border-[#1877f2]" : ""
              }`}
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
            ref={menuButtonRef}
            onClick={() => {
              setShowMenu((prev) => !prev);
              setShowMessenger(false);
              setShowNotifications(false);
            }}
            className="w-10 h-10 rounded-full bg-[#e4e6ea] hover:bg-[#d8dadf] flex items-center justify-center"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
            </svg>
          </button>

          <button
            ref={messengerButtonRef}
            onClick={() => {
              setShowMessenger((prev) => !prev);
              setShowMenu(false);
              setShowNotifications(false);
            }}
            className="w-10 h-10 rounded-full bg-[#e4e6ea] hover:bg-[#d8dadf] flex items-center justify-center"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <path d="M12 2C6 2 2 6 2 11.5c0 3 1.2 5.5 3.2 7.2l.1 2c0 .5.5.9 1 .7l2-1c.2 0 .4-.1.6 0 .6.2 1.2.3 1.9.3 6 0 10-4 10-9.5S18 2 12 2z" />
            </svg>
          </button>

          <button
            ref={notificationsButtonRef}
            onClick={() => {
              setShowNotifications((prev) => !prev);
              setShowMenu(false);
              setShowMessenger(false);
            }}
            className="relative w-10 h-10 rounded-full bg-[#e4e6ea] hover:bg-[#d8dadf] flex items-center justify-center"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <path d="M12 22a2 2 0 002-2h-4a2 2 0 002 2zm6-6v-5c0-3-1.6-5.5-4.5-6.3V4a1.5 1.5 0 10-3 0v.7C7.6 5.5 6 8 6 11v5l-2 2v1h16v-1l-2-2z" />
            </svg>

            {friendRequests.length > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#f02849] text-white text-[11px] font-bold rounded-full flex items-center justify-center">
                {friendRequests.length}
              </span>
            )}
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
                  unoptimized
                />
              ) : (
                <div className="w-full h-full bg-[#1877f2] flex items-center justify-center text-white font-semibold">
                  {user?.displayName?.[0]?.toUpperCase() || "U"}
                </div>
              )}
            </div>
          </Link>
        </div>

        {showMenu && (
          <div
            className="absolute right-4 top-[56px] w-[608px] max-w-[calc(100vw-16px)] h-[calc(100vh-72px)] bg-[#f0f2f5] rounded-lg shadow-[0_12px_28px_rgba(0,0,0,0.25)] z-50 overflow-y-auto p-4 gg:ml-4"
            ref={menuRef}
          >
            <h2 className="text-[24px] font-bold text-[#050505] mb-3">Menu</h2>

            <div className="grid grid-cols-[360px_200px] gap-4 lg:grid-cols-1 sm:m-2.5">
              <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="h-[40px] bg-[#f0f2f5] rounded-full flex items-center gap-2 px-3 mb-5">
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5 text-[#65676b]"
                  >
                    <path d="M15.5 14h-.79l-.28-.27A6.5 6.5 0 109.5 16c1.6 0 3-.6 4.2-1.6l.3.3v.8l5 5L20.5 19l-5-5z" />
                  </svg>

                  <input
                    type="text"
                    placeholder="Search menu"
                    className="w-full bg-transparent outline-none text-[15px] text-[#050505] placeholder-[#65676b]"
                  />
                </div>

                <div className="pb-4 border-b border-[#dadde1]">
                  <h3 className="text-[17px] font-bold text-[#050505] mb-2">
                    Social
                  </h3>

                  <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#f0f2f5] text-left">
                    <div className="w-9 h-9 rounded-md bg-gradient-to-b from-[#ff4b6e] to-[#e4e6eb] flex items-center justify-center text-white text-[18px]">
                      ★
                    </div>
                    <div>
                      <p className="text-[15px] font-bold text-[#050505]">
                        Events
                      </p>
                      <p className="text-[13px] text-[#65676b] leading-[16px]">
                        Organise or find events and other things to do online
                        and nearby.
                      </p>
                    </div>
                  </button>

                  <Link
                    href="/friends"
                    onClick={() => setShowMenu(false)}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#f0f2f5] text-left"
                  >
                    <div className="w-9 h-9 rounded-md bg-gradient-to-b from-[#5bd6ff] to-[#1877f2] flex items-center justify-center text-white text-[18px]">
                      👥
                    </div>
                    <div>
                      <p className="text-[15px] font-bold text-[#050505]">
                        Friends
                      </p>
                      <p className="text-[13px] text-[#65676b] leading-[16px]">
                        Search for friends or people you may know.
                      </p>
                    </div>
                  </Link>

                  <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#f0f2f5] text-left">
                    <div className="w-9 h-9 rounded-md bg-gradient-to-b from-[#63d6ff] to-[#1877f2] flex items-center justify-center text-white text-[18px]">
                      ●
                    </div>
                    <div>
                      <p className="text-[15px] font-bold text-[#050505]">
                        Groups
                      </p>
                      <p className="text-[13px] text-[#65676b] leading-[16px]">
                        Connect with people who share your interests.
                      </p>
                    </div>
                  </button>

                  <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#f0f2f5] text-left">
                    <div className="w-9 h-9 rounded-md bg-gradient-to-b from-[#dff5ff] to-[#1877f2] flex items-center justify-center text-white text-[18px]">
                      ▬
                    </div>
                    <div>
                      <p className="text-[15px] font-bold text-[#050505]">
                        News Feed
                      </p>
                      <p className="text-[13px] text-[#65676b] leading-[16px]">
                        See relevant posts from people and Pages that you
                        follow.
                      </p>
                    </div>
                  </button>

                  <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#f0f2f5] text-left">
                    <div className="w-9 h-9 rounded-md bg-gradient-to-b from-[#dff5ff] to-[#1877f2] flex items-center justify-center text-white text-[18px]">
                      ◉
                    </div>
                    <div>
                      <p className="text-[15px] font-bold text-[#050505]">
                        Feeds
                      </p>
                      <p className="text-[13px] text-[#65676b] leading-[16px]">
                        See the most recent posts from your friends, groups,
                        Pages and more.
                      </p>
                    </div>
                  </button>

                  <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#f0f2f5] text-left">
                    <div className="w-9 h-9 rounded-md bg-gradient-to-b from-[#ff7b32] to-[#1877f2] flex items-center justify-center text-white text-[18px]">
                      ⚑
                    </div>
                    <div>
                      <p className="text-[15px] font-bold text-[#050505]">
                        Pages
                      </p>
                      <p className="text-[13px] text-[#65676b] leading-[16px]">
                        Discover and connect with businesses on Facebook.
                      </p>
                    </div>
                  </button>
                </div>

                <div className="py-4 border-b border-[#dadde1]">
                  <h3 className="text-[17px] font-bold text-[#050505] mb-2">
                    Entertainment
                  </h3>

                  <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#f0f2f5] text-left">
                    <div className="w-9 h-9 rounded-md bg-gradient-to-b from-[#25c4ff] to-[#1877f2] flex items-center justify-center text-white text-[18px]">
                      ▰
                    </div>
                    <div>
                      <p className="text-[15px] font-bold text-[#050505]">
                        Gaming video
                      </p>
                      <p className="text-[13px] text-[#65676b] leading-[16px]">
                        Watch and connect with your favourite games and
                        streamers.
                      </p>
                    </div>
                  </button>

                  <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#f0f2f5] text-left">
                    <div className="w-9 h-9 rounded-md bg-gradient-to-b from-[#25c4ff] to-[#1877f2] flex items-center justify-center text-white text-[18px]">
                      +
                    </div>
                    <div>
                      <p className="text-[15px] font-bold text-[#050505]">
                        Play games
                      </p>
                      <p className="text-[13px] text-[#65676b] leading-[16px]">
                        Play your favourite games.
                      </p>
                    </div>
                  </button>

                  <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#f0f2f5] text-left">
                    <div className="w-9 h-9 rounded-md bg-gradient-to-b from-[#ff908b] to-[#f5533d] flex items-center justify-center text-white text-[18px]">
                      ▶
                    </div>
                    <div>
                      <p className="text-[15px] font-bold text-[#050505]">
                        Reels
                      </p>
                      <p className="text-[13px] text-[#65676b] leading-[16px]">
                        A Reels destination personalised to your interests and
                        connections.
                      </p>
                    </div>
                  </button>
                </div>

                <div className="py-4 border-b border-[#dadde1]">
                  <h3 className="text-[17px] font-bold text-[#050505] mb-2">
                    Shopping
                  </h3>

                  <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#f0f2f5] text-left">
                    <div className="w-9 h-9 rounded-md bg-gradient-to-b from-[#1d4ed8] to-[#0f172a] flex items-center justify-center text-white text-[18px]">
                      ◆
                    </div>
                    <div>
                      <p className="text-[15px] font-bold text-[#050505]">
                        Orders and payments
                      </p>
                      <p className="text-[13px] text-[#65676b] leading-[16px]">
                        A seamless, secure way to pay in the apps you already
                        use.
                      </p>
                    </div>
                  </button>

                  <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#f0f2f5] text-left">
                    <div className="w-9 h-9 rounded-md bg-gradient-to-b from-[#40e0d0] to-[#1877f2] flex items-center justify-center text-white text-[18px]">
                      ▬
                    </div>
                    <div>
                      <p className="text-[15px] font-bold text-[#050505]">
                        Marketplace
                      </p>
                      <p className="text-[13px] text-[#65676b] leading-[16px]">
                        Buy and sell in your community.
                      </p>
                    </div>
                  </button>
                </div>

                <div className="py-4 border-b border-[#dadde1]">
                  <h3 className="text-[17px] font-bold text-[#050505] mb-2">
                    Personal
                  </h3>

                  <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#f0f2f5] text-left">
                    <div className="w-9 h-9 rounded-md bg-gradient-to-b from-[#65d6ff] to-[#1877f2] flex items-center justify-center text-white text-[18px]">
                      ▣
                    </div>
                    <div>
                      <p className="text-[15px] font-bold text-[#050505]">
                        Recent ad activity
                      </p>
                      <p className="text-[13px] text-[#65676b] leading-[16px]">
                        See all of the ads you've interacted with on Facebook.
                      </p>
                    </div>
                  </button>

                  <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#f0f2f5] text-left">
                    <div className="w-9 h-9 rounded-md bg-gradient-to-b from-[#6ee7f9] to-[#1877f2] flex items-center justify-center text-white text-[18px]">
                      ⟳
                    </div>
                    <div>
                      <p className="text-[15px] font-bold text-[#050505]">
                        Memories
                      </p>
                      <p className="text-[13px] text-[#65676b] leading-[16px]">
                        Browse your old photos, videos and posts on Facebook.
                      </p>
                    </div>
                  </button>

                  <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#f0f2f5] text-left">
                    <div className="w-9 h-9 rounded-md bg-gradient-to-b from-[#ec4899] to-[#8b5cf6] flex items-center justify-center text-white text-[18px]">
                      ▌
                    </div>
                    <div>
                      <p className="text-[15px] font-bold text-[#050505]">
                        Saved
                      </p>
                      <p className="text-[13px] text-[#65676b] leading-[16px]">
                        Find posts, photos and videos that you've saved for
                        later.
                      </p>
                    </div>
                  </button>
                </div>

                <div className="py-4 border-b border-[#dadde1]">
                  <h3 className="text-[17px] font-bold text-[#050505] mb-2">
                    Professional
                  </h3>

                  <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#f0f2f5] text-left">
                    <div className="w-9 h-9 rounded-md bg-gradient-to-b from-[#60a5fa] to-[#1877f2] flex items-center justify-center text-white text-[18px]">
                      ▥
                    </div>
                    <div>
                      <p className="text-[15px] font-bold text-[#050505]">
                        Ads Manager
                      </p>
                      <p className="text-[13px] text-[#65676b] leading-[16px]">
                        Create, manage and track the performance of your ads.
                      </p>
                    </div>
                  </button>
                </div>

                <div className="pt-4">
                  <h3 className="text-[17px] font-bold text-[#050505] mb-2">
                    More from Meta
                  </h3>

                  <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#f0f2f5] text-left">
                    <div className="w-9 h-9 rounded-md bg-gradient-to-b from-[#a855f7] to-[#6366f1] flex items-center justify-center text-white text-[18px]">
                      ✣
                    </div>
                    <div>
                      <p className="text-[15px] font-bold text-[#050505]">
                        Meta AI
                      </p>
                      <p className="text-[13px] text-[#65676b] leading-[16px]">
                        Ask questions, brainstorm ideas, create any image you
                        can imagine and more.
                      </p>
                    </div>
                  </button>

                  <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#f0f2f5] text-left">
                    <div className="w-9 h-9 rounded-md bg-gradient-to-b from-[#60a5fa] to-[#2563eb] flex items-center justify-center text-white text-[18px]">
                      ✦
                    </div>
                    <div>
                      <p className="text-[15px] font-bold text-[#050505]">
                        Chat with AIs
                      </p>
                      <p className="text-[13px] text-[#65676b] leading-[16px]">
                        Create and discover AIs for fun conversations or help
                        with specific topics.
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-3 h-fit sticky top-0 lg:static">
                <h3 className="text-[20px] font-bold text-[#050505] mb-2">
                  Create
                </h3>

                {[
                  ["✎", "Post"],
                  ["▰", "Story"],
                  ["▶", "Reel"],
                  ["★", "Life update"],
                  ["⚑", "Page"],
                  ["📣", "Ad"],
                  ["●", "Group"],
                  ["⊞", "Event"],
                  ["◉", "Marketplace Listing"],
                ].map(([icon, label], index) => (
                  <div key={label}>
                    {index === 4 && <hr className="border-[#dadde1] my-2" />}

                    <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#f0f2f5] text-left">
                      <div className="w-9 h-9 rounded-full bg-[#e4e6eb] flex items-center justify-center text-[#050505] text-[18px]">
                        {icon}
                      </div>

                      <span className="text-[15px] font-bold text-[#050505]">
                        {label}
                      </span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {showMessenger && (
          <div
            className="absolute right-4 top-[56px] w-[360px] max-w-[calc(100vw-16px)] bg-white rounded-lg shadow-xl border border-[#ced0d4] p-4 gg:ml-5 ss:w-[300px]"
            ref={messengerRef}
          >
            <h2 className="text-[24px] font-bold text-[#050505] mb-3">Chats</h2>

            <div className="text-[15px] text-[#65676b] py-4">No chats yet.</div>
          </div>
        )}

        {showNotifications && (
          <div
            ref={notificationsRef}
            className="absolute right-4 top-[56px] w-[380px] max-w-[calc(100vw-16px)] bg-white rounded-lg shadow-xl border border-[#ced0d4] p-4 gg:ml-5 ss:w-[300px]"
          >
            <h2 className="text-[24px] font-bold text-[#050505] mb-3">
              Notifications
            </h2>

            {friendRequests.length === 0 ? (
              <div className="text-[15px] text-[#65676b] py-4">
                No notifications yet.
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {friendRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex gap-3 p-2 rounded-lg hover:bg-[#f0f2f5]"
                  >
                    <Link href={`/profile/${request.fromUid}`}>
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-300">
                        {request.fromPhoto ? (
                          <Image
                            src={request.fromPhoto}
                            alt={request.fromName}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full bg-[#1877f2] flex items-center justify-center text-white font-semibold">
                            {request.fromName?.[0]?.toUpperCase() || "U"}
                          </div>
                        )}
                      </div>
                    </Link>

                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] text-[#050505]">
                        <span className="font-semibold">
                          {request.fromName}
                        </span>{" "}
                        sent you a friend request.
                      </p>

                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleAcceptRequest(request)}
                          disabled={requestActionLoading === request.id}
                          className="flex-1 h-9 bg-[#1877f2] hover:bg-[#166fe5] text-white rounded-lg text-[14px] font-semibold disabled:opacity-70"
                        >
                          Confirm
                        </button>

                        <button
                          onClick={() => handleDeleteRequest(request)}
                          disabled={requestActionLoading === request.id}
                          className="flex-1 h-9 bg-[#e4e6eb] hover:bg-[#d8dadf] text-[#050505] rounded-lg text-[14px] font-semibold disabled:opacity-70"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {showSearchPopup && (
        <div
          className="fixed inset-0 z-[9998] bg-transparent"
          onClick={closeSearchPopup}
        >
          <div
            className="fixed top-0 left-0 z-[9999] w-[410px] max-w-[calc(100vw-8px)] bg-white rounded-br-xl shadow-[0_4px_18px_rgba(0,0,0,0.22)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-[72px] flex items-center gap-2 px-3">
              <button
                onClick={closeSearchPopup}
                className="w-10 h-10 rounded-full hover:bg-[#f0f2f5] flex items-center justify-center text-[#65676b]"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.42-1.41L7.83 13H20v-2z" />
                </svg>
              </button>

              <div className="flex-1 h-[46px] bg-[#f0f2f5] rounded-full flex items-center gap-2 px-4">
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-4 h-4 text-[#8a8d91] flex-shrink-0"
                >
                  <path d="M15.5 14h-.79l-.28-.27A6.5 6.5 0 109.5 16c1.6 0 3-.6 4.2-1.6l.3.3v.8l5 5L20.5 19l-5-5z" />
                </svg>

                <input
                  ref={searchPopupInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search Facebook"
                  className="w-full bg-transparent outline-none text-[15px] text-[#050505] placeholder-[#8a8d91]"
                />
              </div>
            </div>

            <div className="border-t border-[#e4e6eb] py-2 max-h-[calc(100vh-72px)] overflow-y-auto">
              {searching ? (
                <div className="px-4 py-3 text-[14px] text-[#8a8d91]">
                  Searching...
                </div>
              ) : searchResults.length === 0 ? (
                <div className="px-4 py-3 text-[14px] text-[#8a8d91]">
                  {searchQuery.trim().length < 2
                    ? ""
                    : `No results for "${searchQuery}"`}
                </div>
              ) : (
                searchResults.map((u) => (
                  <Link
                    key={u.uid}
                    href={`/profile/${u.uid}`}
                    onClick={closeSearchPopup}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-[#f0f2f5] transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-300 flex-shrink-0">
                      {u.photoURL ? (
                        <Image
                          src={u.photoURL}
                          alt={u.firstName || "User"}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full bg-[#1877f2] flex items-center justify-center text-white font-semibold">
                          {u.firstName?.[0]?.toUpperCase() || "U"}
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
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import { auth, db } from "@/firebase/firebase";
import Navbar from "@/app/components/__organisms/Navbar";

interface UserProfile {
  firstName?: string;
  lastName?: string;
  email?: string;
  photoURL?: string | null;
}

interface FriendRequest {
  id: string;
  fromUid: string;
  toUid: string;
  fromName: string;
  fromPhoto?: string | null;
  toName?: string;
  toPhoto?: string | null;
  status: "pending" | "accepted";
  createdAt?: any;
}

type FriendCard = {
  uid: string;
  name: string;
  photoURL?: string | null;
  requestId: string;
};

function getFullName(profile: UserProfile | null, fallback = "User") {
  if (!profile) return fallback;

  const name = `${profile.firstName || ""} ${profile.lastName || ""}`.trim();

  return name || profile.email || fallback;
}

function CircleIcon({ type, active }: { type: string; active?: boolean }) {
  return (
    <div
      className={`w-9 h-9 rounded-full flex items-center justify-center ${
        active ? "bg-[#1877f2]" : "bg-[#e4e6eb] dark:bg-[#3a3b3c]"
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={`w-6 h-6 ${
          active ? "text-white" : "text-[#050505] dark:text-[#e4e6eb]"
        }`}
      >
        {type === "friends" && (
          <path d="M16 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zM8 11c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
        )}

        {type === "request" && (
          <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zM6 10V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        )}

        {type === "all" && (
          <path d="M16 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zM8 11c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        )}

        {type === "gift" && (
          <path d="M20 6h-2.18c.11-.31.18-.65.18-1a3 3 0 00-5.2-2.04L12 3.8l-.8-.84A3 3 0 006 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2z" />
        )}
      </svg>
    </div>
  );
}

function FriendsSidebar() {
  return (
    <div className="fixed left-0 top-[56px] bottom-0 w-[360px] bg-white dark:bg-[#242526] shadow-sm border-r border-[#dddfe2] dark:border-[#3a3b3c] p-4 overflow-y-auto lg:relative lg:top-0 lg:bottom-auto lg:w-full lg:border-r-0 lg:border-b lg:shadow-none">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-[28px] font-bold text-[#050505] dark:text-[#e4e6eb]">
          Friends
        </h1>

        <button className="w-10 h-10 rounded-full bg-[#e4e6eb] dark:bg-[#3a3b3c] hover:bg-[#d8dadf] dark:hover:bg-[#4e4f50] flex items-center justify-center text-[#050505] dark:text-[#e4e6eb]">
          ⚙
        </button>
      </div>

      <div className="flex flex-col gap-1">
        <Link
          href="/friends"
          className="h-[56px] rounded-lg flex items-center justify-between px-2 hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c]"
        >
          <div className="flex items-center gap-3">
            <CircleIcon type="friends" />
            <span className="text-[17px] font-semibold text-[#050505] dark:text-[#e4e6eb]">
              Home
            </span>
          </div>
          <span className="text-[24px] text-[#65676b] dark:text-[#b0b3b8]">
            ›
          </span>
        </Link>

        <Link
          href="/friends/requests"
          className="h-[56px] rounded-lg flex items-center justify-between px-2 hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c]"
        >
          <div className="flex items-center gap-3">
            <CircleIcon type="request" />
            <span className="text-[17px] font-semibold text-[#050505] dark:text-[#e4e6eb]">
              Friend requests
            </span>
          </div>
          <span className="text-[24px] text-[#65676b] dark:text-[#b0b3b8]">
            ›
          </span>
        </Link>

        <button className="h-[56px] rounded-lg flex items-center justify-between px-2 hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c]">
          <div className="flex items-center gap-3">
            <CircleIcon type="request" />
            <span className="text-[17px] font-semibold text-[#050505] dark:text-[#e4e6eb]">
              Suggestions
            </span>
          </div>
          <span className="text-[24px] text-[#65676b] dark:text-[#b0b3b8]">
            ›
          </span>
        </button>

        <Link
          href="/friends/all"
          className="h-[56px] rounded-lg flex items-center justify-between px-2 bg-[#f0f2f5] dark:bg-[#3a3b3c]"
        >
          <div className="flex items-center gap-3">
            <CircleIcon type="all" active />
            <span className="text-[17px] font-semibold text-[#050505] dark:text-[#e4e6eb]">
              All friends
            </span>
          </div>
        </Link>

        <button className="h-[56px] rounded-lg flex items-center justify-between px-2 hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c]">
          <div className="flex items-center gap-3">
            <CircleIcon type="gift" />
            <span className="text-[17px] font-semibold text-[#050505] dark:text-[#e4e6eb]">
              Birthdays
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}

function FriendListItem({ friend }: { friend: FriendCard }) {
  return (
    <Link
      href={`/profile/${friend.uid}`}
      className="bg-white dark:bg-[#242526] rounded-lg border border-[#ced0d4] dark:border-[#3a3b3c] p-3 flex items-center gap-3 hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c]"
    >
      <div className="w-16 h-16 rounded-full overflow-hidden bg-[#1877f2] flex items-center justify-center text-white text-[26px] font-bold flex-shrink-0">
        {friend.photoURL ? (
          <Image
            src={friend.photoURL}
            alt={friend.name}
            width={64}
            height={64}
            className="w-full h-full object-cover"
            unoptimized
          />
        ) : (
          friend.name?.[0]?.toUpperCase() || "U"
        )}
      </div>

      <div className="min-w-0">
        <p className="text-[17px] font-bold text-[#050505] dark:text-[#e4e6eb] truncate">
          {friend.name}
        </p>
        <p className="text-[14px] text-[#65676b] dark:text-[#b0b3b8]">Friend</p>
      </div>
    </Link>
  );
}

export default function FriendsAll() {
  const [currentUid, setCurrentUid] = useState<string | null>(null);
  const [navUser, setNavUser] = useState<{
    displayName: string | null;
    photoURL: string | null;
  } | null>(null);

  const [acceptedSent, setAcceptedSent] = useState<FriendRequest[]>([]);
  const [acceptedReceived, setAcceptedReceived] = useState<FriendRequest[]>([]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setCurrentUid(null);
        setNavUser(null);
        return;
      }

      setCurrentUid(user.uid);

      const snap = await getDoc(doc(db, "users", user.uid));
      const profile = snap.exists() ? (snap.data() as UserProfile) : null;

      setNavUser({
        displayName: getFullName(profile, user.displayName || "User"),
        photoURL: profile?.photoURL || user.photoURL || null,
      });
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    if (!currentUid) {
      setAcceptedSent([]);
      return;
    }

    const q = query(
      collection(db, "friendRequests"),
      where("fromUid", "==", currentUid),
      where("status", "==", "accepted"),
    );

    const unsub = onSnapshot(q, (snap) => {
      setAcceptedSent(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as FriendRequest[],
      );
    });

    return () => unsub();
  }, [currentUid]);

  useEffect(() => {
    if (!currentUid) {
      setAcceptedReceived([]);
      return;
    }

    const q = query(
      collection(db, "friendRequests"),
      where("toUid", "==", currentUid),
      where("status", "==", "accepted"),
    );

    const unsub = onSnapshot(q, (snap) => {
      setAcceptedReceived(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as FriendRequest[],
      );
    });

    return () => unsub();
  }, [currentUid]);

  const allFriends = useMemo(() => {
    const map = new Map<string, FriendCard>();

    acceptedSent.forEach((request) => {
      map.set(request.toUid, {
        uid: request.toUid,
        name: request.toName || "User",
        photoURL: request.toPhoto || null,
        requestId: request.id,
      });
    });

    acceptedReceived.forEach((request) => {
      map.set(request.fromUid, {
        uid: request.fromUid,
        name: request.fromName || "User",
        photoURL: request.fromPhoto || null,
        requestId: request.id,
      });
    });

    return Array.from(map.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }, [acceptedSent, acceptedReceived]);

  return (
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-[#18191a]">
      <Navbar user={navUser} activePage="home" />

      <div className="pt-[56px] flex lg:flex-col">
        <FriendsSidebar />

        <div className="ml-[360px] flex-1 px-10 py-8 lg:ml-0 lg:px-4 lg:py-5">
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[24px] font-bold text-[#050505] dark:text-[#e4e6eb]">
                All friends
              </h2>
            </div>

            {allFriends.length === 0 ? (
              <div className="bg-white dark:bg-[#242526] rounded-lg border border-[#ced0d4] dark:border-[#3a3b3c] p-6 text-[#65676b] dark:text-[#b0b3b8] text-[16px]">
                No friends yet. Confirm friend requests to add friends here.
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-3 2xl:grid-cols-3 xl:grid-cols-2 sm:grid-cols-1">
                {allFriends.map((friend) => (
                  <FriendListItem key={friend.uid} friend={friend} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

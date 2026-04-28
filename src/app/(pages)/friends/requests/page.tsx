"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  updateDoc,
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

function getFullName(profile: UserProfile | null, fallback = "User") {
  if (!profile) return fallback;

  const name = `${profile.firstName || ""} ${profile.lastName || ""}`.trim();

  return name || profile.email || fallback;
}

function CircleIcon({ type, active }: { type: string; active?: boolean }) {
  return (
    <div
      className={`w-9 h-9 rounded-full flex items-center justify-center ${
        active ? "bg-[#1877f2]" : "bg-[#e4e6eb]"
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        fill={active ? "white" : "#050505"}
        className="w-6 h-6"
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
    <div className="fixed left-0 top-[56px] bottom-0 w-[360px] bg-white shadow-sm border-r border-[#dddfe2] p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-[28px] font-bold text-[#050505]">Friends</h1>

        <button className="w-10 h-10 rounded-full bg-[#e4e6eb] hover:bg-[#d8dadf] flex items-center justify-center">
          ⚙
        </button>
      </div>

      <div className="flex flex-col gap-1">
        <Link
          href="/friends"
          className="h-[56px] rounded-lg flex items-center justify-between px-2 hover:bg-[#f0f2f5]"
        >
          <div className="flex items-center gap-3">
            <CircleIcon type="friends" />
            <span className="text-[17px] font-semibold text-[#050505]">
              Home
            </span>
          </div>
          <span className="text-[24px] text-[#65676b]">›</span>
        </Link>

        <Link
          href="/friends/requests"
          className="h-[56px] rounded-lg flex items-center justify-between px-2 bg-[#f0f2f5]"
        >
          <div className="flex items-center gap-3">
            <CircleIcon type="request" active />
            <span className="text-[17px] font-semibold text-[#050505]">
              Friend requests
            </span>
          </div>
        </Link>

        <button className="h-[56px] rounded-lg flex items-center justify-between px-2 hover:bg-[#f0f2f5]">
          <div className="flex items-center gap-3">
            <CircleIcon type="request" />
            <span className="text-[17px] font-semibold text-[#050505]">
              Suggestions
            </span>
          </div>
          <span className="text-[24px] text-[#65676b]">›</span>
        </button>

        <Link
          href="/friends/all"
          className="h-[56px] rounded-lg flex items-center justify-between px-2 hover:bg-[#f0f2f5]"
        >
          <div className="flex items-center gap-3">
            <CircleIcon type="all" />
            <span className="text-[17px] font-semibold text-[#050505]">
              All friends
            </span>
          </div>
          <span className="text-[24px] text-[#65676b]">›</span>
        </Link>

        <button className="h-[56px] rounded-lg flex items-center justify-between px-2 hover:bg-[#f0f2f5]">
          <div className="flex items-center gap-3">
            <CircleIcon type="gift" />
            <span className="text-[17px] font-semibold text-[#050505]">
              Birthdays
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}

function RequestCard({
  request,
  onConfirm,
  onDelete,
  loading,
}: {
  request: FriendRequest;
  onConfirm: (request: FriendRequest) => void;
  onDelete: (request: FriendRequest) => void;
  loading: boolean;
}) {
  return (
    <div className="w-[250px] bg-white rounded-lg border border-[#ced0d4] shadow-sm overflow-hidden">
      <Link href={`/profile/${request.fromUid}`}>
        <div className="h-[248px] bg-[#e4e6eb]">
          {request.fromPhoto ? (
            <Image
              src={request.fromPhoto}
              alt={request.fromName}
              width={250}
              height={248}
              className="w-full h-full object-cover"
              unoptimized
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#1877f2] to-[#8b9dc3] flex items-center justify-center text-white text-[64px] font-bold">
              {request.fromName?.[0]?.toUpperCase() || "U"}
            </div>
          )}
        </div>
      </Link>

      <div className="p-3">
        <Link
          href={`/profile/${request.fromUid}`}
          className="block text-[17px] font-bold text-[#050505] truncate hover:underline"
        >
          {request.fromName}
        </Link>

        <p className="text-[15px] text-[#65676b] mt-1 truncate">
          1 mutual friend
        </p>

        <button
          onClick={() => onConfirm(request)}
          disabled={loading}
          className="w-full h-[40px] mt-3 bg-[#1877f2] hover:bg-[#166fe5] text-white rounded-lg text-[15px] font-semibold disabled:opacity-70"
        >
          {loading ? "..." : "Confirm"}
        </button>

        <button
          onClick={() => onDelete(request)}
          disabled={loading}
          className="w-full h-[40px] mt-2 bg-[#e4e6eb] hover:bg-[#d8dadf] text-[#050505] rounded-lg text-[15px] font-semibold disabled:opacity-70"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default function FriendRequestsPage() {
  const [currentUid, setCurrentUid] = useState<string | null>(null);
  const [navUser, setNavUser] = useState<{
    displayName: string | null;
    photoURL: string | null;
  } | null>(null);

  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

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
    if (!currentUid) return;

    const q = query(
      collection(db, "friendRequests"),
      where("toUid", "==", currentUid),
      where("status", "==", "pending"),
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as FriendRequest[];

      data.sort((a, b) => {
        const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return bTime - aTime;
      });

      setIncomingRequests(data);
    });

    return () => unsub();
  }, [currentUid]);

  const handleConfirm = async (request: FriendRequest) => {
    setActionLoading(request.id);

    try {
      await updateDoc(doc(db, "friendRequests", request.id), {
        status: "accepted",
      });
    } catch (err) {
      console.error("Confirm friend request error:", err);
      alert("Could not confirm request.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (request: FriendRequest) => {
    setActionLoading(request.id);

    try {
      await deleteDoc(doc(db, "friendRequests", request.id));
    } catch (err) {
      console.error("Delete friend request error:", err);
      alert("Could not delete request.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5]">
      <Navbar user={navUser} activePage="home" />

      <div className="pt-[56px] flex">
        <FriendsSidebar />

        <div className="ml-[360px] flex-1 px-10 py-8">
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[24px] font-bold text-[#050505]">
                Friend requests
              </h2>
            </div>

            {incomingRequests.length === 0 ? (
              <div className="bg-white rounded-lg border border-[#ced0d4] p-6 text-[#65676b] text-[16px]">
                No friend requests.
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {incomingRequests.map((request) => (
                  <RequestCard
                    key={request.id}
                    request={request}
                    onConfirm={handleConfirm}
                    onDelete={handleDelete}
                    loading={actionLoading === request.id}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

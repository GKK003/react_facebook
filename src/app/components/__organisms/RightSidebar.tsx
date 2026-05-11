"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { collection, onSnapshot, query, where } from "firebase/firestore";

import { auth, db } from "@/firebase/firebase";

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

type Contact = {
  id: string;
  uid: string;
  name: string;
  photoURL: string | null;
  online: boolean;
  lastSeen?: string;
};

export default function RightSidebar() {
  const [currentUid, setCurrentUid] = useState<string | null>(null);
  const [acceptedSent, setAcceptedSent] = useState<FriendRequest[]>([]);
  const [acceptedReceived, setAcceptedReceived] = useState<FriendRequest[]>([]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUid(user?.uid || null);
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

    const unsub = onSnapshot(
      q,
      (snap) => {
        const data = snap.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as FriendRequest[];

        setAcceptedSent(data);
      },
      (err) => {
        console.error("Accepted sent friends listener error:", err);
      },
    );

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

    const unsub = onSnapshot(
      q,
      (snap) => {
        const data = snap.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as FriendRequest[];

        setAcceptedReceived(data);
      },
      (err) => {
        console.error("Accepted received friends listener error:", err);
      },
    );

    return () => unsub();
  }, [currentUid]);

  const contacts = useMemo(() => {
    const map = new Map<string, Contact>();

    acceptedSent.forEach((request) => {
      map.set(request.toUid, {
        id: request.id,
        uid: request.toUid,
        name: request.toName || "User",
        photoURL: request.toPhoto || null,
        online: true,
      });
    });

    acceptedReceived.forEach((request) => {
      map.set(request.fromUid, {
        id: request.id,
        uid: request.fromUid,
        name: request.fromName || "User",
        photoURL: request.fromPhoto || null,
        online: true,
      });
    });

    return Array.from(map.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }, [acceptedSent, acceptedReceived]);

  return (
    <div className="flex flex-col w-[360px] min-w-[220px] max-w-[360px] flex-shrink sticky top-[56px] h-[calc(100vh-56px)] overflow-y-auto scrollbar-hide px-2 pb-4 ml-auto md:hidden">
      <div className="px-2 mt-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[17px] font-semibold text-[#606770] dark:text-[#b0b3b8]">
            Contacts
          </span>

          <div className="flex items-center gap-1">
            <button className="w-9 h-9 rounded-full hover:bg-[#f2f2f2] dark:hover:bg-[#3a3b3c] flex items-center justify-center transition-colors">
              <svg
                viewBox="0 0 16 16"
                width="16"
                height="16"
                fill="currentColor"
                aria-hidden="true"
                className="text-[#606770] dark:text-[#b0b3b8]"
              >
                <g fillRule="evenodd" transform="translate(-448 -544)">
                  <g fillRule="nonzero">
                    <path
                      d="M10.743 2.257a6 6 0 1 1-8.485 8.486 6 6 0 0 1 8.485-8.486zm-1.06 1.06a4.5 4.5 0 1 0-6.365 6.364 4.5 4.5 0 0 0 6.364-6.363z"
                      transform="translate(448 544)"
                    />
                    <path
                      d="M10.39 8.75a2.94 2.94 0 0 0-.199.432c-.155.417-.23.849-.172 1.284.055.415.232.794.54 1.103a.75.75 0 0 0 1.112-1.004l-.051-.057a.39.39 0 0 1-.114-.24c-.021-.155.014-.356.09-.563.031-.081.06-.145.08-.182l.012-.022a.75.75 0 1 0-1.299-.752z"
                      transform="translate(448 544)"
                    />
                    <path
                      d="M9.557 11.659c.038-.018.09-.04.15-.064.207-.077.408-.112.562-.092.08.01.143.034.198.077l.041.036a.75.75 0 0 0 1.06-1.06 1.881 1.881 0 0 0-1.103-.54c-.435-.058-.867.018-1.284.175-.189.07-.336.143-.433.2a.75.75 0 0 0 .624 1.356l.066-.027.12-.061z"
                      transform="translate(448 544)"
                    />
                    <path
                      d="m13.463 15.142-.04-.044-3.574-4.192c-.599-.703.355-1.656 1.058-1.057l4.191 3.574.044.04c.058.059.122.137.182.24.249.425.249.96-.154 1.41l-.057.057c-.45.403-.986.403-1.411.154a1.182 1.182 0 0 1-.24-.182zm.617-.616.444-.444a.31.31 0 0 0-.063-.052c-.093-.055-.263-.055-.35.024l.208.232.207-.206.006.007-.22.257-.026-.024.033-.034.025.027-.257.22-.007-.007zm-.027-.415c-.078.088-.078.257-.023.35a.31.31 0 0 0 .051.063l.205-.204-.233-.209z"
                      transform="translate(448 544)"
                    />
                  </g>
                </g>
              </svg>
            </button>

            <button className="w-9 h-9 rounded-full hover:bg-[#f2f2f2] dark:hover:bg-[#3a3b3c] flex items-center justify-center transition-colors">
              <svg
                viewBox="0 0 20 20"
                width="20"
                height="20"
                fill="currentColor"
                aria-hidden="true"
                className="text-[#606770] dark:text-[#b0b3b8]"
              >
                <g fillRule="evenodd" transform="translate(-446 -350)">
                  <path d="M458 360a2 2 0 1 1-4 0 2 2 0 0 1 4 0m6 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0m-12 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0" />
                </g>
              </svg>
            </button>
          </div>
        </div>

        {contacts.length === 0 ? (
          <div className="py-4 text-center text-[14px] text-[#8a8d91] dark:text-[#b0b3b8]">
            No contacts yet.
          </div>
        ) : (
          <div className="space-y-1">
            {contacts.map((contact) => (
              <Link
                key={contact.uid}
                href={`/profile/${contact.uid}`}
                className="flex items-center gap-3 w-full px-2 py-2 rounded-lg hover:bg-[#f2f2f2] dark:hover:bg-[#3a3b3c] transition-colors"
              >
                <div className="relative flex-shrink-0">
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-300 dark:bg-[#3a3b3c]">
                    {contact.photoURL ? (
                      <Image
                        src={contact.photoURL}
                        alt={contact.name}
                        width={36}
                        height={36}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full bg-[#1877f2] flex items-center justify-center text-white text-sm font-semibold">
                        {contact.name[0]?.toUpperCase() || "U"}
                      </div>
                    )}
                  </div>

                  {contact.online && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-[#18191a]" />
                  )}
                </div>

                <div className="flex items-center justify-between flex-1 min-w-0">
                  <span className="text-[15px] font-semibold text-[#050505] dark:text-[#e4e6eb] truncate">
                    {contact.name}
                  </span>

                  {contact.lastSeen && (
                    <span className="text-[12px] text-[#8a8d91] dark:text-[#b0b3b8]">
                      {contact.lastSeen}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

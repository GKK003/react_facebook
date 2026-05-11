"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
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
        width="24"
        height="24"
        fill="currentColor"
        className={active ? "text-[#1877f2]" : "text-[#606770]"}
      >
        <path d="M9.464 1.286C10.294.803 11.092.5 12 .5c.908 0 1.707.303 2.537.786.795.462 1.7 1.142 2.815 1.977l2.232 1.675c1.391 1.042 2.359 1.766 2.888 2.826.53 1.059.53 2.268.528 4.006v4.3c0 1.355 0 2.471-.119 3.355-.124.928-.396 1.747-1.052 2.403-.657.657-1.476.928-2.404 1.053-.884.119-2 .119-3.354.119H7.93c-1.354 0-2.471 0-3.355-.119-.928-.125-1.747-.396-2.403-1.053-.656-.656-.928-1.475-1.053-2.403C1 18.541 1 17.425 1 16.07v-4.3c0-1.738-.002-2.947.528-4.006.53-1.06 1.497-1.784 2.888-2.826L6.65 3.263c1.114-.835 2.02-1.515 2.815-1.977zM10.5 13A1.5 1.5 0 0 0 9 14.5V21h6v-6.5a1.5 1.5 0 0 0-1.5-1.5h-3z" />
      </svg>
    ),
  },
  {
    id: "watch",
    href: "",
    icon: (active: boolean) => (
      <svg
        viewBox="0 0 24 24"
        width="24"
        height="24"
        fill="currentColor"
        className={active ? "text-[#1877f2]" : "text-[#606770]"}
      >
        <path d="M10.996 12.132A1 1 0 0 0 9.5 13v4a1 1 0 0 0 1.496.868l3.5-2a1 1 0 0 0 0-1.736l-3.5-2z" />
        <path d="M12.075 1h-.15C9.632 1 7.81 1 6.38 1.192c-1.472.198-2.674.616-3.623 1.565-.949.95-1.367 2.15-1.565 3.623C1 7.81 1 9.632 1 11.925v.15c0 2.293 0 4.116.192 5.545.198 1.472.616 2.674 1.565 3.623.95.949 2.15 1.367 3.623 1.565C7.81 23 9.632 23 11.925 23h.15c2.293 0 4.116 0 5.545-.192 1.472-.198 2.674-.616 3.623-1.565.949-.95 1.367-2.15 1.565-3.623.192-1.43.192-3.252.192-5.545v-.15c0-2.293 0-4.116-.192-5.545-.198-1.472-.616-2.674-1.565-3.623-.95-.949-2.15-1.367-3.623-1.565C16.19 1 14.368 1 12.075 1zM4.172 4.172c.515-.516 1.224-.83 2.475-.998l.183-.023L8.113 7H3.132c.013-.121.027-.239.042-.353.168-1.25.482-1.96.998-2.475zM10.22 7 8.895 3.023C9.778 3 10.801 3 12 3c.642 0 1.234 0 1.78.004L15.114 7H10.22zm6.253 2h4.507c.02.86.02 1.848.02 3 0 2.385-.002 4.074-.174 5.353-.168 1.25-.482 1.96-.998 2.475-.515.516-1.224.83-2.475.998-1.28.172-2.968.174-5.353.174s-4.074-.002-5.353-.174c-1.25-.168-1.96-.482-2.475-.998-.516-.515-.83-1.224-.998-2.475C3.002 16.073 3 14.385 3 12c0-1.152 0-2.14.02-3h13.454zm.747-2-1.316-3.949c.537.026 1.016.065 1.448.123 1.25.168 1.96.482 2.475.998.516.515.83 1.224.998 2.475.015.114.03.232.042.353H17.22z" />
      </svg>
    ),
  },
  {
    id: "marketplace",
    href: "",
    icon: (active: boolean) => (
      <svg
        viewBox="0 0 24 24"
        width="24"
        height="24"
        fill="currentColor"
        className={active ? "text-[#1877f2]" : "text-[#606770]"}
      >
        <path d="M1.588 3.227A3.125 3.125 0 0 1 4.58 1h14.84c1.38 0 2.597.905 2.993 2.227l.816 2.719a6.47 6.47 0 0 1 .272 1.854A5.183 5.183 0 0 1 22 11.455v4.615c0 1.355 0 2.471-.119 3.355-.125.928-.396 1.747-1.053 2.403-.656.657-1.475.928-2.403 1.053-.884.12-2 .119-3.354.119H8.929c-1.354 0-2.47 0-3.354-.119-.928-.125-1.747-.396-2.403-1.053-.657-.656-.929-1.475-1.053-2.403-.12-.884-.119-2-.119-3.354V11.5l.001-.045A5.184 5.184 0 0 1 .5 7.8c0-.628.092-1.252.272-1.854l.816-2.719zM10 21h4v-3.5a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5V21zm6-.002c.918-.005 1.608-.025 2.159-.099.706-.095 1.033-.262 1.255-.485.223-.222.39-.55.485-1.255.099-.735.101-1.716.101-3.159v-3.284a5.195 5.195 0 0 1-1.7.284 5.18 5.18 0 0 1-3.15-1.062A5.18 5.18 0 0 1 12 13a5.18 5.18 0 0 1-3.15-1.062A5.18 5.18 0 0 1 5.7 13a5.2 5.2 0 0 1-1.7-.284V16c0 1.442.002 2.424.1 3.159.096.706.263 1.033.486 1.255.222.223.55.39 1.255.485.551.074 1.24.094 2.159.1V17.5a2.5 2.5 0 0 1 2.5-2.5h3a2.5 2.5 0 0 1 2.5 2.5v3.498zM4.581 3c-.497 0-.935.326-1.078.802l-.815 2.72A4.45 4.45 0 0 0 2.5 7.8a3.2 3.2 0 0 0 5.6 2.117 1 1 0 0 1 1.5 0A3.19 3.19 0 0 0 12 11a3.19 3.19 0 0 0 2.4-1.083 1 1 0 0 1 1.5 0A3.2 3.2 0 0 0 21.5 7.8c0-.434-.063-.865-.188-1.28l-.816-2.72A1.125 1.125 0 0 0 19.42 3H4.58z" />
      </svg>
    ),
  },
  {
    id: "groups",
    href: "",
    icon: (active: boolean) => (
      <svg
        viewBox="0 0 24 24"
        width="24"
        height="24"
        fill="currentColor"
        className={active ? "text-[#1877f2]" : "text-[#606770]"}
      >
        <path d="M.5 12c0 6.351 5.149 11.5 11.5 11.5S23.5 18.351 23.5 12 18.351.5 12 .5.5 5.649.5 12zm2 0c0-.682.072-1.348.209-1.99a2 2 0 0 1 0 3.98A9.539 9.539 0 0 1 2.5 12zm.84-3.912A9.502 9.502 0 0 1 12 2.5a9.502 9.502 0 0 1 8.66 5.588 4.001 4.001 0 0 0 0 7.824 9.514 9.514 0 0 1-1.755 2.613A5.002 5.002 0 0 0 14 14.5h-4a5.002 5.002 0 0 0-4.905 4.025 9.515 9.515 0 0 1-1.755-2.613 4.001 4.001 0 0 0 0-7.824zM12 5a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm-2 4a2 2 0 1 0 4 0 2 2 0 0 0-4 0zm11.291 1.01a9.538 9.538 0 0 1 0 3.98 2 2 0 0 1 0-3.98zM16.99 20.087A9.455 9.455 0 0 1 12 21.5c-1.83 0-3.54-.517-4.99-1.414a1.004 1.004 0 0 1-.01-.148V19.5a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v.438a1 1 0 0 1-.01.148z" />
      </svg>
    ),
  },
  {
    id: "gaming",
    href: "",
    icon: (active: boolean) => (
      <svg
        viewBox="0 0 24 24"
        width="24"
        height="24"
        fill="currentColor"
        className={active ? "text-[#1877f2]" : "text-[#606770]"}
      >
        <path d="M8 8a1 1 0 0 1 1 1v2h2a1 1 0 1 1 0 2H9v2a1 1 0 1 1-2 0v-2H5a1 1 0 1 1 0-2h2V9a1 1 0 0 1 1-1zm8 2a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0zm-2 4a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0z" />
        <path d="M.5 11a7 7 0 0 1 7-7h9a7 7 0 0 1 7 7v2a7 7 0 0 1-7 7h-9a7 7 0 0 1-7-7v-2zm7-5a5 5 0 0 0-5 5v2a5 5 0 0 0 5 5h9a5 5 0 0 0 5-5v-2a5 5 0 0 0-5-5h-9z" />
      </svg>
    ),
  },
];

const RIGHT_ACTION_ICONS = {
  menu: (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="currentColor"
      aria-hidden="true"
      className="text-[#050505] dark:text-[#b0b3b8]"
    >
      <path d="M18.5 1A1.5 1.5 0 0 0 17 2.5v3A1.5 1.5 0 0 0 18.5 7h3A1.5 1.5 0 0 0 23 5.5v-3A1.5 1.5 0 0 0 21.5 1h-3zm0 8a1.5 1.5 0 0 0-1.5 1.5v3a1.5 1.5 0 0 0 1.5 1.5h3a1.5 1.5 0 0 0 1.5-1.5v-3A1.5 1.5 0 0 0 21.5 9h-3zm-16 8A1.5 1.5 0 0 0 1 18.5v3A1.5 1.5 0 0 0 2.5 23h3A1.5 1.5 0 0 0 7 21.5v-3A1.5 1.5 0 0 0 5.5 17h-3zm8 0A1.5 1.5 0 0 0 9 18.5v3a1.5 1.5 0 0 0 1.5 1.5h3a1.5 1.5 0 0 0 1.5-1.5v-3a1.5 1.5 0 0 0-1.5-1.5h-3zm8 0a1.5 1.5 0 0 0-1.5 1.5v3a1.5 1.5 0 0 0 1.5 1.5h3a1.5 1.5 0 0 0 1.5-1.5v-3a1.5 1.5 0 0 0-1.5-1.5h-3zm-16-8A1.5 1.5 0 0 0 1 10.5v3A1.5 1.5 0 0 0 2.5 15h3A1.5 1.5 0 0 0 7 13.5v-3A1.5 1.5 0 0 0 5.5 9h-3zm0-8A1.5 1.5 0 0 0 1 2.5v3A1.5 1.5 0 0 0 2.5 7h3A1.5 1.5 0 0 0 7 5.5v-3A1.5 1.5 0 0 0 5.5 1h-3zm8 0A1.5 1.5 0 0 0 9 2.5v3A1.5 1.5 0 0 0 10.5 7h3A1.5 1.5 0 0 0 15 5.5v-3A1.5 1.5 0 0 0 13.5 1h-3zm0 8A1.5 1.5 0 0 0 9 10.5v3a1.5 1.5 0 0 0 1.5 1.5h3a1.5 1.5 0 0 0 1.5-1.5v-3A1.5 1.5 0 0 0 13.5 9h-3z" />
    </svg>
  ),

  messenger: (
    <svg
      viewBox="0 0 16 16"
      width="20"
      height="20"
      fill="currentColor"
      aria-hidden="true"
      className="text-[#050505] dark:text-[#b0b3b8]"
    >
      <path
        fillRule="evenodd"
        d="M.5 8a7.5 7.5 0 1 1 4.006 6.638.341.341 0 0 0-.236-.041l-2.193.534A1 1 0 0 1 .87 13.923l.534-2.193a.341.341 0 0 0-.04-.236A7.47 7.47 0 0 1 .5 8zm11.389-.907a.56.56 0 0 0-.79-.78L9.25 7.75 7.294 6.327a1 1 0 0 0-1.386.205L4.111 8.906a.56.56 0 0 0 .791.781L6.75 8.25l1.957 1.423a1 1 0 0 0 1.385-.205l1.797-2.375z"
        clipRule="evenodd"
      />
    </svg>
  ),

  notifications: (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="currentColor"
      aria-hidden="true"
      className="text-[#050505] dark:text-[#b0b3b8]"
    >
      <path d="M3 9.5a9 9 0 1 1 18 0v2.927c0 1.69.475 3.345 1.37 4.778a1.5 1.5 0 0 1-1.272 2.295h-4.625a4.5 4.5 0 0 1-8.946 0H2.902a1.5 1.5 0 0 1-1.272-2.295A9.01 9.01 0 0 0 3 12.43V9.5zm6.55 10a2.5 2.5 0 0 0 4.9 0h-4.9z" />
    </svg>
  ),
};

export default function Navbar({ user, activePage = "home" }: NavbarProps) {
  const router = useRouter();
  const [currentUid, setCurrentUid] = useState<string | null>(null);

  const [showMenu, setShowMenu] = useState(false);
  const [showMessenger, setShowMessenger] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

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
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);

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
        profileMenuRef.current &&
        !profileMenuRef.current.contains(target) &&
        profileButtonRef.current &&
        !profileButtonRef.current.contains(target)
      ) {
        setShowProfileMenu(false);
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

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") === "dark";

    document.documentElement.classList.toggle("dark", savedTheme);
    setDarkMode(savedTheme);
  }, []);

  const toggleDarkMode = () => {
    const next = !document.documentElement.classList.contains("dark");

    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
    setDarkMode(next);
  };

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
    setShowProfileMenu(false);

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

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const createItems = [
    {
      label: "Post",
      icon: (
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
          <path
            fillRule="evenodd"
            d="M17.99.93a1.75 1.75 0 0 0-2.48.005l-9.148 9.224a1.25 1.25 0 0 0-.362.88v2.21c0 .415.336.75.75.75h2.212c.33 0 .646-.13.88-.362l9.223-9.148a1.75 1.75 0 0 0 .005-2.48L17.99.93zm-1.415 1.06a.25.25 0 0 1 .355 0l1.08 1.08a.25.25 0 0 1-.001.353L16.742 4.68l-1.423-1.423 1.256-1.267z"
            clipRule="evenodd"
          />
          <path d="M11.238 1H9.694C7.856 1 6.4 1 5.26 1.153c-1.172.158-2.121.49-2.87 1.238-.748.749-1.08 1.698-1.238 2.87C1 6.401 1 7.856 1 9.694v.612c0 1.838 0 3.294.153 4.433.158 1.172.49 2.121 1.238 2.87.749.748 1.698 1.08 2.87 1.238C6.401 19 7.856 19 9.694 19h.612c1.838 0 3.294 0 4.433-.153 1.172-.158 2.121-.49 2.87-1.238.748-.749 1.08-1.698 1.238-2.87.153-1.14.153-2.595.153-4.433V8.764a.75.75 0 0 0-1.5 0v1.487c0 1.907-.002 3.261-.14 4.29-.135 1.005-.389 1.585-.812 2.008-.423.423-1.003.677-2.009.812-1.027.138-2.382.14-4.289.14h-.5c-1.907 0-3.261-.002-4.29-.14-1.005-.135-1.585-.389-2.008-.812-.423-.423-.677-1.003-.812-2.009-.138-1.027-.14-2.382-.14-4.289v-.5c0-1.907.002-3.261.14-4.29.135-1.005.389-1.585.812-2.008.423-.423 1.003-.677 2.009-.812 1.028-.138 2.382-.14 4.289-.14h1.488a.75.75 0 0 0 0-1.5z" />
        </svg>
      ),
    },
    {
      label: "Story",
      icon: (
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
          <path d="M19.5 3.75A1.75 1.75 0 0 0 17.75 2h-2.198A10.43 10.43 0 0 0 10 3.6 10.43 10.43 0 0 0 4.448 2H2.25A1.75 1.75 0 0 0 .5 3.75v11.5c0 .966.784 1.75 1.75 1.75h2.96c1.337 0 2.64.411 3.735 1.177a1.84 1.84 0 0 0 2.11 0A6.512 6.512 0 0 1 14.789 17h2.961a1.75 1.75 0 0 0 1.75-1.75V3.75zM9.25 4.9v11.693A8.013 8.013 0 0 0 5.21 15.5H2.25a.25.25 0 0 1-.25-.25V3.75a.25.25 0 0 1 .25-.25h2.198A8.93 8.93 0 0 1 9.25 4.9z" />
        </svg>
      ),
    },
    {
      label: "Reel",
      icon: (
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
          <path d="M1.046 6.5C1 7.407 1 8.465 1 9.694v.612c0 1.838 0 3.294.153 4.433.158 1.172.49 2.121 1.238 2.87.749.748 1.698 1.08 2.87 1.238C6.401 19 7.856 19 9.694 19h.612c1.838 0 3.294 0 4.433-.153 1.172-.158 2.121-.49 2.87-1.238.748-.749 1.08-1.698 1.238-2.87.153-1.14.153-2.595.153-4.433v-.612c0-1.23 0-2.287-.046-3.194H1.046zm8.076 3.599 3.063 1.75a.75.75 0 0 1 0 1.302l-3.063 1.75A.75.75 0 0 1 8 14.25v-3.5a.75.75 0 0 1 1.122-.651zM18.808 5c-.171-1.053-.507-1.917-1.2-2.609-.748-.748-1.697-1.08-2.869-1.238a17.241 17.241 0 0 0-1.698-.126L14.233 5h4.575zm-7.34-3.998C11.098 1 10.712 1 10.306 1h-.612C8.7 1 7.82 1 7.04 1.024L8.233 5h4.434l-1.2-3.998zm-5.964.121-.243.03c-1.172.158-2.121.49-2.87 1.238C1.7 3.083 1.363 3.947 1.191 5h5.476L5.504 1.123z" />
        </svg>
      ),
    },
    {
      label: "Life update",
      icon: (
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
          <path d="M8.399 1.43c.625-1.357 2.552-1.357 3.178 0l1.411 3.06 3.347.396c1.483.176 2.078 2.009.982 3.023l-2.474 2.288.656 3.305c.292 1.465-1.268 2.597-2.57 1.868l-2.941-1.646-2.94 1.646c-1.304.73-2.863-.403-2.572-1.868l.657-3.305-2.474-2.288c-1.097-1.014-.501-2.847.982-3.023l3.346-.397L8.4 1.43z" />
          <path d="M10.751 15.75a.75.75 0 0 0-1.5 0v1.75H3.25a.75.75 0 0 0 0 1.5h13.5a.75.75 0 0 0 0-1.5h-5.999v-1.75z" />
        </svg>
      ),
    },
    {
      label: "Page",
      icon: (
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
          <path d="M5.445 14h10.828a1.75 1.75 0 0 0 1.625-2.4l-1.31-3.274a.25.25 0 0 1-.003-.178l1.382-3.8A1.75 1.75 0 0 0 16.322 2H2.75a.75.75 0 0 0-.74.877l1.806 10.5c0 .004 0 .008.002.012l.943 5.488a.75.75 0 0 0 1.478-.254L5.445 14z" />
        </svg>
      ),
    },
    {
      label: "Ad",
      icon: (
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
          <path d="M19 2.904c0-1.536-1.659-2.499-2.992-1.737L10.51 4.308A5.25 5.25 0 0 1 7.907 5H4.5a4 4 0 0 0-.671 7.944l.974 4.48A2 2 0 0 0 6.757 19H7a2 2 0 0 0 2-2v-3.885a5.25 5.25 0 0 1 1.511.577l5.497 3.14c1.333.762 2.992-.2 2.992-1.736V2.904zM7.5 13v4a.5.5 0 0 1-.5.5h-.243a.5.5 0 0 1-.488-.394L5.376 13H7.5z" />
        </svg>
      ),
    },
    {
      label: "Group",
      icon: (
        <i
          data-visualcompletion="css-img"
          className="inline-block h-5 w-5 bg-no-repeat dark:invert"
          style={{
            backgroundImage:
              'url("https://static.xx.fbcdn.net/rsrc.php/yn/r/F133GlJ0cha.webp?_nc_eui2=AeG0kEoQO8eXHu-Q9srYzG9DY0a1a7F9ZPxjRrVrsX1k_IYIi2kKuTHxW1UM7t2szCZEi9Log03wATiyVz1EgMFF")',
            backgroundPosition: "0px -75px",
            backgroundSize: "auto",
          }}
        />
      ),
    },
    {
      label: "Event",
      icon: (
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
          <path d="M9.694 1h.612c1.838 0 3.294 0 4.433.153 1.172.158 2.121.49 2.87 1.238.748.749 1.08 1.698 1.238 2.87C19 6.401 19 7.856 19 9.694v.612c0 1.838 0 3.294-.153 4.433-.158 1.172-.49 2.121-1.238 2.87-.749.748-1.698 1.08-2.87 1.238-1.14.153-2.595.153-4.433.153h-.612c-1.838 0-3.294 0-4.433-.153-1.172-.158-2.121-.49-2.87-1.238-.748-.749-1.08-1.698-1.238-2.87C1 13.599 1 12.144 1 10.306v-.612C1 7.856 1 6.4 1.153 5.26c.158-1.172.49-2.121 1.238-2.87.749-.748 1.698-1.08 2.87-1.238C6.401 1 7.856 1 9.694 1zM6.75 4.5a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5zM10 8a.75.75 0 0 0-.75.75v2h-2a.75.75 0 0 0 0 1.5h2v2a.75.75 0 0 0 1.5 0v-2h2a.75.75 0 0 0 0-1.5h-2v-2A.75.75 0 0 0 10 8z" />
        </svg>
      ),
    },
    {
      label: "Marketplace Listing",
      icon: (
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
          <path d="M10 .5A4.251 4.251 0 0 0 5.816 4H3.967c-.14 0-.27 0-.392.015A2 2 0 0 0 1.877 5.51c-.03.119-.047.248-.064.387l-.43 3.383c-.244 1.922-.436 3.437-.436 4.636 0 1.229.2 2.245.839 3.103.161.216.34.419.534.606.77.741 1.753 1.067 2.972 1.222C6.482 19 8.009 19 9.946 19h.109c1.937 0 3.464 0 4.654-.152 1.218-.155 2.201-.48 2.972-1.222.194-.187.373-.39.534-.607.638-.857.838-1.873.838-3.101 0-1.2-.192-2.715-.436-4.637l-.43-3.383a3.161 3.161 0 0 0-.063-.387 2 2 0 0 0-1.698-1.496A3.306 3.306 0 0 0 16.034 4h-1.85A4.251 4.251 0 0 0 10 .5zM10 2a2.75 2.75 0 0 1 2.646 2H7.354A2.751 2.751 0 0 1 10 2zm2.75 6a.75.75 0 0 1 1.5 0 4.25 4.25 0 0 1-8.5 0 .75.75 0 0 1 1.5 0 2.75 2.75 0 0 0 5.5 0z" />
        </svg>
      ),
    },
  ];

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-[#242526] shadow-sm h-[56px] flex items-center px-4 max-md:px-2">
        {" "}
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
              className="hidden lg:flex w-10 h-10 rounded-full bg-[#f0f2f5] dark:bg-[#3a3b3c] items-center justify-center hover:bg-[#e4e6eb] dark:hover:bg-[#3a3b3c]"
            >
              <svg
                viewBox="0 0 16 16"
                width="16"
                height="16"
                fill="currentColor"
                aria-hidden="true"
                className="text-[#65676b]"
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
                      d="m13.463 15.142-.04-.044-3.574-4.192c-.599-.703.355-1.656 1.058-1.057l4.191 3.574.044.04c.058.059.122.137.182.24.249.425.249.96-.154 1.41l-.057.057c-.45.403-.986.403-1.411.154a1.182 1.182 0 0 1-.240-.182zm.617-.616.444-.444a.31.31 0 0 0-.063-.052c-.093-.055-.263-.055-.35.024l.208.232.207-.206.006.007-.22.257-.026-.024.033-.034.025.027-.257.22-.007-.007zm-.027-.415c-.078.088-.078.257-.023.35a.31.31 0 0 0 .051.063l.205-.204-.233-.209z"
                      transform="translate(448 544)"
                    />
                  </g>
                </g>
              </svg>
            </button>

            <div className="w-[240px] h-[40px] bg-[#f0f2f5] dark:bg-[#3a3b3c] rounded-full flex items-center gap-2 px-3 lg:hidden">
              <svg
                viewBox="0 0 16 16"
                width="16"
                height="16"
                fill="currentColor"
                aria-hidden="true"
                className="text-[#65676b] flex-shrink-0"
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

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => setShowResults(true)}
                placeholder="Search Facebook"
                className="bg-transparent  outline-none text-[15px] text-[#050505] dark:text-[#e4e6eb] placeholder-[#8a8d91] dark:placeholder-[#b0b3b8] w-full"
              />
            </div>

            {showResults && !showSearchPopup && (
              <div className="absolute top-[44px] left-0 w-[360px] bg-[#f0f2f5] dark:bg-[#3a3b3c] rounded-lg shadow-xl py-2 z-50">
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
                      className="flex items-center gap-3 px-3 py-2 hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c] transition-colors"
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
              className={`relative flex items-center justify-center w-[116px] h-[48px] lg:w-[70px] lg:h-[40px] rounded-lg hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c] ${
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
              setShowProfileMenu(false);
            }}
            className="w-10 h-10 rounded-full bg-[#e4e6ea] hover:bg-[#d8dadf] dark:bg-[#18191a] dark:hover:bg-[#3a3b3c] flex items-center justify-center "
          >
            {RIGHT_ACTION_ICONS.menu}
          </button>

          <button
            ref={messengerButtonRef}
            onClick={() => {
              setShowMessenger((prev) => !prev);
              setShowMenu(false);
              setShowNotifications(false);
              setShowProfileMenu(false);
            }}
            className="w-10 h-10 rounded-full bg-[#e4e6ea] hover:bg-[#d8dadf] dark:bg-[#18191a] dark:hover:bg-[#3a3b3c] flex items-center justify-center"
          >
            {RIGHT_ACTION_ICONS.messenger}
          </button>

          <button
            ref={notificationsButtonRef}
            onClick={() => {
              setShowNotifications((prev) => !prev);
              setShowMenu(false);
              setShowMessenger(false);
              setShowProfileMenu(false);
            }}
            className="relative w-10 h-10 rounded-full bg-[#e4e6ea] dark:bg-[#18191a] hover:bg-[#d8dadf]  dark:hover:bg-[#3a3b3c] flex items-center justify-center"
          >
            {RIGHT_ACTION_ICONS.notifications}

            {friendRequests.length > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#f02849] text-white text-[11px] font-bold rounded-full flex items-center justify-center">
                {friendRequests.length}
              </span>
            )}
          </button>

          {user ? (
            <div className="relative">
              <button
                ref={profileButtonRef}
                onClick={() => {
                  setShowProfileMenu((prev) => !prev);
                  setShowMenu(false);
                  setShowMessenger(false);
                  setShowNotifications(false);
                }}
                className="w-10 h-10 rounded-full overflow-hidden bg-gray-300 hover:opacity-90"
              >
                {user.photoURL ? (
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
                    {user.displayName?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
              </button>

              {showProfileMenu && (
                <div
                  ref={profileMenuRef}
                  className="absolute right-0 top-[48px] w-[360px] max-w-[calc(100vw-16px)] bg-white rounded-lg shadow-[0_12px_28px_rgba(0,0,0,0.25)] border border-[#ced0d4] p-2 z-50"
                >
                  <Link
                    href="/profile"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c]"
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-300">
                      {user.photoURL ? (
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
                          {user.displayName?.[0]?.toUpperCase() || "U"}
                        </div>
                      )}
                    </div>

                    <span className="text-[15px] font-semibold text-[#050505]">
                      {user.displayName || "User"}
                    </span>
                  </Link>

                  <hr className="my-2 border-[#dadde1] dark:border-[#3a3b3c]" />

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c] text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#e4e6eb] flex items-center justify-center">
                      <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-5 h-5 text-[#050505] "
                      >
                        <path d="M16 13v-2H7V8l-5 4 5 4v-3h9zm3-10H9c-1.1 0-2 .9-2 2v3h2V5h10v14H9v-3H7v3c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
                      </svg>
                    </div>

                    <span className="text-[15px] font-semibold text-[#050505] dark:text-[#e4e6eb]">
                      Log out
                    </span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/"
              className="h-10 px-4 rounded-full bg-[#1877f2] hover:bg-[#166fe5] text-white text-[15px] font-semibold flex items-center justify-center"
            >
              Log in
            </Link>
          )}
        </div>
        {showMenu && (
          <div
            className="absolute right-4 top-[56px] w-[608px] max-w-[calc(100vw-16px)] h-[calc(100vh-72px)] bg-[#f0f2f5] dark:bg-[#18191a] rounded-lg shadow-[0_12px_28px_rgba(0,0,0,0.25)] z-50 overflow-y-auto p-4 gg:ml-4"
            ref={menuRef}
          >
            <h2 className="text-[24px] font-bold text-[#050505] dark:text-[#e4e6eb] mb-3">
              Menu
            </h2>{" "}
            <div className="bg-white dark:bg-[#242526] rounded-xl shadow-sm p-2 mb-3">
              {user ? (
                <>
                  <Link
                    href="/profile"
                    onClick={() => setShowMenu(false)}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#f0f2f5]  dark:hover:bg-[#3a3b3c]"
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-300">
                      {user.photoURL ? (
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
                          {user.displayName?.[0]?.toUpperCase() || "U"}
                        </div>
                      )}
                    </div>

                    <span className="text-[15px] font-semibold text-[#050505] dark:text-[#e4e6eb]">
                      {user.displayName || "User"}
                    </span>
                  </Link>

                  <button
                    onClick={toggleDarkMode}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c] text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#e4e6eb] dark:bg-[#3a3b3c] flex items-center justify-center">
                      <svg
                        viewBox="0 0 20 20"
                        width="20"
                        height="20"
                        fill="currentColor"
                        aria-hidden="true"
                        className="text-[#050505] dark:text-[#e4e6eb]"
                      >
                        <path d="M10.293 1.691A.75.75 0 0 0 9.66.501a9.503 9.503 0 0 0 .343 19c4.594-.001 8.426-3.26 9.31-7.593a.75.75 0 0 0-1.07-.822 6.336 6.336 0 0 1-7.95-9.395z" />
                      </svg>
                    </div>

                    <span className="text-[15px] font-semibold text-[#050505]  dark:text-[#e4e6eb]">
                      {darkMode ? "Light mode" : "Dark mode"}
                    </span>
                  </button>
                </>
              ) : (
                <Link
                  href="/"
                  onClick={() => setShowMenu(false)}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c]"
                >
                  <div className="w-10 h-10 rounded-full bg-[#1877f2] flex items-center justify-center">
                    <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                      <path d="M10 17v-3H3v-4h7V7l5 5-5 5zm-1 4h10c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2H9c-1.1 0-2 .9-2 2v3h2V5h10v14H9v-3H7v3c0 1.1.9 2 2 2z" />
                    </svg>
                  </div>

                  <span className="text-[15px] font-semibold text-[#050505] dark:text-[#e4e6eb]">
                    Log in
                  </span>
                </Link>
              )}
            </div>
            <div className="grid grid-cols-[360px_200px] gap-4 lg:grid-cols-1 sm:m-2.5">
              <div className="bg-white dark:bg-[#242526] rounded-xl shadow-sm p-4">
                <div className="h-[40px] bg-white dark:bg-[#3a3b3c] rounded-full flex items-center gap-2 px-3 mb-5">
                  <svg
                    viewBox="0 0 16 16"
                    width="16"
                    height="16"
                    fill="currentColor"
                    aria-hidden="true"
                    className="h-4 w-4 text-[#65676b] dark:text-[#b0b3b8]"
                  >
                    <path d="M7.5 1a6.5 6.5 0 1 0 3.835 11.749l1.958 1.958a1 1 0 0 0 1.414-1.414l-1.958-1.958A6.5 6.5 0 0 0 7.5 1zM3 7.5a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0z" />
                  </svg>

                  <input
                    type="text"
                    placeholder="Search menu"
                    className="w-full bg-transparent outline-none text-[15px] text-[#050505] dark:text-[#e4e6eb] placeholder-[#65676b]"
                  />
                </div>

                <div className="pb-4 border-b border-[#dadde1] dark:border-[#3a3b3c]">
                  <h3 className="text-[17px] font-bold text-[#050505] dark:text-[#e4e6eb] mb-2">
                    Social
                  </h3>

                  <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c] text-left">
                    <img
                      src="https://static.xx.fbcdn.net/rsrc.php/yi/r/_-6DsSRXGcS.webp?_nc_eui2=AeEhgr4K4WWhTi3oeZLT0cVZsoKcbHreVPWygpxset5U9bcoBLswmorxrMUqqCvLx2Av-Omgzwm7MkhmdfYdUmYu"
                      alt=""
                      aria-hidden="true"
                      width={36}
                      height={36}
                      referrerPolicy="origin-when-cross-origin"
                      className="h-9 w-9"
                    />

                    <div>
                      <p className="text-[15px] font-bold text-[#050505] dark:text-[#e4e6eb]">
                        Events
                      </p>
                      <p className="text-[13px] text-[#65676b] dark:text-[#b0b3b8] leading-[16px]">
                        Organise or find events and other things to do online
                        and nearby.
                      </p>
                    </div>
                  </button>

                  <Link
                    href="/friends"
                    onClick={() => setShowMenu(false)}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c] text-left"
                  >
                    <img
                      src="https://static.xx.fbcdn.net/rsrc.php/yK/r/pt3boho8KBZ.webp?_nc_eui2=AeFIY6u9-MqXQkfWxgUESZeh7ot1wEZDYRHui3XARkNhEYn9CtaDRLxE2zEMcmQXuKytwQijW1g0_wPYXzkVdfOn"
                      alt=""
                      aria-hidden="true"
                      width={36}
                      height={36}
                      referrerPolicy="origin-when-cross-origin"
                      className="h-9 w-9"
                    />

                    <div>
                      <p className="text-[15px] font-bold text-[#050505] dark:text-[#e4e6eb]">
                        Friends
                      </p>
                      <p className="text-[13px] text-[#65676b] dark:text-[#b0b3b8] leading-[16px]">
                        Search for friends or people you may know.
                      </p>
                    </div>
                  </Link>

                  <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c] text-left">
                    <img
                      src="https://static.xx.fbcdn.net/rsrc.php/y8/r/iaP8U-_yJOY.webp?_nc_eui2=AeGnw5ZHX28PpsErVdUzf9CJpRuokJLd8nOlG6iQkt3yc3N_1vgpFNi5zGTOS63FIhh-vF2FRqHLImrx_15x1Sxz"
                      alt=""
                      aria-hidden="true"
                      width={36}
                      height={36}
                      referrerPolicy="origin-when-cross-origin"
                      className="h-9 w-9"
                    />

                    <div>
                      <p className="text-[15px] font-bold text-[#050505] dark:text-[#e4e6eb]">
                        Groups
                      </p>
                      <p className="text-[13px] text-[#65676b] dark:text-[#b0b3b8] leading-[16px]">
                        Connect with people who share your interests.
                      </p>
                    </div>
                  </button>

                  <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c] text-left">
                    <img
                      src="https://static.xx.fbcdn.net/rsrc.php/yF/r/IOdWWyXde8k.webp?_nc_eui2=AeEm8xa5shVDyBeybUl9LDbBYxDkR9eJBh5jEORH14kGHmTMZXQVzREL3pYdGLp2G4sHDMRPEkw2bH-d9Hs0vOg9"
                      alt=""
                      aria-hidden="true"
                      width={36}
                      height={36}
                      referrerPolicy="origin-when-cross-origin"
                      className="h-9 w-9"
                    />

                    <div>
                      <p className="text-[15px] font-bold text-[#050505] dark:text-[#e4e6eb]">
                        News Feed
                      </p>
                      <p className="text-[13px] text-[#65676b] dark:text-[#b0b3b8] leading-[16px]">
                        See relevant posts from people and Pages that you
                        follow.
                      </p>
                    </div>
                  </button>

                  <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c] text-left">
                    <img
                      src="https://static.xx.fbcdn.net/rsrc.php/yd/r/6H6EFrx5Jjl.webp?_nc_eui2=AeHa3wUfiL3pIU7XmfiO4YSVERi4XsvRWc4RGLhey9FZzg7psVyw-ZOw7Nr0NpvgYEsFtGBj_2FZ2Qrbc4433ztd"
                      alt=""
                      aria-hidden="true"
                      width={36}
                      height={36}
                      referrerPolicy="origin-when-cross-origin"
                      className="h-9 w-9"
                    />

                    <div>
                      <p className="text-[15px] font-bold text-[#050505] dark:text-[#e4e6eb]">
                        Feeds
                      </p>
                      <p className="text-[13px] text-[#65676b] dark:text-[#b0b3b8] leading-[16px]">
                        See the most recent posts from your friends, groups,
                        Pages and more.
                      </p>
                    </div>
                  </button>

                  <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c] text-left">
                    <img
                      src="https://static.xx.fbcdn.net/rsrc.php/yH/r/pRlzLrwCyIc.webp?_nc_eui2=AeHQpD4PJvVZkx7u-VrcJwr1zl-pbntIHMvOX6lue0gcy7FDOOJCkYA9iWszyMTV70IVsHA1oEK16eN4mu9U3tur"
                      alt=""
                      aria-hidden="true"
                      width={36}
                      height={36}
                      referrerPolicy="origin-when-cross-origin"
                      className="h-9 w-9"
                    />

                    <div>
                      <p className="text-[15px] font-bold text-[#050505] dark:text-[#e4e6eb]">
                        Pages
                      </p>
                      <p className="text-[13px] text-[#65676b] dark:text-[#b0b3b8] leading-[16px]">
                        Discover and connect with businesses on Facebook.
                      </p>
                    </div>
                  </button>
                </div>

                <div className="py-4 border-b border-[#dadde1] dark:border-[#3a3b3c]">
                  <h3 className="text-[17px] font-bold text-[#050505] dark:text-[#e4e6eb] mb-2">
                    Entertainment
                  </h3>

                  <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c] text-left">
                    <img
                      src="https://static.xx.fbcdn.net/rsrc.php/yT/r/JYr05Vf7xjV.webp?_nc_eui2=AeFw4U08o8ZwGfAr0loe7mSvx1_O6krjazfHX87qSuNrN4Ae7VGE9Am-vdczJqbaEygKT8Qf4cDRjjExOv4BONZ6"
                      alt=""
                      aria-hidden="true"
                      width={36}
                      height={36}
                      referrerPolicy="origin-when-cross-origin"
                      className="h-9 w-9"
                    />

                    <div>
                      <p className="text-[15px] font-bold text-[#050505] dark:text-[#e4e6eb]">
                        Gaming video
                      </p>
                      <p className="text-[13px] text-[#65676b] dark:text-[#b0b3b8] leading-[16px]">
                        Watch and connect with your favourite games and
                        streamers.
                      </p>
                    </div>
                  </button>

                  <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c] text-left">
                    <img
                      src="https://static.xx.fbcdn.net/rsrc.php/y3/r/VTvvptemt72.webp?_nc_eui2=AeG_GP3s8fO3TRFGhUhGhOunQtC3T39ohN9C0LdPf2iE36tljM0yjJAwJ_8QUYqbxkm0HbVDZpe5xD8aWT3LkxZG"
                      alt=""
                      aria-hidden="true"
                      width={36}
                      height={36}
                      referrerPolicy="origin-when-cross-origin"
                      className="h-9 w-9"
                    />

                    <div>
                      <p className="text-[15px] font-bold text-[#050505] dark:text-[#e4e6eb]">
                        Play games
                      </p>
                      <p className="text-[13px] text-[#65676b] dark:text-[#b0b3b8] leading-[16px]">
                        Play your favourite games.
                      </p>
                    </div>
                  </button>

                  <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c] text-left">
                    <img
                      src="https://static.xx.fbcdn.net/rsrc.php/yJ/r/_E6CYXQ_FqC.webp?_nc_eui2=AeEuNnpcG-Z-uQjgqLBHd2dXotreepYCtOKi2t56lgK04t7gz6cZtZHWbSBK9KMM6X8YG2_X-T6b0m3nUjKTOayZ"
                      alt=""
                      aria-hidden="true"
                      width={36}
                      height={36}
                      referrerPolicy="origin-when-cross-origin"
                      className="h-9 w-9"
                    />

                    <div>
                      <p className="text-[15px] font-bold text-[#050505] dark:text-[#e4e6eb]">
                        Reels
                      </p>
                      <p className="text-[13px] text-[#65676b] dark:text-[#b0b3b8] leading-[16px]">
                        A Reels destination personalised to your interests and
                        connections.
                      </p>
                    </div>
                  </button>
                </div>

                <div className="py-4 border-b border-[#dadde1] dark:border-[#3a3b3c]">
                  <h3 className="text-[17px] font-bold text-[#050505] dark:text-[#e4e6eb] mb-2">
                    Shopping
                  </h3>

                  <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c] text-left">
                    <img
                      src="https://static.xx.fbcdn.net/rsrc.php/y_/r/R4eauTzM8dl.webp?_nc_eui2=AeH-9cz373FkBVC4F05UroqQLiT8ZGD6E9wuJPxkYPoT3Ce8tyZNtktMfT6Ymfy7NrEkuFdcVY4Swa-PzNY9kCuK"
                      alt=""
                      aria-hidden="true"
                      width={36}
                      height={36}
                      referrerPolicy="origin-when-cross-origin"
                      className="h-9 w-9"
                    />

                    <div>
                      <p className="text-[15px] font-bold text-[#050505] dark:text-[#e4e6eb]">
                        Orders and payments
                      </p>
                      <p className="text-[13px] text-[#65676b] dark:text-[#b0b3b8] leading-[16px]">
                        A seamless, secure way to pay in the apps you already
                        use.
                      </p>
                    </div>
                  </button>

                  <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c] text-left">
                    <img
                      src="https://static.xx.fbcdn.net/rsrc.php/ya/r/k_2AcQbzeZL.webp?_nc_eui2=AeHPKutQ0vJJ6cR3MQrLt_Adlyh6Q76FvXmXKHpDvoW9edFSF-iU9qcfJdzVBZSqBm-uZB6t8OFF4JPS27shH6JO"
                      alt=""
                      aria-hidden="true"
                      width={36}
                      height={36}
                      referrerPolicy="origin-when-cross-origin"
                      className="h-9 w-9"
                    />

                    <div>
                      <p className="text-[15px] font-bold text-[#050505] dark:text-[#e4e6eb]">
                        Marketplace
                      </p>
                      <p className="text-[13px] text-[#65676b] dark:text-[#b0b3b8] leading-[16px]">
                        Buy and sell in your community.
                      </p>
                    </div>
                  </button>
                </div>

                <div className="py-4 border-b border-[#dadde1] dark:border-[#3a3b3c]">
                  <h3 className="text-[17px] font-bold text-[#050505] dark:text-[#e4e6eb] mb-2">
                    Personal
                  </h3>

                  <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c] text-left">
                    <img
                      src="https://static.xx.fbcdn.net/rsrc.php/y-/r/ITvoZIONvPL.webp?_nc_eui2=AeHHMoPCtJhBANggfjUjMKoLRtJcRSRlu3NG0lxFJGW7c2T5e6P_fBaj7gtv5WcZxR9qf-a6z0nQFI2cBtCBrSz9"
                      alt=""
                      aria-hidden="true"
                      width={36}
                      height={36}
                      referrerPolicy="origin-when-cross-origin"
                      className="h-9 w-9"
                    />

                    <div>
                      <p className="text-[15px] font-bold text-[#050505] dark:text-[#e4e6eb]">
                        Recent ad activity
                      </p>
                      <p className="text-[13px] text-[#65676b] dark:text-[#b0b3b8] leading-[16px]">
                        See all of the ads you've interacted with on Facebook.
                      </p>
                    </div>
                  </button>

                  <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c] text-left">
                    <img
                      src="https://static.xx.fbcdn.net/rsrc.php/yv/r/G_HHYFVKqWp.webp?_nc_eui2=AeFNW33hzTMjEr80-4KsKe2Zce4rG0BsyaJx7isbQGzJoib8pNDu_wPQQu1Xt6a_7QkvOYMz5oAyOOGpmbh4-8X3"
                      alt=""
                      aria-hidden="true"
                      width={36}
                      height={36}
                      referrerPolicy="origin-when-cross-origin"
                      className="h-9 w-9"
                    />

                    <div>
                      <p className="text-[15px] font-bold text-[#050505] dark:text-[#e4e6eb]">
                        Memories
                      </p>
                      <p className="text-[13px] text-[#65676b] dark:text-[#b0b3b8] leading-[16px]">
                        Browse your old photos, videos and posts on Facebook.
                      </p>
                    </div>
                  </button>

                  <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c] text-left">
                    <img
                      src="https://static.xx.fbcdn.net/rsrc.php/yw/r/y1z3mT73M1Q.webp?_nc_eui2=AeHbR7Ak_vCxWvWXtEvT9ALLfMBzzVf_5sd8wHPNV__mx8fTqL5wPRns_F8kBhuI470QHtASrl4jYsEf-4tLZghF"
                      alt=""
                      aria-hidden="true"
                      width={36}
                      height={36}
                      referrerPolicy="origin-when-cross-origin"
                      className="h-9 w-9"
                    />

                    <div>
                      <p className="text-[15px] font-bold text-[#050505] dark:text-[#e4e6eb]">
                        Saved
                      </p>
                      <p className="text-[13px] text-[#65676b] dark:text-[#b0b3b8] leading-[16px]">
                        Find posts, photos and videos that you've saved for
                        later.
                      </p>
                    </div>
                  </button>
                </div>

                <div className="py-4 border-b border-[#dadde1] dark:border-[#3a3b3c]">
                  <h3 className="text-[17px] font-bold text-[#050505] dark:text-[#e4e6eb] mb-2">
                    Professional
                  </h3>

                  <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c] text-left">
                    <img
                      src="https://static.xx.fbcdn.net/rsrc.php/ym/r/S_7PO9V7HZj.webp?_nc_eui2=AeExF1T7nUvYKod-KkNPK5gNXDGsG5pzg9VcMawbmnOD1UAApSpZ8K-IFlvp5blgkAq-_ysIp0J5Xg5Cn_VEyXk8"
                      alt=""
                      aria-hidden="true"
                      width={36}
                      height={36}
                      referrerPolicy="origin-when-cross-origin"
                      className="h-9 w-9"
                    />

                    <div>
                      <p className="text-[15px] font-bold text-[#050505] dark:text-[#e4e6eb]">
                        Ads Manager
                      </p>
                      <p className="text-[13px] text-[#65676b] dark:text-[#b0b3b8] leading-[16px]">
                        Create, manage and track the performance of your ads.
                      </p>
                    </div>
                  </button>
                </div>

                <div className="pt-4">
                  <h3 className="text-[17px] font-bold text-[#050505] dark:text-[#e4e6eb] mb-2">
                    More from Meta
                  </h3>

                  <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c] text-left">
                    <img
                      src="https://static.xx.fbcdn.net/rsrc.php/yM/r/99HwH9ed7Uy.webp?_nc_eui2=AeFbm4CkLMioBalR4IVbJS-S3X37UATbr-_dfftQBNuv7yhFwDAw55rwBtVdiz0o8rEII2aLaF32z81_VAun0-5P"
                      alt=""
                      aria-hidden="true"
                      width={36}
                      height={36}
                      referrerPolicy="origin-when-cross-origin"
                      className="h-9 w-9"
                    />

                    <div>
                      <p className="text-[15px] font-bold text-[#050505] dark:text-[#e4e6eb]">
                        Meta AI
                      </p>
                      <p className="text-[13px] text-[#65676b] dark:text-[#b0b3b8] leading-[16px]">
                        Ask questions, brainstorm ideas, create any image you
                        can imagine and more.
                      </p>
                    </div>
                  </button>

                  <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c] text-left">
                    <img
                      src="https://static.xx.fbcdn.net/rsrc.php/y6/r/v-mtC0o1kj1.webp?_nc_eui2=AeEIdb900PqTuaOWTlkWjAOI_0fyU_uLSP7_R_JT-4tI_tOehMH5xyV-7QStR9Wts2XzEjt1LSov3fOEGcH-RpQf"
                      alt=""
                      aria-hidden="true"
                      width={36}
                      height={36}
                      referrerPolicy="origin-when-cross-origin"
                      className="h-9 w-9"
                    />

                    <div>
                      <p className="text-[15px] font-bold text-[#050505] dark:text-[#e4e6eb]">
                        Chat with AIs
                      </p>
                      <p className="text-[13px] text-[#65676b] dark:text-[#b0b3b8] leading-[16px]">
                        Create and discover AIs for fun conversations or help
                        with specific topics.
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-[#242526] rounded-xl shadow-sm p-3 h-fit sticky top-0 lg:static">
                <h3 className="text-[20px] font-bold text-[#050505] dark:text-[#e4e6eb] mb-2">
                  Create
                </h3>

                {createItems.map((item, index) => (
                  <div key={item.label}>
                    {index === 4 && (
                      <hr className="border-[#dadde1] dark:border-[#3a3b3c] my-2" />
                    )}

                    <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c] text-left">
                      <div className="w-9 h-9 rounded-full bg-[#e4e6eb] dark:bg-[#3a3b3c] flex items-center justify-center text-[#050505] dark:text-[#e4e6eb]">
                        {item.icon}
                      </div>

                      <span className="text-[15px] font-bold text-[#050505] dark:text-[#e4e6eb]">
                        {item.label}
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
            ref={messengerRef}
            className="absolute right-0 top-[48px] w-[360px] bg-white dark:bg-[#242526] rounded-lg shadow-[0_12px_28px_rgba(0,0,0,0.25)] border border-[#ced0d4] dark:border-[#3a3b3c] p-2 z-50"
          >
            <h2 className="text-[24px] font-bold text-[#050505] dark:text-[#e4e6eb] mb-3">
              Chats
            </h2>

            <div className="text-[15px] text-[#65676b] dark:text-[#b0b3b8] py-4">
              No chats yet.
            </div>
          </div>
        )}
        {showNotifications && (
          <div
            ref={notificationsRef}
            className="absolute right-0 top-[48px] w-[360px] bg-white dark:bg-[#242526] rounded-lg shadow-[0_12px_28px_rgba(0,0,0,0.25)] border border-[#ced0d4] dark:border-[#3a3b3c] p-2 z-50"
          >
            <h2 className="text-[24px] font-bold text-[#050505] dark:text-[#e4e6eb] mb-3">
              Notifications
            </h2>

            {friendRequests.length === 0 ? (
              <div className="text-[15px] text-[#65676b] dark:text-[#b0b3b8] py-4">
                No notifications yet.
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {friendRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex gap-3 p-2 rounded-lg hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c]"
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
                      <p className="text-[15px] text-[#050505] dark:text-[#e4e6eb]">
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
                          className="flex-1 h-9 bg-[#e4e6eb] hover:bg-[#d8dadf] text-[#050505] dark:text-[#e4e6eb] rounded-lg text-[14px] font-semibold disabled:opacity-70"
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
            className="fixed top-0 left-0 z-[9999] w-[410px] max-w-[calc(100vw-8px)] bg-white dark:bg-[#242526] rounded-br-xl shadow-[0_4px_18px_rgba(0,0,0,0.22)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-[72px] flex items-center gap-2 px-3">
              <button
                onClick={closeSearchPopup}
                className="w-10 h-10 rounded-full hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c] flex items-center justify-center text-[#65676b]"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.42-1.41L7.83 13H20v-2z" />
                </svg>
              </button>

              <div className="flex-1 h-[46px] bg-[#f0f2f5] dark:bg-[#3a3b3c] rounded-full flex items-center gap-2 px-4">
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
                  className="w-full bg-transparent outline-none text-[15px] text-[#050505] dark:text-[#e4e6eb] placeholder-[#8a8d91] dark:placeholder-[#b0b3b8]"
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
                    className="flex items-center gap-3 px-3 py-2 hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c] transition-colors"
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
                      <p className="text-[15px] font-semibold text-[#050505] dark:text-[#e4e6eb]">
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

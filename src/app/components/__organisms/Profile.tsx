"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, updateProfile } from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";

import { auth, db } from "@/firebase/firebase";
import { uploadToCloudinary } from "@/lib/cloudinary";
import Navbar from "@/app/components/__organisms/Navbar";
import PostCard, { Post } from "@/app/components/__molecules/PostCard";

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
  birthday: {
    day: string;
    month: string;
    year: string;
  };
  photoURL?: string | null;
  coverPhotoURL?: string | null;
  bio?: string;
  city?: string;
}

type FriendCard = {
  uid: string;
  name: string;
  photoURL: string | null;
};

export default function Profile() {
  const router = useRouter();

  const [authUser, setAuthUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<"profile" | "cover" | null>(null);
  const [acceptedSent, setAcceptedSent] = useState<any[]>([]);
  const [acceptedReceived, setAcceptedReceived] = useState<any[]>([]);
  const [showEditBio, setShowEditBio] = useState(false);
  const [cityInput, setCityInput] = useState("");
  const [birthDayInput, setBirthDayInput] = useState("");
  const [birthMonthInput, setBirthMonthInput] = useState("");
  const [birthYearInput, setBirthYearInput] = useState("");
  const [savingBio, setSavingBio] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/");
        return;
      }

      setAuthUser(user);

      const snap = await getDoc(doc(db, "users", user.uid));

      if (snap.exists()) {
        setProfile(snap.data() as UserProfile);
      }

      setLoading(false);
    });

    return () => unsub();
  }, [router]);

  useEffect(() => {
    if (!authUser?.uid) return;

    const q = query(
      collection(db, "posts"),
      where("authorId", "==", authUser.uid),
      orderBy("createdAt", "desc"),
    );

    const unsub = onSnapshot(q, (snap) => {
      setPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Post[]);
    });

    return () => unsub();
  }, [authUser?.uid]);

  useEffect(() => {
    if (!authUser?.uid) {
      setAcceptedSent([]);
      return;
    }

    const q = query(
      collection(db, "friendRequests"),
      where("fromUid", "==", authUser.uid),
      where("status", "==", "accepted"),
    );

    const unsub = onSnapshot(q, (snap) => {
      setAcceptedSent(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })),
      );
    });

    return () => unsub();
  }, [authUser?.uid]);

  useEffect(() => {
    if (!authUser?.uid) {
      setAcceptedReceived([]);
      return;
    }

    const q = query(
      collection(db, "friendRequests"),
      where("toUid", "==", authUser.uid),
      where("status", "==", "accepted"),
    );

    const unsub = onSnapshot(q, (snap) => {
      setAcceptedReceived(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })),
      );
    });

    return () => unsub();
  }, [authUser?.uid]);

  const handleLikePost = async (post: Post) => {
    if (!authUser?.uid) return;

    const postRef = doc(db, "posts", post.id);

    const alreadyLiked = Array.isArray(post.likes)
      ? post.likes.includes(authUser.uid)
      : false;

    try {
      await updateDoc(postRef, {
        likes: alreadyLiked
          ? arrayRemove(authUser.uid)
          : arrayUnion(authUser.uid),
      });
    } catch (err) {
      console.error("Like post error:", err);
    }
  };

  const handleImageUpload = async (
    file: File | undefined,
    type: "profile" | "cover",
  ) => {
    if (!file || !authUser?.uid) return;

    if (!file.type.startsWith("image/")) {
      alert("Please choose an image.");
      return;
    }

    setUploading(type);

    try {
      const url = await uploadToCloudinary(file);

      if (type === "profile") {
        await updateDoc(doc(db, "users", authUser.uid), {
          photoURL: url,
        });

        if (auth.currentUser) {
          await updateProfile(auth.currentUser, {
            photoURL: url,
          });
        }

        setProfile((prev) =>
          prev
            ? {
                ...prev,
                photoURL: url,
              }
            : prev,
        );

        setAuthUser((prev: any) =>
          prev
            ? {
                ...prev,
                photoURL: url,
              }
            : prev,
        );
      }

      if (type === "cover") {
        await updateDoc(doc(db, "users", authUser.uid), {
          coverPhotoURL: url,
        });

        setProfile((prev) =>
          prev
            ? {
                ...prev,
                coverPhotoURL: url,
              }
            : prev,
        );
      }
    } catch (err: any) {
      console.error("Image upload error:", err);
      alert(err.message || "Image upload failed.");
    } finally {
      setUploading(null);
    }
  };

  const openEditBio = () => {
    setCityInput(profile?.city || "");
    setBirthDayInput(profile?.birthday?.day || "");
    setBirthMonthInput(profile?.birthday?.month || "");
    setBirthYearInput(profile?.birthday?.year || "");
    setShowEditBio(true);
  };

  const closeEditBio = () => {
    setShowEditBio(false);
    setCityInput("");
    setBirthDayInput("");
    setBirthMonthInput("");
    setBirthYearInput("");
  };

  const handleSaveBio = async () => {
    if (!authUser?.uid || savingBio) return;

    setSavingBio(true);

    try {
      const updatedBirthday = {
        day: birthDayInput.trim(),
        month: birthMonthInput.trim(),
        year: birthYearInput.trim(),
      };

      await updateDoc(doc(db, "users", authUser.uid), {
        city: cityInput.trim(),
        birthday: updatedBirthday,
      });

      setProfile((prev) =>
        prev
          ? {
              ...prev,
              city: cityInput.trim(),
              birthday: updatedBirthday,
            }
          : prev,
      );

      closeEditBio();
    } catch (err) {
      console.error("Save profile details error:", err);
      alert("Could not save profile details.");
    } finally {
      setSavingBio(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-[#f0f2f5] dark:bg-[#18191a]" />;
  }

  const fullName =
    profile?.firstName || profile?.lastName
      ? `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim()
      : authUser?.displayName || "Giorgi";

  const userPhoto = profile?.photoURL || authUser?.photoURL || null;

  const friendsMap = new Map<string, FriendCard>();

  acceptedSent.forEach((request) => {
    friendsMap.set(request.toUid, {
      uid: request.toUid,
      name: request.toName || "User",
      photoURL: request.toPhoto || null,
    });
  });

  acceptedReceived.forEach((request) => {
    friendsMap.set(request.fromUid, {
      uid: request.fromUid,
      name: request.fromName || "User",
      photoURL: request.fromPhoto || null,
    });
  });

  const friends = Array.from(friendsMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  return (
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-[#18191a]">
      <Navbar
        user={{
          displayName: fullName,
          photoURL: userPhoto,
        }}
        activePage="home"
      />

      <div className="pt-[56px] max-w-[1100px] mx-auto">
        <div className="bg-white dark:bg-[#242526] rounded-b-lg shadow">
          <div className="relative h-[350px] bg-gradient-to-b from-[#b0b3b8] to-[#606770] rounded-b-lg overflow-hidden">
            {profile?.coverPhotoURL ? (
              <Image
                src={profile.coverPhotoURL}
                alt="Cover"
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="w-full h-full bg-[#c9cdd2] dark:bg-[#3a3b3c]" />
            )}

            <label className="absolute bottom-4 right-4 flex items-center gap-2 bg-white dark:bg-[#3a3b3c] hover:bg-[#f0f2f5] dark:hover:bg-[#4e4f50] px-3 py-2 rounded-lg text-[15px] font-semibold text-[#050505] dark:text-[#e4e6eb] cursor-pointer">
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) =>
                  handleImageUpload(e.target.files?.[0], "cover")
                }
              />

              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M20 5h-3.2l-1.8-2H9L7.2 5H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zM12 18c-2.8 0-5-2.2-5-5s2.2-5 5-5 5 2.2 5 5-2.2 5-5 5z" />
              </svg>

              {uploading === "cover" ? "Uploading..." : "Edit cover photo"}
            </label>
          </div>

          <div className="px-4 pb-4">
            <div className="flex items-end justify-between -mt-[52px] flex-wrap gap-4 sd:flex-col sd:items-start">
              <div className="relative">
                <div className="w-[168px] h-[168px] rounded-full border-4 border-white dark:border-[#242526] overflow-hidden bg-[#c9cdd2] dark:bg-[#3a3b3c] relative">
                  {userPhoto ? (
                    <Image
                      src={userPhoto}
                      alt={fullName}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full bg-[#1877f2] flex items-center justify-center text-white text-[64px] font-bold">
                      {fullName[0]?.toUpperCase() || "G"}
                    </div>
                  )}
                </div>

                <label className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-[#e4e6ea] dark:bg-[#3a3b3c] hover:bg-[#d8dadf] dark:hover:bg-[#4e4f50] flex items-center justify-center cursor-pointer border-2 border-white dark:border-[#242526]">
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) =>
                      handleImageUpload(e.target.files?.[0], "profile")
                    }
                  />

                  {uploading === "profile" ? (
                    <div className="w-4 h-4 border-2 border-[#050505] dark:border-[#e4e6eb] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-5 h-5 text-[#050505] dark:text-[#e4e6eb]"
                    >
                      <path d="M20 5h-3.2l-1.8-2H9L7.2 5H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zM12 18c-2.8 0-5-2.2-5-5s2.2-5 5-5 5 2.2 5 5-2.2 5-5 5zm0-1.8c1.8 0 3.2-1.4 3.2-3.2S13.8 9.8 12 9.8 8.8 11.2 8.8 13s1.4 3.2 3.2 3.2z" />
                    </svg>
                  )}
                </label>
              </div>

              <div className="flex-1 pb-2">
                <h1 className="text-[32px] font-bold text-[#050505] dark:text-[#e4e6eb]">
                  {fullName}
                </h1>

                {profile?.city && (
                  <p className="text-[#606770] dark:text-[#b0b3b8] text-[15px] mt-1">
                    Lives in {profile.city}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 pb-2">
                <button
                  onClick={openEditBio}
                  className="bg-[#1877f2] hover:bg-[#166fe5] text-white px-4 py-2 rounded-lg font-semibold text-[15px] cursor-pointer"
                >
                  Edit profile
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-[#ced0d4] dark:border-[#3a3b3c] px-4 flex  gap-1 sm:gap-0 sm:px-2 gg:px-0">
            <a
              href="#"
              className="px-4 py-3 text-[15px] font-semibold text-[#606770] dark:text-[#b0b3b8] hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c] rounded-lg whitespace-nowrap"
            >
              All
            </a>
            <a
              href="https://www.meta.com/about/?utm_source=about.facebook.com&utm_medium=redirect"
              className="px-4 py-3 text-[15px] font-semibold text-[#606770] dark:text-[#b0b3b8] hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c] rounded-lg whitespace-nowrap"
            >
              About
            </a>
            <a
              href="/friends"
              className="px-4 py-3 text-[15px] font-semibold text-[#606770] dark:text-[#b0b3b8] hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c] rounded-lg whitespace-nowrap"
            >
              Friends
            </a>
            <a
              href="https://www.facebook.com/photos"
              className="px-4 py-3 text-[15px] font-semibold text-[#606770] dark:text-[#b0b3b8] hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c] rounded-lg whitespace-nowrap sl:hidden"
            >
              Photos
            </a>
            <a
              href="https://www.facebook.com/kostava.gio/reels/"
              className="px-4 py-3 text-[15px] font-semibold text-[#606770] dark:text-[#b0b3b8] hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c] rounded-lg whitespace-nowrap gl:hidden"
            >
              Reels
            </a>
            <a
              href="https://www.facebook.com/100006526143813/allactivity/?category_key=ALL&entry_point=profile_shortcut&should_load_landing_page=1"
              className="px-4 py-3 text-[15px] font-semibold text-[#606770] dark:text-[#b0b3b8] hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c] rounded-lg whitespace-nowrap"
            >
              More
            </a>
          </div>
        </div>

        <div className="flex gap-4 mt-4 px-4 pb-8 lg:flex-col">
          <div className="w-[360px] flex-shrink-0 lg:w-full">
            <div className="bg-white dark:bg-[#242526] rounded-lg shadow p-4">
              <h2 className="text-[20px] font-bold text-[#050505] dark:text-[#e4e6eb] mb-3">
                Personal Details
              </h2>

              <div className="mt-3 space-y-2 text-[15px] text-[#050505] dark:text-[#e4e6eb]">
                {profile?.birthday?.day &&
                  profile?.birthday?.month &&
                  profile?.birthday?.year && (
                    <div>
                      Birthday: {profile.birthday.day} {profile.birthday.month}{" "}
                      {profile.birthday.year}
                    </div>
                  )}

                {profile?.gender && (
                  <div className="capitalize">Gender: {profile.gender}</div>
                )}

                {profile?.city && <div>Lives in {profile.city}</div>}

                {!profile?.birthday?.day &&
                  !profile?.birthday?.month &&
                  !profile?.birthday?.year &&
                  !profile?.gender &&
                  !profile?.city && (
                    <p className="text-[#8a8d91] dark:text-[#b0b3b8]">
                      No personal details.
                    </p>
                  )}
              </div>
            </div>

            <div className="bg-white dark:bg-[#242526] rounded-lg shadow p-4 mt-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[20px] font-bold text-[#050505] dark:text-[#e4e6eb]">
                  Friends
                </h2>

                <Link
                  href="/friends/all"
                  className="text-[15px] text-[#1877f2] hover:underline cursor-pointer"
                >
                  See all friends
                </Link>
              </div>

              <p className="text-[15px] text-[#65676b] dark:text-[#b0b3b8] mb-3">
                {friends.length} friend{friends.length !== 1 ? "s" : ""}
              </p>

              {friends.length === 0 ? (
                <p className="text-[15px] text-[#8a8d91] dark:text-[#b0b3b8]">
                  No friends yet.
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {friends.slice(0, 9).map((friend) => (
                    <Link
                      key={friend.uid}
                      href={`/profile/${friend.uid}`}
                      className="cursor-pointer"
                    >
                      <div className="w-full aspect-square rounded-lg overflow-hidden bg-gray-300 dark:bg-[#3a3b3c]">
                        {friend.photoURL ? (
                          <Image
                            src={friend.photoURL}
                            alt={friend.name}
                            width={110}
                            height={110}
                            className="w-full h-full object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full bg-[#1877f2] flex items-center justify-center text-white text-[28px] font-bold">
                            {friend.name[0]?.toUpperCase() || "U"}
                          </div>
                        )}
                      </div>

                      <p className="mt-1 text-[13px] font-semibold text-[#050505] dark:text-[#e4e6eb] truncate">
                        {friend.name}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-4 lg:w-full">
            {posts.length === 0 ? (
              <div className="bg-white dark:bg-[#242526] rounded-lg shadow p-8 text-center">
                <p className="text-[#8a8d91] dark:text-[#b0b3b8] text-[17px]">
                  No posts yet.
                </p>
              </div>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserId={authUser?.uid}
                  currentUserName={fullName}
                  currentUserPhoto={userPhoto}
                  onLike={() => handleLikePost(post)}
                  onComment={() => {}}
                  onShare={() => {}}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {showEditBio && (
        <div
          className="fixed inset-0 z-50 bg-white/70 dark:bg-black/60 flex items-center justify-center px-4"
          onClick={closeEditBio}
        >
          <div
            className="w-[500px] max-w-[calc(100vw-24px)] bg-white dark:bg-[#242526] rounded-lg shadow-[0_12px_28px_rgba(0,0,0,0.25)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-[60px] flex items-center justify-center border-b border-[#dadde1] dark:border-[#3a3b3c]">
              <h2 className="text-[20px] font-bold text-[#050505] dark:text-[#e4e6eb]">
                Edit profile details
              </h2>

              <button
                onClick={closeEditBio}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#e4e6eb] dark:bg-[#3a3b3c] hover:bg-[#d8dadf] dark:hover:bg-[#4e4f50] flex items-center justify-center cursor-pointer"
              >
                <span className="text-[34px] leading-none text-[#65676b] dark:text-[#b0b3b8] font-light">
                  ×
                </span>
              </button>
            </div>

            <div className="p-4">
              <div className="mb-4">
                <span className="block text-[15px] font-semibold text-[#050505] dark:text-[#e4e6eb] mb-2">
                  Birthday
                </span>

                <div className="grid grid-cols-3 gap-2">
                  <input
                    value={birthDayInput}
                    onChange={(e) => setBirthDayInput(e.target.value)}
                    placeholder="Day"
                    className="h-10 rounded-lg border border-[#ccd0d5] dark:border-[#3a3b3c] bg-white dark:bg-[#242526] px-3 outline-none text-[15px] text-[#050505] dark:text-[#e4e6eb] placeholder:text-[#65676b] dark:placeholder:text-[#b0b3b8] focus:border-[#1877f2]"
                  />

                  <input
                    value={birthMonthInput}
                    onChange={(e) => setBirthMonthInput(e.target.value)}
                    placeholder="Month"
                    className="h-10 rounded-lg border border-[#ccd0d5] dark:border-[#3a3b3c] bg-white dark:bg-[#242526] px-3 outline-none text-[15px] text-[#050505] dark:text-[#e4e6eb] placeholder:text-[#65676b] dark:placeholder:text-[#b0b3b8] focus:border-[#1877f2]"
                  />

                  <input
                    value={birthYearInput}
                    onChange={(e) => setBirthYearInput(e.target.value)}
                    placeholder="Year"
                    className="h-10 rounded-lg border border-[#ccd0d5] dark:border-[#3a3b3c] bg-white dark:bg-[#242526] px-3 outline-none text-[15px] text-[#050505] dark:text-[#e4e6eb] placeholder:text-[#65676b] dark:placeholder:text-[#b0b3b8] focus:border-[#1877f2]"
                  />
                </div>
              </div>

              <label className="block mb-4">
                <span className="block text-[15px] font-semibold text-[#050505] dark:text-[#e4e6eb] mb-2">
                  Current city
                </span>

                <input
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                  placeholder="Add city"
                  className="w-full h-10 rounded-lg border border-[#ccd0d5] dark:border-[#3a3b3c] bg-white dark:bg-[#242526] px-3 outline-none text-[15px] text-[#050505] dark:text-[#e4e6eb] placeholder:text-[#65676b] dark:placeholder:text-[#b0b3b8] focus:border-[#1877f2]"
                />
              </label>

              <div className="flex justify-end gap-2">
                <button
                  onClick={closeEditBio}
                  className="h-9 px-4 rounded-md hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c] text-[#1877f2] text-[15px] font-semibold cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSaveBio}
                  disabled={savingBio}
                  className="h-9 px-8 rounded-md bg-[#1877f2] hover:bg-[#166fe5] text-white text-[15px] font-semibold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {savingBio ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

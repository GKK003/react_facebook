"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { onAuthStateChanged, updateProfile } from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "@/firebase/firebase";
import { uploadToCloudinary } from "@/lib/cloudinary";
import Navbar from "@/app/components/__organisms/Navbar";
import PostCard, { Post } from "@/app/components/__molecules/PostCard";
import ProfilePicture from "@/app/components/__atoms/ProfilePicture";
import Link from "next/link";

interface UserProfileData {
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

type RequestStatus = "none" | "pendingSent" | "pendingReceived" | "friends";

type FriendCard = {
  uid: string;
  name: string;
  photoURL: string | null;
};

export default function UserProfile() {
  const router = useRouter();
  const { uid } = useParams<{ uid: string }>();

  const [authUser, setAuthUser] = useState<any>(null);
  const [authProfile, setAuthProfile] = useState<UserProfileData | null>(null);

  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<"profile" | "cover" | null>(null);

  const [requestStatus, setRequestStatus] = useState<RequestStatus>("none");
  const [requestLoading, setRequestLoading] = useState(false);
  const [acceptedSent, setAcceptedSent] = useState<any[]>([]);
  const [acceptedReceived, setAcceptedReceived] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/");
        return;
      }

      setAuthUser(user);

      const authSnap = await getDoc(doc(db, "users", user.uid));

      if (authSnap.exists()) {
        setAuthProfile(authSnap.data() as UserProfileData);
      }
    });

    return () => unsub();
  }, [router]);

  useEffect(() => {
    if (!uid) return;

    const fetchProfile = async () => {
      try {
        const snap = await getDoc(doc(db, "users", uid));

        if (snap.exists()) {
          setProfile(snap.data() as UserProfileData);
        }
      } catch (err) {
        console.error("Fetch profile error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [uid]);

  useEffect(() => {
    if (!uid) return;

    const q = query(
      collection(db, "posts"),
      where("authorId", "==", uid),
      orderBy("createdAt", "desc"),
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        setPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Post[]);
      },
      (err) => {
        console.error("Profile posts listener error:", err);
      },
    );

    return () => unsub();
  }, [uid]);

  useEffect(() => {
    if (!authUser?.uid || !uid || authUser.uid === uid) {
      setRequestStatus("none");
      return;
    }

    const sentRequestId = `${authUser.uid}_${uid}`;
    const receivedRequestId = `${uid}_${authUser.uid}`;

    const sentRef = doc(db, "friendRequests", sentRequestId);
    const receivedRef = doc(db, "friendRequests", receivedRequestId);

    const unsubSent = onSnapshot(
      sentRef,
      (sentSnap) => {
        if (sentSnap.exists()) {
          const data = sentSnap.data();

          if (data.status === "accepted") {
            setRequestStatus("friends");
          } else {
            setRequestStatus("pendingSent");
          }

          return;
        }

        getDoc(receivedRef)
          .then((receivedSnap) => {
            if (receivedSnap.exists()) {
              const data = receivedSnap.data();

              if (data.status === "accepted") {
                setRequestStatus("friends");
              } else {
                setRequestStatus("pendingReceived");
              }
            } else {
              setRequestStatus("none");
            }
          })
          .catch((err) => {
            console.error("Received request check error:", err);
            setRequestStatus("none");
          });
      },
      (err) => {
        console.error("Friend request listener error:", err);
      },
    );

    return () => unsubSent();
  }, [authUser?.uid, uid]);

  useEffect(() => {
    if (!uid) {
      setAcceptedSent([]);
      return;
    }

    const q = query(
      collection(db, "friendRequests"),
      where("fromUid", "==", uid),
      where("status", "==", "accepted"),
    );

    const unsub = onSnapshot(q, (snap) => {
      setAcceptedSent(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, [uid]);

  useEffect(() => {
    if (!uid) {
      setAcceptedReceived([]);
      return;
    }

    const q = query(
      collection(db, "friendRequests"),
      where("toUid", "==", uid),
      where("status", "==", "accepted"),
    );

    const unsub = onSnapshot(q, (snap) => {
      setAcceptedReceived(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, [uid]);

  const isOwnProfile = authUser?.uid === uid;

  const fullName =
    profile?.firstName || profile?.lastName
      ? `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim()
      : "User";

  const profilePhoto = profile?.photoURL || null;

  const navName =
    authProfile?.firstName || authProfile?.lastName
      ? `${authProfile?.firstName || ""} ${authProfile?.lastName || ""}`.trim()
      : authUser?.displayName || "User";

  const navPhoto = authProfile?.photoURL || authUser?.photoURL || null;

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
    if (!file || !authUser?.uid || !isOwnProfile) return;

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

        setAuthProfile((prev) =>
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

  const handleFriendRequest = async () => {
    if (!authUser?.uid || !uid || !profile) return;
    if (authUser.uid === uid) return;

    setRequestLoading(true);

    try {
      const requestId = `${authUser.uid}_${uid}`;
      const reverseRequestId = `${uid}_${authUser.uid}`;

      const requestRef = doc(db, "friendRequests", requestId);
      const reverseRequestRef = doc(db, "friendRequests", reverseRequestId);

      if (requestStatus === "pendingSent") {
        await deleteDoc(requestRef);
        setRequestStatus("none");
        return;
      }

      if (requestStatus === "pendingReceived") {
        alert(
          "This user already sent you a request. You can accept it later in notifications.",
        );
        return;
      }

      if (requestStatus === "friends") {
        return;
      }

      const senderSnap = await getDoc(doc(db, "users", authUser.uid));
      const senderData = senderSnap.exists()
        ? (senderSnap.data() as UserProfileData)
        : null;

      const fromName =
        senderData?.firstName || senderData?.lastName
          ? `${senderData?.firstName || ""} ${senderData?.lastName || ""}`.trim()
          : authUser.displayName || "User";

      const toName =
        profile.firstName || profile.lastName
          ? `${profile.firstName || ""} ${profile.lastName || ""}`.trim()
          : "User";

      const reverseSnap = await getDoc(reverseRequestRef);

      if (reverseSnap.exists()) {
        setRequestStatus("pendingReceived");
        return;
      }

      await setDoc(requestRef, {
        fromUid: authUser.uid,
        toUid: uid,
        fromName,
        fromPhoto: senderData?.photoURL || authUser.photoURL || null,
        toName,
        toPhoto: profile.photoURL || null,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      setRequestStatus("pendingSent");
    } catch (err) {
      console.error("Friend request error:", err);
      alert("Friend request failed.");
    } finally {
      setRequestLoading(false);
    }
  };

  const getFriendButtonText = () => {
    if (requestLoading) return "Loading...";
    if (requestStatus === "pendingSent") return "Cancel request";
    if (requestStatus === "pendingReceived") return "Respond";
    if (requestStatus === "friends") return "Friends";
    return "Add friend";
  };

  if (loading) {
    return <div className="min-h-screen bg-[#f0f2f5] dark:bg-[#18191a]" />;
  }

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
          displayName: navName,
          photoURL: navPhoto,
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

            {isOwnProfile && (
              <label className="absolute bottom-4 right-4 flex items-center gap-2 bg-white dark:bg-[#3a3b3c] hover:bg-[#f0f2f5] dark:hover:bg-[#4e4f50] px-3 py-2 rounded-lg text-[15px] font-semibold text-[#050505] dark:text-[#e4e6eb] cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) =>
                    handleImageUpload(e.target.files?.[0], "cover")
                  }
                />

                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5 flex-shrink-0"
                >
                  <path d="M20 5h-3.2l-1.8-2H9L7.2 5H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zM12 18c-2.8 0-5-2.2-5-5s2.2-5 5-5 5 2.2 5 5-2.2 5-5 5z" />
                </svg>

                <span className="max-[360px]:hidden">
                  {uploading === "cover" ? "Uploading..." : "Edit cover photo"}
                </span>
              </label>
            )}
          </div>

          <div className="px-4 pb-4">
            <div className="flex items-end justify-between -mt-[52px] flex-wrap gap-4 gh:flex-col gh:items-start">
              <div className="relative">
                <ProfilePicture
                  uid={uid}
                  src={profilePhoto}
                  name={fullName}
                  size={168}
                  live
                  className="border-4 border-white dark:border-[#242526] bg-[#c9cdd2] dark:bg-[#3a3b3c]"
                  textClassName="text-[64px] font-bold"
                />

                {isOwnProfile && (
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
                )}
              </div>

              <div className="flex-1 pb-2">
                <h1 className="text-[32px] font-bold text-[#050505] dark:text-[#e4e6eb]">
                  {fullName}
                </h1>

                {profile?.bio && (
                  <p className="text-[#606770] dark:text-[#b0b3b8] text-[16px]">
                    {profile.bio}
                  </p>
                )}

                {profile?.city && (
                  <p className="text-[#606770] dark:text-[#b0b3b8] text-[15px] mt-1">
                    Lives in {profile.city}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 pb-2">
                {isOwnProfile ? (
                  <button className="bg-[#1877f2] hover:bg-[#166fe5] text-white px-4 py-2 rounded-lg font-semibold text-[15px]">
                    Edit profile
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleFriendRequest}
                      disabled={requestLoading}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-[15px] transition-colors disabled:opacity-70 ${
                        requestStatus === "none"
                          ? "bg-[#1877f2] hover:bg-[#166fe5] text-white"
                          : "bg-[#e4e6ea] dark:bg-[#3a3b3c] hover:bg-[#d8dadf] dark:hover:bg-[#4e4f50] text-[#050505] dark:text-[#e4e6eb]"
                      }`}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-5 h-5"
                      >
                        <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>

                      {getFriendButtonText()}
                    </button>

                    <button className="flex items-center gap-2 bg-[#e4e6ea] dark:bg-[#3a3b3c] hover:bg-[#d8dadf] dark:hover:bg-[#4e4f50] text-[#050505] dark:text-[#e4e6eb] px-4 py-2 rounded-lg font-semibold text-[15px] transition-colors">
                      Message
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-[#ced0d4] dark:border-[#3a3b3c] px-4 flex flex-wrap gap-1 sm:gap-0 sm:px-2 gg:px-0">
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

              <div className="space-y-2 text-[15px] text-[#050505] dark:text-[#e4e6eb]">
                {profile?.birthday && (
                  <div>
                    Birthday: {profile.birthday.day} {profile.birthday.month}{" "}
                    {profile.birthday.year}
                  </div>
                )}

                {profile?.gender && (
                  <div className="capitalize">Gender: {profile.gender}</div>
                )}

                {profile?.city && <div>Lives in {profile.city}</div>}

                {!profile?.birthday && !profile?.gender && (
                  <p className="text-[#8a8d91] dark:text-[#b0b3b8]">
                    No Personal information.
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
                  href={`/profile/${uid}/friends`}
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
                      <ProfilePicture
                        uid={friend.uid}
                        src={friend.photoURL}
                        name={friend.name}
                        width="100%"
                        height="auto"
                        live
                        className="aspect-square rounded-lg bg-gray-300 dark:bg-[#3a3b3c]"
                        textClassName="text-[28px] font-bold"
                      />

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
                  currentUserName={navName}
                  currentUserPhoto={navPhoto}
                  onLike={() => handleLikePost(post)}
                  onComment={() => {}}
                  onShare={() => {}}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

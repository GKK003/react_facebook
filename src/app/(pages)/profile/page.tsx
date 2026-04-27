"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
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
import Navbar from "@/app/components/__organisms/Navbar";
import PostCard, { Post } from "@/app/components/__molecules/PostCard";
import Image from "next/image";

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
  birthday: { day: string; month: string; year: string };
  photoURL?: string | null;
  coverPhotoURL?: string | null;
  bio?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [authUser, setAuthUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

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

  const handleLikePost = async (post: Post) => {
    if (!authUser?.uid) return;

    const postRef = doc(db, "posts", post.id);

    const alreadyLiked = Array.isArray(post.likes)
      ? post.likes.includes(authUser.uid)
      : false;

    await updateDoc(postRef, {
      likes: alreadyLiked
        ? arrayRemove(authUser.uid)
        : arrayUnion(authUser.uid),
    });
  };

  if (loading) return <div className="min-h-screen bg-[#f0f2f5]" />;

  const fullName =
    profile?.firstName || profile?.lastName
      ? `${profile.firstName || ""} ${profile.lastName || ""}`.trim()
      : authUser?.displayName || "Giorgi";

  const userPhoto = profile?.photoURL || authUser?.photoURL || null;

  return (
    <div className="min-h-screen bg-[#f0f2f5]">
      <Navbar
        user={{
          displayName: fullName,
          photoURL: userPhoto,
        }}
        activePage="home"
      />

      <div className="pt-[56px] max-w-[1100px] mx-auto">
        <div className="bg-white rounded-b-lg shadow">
          <div className="relative h-[350px] bg-gradient-to-b from-[#b0b3b8] to-[#606770] rounded-b-lg overflow-hidden">
            {profile?.coverPhotoURL ? (
              <Image
                src={profile.coverPhotoURL}
                alt="Cover"
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#c9cdd2]" />
            )}

            <button className="absolute bottom-4 right-4 flex items-center gap-2 bg-white hover:bg-[#f0f2f5] px-3 py-2 rounded-lg text-[15px] font-semibold text-[#050505]">
              Edit cover photo
            </button>
          </div>

          <div className="px-4 pb-4">
            <div className="flex items-end justify-between -mt-[52px] flex-wrap gap-4">
              <div className="relative">
                <div className="w-[168px] h-[168px] rounded-full border-4 border-white overflow-hidden bg-[#c9cdd2] relative">
                  {userPhoto ? (
                    <Image
                      src={userPhoto}
                      alt={fullName}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#1877f2] flex items-center justify-center text-white text-[64px] font-bold">
                      {fullName[0]?.toUpperCase() || "G"}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 pb-2">
                <h1 className="text-[32px] font-bold text-[#050505]">
                  {fullName}
                </h1>

                {profile?.bio && (
                  <p className="text-[#606770] text-[16px]">{profile.bio}</p>
                )}
              </div>

              <div className="flex items-center gap-2 pb-2">
                <button className="bg-[#1877f2] hover:bg-[#166fe5] text-white px-4 py-2 rounded-lg font-semibold text-[15px]">
                  Edit profile
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-[#ced0d4] px-4 flex gap-1">
            {["Posts", "About", "Friends", "Photos"].map((tab) => (
              <button
                key={tab}
                className="px-4 py-3 text-[15px] font-semibold text-[#606770] hover:bg-[#f0f2f5] rounded-lg"
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-4 mt-4 px-4 pb-8">
          <div className="w-[360px] flex-shrink-0">
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-[20px] font-bold text-[#050505] mb-3">
                Intro
              </h2>

              <button className="w-full py-2 bg-[#e4e6ea] hover:bg-[#d8dadf] rounded-lg text-[15px] font-semibold text-[#050505]">
                Add bio
              </button>

              <div className="mt-3 space-y-2 text-[15px] text-[#050505]">
                {profile?.birthday && (
                  <div>
                    Birthday: {profile.birthday.day}/{profile.birthday.month}/
                    {profile.birthday.year}
                  </div>
                )}

                {profile?.gender && (
                  <div className="capitalize">{profile.gender}</div>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-4">
            {posts.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-[#8a8d91] text-[17px]">No posts yet.</p>
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
    </div>
  );
}

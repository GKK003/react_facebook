"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
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

export default function UserProfilePage() {
  const router = useRouter();
  const { uid } = useParams<{ uid: string }>();
  const [authUser, setAuthUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/");
        return;
      }
      setAuthUser(user);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!uid) return;
    const fetchProfile = async () => {
      const snap = await getDoc(doc(db, "users", uid));
      if (snap.exists()) setProfile(snap.data() as UserProfile);
      setLoading(false);
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
    const unsub = onSnapshot(q, (snap) => {
      setPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Post[]);
    });
    return () => unsub();
  }, [uid]);

  if (loading) return <div className="min-h-screen bg-[#f0f2f5]" />;

  const fullName = profile ? `${profile.firstName} ${profile.lastName}` : "";
  const isOwnProfile = authUser?.uid === uid;

  return (
    <div className="min-h-screen bg-[#f0f2f5]">
      <Navbar
        user={{
          displayName: authUser?.displayName,
          photoURL: authUser?.photoURL,
        }}
        activePage="home"
      />

      <div className="pt-[56px] max-w-[1100px] mx-auto">
        <div className="bg-white rounded-b-lg shadow">
          <div className="relative h-[350px] rounded-b-lg overflow-hidden">
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
          </div>

          <div className="px-4 pb-4">
            <div className="flex items-end justify-between -mt-[52px] flex-wrap gap-4">
              <div className="relative w-[168px] h-[168px] rounded-full border-4 border-white overflow-hidden bg-[#c9cdd2]">
                {profile?.photoURL ? (
                  <Image
                    src={profile.photoURL}
                    alt={fullName}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#c9cdd2] flex items-center justify-center">
                    <svg
                      viewBox="0 0 24 24"
                      fill="#8a8d91"
                      className="w-24 h-24"
                    >
                      <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                    </svg>
                  </div>
                )}
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
                {isOwnProfile ? (
                  <button className="flex items-center gap-2 bg-[#1877f2] hover:bg-[#166fe5] text-white px-4 py-2 rounded-lg font-semibold text-[15px] transition-colors">
                    Edit profile
                  </button>
                ) : (
                  <>
                    <button className="flex items-center gap-2 bg-[#1877f2] hover:bg-[#166fe5] text-white px-4 py-2 rounded-lg font-semibold text-[15px] transition-colors">
                      <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-5 h-5"
                      >
                        <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                      Add friend
                    </button>
                    <button className="flex items-center gap-2 bg-[#e4e6ea] hover:bg-[#d8dadf] text-[#050505] px-4 py-2 rounded-lg font-semibold text-[15px] transition-colors">
                      Message
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-[#ced0d4] px-4 flex gap-1">
            {["Posts", "About", "Friends", "Photos"].map((tab) => (
              <button
                key={tab}
                className="px-4 py-3 text-[15px] font-semibold text-[#606770] hover:bg-[#f0f2f5] rounded-lg transition-colors"
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
              <div className="space-y-2 text-[15px] text-[#050505]">
                {profile?.birthday && (
                  <div className="flex items-center gap-2">
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-5 h-5 text-[#606770]"
                    >
                      <path d="M12 6c1.1 0 2-.9 2-2 0-.38-.1-.73-.29-1.03L12 0l-1.71 2.97c-.19.3-.29.65-.29 1.03 0 1.1.9 2 2 2zm4.6 9.99l-1.07-1.07-1.08 1.07c-1.3 1.3-3.58 1.31-4.89 0l-1.07-1.07-1.09 1.07C6.75 17.64 5.88 18 4.96 18c-.73 0-1.4-.23-1.96-.61V22c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-4.61c-.56.38-1.23.61-1.96.61-.92 0-1.79-.36-2.44-1.01zM18 9H6c-1.1 0-2 .9-2 2v2.47c0 .73.4 1.41 1.02 1.74.68.36 1.53.22 2.05-.3l2.14-2.13 2.14 2.13c.74.74 2.03.74 2.77 0l2.14-2.13 2.14 2.13c.52.52 1.37.66 2.05.3C20.6 14.88 21 14.2 21 13.47V11c0-1.1-.9-2-2-2z" />
                    </svg>
                    <span>
                      Birthday: {profile.birthday.day}/{profile.birthday.month}/
                      {profile.birthday.year}
                    </span>
                  </div>
                )}
                {profile?.gender && (
                  <div className="flex items-center gap-2">
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-5 h-5 text-[#606770]"
                    >
                      <path d="M12 2a5 5 0 100 10A5 5 0 0012 2zm0 12c-5.33 0-8 2.67-8 4v2h16v-2c0-1.33-2.67-4-8-4z" />
                    </svg>
                    <span className="capitalize">{profile.gender}</span>
                  </div>
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
                  currentUserName={
                    profile
                      ? `${profile.firstName} ${profile.lastName}`
                      : "User"
                  }
                  currentUserPhoto={
                    profile?.photoURL || authUser?.photoURL || null
                  }
                  onLike={() => {}}
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

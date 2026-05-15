"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
  deleteDoc,
} from "firebase/firestore";

import { auth, db } from "@/firebase/firebase";
import Navbar from "@/app/components/__organisms/Navbar";
import { Post } from "@/app/components/__molecules/PostCard";
import ProfilePicture from "@/app/components/__atoms/ProfilePicture";

type User = {
  uid: string;
  displayName: string | null;
  photoURL: string | null;
};

type SavedPost = {
  id: string;
  postId: string;
  userId: string;
  savedAt: any;
  post: Post | null;
};

export default function SavedPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [savedPosts, setSavedPosts] = useState<SavedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        router.push("/");
        return;
      }

      setUser({
        uid: firebaseUser.uid,
        displayName: firebaseUser.displayName || "User",
        photoURL: firebaseUser.photoURL,
      });
    });

    return () => unsub();
  }, [router]);

  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, "savedPosts"),
      where("userId", "==", user.uid),
    );

    const unsub = onSnapshot(
      q,
      async (snap) => {
        const data = await Promise.all(
          snap.docs.map(async (savedDoc) => {
            const savedData = savedDoc.data();
            const postSnap = await getDoc(doc(db, "posts", savedData.postId));

            return {
              id: savedDoc.id,
              postId: savedData.postId,
              userId: savedData.userId,
              savedAt: savedData.savedAt,
              post: postSnap.exists()
                ? ({ id: postSnap.id, ...postSnap.data() } as Post)
                : null,
            };
          }),
        );

        const sorted = data
          .filter((item) => item.post !== null)
          .sort((a, b) => {
            const aTime = a.savedAt?.toDate ? a.savedAt.toDate().getTime() : 0;
            const bTime = b.savedAt?.toDate ? b.savedAt.toDate().getTime() : 0;
            return bTime - aTime;
          });

        setSavedPosts(sorted);
        setLoading(false);
      },
      (err) => {
        console.error("Saved posts listener error:", err);
        setLoading(false);
      },
    );

    return () => unsub();
  }, [user?.uid]);

  const handleUnsave = async (savedId: string) => {
    try {
      await deleteDoc(doc(db, "savedPosts", savedId));
      setOpenMenuId(null);
    } catch (err) {
      console.error("Unsave post error:", err);
    }
  };

  const getPostTitle = (post: Post) => {
    if (post.text && post.text.trim()) {
      return post.text.trim().slice(0, 70);
    }

    if (post.mediaType === "image") return "Photo";
    if (post.mediaType === "video") return "Video";

    return "Saved post";
  };

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] dark:bg-[#18191a]">
        <Navbar user={user} activePage="home" />

        <div className="pt-[90px] text-center text-[#65676b] dark:text-[#b0b3b8]">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-[#18191a]">
      <Navbar user={user} activePage="home" />

      <div className="pt-[56px] flex">
        <div className="fixed left-0 top-[56px] bottom-0 w-[360px] bg-white dark:bg-[#242526] border-r border-[#dddfe2] dark:border-[#3a3b3c] p-4 overflow-y-auto lg:hidden">
          <h1 className="text-[24px] font-bold text-[#050505] dark:text-[#e4e6eb] mb-4">
            Saved
          </h1>

          <button className="w-full flex items-center gap-3 px-2 py-2 rounded-lg bg-[#e7f3ff] text-[#1877f2] text-[15px] font-semibold cursor-pointer">
            <span className="w-9 h-9 rounded-full bg-[#1877f2] flex items-center justify-center text-white shrink-0">
              <svg
                viewBox="0 0 20 20"
                width={20}
                height={20}
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M14.75 3.5a.75.75 0 0 0 0-1.5H6.196c-1.132 0-2.058 0-2.79.098-.763.103-1.425.325-1.954.854C.923 3.48.7 4.142.598 4.907.5 5.637.5 6.563.5 7.697v5.053a.75.75 0 0 0 1.5 0v-5c0-1.2.002-2.024.085-2.643.08-.598.224-.89.428-1.094.203-.204.496-.348 1.094-.428C4.226 3.502 5.05 3.5 6.25 3.5h8.5zM10 8.25a.75.75 0 0 1 .75-.75h5a.75.75 0 0 1 0 1.5h-5a.75.75 0 0 1-.75-.75z" />
                <path d="M8.5 8.25a1.25 1.25 0 1 1-2.5 0 1.25 1.25 0 0 1 2.5 0z" />
                <path d="M19.495 11.804v-1.608c0-1.132 0-2.058-.098-2.79-.103-.763-.325-1.425-.854-1.954-.528-.529-1.19-.751-1.955-.854-.73-.098-1.656-.098-2.79-.098H8.692c-1.132 0-2.058 0-2.789.098-.764.103-1.426.325-1.955.854-.529.529-.751 1.19-.854 1.955-.098.73-.098 1.656-.098 2.79v1.607c0 1.133 0 2.058.098 2.79.103.763.325 1.425.854 1.954.529.529 1.191.751 1.955.854.73.098 1.657.098 2.79.098H13.8c1.133 0 2.058 0 2.79-.098.763-.103 1.426-.325 1.954-.854.529-.529.751-1.19.854-1.955.098-.73.098-1.656.098-2.79zm-2.012-5.291c.203.203.347.496.427 1.094.084.619.085 1.443.085 2.643v.25h-13.5v-.25c0-1.2.002-2.024.085-2.643.08-.598.224-.89.428-1.094.203-.204.496-.348 1.094-.428C6.72 6.002 7.545 6 8.745 6h5c1.2 0 2.024.002 2.643.085.598.08.891.224 1.095.428z" />
              </svg>
            </span>

            <span>Saved items</span>
          </button>
        </div>

        <div className="ml-[360px] lg:ml-0 flex-1 px-6 py-5">
          <div className="max-w-[860px]">
            {savedPosts.length === 0 ? (
              <div className="bg-white dark:bg-[#242526] rounded-xl shadow-sm border border-[#dddfe2] dark:border-[#3a3b3c] p-10 text-center">
                <svg
                  viewBox="0 0 20 20"
                  width={20}
                  height={20}
                  fill="currentColor"
                  aria-hidden="true"
                  className="text-white"
                >
                  <path d="M14.75 3.5a.75.75 0 0 0 0-1.5H6.196c-1.132 0-2.058 0-2.79.098-.763.103-1.425.325-1.954.854C.923 3.48.7 4.142.598 4.907.5 5.637.5 6.563.5 7.697v5.053a.75.75 0 0 0 1.5 0v-5c0-1.2.002-2.024.085-2.643.08-.598.224-.89.428-1.094.203-.204.496-.348 1.094-.428C4.226 3.502 5.05 3.5 6.25 3.5h8.5zM10 8.25a.75.75 0 0 1 .75-.75h5a.75.75 0 0 1 0 1.5h-5a.75.75 0 0 1-.75-.75z" />
                  <path d="M8.5 8.25a1.25 1.25 0 1 1-2.5 0 1.25 1.25 0 0 1 2.5 0z" />
                  <path d="M19.495 11.804v-1.608c0-1.132 0-2.058-.098-2.79-.103-.763-.325-1.425-.854-1.954-.528-.529-1.19-.751-1.955-.854-.73-.098-1.656-.098-2.79-.098H8.692c-1.132 0-2.058 0-2.789.098-.764.103-1.426.325-1.955.854-.529.529-.751 1.19-.854 1.955-.098.73-.098 1.656-.098 2.79v1.607c0 1.133 0 2.058.098 2.79.103.763.325 1.425.854 1.954.529.529 1.191.751 1.955.854.73.098 1.657.098 2.79.098H13.8c1.133 0 2.058 0 2.79-.098.763-.103 1.426-.325 1.954-.854.529-.529.751-1.19.854-1.955.098-.73.098-1.656.098-2.79zm-2.012-5.291c.203.203.347.496.427 1.094.084.619.085 1.443.085 2.643v.25h-13.5v-.25c0-1.2.002-2.024.085-2.643.08-.598.224-.89.428-1.094.203-.204.496-.348 1.094-.428C6.72 6.002 7.545 6 8.745 6h5c1.2 0 2.024.002 2.643.085.598.08.891.224 1.095.428z" />
                </svg>

                <p className="text-[20px] font-bold text-[#050505] dark:text-[#e4e6eb]">
                  No saved posts yet
                </p>

                <p className="text-[15px] text-[#65676b] dark:text-[#b0b3b8] mt-1">
                  Posts you save will appear here.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {savedPosts.map((saved) => {
                  const post = saved.post;
                  if (!post) return null;

                  return (
                    <div
                      key={saved.id}
                      className="relative bg-white dark:bg-[#242526] rounded-xl shadow-sm border border-[#dddfe2] dark:border-[#3a3b3c] p-4"
                    >
                      <div className="flex gap-4">
                        <button
                          type="button"
                          onClick={() => router.push("/feed")}
                          className="w-[144px] h-[144px] rounded-lg overflow-hidden bg-[#e4e6eb] dark:bg-[#3a3b3c] flex-shrink-0 cursor-pointer"
                        >
                          {post.mediaURL && post.mediaType === "image" ? (
                            <Image
                              src={post.mediaURL}
                              alt=""
                              width={144}
                              height={144}
                              className="w-full h-full object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[#1877f2] text-white text-[40px] font-bold">
                              {(post.authorName || "U")[0].toUpperCase()}
                            </div>
                          )}
                        </button>

                        <div className="flex-1 min-w-0">
                          <button
                            type="button"
                            onClick={() => router.push("/feed")}
                            className="text-left text-[22px] leading-[26px] font-bold text-[#050505] dark:text-[#e4e6eb] hover:underline cursor-pointer line-clamp-2"
                          >
                            {getPostTitle(post)}
                          </button>

                          <div className="mt-1 text-[13px] text-[#65676b] dark:text-[#b0b3b8]">
                            Post
                            {post.mediaType === "image" && " · 1 photo"}
                            {post.authorName && ` · ${post.authorName}`}
                          </div>

                          <div className="mt-2 flex items-center gap-2 text-[14px] text-[#65676b] dark:text-[#b0b3b8]">
                            <ProfilePicture
                              uid={post.authorId}
                              src={post.authorPhoto}
                              name={post.authorName}
                              size={28}
                              live
                              className="bg-gray-300 dark:bg-[#3a3b3c]"
                              textClassName="text-[12px] font-bold"
                            />

                            <span className="truncate">
                              Saved from{" "}
                              <b className="text-[#050505] dark:text-[#e4e6eb]">
                                {post.authorName || "User"}'s post
                              </b>
                            </span>
                          </div>

                          <div className="mt-8 flex items-center gap-2">
                            <button
                              type="button"
                              className="h-9 min-w-[196px] px-4 rounded-md bg-[#e4e6eb] hover:bg-[#d8dadf] dark:bg-[#3a3b3c] dark:hover:bg-[#4e4f50] text-[#050505] dark:text-[#e4e6eb] text-[15px] font-semibold cursor-pointer"
                            >
                              Add to collection
                            </button>

                            <button
                              type="button"
                              className="h-9 w-12 rounded-md bg-[#e4e6eb] hover:bg-[#d8dadf] dark:bg-[#3a3b3c] dark:hover:bg-[#4e4f50] flex items-center justify-center cursor-pointer"
                            >
                              <svg
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="w-5 h-5 text-[#050505] dark:text-[#e4e6eb]"
                              >
                                <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7a3.27 3.27 0 0 0 0-1.39l7.05-4.11A2.99 2.99 0 1 0 15 5c0 .23.03.45.08.66L8.03 9.77a3 3 0 1 0 0 4.46l7.12 4.18c-.05.19-.08.39-.08.59a2.93 2.93 0 1 0 2.93-2.92z" />
                              </svg>
                            </button>

                            <div className="relative">
                              <button
                                type="button"
                                onClick={() =>
                                  setOpenMenuId(
                                    openMenuId === saved.id ? null : saved.id,
                                  )
                                }
                                className="h-9 w-12 rounded-md bg-[#e4e6eb] hover:bg-[#d8dadf] dark:bg-[#3a3b3c] dark:hover:bg-[#4e4f50] flex items-center justify-center cursor-pointer"
                              >
                                <span className="text-[22px] leading-none text-[#050505] dark:text-[#e4e6eb]">
                                  ...
                                </span>
                              </button>

                              {openMenuId === saved.id && (
                                <>
                                  <div
                                    className="fixed inset-0 z-20"
                                    onClick={() => setOpenMenuId(null)}
                                  />

                                  <div className="absolute left-1/2 -translate-x-1/2 top-[46px] z-30 w-[344px] bg-white dark:bg-[#242526] rounded-lg shadow-[0_4px_16px_rgba(0,0,0,0.22)] border border-[#dddfe2] dark:border-[#3a3b3c] p-2">
                                    <button
                                      type="button"
                                      onClick={() => handleUnsave(saved.id)}
                                      className="w-full flex items-center gap-3 px-3 py-3 rounded-md hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c] cursor-pointer text-left"
                                    >
                                      <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        className="w-6 h-6 text-[#050505] dark:text-[#e4e6eb]"
                                      >
                                        <path d="M6.5 4.75c0-.97.78-1.75 1.75-1.75h7.5c.97 0 1.75.78 1.75 1.75v16l-5.5-3.3-5.5 3.3v-16z" />
                                        <path d="M5 5l14 14" />
                                      </svg>

                                      <span className="text-[15px] font-semibold text-[#050505] dark:text-[#e4e6eb]">
                                        Unsave
                                      </span>
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

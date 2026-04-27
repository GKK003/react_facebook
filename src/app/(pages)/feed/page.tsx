"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { auth, db } from "@/firebase/firebase";

import Navbar from "@/app/components/__organisms/Navbar";
import LeftSidebar from "@/app/components/__organisms/LeftSidebar";
import RightSidebar from "@/app/components/__organisms/RightSidebar";
import StoriesRow from "@/app/components/__molecules/StoriesRow";
import CreatePostBox from "@/app/components/__molecules/CreatePostBox";
import PostCard, { Post } from "@/app/components/__molecules/PostCard";

interface User {
  displayName: string | null;
  photoURL: string | null;
  uid: string;
}

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [postText, setPostText] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          displayName: firebaseUser.displayName || "Giorgi",
          photoURL: firebaseUser.photoURL,
          uid: firebaseUser.uid,
        });
      } else {
        router.push("/");
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as Post[];

        setPosts(data);
      },
      (error) => {
        console.error("Posts listener error:", error);
      },
    );

    return () => unsub();
  }, []);

  const handleCreatePost = async () => {
    if (!postText.trim() || !user) return;

    setPosting(true);

    try {
      await addDoc(collection(db, "posts"), {
        authorId: user.uid,
        authorName: user.displayName || "Giorgi",
        authorPhoto: user.photoURL || null,
        text: postText.trim(),
        createdAt: serverTimestamp(),
        likes: [],
        comments: 0,
        shares: 0,
      });

      setPostText("");
      setShowCreatePost(false);
    } catch (err) {
      console.error("Create post error:", err);
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (post: Post) => {
    const userId = user?.uid || auth.currentUser?.uid;
    if (!userId) return;

    const postRef = doc(db, "posts", post.id);

    const alreadyLiked = Array.isArray(post.likes)
      ? post.likes.includes(userId)
      : false;

    try {
      await updateDoc(postRef, {
        likes: alreadyLiked ? arrayRemove(userId) : arrayUnion(userId),
      });
    } catch (err) {
      console.error("Like update error:", err);
    }
  };

  const handleComment = (postId: string) =>
    console.log("Comment on post", postId);

  const handleShare = (postId: string) => console.log("Share post", postId);

  return (
    <div className="min-h-screen bg-[#f0f2f5]">
      <Navbar user={user} activePage="home" />

      <div className="flex pt-[56px] max-w-[1920px] mx-auto">
        <LeftSidebar user={user} />

        <div className="flex-1 min-w-0 py-4 px-4 max-w-[680px] mx-auto">
          <div className="flex flex-col gap-4">
            <CreatePostBox user={user} onOpen={() => setShowCreatePost(true)} />

            <div className="bg-transparent">
              <StoriesRow user={user} stories={[]} />
            </div>

            <div className="flex items-center justify-between px-1">
              <span className="text-[17px] font-bold text-[#050505]">
                Posts
              </span>

              <button className="flex items-center gap-1.5 bg-[#e4e6ea] hover:bg-[#d8dadf] transition-colors rounded-lg px-3 py-1.5 text-[15px] font-semibold text-[#050505]">
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-4 h-4"
                >
                  <path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z" />
                </svg>
                Filters
              </button>
            </div>

            {loading ? (
              <div className="flex flex-col gap-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg shadow p-4 animate-pulse"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-[#e4e6ea]" />
                      <div className="flex-1">
                        <div className="h-4 bg-[#e4e6ea] rounded w-32 mb-2" />
                        <div className="h-3 bg-[#e4e6ea] rounded w-20" />
                      </div>
                    </div>
                    <div className="h-4 bg-[#e4e6ea] rounded mb-2" />
                    <div className="h-4 bg-[#e4e6ea] rounded w-3/4 mb-4" />
                    <div className="h-48 bg-[#e4e6ea] rounded" />
                  </div>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-[#8a8d91] text-[17px]">No posts yet.</p>
              </div>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserId={user?.uid}
                  currentUserName={user?.displayName || "Giorgi"}
                  currentUserPhoto={user?.photoURL || null}
                  onLike={() => handleLike(post)}
                  onComment={handleComment}
                  onShare={handleShare}
                />
              ))
            )}
          </div>
        </div>

        <RightSidebar />
      </div>

      {showCreatePost && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => setShowCreatePost(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-[500px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative flex items-center justify-center py-4 border-b border-[#ced0d4]">
              <h2 className="text-[20px] font-bold text-[#050505]">
                Create post
              </h2>

              <button
                onClick={() => setShowCreatePost(false)}
                className="absolute right-4 w-9 h-9 rounded-full bg-[#e4e6ea] hover:bg-[#d8dadf] flex items-center justify-center transition-colors"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5 text-[#606770]"
                >
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </button>
            </div>

            <div className="flex items-center gap-2 px-4 py-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-300 flex-shrink-0">
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#1877f2] flex items-center justify-center text-white font-semibold">
                    {user?.displayName?.[0]?.toUpperCase() || "G"}
                  </div>
                )}
              </div>

              <div>
                <p className="text-[15px] font-semibold text-[#050505]">
                  {user?.displayName || "Giorgi"}
                </p>

                <button className="flex items-center gap-1 bg-[#e4e6ea] rounded-md px-2 py-0.5 text-[13px] font-semibold text-[#050505] hover:bg-[#d8dadf] transition-colors">
                  Friends
                </button>
              </div>
            </div>

            <div className="px-4 pb-2">
              <textarea
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.ctrlKey) handleCreatePost();
                }}
                placeholder={`What's on your mind, ${
                  user?.displayName?.split(" ")[0] || "you"
                }?`}
                className="w-full resize-none outline-none text-[20px] text-[#050505] placeholder-[#8a8d91] min-h-[120px]"
                autoFocus
              />
            </div>

            <div className="px-4 pb-4">
              <button
                onClick={handleCreatePost}
                disabled={!postText.trim() || posting}
                className="w-full bg-[#1877f2] hover:bg-[#166fe5] disabled:bg-[#e4e6ea] disabled:text-[#bcc0c4] disabled:cursor-not-allowed text-white font-semibold text-[17px] py-2 rounded-lg transition-colors"
              >
                {posting ? "Posting..." : "Post"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

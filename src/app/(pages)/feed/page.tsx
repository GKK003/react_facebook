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
import { uploadToCloudinary } from "@/lib/cloudinary";

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

  const [postFile, setPostFile] = useState<File | null>(null);
  const [previewURL, setPreviewURL] = useState<string | null>(null);

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

  const resetCreatePost = () => {
    setPostText("");
    setPostFile(null);

    if (previewURL) {
      URL.revokeObjectURL(previewURL);
    }

    setPreviewURL(null);
  };

  const closeCreatePost = () => {
    resetCreatePost();
    setShowCreatePost(false);
  };

  const handleFileSelect = (file: File | undefined) => {
    if (!file) return;

    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      alert("Please choose an image or video.");
      return;
    }

    setPostFile(file);

    if (previewURL) {
      URL.revokeObjectURL(previewURL);
    }

    setPreviewURL(URL.createObjectURL(file));
  };

  const handleCreatePost = async () => {
    if ((!postText.trim() && !postFile) || !user) return;

    setPosting(true);

    try {
      let mediaURL: string | null = null;
      let mediaType: "image" | "video" | null = null;

      if (postFile) {
        mediaType = postFile.type.startsWith("video/") ? "video" : "image";
        mediaURL = await uploadToCloudinary(postFile);
      }

      await addDoc(collection(db, "posts"), {
        authorId: user.uid,
        authorName: user.displayName || "Giorgi",
        authorPhoto: user.photoURL || null,
        text: postText.trim(),
        mediaURL,
        mediaType,
        createdAt: serverTimestamp(),
        likes: [],
        comments: 0,
        shares: 0,
      });

      resetCreatePost();
      setShowCreatePost(false);
    } catch (err: any) {
      console.error("Create post error:", err);
      alert(err.message || "Post upload failed.");
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
          className="fixed inset-0 z-50 bg-white/70 backdrop-blur-[1px] flex items-start justify-center pt-[80px] px-4"
          onClick={closeCreatePost}
        >
          <div
            className="w-[500px] max-h-[90vh] bg-white rounded-xl shadow-[0_12px_28px_rgba(0,0,0,0.25)] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-[60px] flex items-center justify-center border-b border-[#dadde1]">
              <h2 className="text-[20px] font-bold text-[#050505]">
                Create post
              </h2>

              <button
                onClick={closeCreatePost}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#e4e6eb] hover:bg-[#d8dadf] flex items-center justify-center transition-colors"
              >
                <span className="text-[34px] leading-none text-[#65676b] font-light">
                  ×
                </span>
              </button>
            </div>

            <div className="px-4 pt-3 pb-4">
              <div className="flex items-center gap-3 mb-3">
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
                  <p className="text-[15px] leading-[18px] font-semibold text-[#050505]">
                    {user?.displayName || "Giorgi"}
                  </p>

                  <button
                    type="button"
                    className="mt-1 h-[24px] px-2 rounded-md bg-[#e4e6eb] hover:bg-[#d8dadf] flex items-center gap-1 text-[13px] font-semibold text-[#050505]"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-3.5 h-3.5"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm6.93 6h-2.95a15.7 15.7 0 00-1.38-3.56A8.05 8.05 0 0118.93 8zM12 4.04c.83 1.2 1.48 2.52 1.87 3.96h-3.74A13.4 13.4 0 0112 4.04zM4.26 14a8.2 8.2 0 010-4h3.35a16.8 16.8 0 000 4H4.26zm.81 2h2.95c.32 1.25.79 2.45 1.38 3.56A8.05 8.05 0 015.07 16zm2.95-8H5.07A8.05 8.05 0 019.4 4.44 15.7 15.7 0 008.02 8zM12 19.96A13.4 13.4 0 0110.13 16h3.74A13.4 13.4 0 0112 19.96zM14.3 14H9.7a14.7 14.7 0 010-4h4.6a14.7 14.7 0 010 4zm.3 5.56c.59-1.11 1.06-2.31 1.38-3.56h2.95a8.05 8.05 0 01-4.33 3.56zM16.39 14a16.8 16.8 0 000-4h3.35a8.2 8.2 0 010 4h-3.35z" />
                    </svg>
                    Friends
                    <svg
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-3.5 h-3.5"
                    >
                      <path d="M5.5 7.5L10 12l4.5-4.5h-9z" />
                    </svg>
                  </button>
                </div>
              </div>

              <textarea
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                placeholder={`What's on your mind, ${
                  user?.displayName?.split(" ")[0] || "you"
                }?`}
                className="w-full min-h-[135px] resize-none border-none outline-none text-[24px] leading-[30px] text-[#050505] placeholder-[#65676b]"
                autoFocus
              />

              {previewURL && postFile && (
                <div className="relative rounded-lg overflow-hidden border border-[#ced0d4] mb-3">
                  <button
                    onClick={() => {
                      setPostFile(null);
                      if (previewURL) URL.revokeObjectURL(previewURL);
                      setPreviewURL(null);
                    }}
                    className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-white shadow flex items-center justify-center text-[22px] text-[#050505]"
                  >
                    ×
                  </button>

                  {postFile.type.startsWith("video/") ? (
                    <video
                      src={previewURL}
                      controls
                      className="w-full max-h-[190px] object-cover"
                    />
                  ) : (
                    <img
                      src={previewURL}
                      alt="Preview"
                      className="w-full max-h-[260px] object-cover"
                    />
                  )}
                </div>
              )}

              <div className="flex items-center justify-between mb-3">
                <button
                  type="button"
                  className="w-9 h-9 rounded-lg overflow-hidden shadow-sm hover:brightness-95"
                >
                  <div className="w-full h-full bg-gradient-to-br from-red-500 via-yellow-400 to-blue-500 flex items-center justify-center text-white font-bold text-[17px]">
                    Aa
                  </div>
                </button>

                <button
                  type="button"
                  className="w-9 h-9 rounded-full hover:bg-[#f0f2f5] flex items-center justify-center"
                >
                  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                      stroke="#8a8d91"
                      strokeWidth="2"
                    />
                    <circle cx="9" cy="10" r="1.2" fill="#8a8d91" />
                    <circle cx="15" cy="10" r="1.2" fill="#8a8d91" />
                    <path
                      d="M8 14c1 1.5 2.3 2.2 4 2.2s3-.7 4-2.2"
                      stroke="#8a8d91"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>

              <div className="h-[58px] border border-[#ced0d4] rounded-lg flex items-center justify-between px-4 mb-4">
                <span className="text-[15px] font-semibold text-[#050505]">
                  Add to your post
                </span>

                <div className="flex items-center gap-2">
                  <label className="w-9 h-9 rounded-full hover:bg-[#f0f2f5] flex items-center justify-center cursor-pointer">
                    <input
                      type="file"
                      accept="image/*,video/*"
                      hidden
                      onChange={(e) => handleFileSelect(e.target.files?.[0])}
                    />

                    <svg viewBox="0 0 24 24" fill="#45bd62" className="w-7 h-7">
                      <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                    </svg>
                  </label>

                  <button className="w-9 h-9 rounded-full hover:bg-[#f0f2f5] flex items-center justify-center">
                    <svg viewBox="0 0 24 24" fill="#1877f2" className="w-7 h-7">
                      <path d="M16 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zM8 11c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                    </svg>
                  </button>

                  <button className="w-9 h-9 rounded-full hover:bg-[#f0f2f5] flex items-center justify-center">
                    <svg viewBox="0 0 24 24" fill="#f7b928" className="w-7 h-7">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM8.5 9C9.33 9 10 9.67 10 10.5S9.33 12 8.5 12 7 11.33 7 10.5 7.67 9 8.5 9zm7 0c.83 0 1.5.67 1.5 1.5S16.33 12 15.5 12 14 11.33 14 10.5 14.67 9 15.5 9zM12 17.5c-2.1 0-3.9-1.1-4.8-2.75h9.6C15.9 16.4 14.1 17.5 12 17.5z" />
                    </svg>
                  </button>

                  <button className="w-9 h-9 rounded-full hover:bg-[#f0f2f5] flex items-center justify-center">
                    <svg viewBox="0 0 24 24" fill="#f5533d" className="w-7 h-7">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1112 6a2.5 2.5 0 010 5.5z" />
                    </svg>
                  </button>

                  <button className="w-9 h-9 rounded-full hover:bg-[#f0f2f5] flex items-center justify-center">
                    <span className="bg-[#20c997] text-white text-[12px] font-bold px-1 rounded">
                      GIF
                    </span>
                  </button>

                  <button className="w-9 h-9 rounded-full hover:bg-[#f0f2f5] flex items-center justify-center">
                    <span className="text-[24px] text-[#65676b] leading-none">
                      ...
                    </span>
                  </button>
                </div>
              </div>

              <button
                onClick={handleCreatePost}
                disabled={(!postText.trim() && !postFile) || posting}
                className="w-full h-[40px] rounded-lg bg-[#1877f2] hover:bg-[#166fe5] disabled:bg-[#e4e6eb] disabled:text-[#bcc0c4] disabled:hover:bg-[#e4e6eb] disabled:cursor-not-allowed text-white text-[15px] font-semibold transition-colors"
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

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
import StoriesRow, { Story } from "@/app/components/__molecules/StoriesRow";
import CreatePostBox from "@/app/components/__molecules/CreatePostBox";
import PostCard, { Post } from "@/app/components/__molecules/PostCard";
import CreatePostPopup from "@/app/components/__organisms/CreatePostPopup";

interface User {
  displayName: string | null;
  photoURL: string | null;
  uid: string;
}

export default function Feed() {
  const router = useRouter();

  const [stories, setStories] = useState<Story[]>([]);

  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const [showCreatePost, setShowCreatePost] = useState(false);
  const [postText, setPostText] = useState("");
  const [posting, setPosting] = useState(false);

  const [postFile, setPostFile] = useState<File | null>(null);
  const [previewURL, setPreviewURL] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "stories"), orderBy("createdAt", "desc"));

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as Story[];

        setStories(data);
      },
      (error) => {
        console.error("Stories listener error:", error);
      },
    );

    return () => unsub();
  }, []);

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
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-[#18191a]">
      <Navbar user={user} activePage="home" />
      <div className="flex pt-[56px] max-w-[1920px] mx-auto justify-center gap-4">
        <LeftSidebar user={user} />

        <div className="w-full min-w-[500px] max-w-[680px] flex-shrink-0 py-4 px-4 xx:min-w-0 xx:flex-shrink">
          <div className="flex flex-col gap-4">
            <CreatePostBox user={user} onOpen={() => setShowCreatePost(true)} />

            <div className="bg-transparent">
              <StoriesRow user={user} stories={stories} />{" "}
            </div>

            <div className="flex items-center justify-between px-1">
              <span className="text-[17px] font-bold text-[#050505] dark:text-[#e4e6eb]">
                Posts
              </span>

              <button className="flex items-center gap-1.5 bg-[#e4e6ea] dark:bg-[#3a3b3c] hover:bg-[#d8dadf] dark:hover:bg-[#4e4f50] transition-colors rounded-lg px-3 py-1.5 text-[15px] font-semibold text-[#050505] dark:text-[#e4e6eb]">
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
              <div className="bg-white dark:bg-[#242526] rounded-lg shadow p-8 text-center">
                {" "}
                <p className="text-[#8a8d91] dark:text-[#b0b3b8] text-[17px]">
                  No posts yet.
                </p>{" "}
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
        <CreatePostPopup
          user={user}
          postText={postText}
          setPostText={setPostText}
          postFile={postFile}
          setPostFile={setPostFile}
          previewURL={previewURL}
          setPreviewURL={setPreviewURL}
          posting={posting}
          closeCreatePost={closeCreatePost}
          handleCreatePost={handleCreatePost}
          handleFileSelect={handleFileSelect}
        />
      )}
    </div>
  );
}

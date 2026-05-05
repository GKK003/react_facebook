"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import {
  deleteDoc,
  doc,
  collection,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
} from "firebase/firestore";
import { auth, db } from "@/firebase/firebase";

export interface Post {
  id: string;
  authorName: string;
  authorPhoto: string | null;
  authorId: string;
  text: string;
  mediaURL?: string;
  mediaType?: "image" | "video";
  createdAt: any;
  likes: string[];
  comments: number;
  shares: number;
}

interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorPhoto: string | null;
  text: string;
  createdAt: any;
  likes: string[];
}

interface LikedUser {
  uid: string;
  name: string;
  photoURL: string | null;
}

interface PostCardProps {
  post: Post;
  currentUserId?: string;
  currentUserName?: string | null;
  currentUserPhoto?: string | null;
  onLike?: (post: Post) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
}

export default function PostCard({
  post,
  currentUserId,
  currentUserName,
  currentUserPhoto,
  onShare,
}: PostCardProps) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [showMore, setShowMore] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const commentInputRef = useRef<HTMLInputElement>(null);

  const userId = currentUserId || auth.currentUser?.uid;

  const safeCurrentUserName =
    currentUserName && currentUserName.trim() !== ""
      ? currentUserName.trim()
      : auth.currentUser?.displayName || "Giorgi";

  const safeCurrentUserPhoto =
    currentUserPhoto || auth.currentUser?.photoURL || null;

  useEffect(() => {
    setLiked(userId ? post.likes?.includes(userId) : false);
    setLikesCount(Array.isArray(post.likes) ? post.likes.length : 0);
  }, [post.likes, userId]);

  useEffect(() => {
    if (!showComments && !showCommentModal) return;

    const q = query(
      collection(db, "posts", post.id, "comments"),
      orderBy("createdAt", "asc"),
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        setComments(
          snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Comment[],
        );
      },
      (error) => {
        console.error("Comments listener error:", error);
      },
    );

    return () => unsub();
  }, [showComments, showCommentModal, post.id]);

  const openLikesPopup = async () => {
    if (!Array.isArray(post.likes) || post.likes.length === 0) return;

    setShowLikesPopup(true);
    setLikesLoading(true);

    try {
      const users = await Promise.all(
        post.likes.map(async (uid) => {
          const snap = await getDoc(doc(db, "users", uid));

          if (snap.exists()) {
            const data = snap.data();

            const name =
              `${data.firstName || ""} ${data.lastName || ""}`.trim() ||
              data.email ||
              "User";

            return {
              uid,
              name,
              photoURL: data.photoURL || null,
            };
          }

          return {
            uid,
            name: "User",
            photoURL: null,
          };
        }),
      );

      setLikedUsers(users);
    } catch (err) {
      console.error("Likes popup error:", err);
    } finally {
      setLikesLoading(false);
    }
  };

  const handleLike = async () => {
    if (!userId) return;

    const alreadyLiked = Array.isArray(post.likes)
      ? post.likes.includes(userId)
      : false;

    setLiked(!alreadyLiked);
    setLikesCount((prev) => (alreadyLiked ? Math.max(prev - 1, 0) : prev + 1));

    try {
      await updateDoc(doc(db, "posts", post.id), {
        likes: alreadyLiked ? arrayRemove(userId) : arrayUnion(userId),
      });
    } catch (err) {
      console.error("Like save error:", err);
      setLiked(alreadyLiked);
      setLikesCount((prev) =>
        alreadyLiked ? prev + 1 : Math.max(prev - 1, 0),
      );
    }
  };

  const openCommentModal = () => {
    setShowComments(true);
    setShowCommentModal(true);
    setTimeout(() => commentInputRef.current?.focus(), 100);
  };

  const [showLikesPopup, setShowLikesPopup] = useState(false);
  const [likedUsers, setLikedUsers] = useState<LikedUser[]>([]);
  const [likesLoading, setLikesLoading] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, "posts", post.id));
      setDeleted(true);
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim() || submitting) return;

    if (!userId) {
      console.error("No user ID. Comment blocked.");
      return;
    }

    setSubmitting(true);

    try {
      await addDoc(collection(db, "posts", post.id, "comments"), {
        authorId: userId,
        authorName: safeCurrentUserName,
        authorPhoto: safeCurrentUserPhoto,
        text: commentText.trim(),
        createdAt: serverTimestamp(),
        likes: [],
      });

      setCommentText("");
      setShowComments(true);
    } catch (err) {
      console.error("Comment error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const isLongContent = (post.text || "").length > 250;
  const displayContent =
    isLongContent && !showMore ? post.text.slice(0, 250) + "..." : post.text;

  const formattedDate = post.createdAt?.toDate
    ? post.createdAt.toDate().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Just now";

  if (deleted) return null;

  if (hidden) {
    return (
      <div className="bg-white rounded-lg shadow px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-[15px] font-semibold text-[#050505]">
            Post hidden
          </p>
          <p className="text-[13px] text-[#8a8d91]">
            You won't see this post in your feed
          </p>
        </div>

        <button
          onClick={() => setHidden(false)}
          className="text-[#1877f2] font-semibold text-[15px] hover:underline"
        >
          Undo
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow">
        <div className="flex items-start justify-between px-4 pt-3 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-300">
              {post.authorPhoto ? (
                <Image
                  src={post.authorPhoto}
                  alt={post.authorName || "User"}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[#1877f2] flex items-center justify-center text-white font-semibold text-sm">
                  {(post.authorName || "U")[0].toUpperCase()}
                </div>
              )}
            </div>

            <div>
              <p className="text-[15px] font-semibold text-[#050505] leading-tight">
                {post.authorName || "User"}
              </p>
              <span className="text-[13px] text-[#8a8d91]">
                {formattedDate}
              </span>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="w-9 h-9 rounded-full hover:bg-[#f0f2f5] flex items-center justify-center"
            >
              <span className="text-xl text-[#606770]">•••</span>
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />

                <div className="absolute right-0 top-10 w-[260px] bg-white rounded-lg shadow-xl border z-20 py-1">
                  <button
                    onClick={() => {
                      setHidden(true);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-[#f0f2f5] text-[15px] font-semibold"
                  >
                    Hide post
                  </button>

                  {userId === post.authorId && (
                    <button
                      onClick={() => {
                        handleDelete();
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-[#f0f2f5] text-[15px] font-semibold text-[#f02849]"
                    >
                      Delete post
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {post.text && (
          <div className="px-4 pb-2">
            <p className="text-[15px] text-[#050505] whitespace-pre-wrap">
              {displayContent}
              {isLongContent && (
                <button
                  onClick={() => setShowMore(!showMore)}
                  className="text-[#8a8d91] font-semibold hover:underline ml-1"
                >
                  {showMore ? " See less" : " See more"}
                </button>
              )}
            </p>
          </div>
        )}

        {post.mediaURL && post.mediaType === "image" && (
          <button
            onClick={openCommentModal}
            className="relative w-full bg-[#f0f2f5] max-h-[500px] overflow-hidden block"
          >
            <Image
              src={post.mediaURL}
              alt="Post media"
              width={600}
              height={400}
              className="w-full object-cover"
            />
          </button>
        )}

        {post.mediaURL && post.mediaType === "video" && (
          <div className="relative w-full bg-black">
            <video
              src={post.mediaURL}
              controls
              className="w-full max-h-[500px] object-contain"
            />
          </div>
        )}

        {(likesCount > 0 || comments.length > 0) && (
          <div className="flex items-center justify-between px-4 py-2 text-[15px] text-[#8a8d91] ">
            <div>
              {likesCount > 0 && (
                <button
                  onClick={openLikesPopup}
                  className="flex items-center gap-1 "
                >
                  <span className="w-[18px] h-[18px] rounded-full bg-[#1877f2] flex items-center justify-center text-[10px]">
                    👍
                  </span>
                  <span className="hover:underline cursor-pointer">
                    {likesCount.toLocaleString()}
                  </span>
                </button>
              )}{" "}
            </div>

            {comments.length > 0 && (
              <button onClick={openCommentModal} className="hover:underline">
                {comments.length} comment{comments.length !== 1 ? "s" : ""}
              </button>
            )}
          </div>
        )}

        <hr className="border-[#ced0d4] mx-4" />

        <div className="flex items-center px-2 py-1">
          <button
            onClick={handleLike}
            className={`flex-1 py-1.5 rounded-lg hover:bg-[#f0f2f5] font-semibold ${
              liked ? "text-[#1877f2]" : "text-[#606770]"
            }`}
          >
            Like
          </button>

          <button
            onClick={openCommentModal}
            className="flex-1 py-1.5 rounded-lg hover:bg-[#f0f2f5] font-semibold text-[#606770]"
          >
            Comment
          </button>

          <button
            onClick={() => onShare?.(post.id)}
            className="flex-1 py-1.5 rounded-lg hover:bg-[#f0f2f5] font-semibold text-[#606770]"
          >
            Share
          </button>
        </div>
      </div>

      {showCommentModal && (
        <div
          className="fixed inset-0 z-50 bg-white/70 flex items-center justify-center px-4"
          onClick={() => setShowCommentModal(false)}
        >
          <div
            className="w-full max-w-[880px] h-[86vh] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-[72px] flex items-center justify-center border-b border-[#e4e6ea] shrink-0">
              <h2 className="text-[22px] font-bold text-[#050505]">
                {post.authorName?.split(" ")[0] || "User"}'s post
              </h2>

              <button
                onClick={() => setShowCommentModal(false)}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-[#e4e6ea] hover:bg-[#d8dadf] flex items-center justify-center text-[34px] leading-none"
              >
                ×
              </button>
            </div>

            {post.mediaURL && post.mediaType === "image" && (
              <div className="w-full max-h-[260px] overflow-hidden bg-black shrink-0">
                <img
                  src={post.mediaURL}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {post.mediaURL && post.mediaType === "video" && (
              <div className="w-full max-h-[260px] bg-black shrink-0">
                <video
                  src={post.mediaURL}
                  controls
                  className="w-full max-h-[260px] object-contain"
                />
              </div>
            )}

            {!post.mediaURL && post.text && (
              <div className="px-4 py-4 border-b border-[#e4e6ea] shrink-0">
                <p className="text-[16px] text-[#050505] whitespace-pre-wrap">
                  {post.text}
                </p>
              </div>
            )}

            <div className="px-4 py-2 flex items-center justify-between text-[15px] text-[#65676b] shrink-0">
              <div className="flex items-center gap-1">
                {likesCount > 0 && (
                  <>
                    <span className="w-5 h-5 rounded-full bg-[#1877f2] flex items-center justify-center text-white text-[11px]">
                      👍
                    </span>
                    <span>{likesCount.toLocaleString()}</span>
                  </>
                )}
              </div>

              <span>
                {comments.length} comment{comments.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="border-y border-[#e4e6ea] mx-4 flex shrink-0">
              <button
                onClick={handleLike}
                className={`flex-1 py-2 rounded-md hover:bg-[#f0f2f5] font-semibold ${
                  liked ? "text-[#1877f2]" : "text-[#65676b]"
                }`}
              >
                👍 Like
              </button>

              <button
                onClick={() => commentInputRef.current?.focus()}
                className="flex-1 py-2 rounded-md hover:bg-[#f0f2f5] font-semibold text-[#65676b]"
              >
                💬 Comment
              </button>

              <button
                onClick={() => onShare?.(post.id)}
                className="flex-1 py-2 rounded-md hover:bg-[#f0f2f5] font-semibold text-[#65676b]"
              >
                ↗ Share
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3">
              <button className="text-[16px] font-semibold text-[#65676b] mb-4">
                Most relevant ▾
              </button>

              <div className="flex flex-col gap-3">
                {comments.map((c) => {
                  const commentName = c.authorName || "User";

                  return (
                    <div key={c.id} className="flex items-start gap-2">
                      <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-300 flex-shrink-0">
                        {c.authorPhoto ? (
                          <img
                            src={c.authorPhoto}
                            alt={commentName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-[#1877f2] flex items-center justify-center text-white text-sm font-semibold">
                            {commentName[0].toUpperCase()}
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="bg-[#f0f2f5] rounded-2xl px-3 py-2 inline-block">
                          <p className="text-[13px] font-bold text-[#050505]">
                            {commentName}
                          </p>
                          <p className="text-[15px] text-[#050505]">{c.text}</p>
                        </div>

                        <div className="flex items-center gap-3 mt-1 px-2">
                          <span className="text-[12px] text-[#65676b]">
                            {c.createdAt?.toDate
                              ? c.createdAt
                                  .toDate()
                                  .toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                  })
                              : "Just now"}
                          </span>
                          <button className="text-[12px] font-bold text-[#65676b]">
                            Like
                          </button>
                          <button className="text-[12px] font-bold text-[#65676b]">
                            Reply
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="px-4 py-3 border-t border-[#e4e6ea] flex items-start gap-2 shrink-0">
              <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-300 flex-shrink-0">
                {safeCurrentUserPhoto ? (
                  <img
                    src={safeCurrentUserPhoto}
                    alt={safeCurrentUserName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#1877f2] flex items-center justify-center text-white text-sm font-semibold">
                    {safeCurrentUserName[0].toUpperCase()}
                  </div>
                )}
              </div>

              <div className="relative flex-1 bg-[#f0f2f5] rounded-2xl px-4 py-2 pr-12">
                <input
                  ref={commentInputRef}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !submitting) {
                      handleSubmitComment();
                    }
                  }}
                  placeholder="Write a comment..."
                  className="w-full bg-transparent outline-none text-[15px]"
                />

                {commentText.trim() && (
                  <button
                    onClick={handleSubmitComment}
                    disabled={submitting}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1877f2] font-bold disabled:opacity-50"
                  >
                    ➤
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {showLikesPopup && (
        <div
          className="fixed inset-0 z-50 bg-white/70 flex items-center justify-center px-4"
          onClick={() => setShowLikesPopup(false)}
        >
          <div
            className="w-full max-w-[500px] max-h-[80vh] bg-white rounded-xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-[60px] flex items-center justify-center border-b border-[#e4e6ea]">
              <h2 className="text-[20px] font-bold text-[#050505]">Likes</h2>

              <button
                onClick={() => setShowLikesPopup(false)}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#e4e6ea] hover:bg-[#d8dadf] flex items-center justify-center text-[30px] leading-none text-[#65676b]"
              >
                ×
              </button>
            </div>

            <div className="p-3 overflow-y-auto max-h-[calc(80vh-60px)]">
              {likesLoading ? (
                <div className="py-6 text-center text-[15px] text-[#65676b]">
                  Loading...
                </div>
              ) : likedUsers.length === 0 ? (
                <div className="py-6 text-center text-[15px] text-[#65676b]">
                  No likes yet.
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {likedUsers.map((user) => (
                    <a
                      key={user.uid}
                      href={`/profile/${user.uid}`}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#f0f2f5]"
                    >
                      <div className="w-11 h-11 rounded-full overflow-hidden bg-gray-300 flex-shrink-0">
                        {user.photoURL ? (
                          <img
                            src={user.photoURL}
                            alt={user.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-[#1877f2] flex items-center justify-center text-white font-semibold">
                            {user.name[0]?.toUpperCase() || "U"}
                          </div>
                        )}
                      </div>

                      <span className="text-[15px] font-semibold text-[#050505]">
                        {user.name}
                      </span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

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
  where,
  serverTimestamp,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
} from "firebase/firestore";
import { auth, db } from "@/firebase/firebase";
import TimeAgoText from "./TimeAgo";

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

type ShareFriend = {
  uid: string;
  name: string;
  photoURL: string | null;
};

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
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [shareText, setShareText] = useState("");
  const [sharing, setSharing] = useState(false);
  const [shareFriends, setShareFriends] = useState<ShareFriend[]>([]);
  const [showLikesPopup, setShowLikesPopup] = useState(false);
  const [likedUsers, setLikedUsers] = useState<LikedUser[]>([]);
  const [likesLoading, setLikesLoading] = useState(false);

  const userId = currentUserId || auth.currentUser?.uid;

  const safeCurrentUserName =
    currentUserName && currentUserName.trim() !== ""
      ? currentUserName.trim()
      : auth.currentUser?.displayName || "Giorgi";

  const safeCurrentUserPhoto =
    currentUserPhoto || auth.currentUser?.photoURL || null;

  useEffect(() => {
    if (!userId || !showSharePopup) return;

    const q = query(
      collection(db, "friendRequests"),
      where("status", "==", "accepted"),
    );

    const unsub = onSnapshot(q, (snap) => {
      const map = new Map<string, ShareFriend>();

      snap.docs.forEach((docSnap) => {
        const request = docSnap.data();

        if (request.fromUid === userId) {
          map.set(request.toUid, {
            uid: request.toUid,
            name: request.toName || "User",
            photoURL: request.toPhoto || null,
          });
        }

        if (request.toUid === userId) {
          map.set(request.fromUid, {
            uid: request.fromUid,
            name: request.fromName || "User",
            photoURL: request.fromPhoto || null,
          });
        }
      });

      setShareFriends(
        Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name)),
      );
    });

    return () => unsub();
  }, [userId, showSharePopup]);

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

  const handleSharePost = async () => {
    if (!userId || sharing) return;

    setSharing(true);

    try {
      await addDoc(collection(db, "posts"), {
        authorId: userId,
        authorName: safeCurrentUserName,
        authorPhoto: safeCurrentUserPhoto,
        text: shareText.trim(),
        mediaURL: post.mediaURL || null,
        mediaType: post.mediaType || null,
        sharedPostId: post.id,
        sharedAuthorId: post.authorId,
        sharedAuthorName: post.authorName || "User",
        sharedText: post.text || "",
        createdAt: serverTimestamp(),
        likes: [],
        comments: 0,
        shares: 0,
      });

      setShareText("");
      setShowSharePopup(false);
    } catch (err) {
      console.error("Share post error:", err);
      alert("Could not share post.");
    } finally {
      setSharing(false);
    }
  };

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

  if (deleted) return null;

  if (hidden) {
    return (
      <div className="bg-white dark:bg-[#242526] rounded-lg shadow px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-[15px] font-semibold text-[#050505] dark:text-[#e4e6eb]">
            Post hidden
          </p>
          <p className="text-[13px] text-[#8a8d91] dark:text-[#b0b3b8]">
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
      <div className="bg-white dark:bg-[#242526] rounded-lg shadow">
        <div className="flex items-start justify-between px-4 pt-3 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-300 dark:bg-[#3a3b3c]">
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
              <p className="text-[15px] font-semibold text-[#050505] dark:text-[#e4e6eb] leading-tight">
                {post.authorName || "User"}
              </p>
              <span className="text-[13px] text-[#8a8d91] dark:text-[#b0b3b8]">
                <TimeAgoText date={post.createdAt} />
              </span>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="w-9 h-9 rounded-full hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c] flex items-center justify-center"
            >
              <span className="text-xl text-[#606770] dark:text-[#b0b3b8]">
                •••
              </span>
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />

                <div className="absolute right-0 top-10 w-[260px] bg-white dark:bg-[#242526] rounded-lg shadow-xl border border-[#ced0d4] dark:border-[#3a3b3c] z-20 py-1">
                  <button
                    onClick={() => {
                      setHidden(true);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c] text-[15px] font-semibold text-[#050505] dark:text-[#e4e6eb]"
                  >
                    Hide post
                  </button>

                  {userId === post.authorId && (
                    <button
                      onClick={() => {
                        handleDelete();
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c] text-[15px] font-semibold text-[#f02849]"
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
            <p className="text-[15px] text-[#050505] dark:text-[#e4e6eb] whitespace-pre-wrap">
              {displayContent}
              {isLongContent && (
                <button
                  onClick={() => setShowMore(!showMore)}
                  className="text-[#8a8d91] dark:text-[#b0b3b8] font-semibold hover:underline ml-1"
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
            className="w-full bg-[#f0f2f5] dark:bg-[#18191a] overflow-hidden block flex items-center justify-center"
          >
            <Image
              src={post.mediaURL}
              alt="Post media"
              width={900}
              height={700}
              className="w-full max-h-[650px] object-contain bg-[#f0f2f5] dark:bg-[#18191a]"
              unoptimized
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
          <div className="flex items-center justify-between px-4 py-2 text-[15px] text-[#8a8d91] dark:text-[#b0b3b8]">
            <div>
              {likesCount > 0 && (
                <button
                  onClick={openLikesPopup}
                  className="flex items-center gap-1"
                >
                  <img
                    className="w-[18px] h-[18px]"
                    height={18}
                    width={18}
                    alt="Like"
                    src="data:image/svg+xml,%3Csvg fill='none' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M16.0001 7.9996c0 4.418-3.5815 7.9996-7.9995 7.9996S.001 12.4176.001 7.9996 3.5825 0 8.0006 0C12.4186 0 16 3.5815 16 7.9996Z' fill='url(%23paint0_linear_15251_63610)'/%3E%3Cpath d='M16.0001 7.9996c0 4.418-3.5815 7.9996-7.9995 7.9996S.001 12.4176.001 7.9996 3.5825 0 8.0006 0C12.4186 0 16 3.5815 16 7.9996Z' fill='url(%23paint1_radial_15251_63610)'/%3E%3Cpath d='M16.0001 7.9996c0 4.418-3.5815 7.9996-7.9995 7.9996S.001 12.4176.001 7.9996 3.5825 0 8.0006 0C12.4186 0 16 3.5815 16 7.9996Z' fill='url(%23paint2_radial_15251_63610)' fill-opacity='.5'/%3E%3Cpath d='M7.3014 3.8662a.6974.6974 0 0 1 .6974-.6977c.6742 0 1.2207.5465 1.2207 1.2206v1.7464a.101.101 0 0 0 .101.101h1.7953c.992 0 1.7232.9273 1.4917 1.892l-.4572 1.9047a2.301 2.301 0 0 1-2.2374 1.764H6.9185a.5752.5752 0 0 1-.5752-.5752V7.7384c0-.4168.097-.8278.2834-1.2005l.2856-.5712a3.6878 3.6878 0 0 0 .3893-1.6509l-.0002-.4496ZM4.367 7a.767.767 0 0 0-.7669.767v3.2598a.767.767 0 0 0 .767.767h.767a.3835.3835 0 0 0 .3835-.3835V7.3835A.3835.3835 0 0 0 5.134 7h-.767Z' fill='%23fff'/%3E%3Cdefs%3E%3CradialGradient id='paint1_radial_15251_63610' cx='0' cy='0' r='1' gradientUnits='userSpaceOnUse' gradientTransform='rotate(90 .0005 8) scale(7.99958)'%3E%3Cstop offset='.5618' stop-color='%230866FF' stop-opacity='0'/%3E%3Cstop offset='1' stop-color='%230866FF' stop-opacity='.1'/%3E%3C/radialGradient%3E%3CradialGradient id='paint2_radial_15251_63610' cx='0' cy='0' r='1' gradientUnits='userSpaceOnUse' gradientTransform='rotate(45 -4.5257 10.9237) scale(10.1818)'%3E%3Cstop offset='.3143' stop-color='%2302ADFC'/%3E%3Cstop offset='1' stop-color='%2302ADFC' stop-opacity='0'/%3E%3C/radialGradient%3E%3ClinearGradient id='paint0_linear_15251_63610' x1='2.3989' y1='2.3999' x2='13.5983' y2='13.5993' gradientUnits='userSpaceOnUse'%3E%3Cstop stop-color='%2302ADFC'/%3E%3Cstop offset='.5' stop-color='%230866FF'/%3E%3Cstop offset='1' stop-color='%232B7EFF'/%3E%3C/linearGradient%3E%3C/defs%3E%3C/svg%3E"
                  />
                  <span className="hover:underline cursor-pointer">
                    {likesCount.toLocaleString()}
                  </span>
                </button>
              )}
            </div>

            {comments.length > 0 && (
              <button onClick={openCommentModal} className="hover:underline">
                {comments.length} comment{comments.length !== 1 ? "s" : ""}
              </button>
            )}
          </div>
        )}

        <hr className="border-[#ced0d4] dark:border-[#3a3b3c] mx-4" />

        <div className="flex items-center px-2 py-1">
          <button
            onClick={handleLike}
            className={`flex-1 py-2 rounded-md hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c] font-semibold flex items-center justify-center gap-2 ${
              liked ? "text-[#1877f2]" : "text-[#65676b] dark:text-[#b0b3b8]"
            }`}
          >
            <i
              data-visualcompletion="css-img"
              style={{
                backgroundImage:
                  "url('https://static.xx.fbcdn.net/rsrc.php/yd/r/Fv2SXGWpLpB.webp?_nc_eui2=AeGJ4UCCkeCtw-5MGO2vHLchr_rM-2-GSAKv-sz7b4ZIAnias0V3Za5hrWAB6k-WmVrFCxOfbmnm1NaTkD_aAjFE')",
                backgroundPosition: liked ? "0px -613px" : "0px -697px",
                backgroundSize: "auto",
                width: "20px",
                height: "20px",
                backgroundRepeat: "no-repeat",
                display: "inline-block",
                filter: liked
                  ? "invert(39%) sepia(57%) saturate(200%) saturate(200%) saturate(200%) saturate(147.75%) hue-rotate(202deg) brightness(97%) contrast(96%)"
                  : "none",
              }}
            />

            <span>Like</span>
          </button>

          <button
            onClick={openCommentModal}
            className="flex-1 py-1.5 rounded-lg hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c] font-semibold text-[#606770] dark:text-[#b0b3b8] flex items-center justify-center gap-2"
          >
            <i
              data-visualcompletion="css-img"
              style={{
                backgroundImage:
                  "url('https://static.xx.fbcdn.net/rsrc.php/yd/r/Fv2SXGWpLpB.webp?_nc_eui2=AeGJ4UCCkeCtw-5MGO2vHLchr_rM-2-GSAKv-sz7b4ZIAnias0V3Za5hrWAB6k-WmVrFCxOfbmnm1NaTkD_aAjFE')",
                backgroundPosition: "0px -487px",
                backgroundSize: "auto",
                width: "20px",
                height: "20px",
                backgroundRepeat: "no-repeat",
                display: "inline-block",
              }}
            />
            <span>Comment</span>
          </button>

          <button
            onClick={() => setShowSharePopup(true)}
            className="flex-1 py-1.5 rounded-lg hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c] font-semibold text-[#606770] dark:text-[#b0b3b8] flex items-center justify-center gap-2"
          >
            <i
              data-visualcompletion="css-img"
              style={{
                backgroundImage:
                  "url('https://static.xx.fbcdn.net/rsrc.php/yd/r/Fv2SXGWpLpB.webp?_nc_eui2=AeGJ4UCCkeCtw-5MGO2vHLchr_rM-2-GSAKv-sz7b4ZIAnias0V3Za5hrWAB6k-WmVrFCxOfbmnm1NaTkD_aAjFE')",
                backgroundPosition: "0px -844px",
                backgroundSize: "auto",
                width: "20px",
                height: "20px",
                backgroundRepeat: "no-repeat",
                display: "inline-block",
              }}
            />
            <span>Share</span>
          </button>
        </div>
      </div>

      {showCommentModal && (
        <div
          className="fixed inset-0 z-50 bg-white/70 dark:bg-black/60 flex items-center justify-center px-4"
          onClick={() => setShowCommentModal(false)}
        >
          <div
            className="w-[760px] max-w-[calc(100vw-24px)] max-h-[90vh] bg-white dark:bg-[#242526] rounded-lg shadow-[0_12px_28px_rgba(0,0,0,0.25)] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-[72px] flex items-center justify-center border-b border-[#e4e6ea] dark:border-[#3a3b3c]">
              <h2 className="max-w-[calc(100%-120px)] truncate text-center text-[22px] font-bold text-[#050505] dark:text-[#e4e6eb]">
                {post.authorName || "User"}'s post
              </h2>
              <button
                onClick={() => setShowCommentModal(false)}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-[#e4e6ea] dark:bg-[#3a3b3c] hover:bg-[#d8dadf] dark:hover:bg-[#4e4f50] flex items-center justify-center text-[34px] leading-none text-[#65676b] dark:text-[#b0b3b8]"
              >
                ×
              </button>
            </div>

            <div className="px-4 py-3 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-300 dark:bg-[#3a3b3c] flex-shrink-0">
                {post.authorPhoto ? (
                  <img
                    src={post.authorPhoto}
                    alt={post.authorName || "User"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#1877f2] flex items-center justify-center text-white font-semibold text-[18px]">
                    {(post.authorName || "U")[0].toUpperCase()}
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <p className="text-[17px] font-semibold text-[#050505] dark:text-[#e4e6eb] leading-[20px] truncate">
                  {post.authorName || "User"}
                </p>

                <div className="flex items-center gap-1 text-[13px] text-[#65676b] dark:text-[#b0b3b8] leading-[16px]">
                  <span>
                    {post.createdAt?.toDate
                      ? post.createdAt.toDate().toLocaleDateString()
                      : "Just now"}
                  </span>
                  <span>·</span>
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-3.5 h-3.5"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm6.93 6h-2.95a15.7 15.7 0 00-1.38-3.56A8.05 8.05 0 0118.93 8zM12 4.04c.83 1.2 1.48 2.52 1.87 3.96h-3.74A13.4 13.4 0 0112 4.04zM4.26 14a8.2 8.2 0 010-4h3.35a16.8 16.8 0 000 4H4.26zm.81 2h2.95c.32 1.25.79 2.45 1.38 3.56A8.05 8.05 0 015.07 16zm2.95-8H5.07A8.05 8.05 0 019.4 4.44 15.7 15.7 0 008.02 8zM12 19.96A13.4 13.4 0 0110.13 16h3.74A13.4 13.4 0 0112 19.96zM14.3 14H9.7a14.7 14.7 0 010-4h4.6a14.7 14.7 0 010 4zm.3 5.56c.59-1.11 1.06-2.31 1.38-3.56h2.95a8.05 8.05 0 01-4.33 3.56zM16.39 14a16.8 16.8 0 000-4h3.35a8.2 8.2 0 010 4h-3.35z" />
                  </svg>
                </div>
              </div>
            </div>

            {post.mediaURL && post.mediaType === "image" && (
              <div className="w-full h-[420px] bg-[#f0f2f5] dark:bg-[#18191a] flex items-center justify-center overflow-hidden lg:h-[360px] sm:h-[280px]">
                <img
                  src={post.mediaURL}
                  alt=""
                  className="w-full h-full object-contain"
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
              <div className="px-4 py-4 border-b border-[#e4e6ea] dark:border-[#3a3b3c] shrink-0">
                <p className="text-[16px] text-[#050505] dark:text-[#e4e6eb] whitespace-pre-wrap">
                  {post.text}
                </p>
              </div>
            )}

            <div className="px-4 py-2 flex items-center justify-between text-[15px] text-[#65676b] dark:text-[#b0b3b8]">
              <div className="flex items-center gap-1">
                {likesCount > 0 && (
                  <>
                    <img
                      className="w-[18px] h-[18px]"
                      height={18}
                      width={18}
                      alt="Like"
                      src="data:image/svg+xml,%3Csvg fill='none' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M16.0001 7.9996c0 4.418-3.5815 7.9996-7.9995 7.9996S.001 12.4176.001 7.9996 3.5825 0 8.0006 0C12.4186 0 16 3.5815 16 7.9996Z' fill='url(%23paint0_linear_15251_63610)'/%3E%3Cpath d='M16.0001 7.9996c0 4.418-3.5815 7.9996-7.9995 7.9996S.001 12.4176.001 7.9996 3.5825 0 8.0006 0C12.4186 0 16 3.5815 16 7.9996Z' fill='url(%23paint1_radial_15251_63610)'/%3E%3Cpath d='M16.0001 7.9996c0 4.418-3.5815 7.9996-7.9995 7.9996S.001 12.4176.001 7.9996 3.5825 0 8.0006 0C12.4186 0 16 3.5815 16 7.9996Z' fill='url(%23paint2_radial_15251_63610)' fill-opacity='.5'/%3E%3Cpath d='M7.3014 3.8662a.6974.6974 0 0 1 .6974-.6977c.6742 0 1.2207.5465 1.2207 1.2206v1.7464a.101.101 0 0 0 .101.101h1.7953c.992 0 1.7232.9273 1.4917 1.892l-.4572 1.9047a2.301 2.301 0 0 1-2.2374 1.764H6.9185a.5752.5752 0 0 1-.5752-.5752V7.7384c0-.4168.097-.8278.2834-1.2005l.2856-.5712a3.6878 3.6878 0 0 0 .3893-1.6509l-.0002-.4496ZM4.367 7a.767.767 0 0 0-.7669.767v3.2598a.767.767 0 0 0 .767.767h.767a.3835.3835 0 0 0 .3835-.3835V7.3835A.3835.3835 0 0 0 5.134 7h-.767Z' fill='%23fff'/%3E%3Cdefs%3E%3CradialGradient id='paint1_radial_15251_63610' cx='0' cy='0' r='1' gradientUnits='userSpaceOnUse' gradientTransform='rotate(90 .0005 8) scale(7.99958)'%3E%3Cstop offset='.5618' stop-color='%230866FF' stop-opacity='0'/%3E%3Cstop offset='1' stop-color='%230866FF' stop-opacity='.1'/%3E%3C/radialGradient%3E%3CradialGradient id='paint2_radial_15251_63610' cx='0' cy='0' r='1' gradientUnits='userSpaceOnUse' gradientTransform='rotate(45 -4.5257 10.9237) scale(10.1818)'%3E%3Cstop offset='.3143' stop-color='%2302ADFC'/%3E%3Cstop offset='1' stop-color='%2302ADFC' stop-opacity='0'/%3E%3C/radialGradient%3E%3ClinearGradient id='paint0_linear_15251_63610' x1='2.3989' y1='2.3999' x2='13.5983' y2='13.5993' gradientUnits='userSpaceOnUse'%3E%3Cstop stop-color='%2302ADFC'/%3E%3Cstop offset='.5' stop-color='%230866FF'/%3E%3Cstop offset='1' stop-color='%232B7EFF'/%3E%3C/linearGradient%3E%3C/defs%3E%3C/svg%3E"
                    />
                    <span>{likesCount.toLocaleString()}</span>
                  </>
                )}
              </div>

              <span>
                {comments.length} comment{comments.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="border-y border-[#e4e6ea] dark:border-[#3a3b3c] mx-4 flex">
              <button
                onClick={handleLike}
                className={`flex-1 py-2 rounded-md hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c] font-semibold flex items-center justify-center gap-2 ${
                  liked
                    ? "text-[#1877f2]"
                    : "text-[#65676b] dark:text-[#b0b3b8]"
                }`}
              >
                <i
                  data-visualcompletion="css-img"
                  style={{
                    backgroundImage:
                      "url('https://static.xx.fbcdn.net/rsrc.php/yd/r/Fv2SXGWpLpB.webp?_nc_eui2=AeGJ4UCCkeCtw-5MGO2vHLchr_rM-2-GSAKv-sz7b4ZIAnias0V3Za5hrWAB6k-WmVrFCxOfbmnm1NaTkD_aAjFE')",
                    backgroundPosition: liked ? "0px -613px" : "0px -697px",
                    backgroundSize: "auto",
                    width: "20px",
                    height: "20px",
                    backgroundRepeat: "no-repeat",
                    display: "inline-block",
                    filter: liked
                      ? "invert(39%) sepia(57%) saturate(200%) saturate(200%) saturate(200%) saturate(147.75%) hue-rotate(202deg) brightness(97%) contrast(96%)"
                      : "none",
                  }}
                />

                <span>Like</span>
              </button>

              <button
                onClick={() => commentInputRef.current?.focus()}
                className="flex-1 py-2 rounded-md hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c] font-semibold text-[#65676b] dark:text-[#b0b3b8] flex items-center justify-center gap-2"
              >
                <i
                  data-visualcompletion="css-img"
                  style={{
                    backgroundImage:
                      "url('https://static.xx.fbcdn.net/rsrc.php/yd/r/Fv2SXGWpLpB.webp?_nc_eui2=AeGJ4UCCkeCtw-5MGO2vHLchr_rM-2-GSAKv-sz7b4ZIAnias0V3Za5hrWAB6k-WmVrFCxOfbmnm1NaTkD_aAjFE')",
                    backgroundPosition: "0px -487px",
                    backgroundSize: "auto",
                    width: "20px",
                    height: "20px",
                    backgroundRepeat: "no-repeat",
                    display: "inline-block",
                  }}
                />
                <span>Comment</span>
              </button>

              <button
                onClick={() => setShowSharePopup(true)}
                className="flex-1 py-2 rounded-md hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c] font-semibold text-[#65676b] dark:text-[#b0b3b8] flex items-center justify-center gap-2"
              >
                <i
                  data-visualcompletion="css-img"
                  style={{
                    backgroundImage:
                      "url('https://static.xx.fbcdn.net/rsrc.php/yd/r/Fv2SXGWpLpB.webp?_nc_eui2=AeGJ4UCCkeCtw-5MGO2vHLchr_rM-2-GSAKv-sz7b4ZIAnias0V3Za5hrWAB6k-WmVrFCxOfbmnm1NaTkD_aAjFE')",
                    backgroundPosition: "0px -844px",
                    backgroundSize: "auto",
                    width: "20px",
                    height: "20px",
                    backgroundRepeat: "no-repeat",
                    display: "inline-block",
                  }}
                />
                <span>Share</span>
              </button>
            </div>

            <div className="px-4 py-3">
              <button className="text-[16px] font-semibold text-[#65676b] dark:text-[#b0b3b8] mb-4">
                Most relevant ▾
              </button>
              <div className="flex flex-col gap-3">
                {comments.map((c) => {
                  const commentName = c.authorName || "User";

                  return (
                    <div key={c.id} className="flex items-start gap-2">
                      <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-300 dark:bg-[#3a3b3c] flex-shrink-0">
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
                        <div className="bg-[#f0f2f5] dark:bg-[#3a3b3c] rounded-2xl px-3 py-2 inline-block">
                          <p className="text-[13px] font-bold text-[#050505] dark:text-[#e4e6eb]">
                            {commentName}
                          </p>
                          <p className="text-[15px] text-[#050505] dark:text-[#e4e6eb]">
                            {c.text}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 mt-1 px-2">
                          <span className="text-[12px] text-[#65676b] dark:text-[#b0b3b8]">
                            <TimeAgoText date={c.createdAt} />
                          </span>
                          <button className="text-[12px] font-bold text-[#65676b] dark:text-[#b0b3b8]">
                            Like
                          </button>
                          <button className="text-[12px] font-bold text-[#65676b] dark:text-[#b0b3b8]">
                            Reply
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="px-4 py-3 border-t border-[#e4e6ea] dark:border-[#3a3b3c] flex items-start gap-2 bg-white dark:bg-[#242526]">
              <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-300 dark:bg-[#3a3b3c] flex-shrink-0">
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
              <div className="relative flex-1 bg-[#f0f2f5] dark:bg-[#3a3b3c] rounded-2xl px-4 py-2 pr-12">
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
                  className="w-full bg-transparent outline-none text-[15px] text-[#050505] dark:text-[#e4e6eb] placeholder-[#65676b] dark:placeholder-[#b0b3b8]"
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
          className="fixed inset-0 z-50 bg-white/70 dark:bg-black/60 flex items-center justify-center px-4"
          onClick={() => setShowLikesPopup(false)}
        >
          <div
            className="w-full max-w-[500px] max-h-[80vh] bg-white dark:bg-[#242526] rounded-xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-[60px] flex items-center justify-center border-b border-[#e4e6ea] dark:border-[#3a3b3c]">
              <h2 className="text-[20px] font-bold text-[#050505] dark:text-[#e4e6eb]">
                Likes
              </h2>

              <button
                onClick={() => setShowLikesPopup(false)}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#e4e6ea] dark:bg-[#3a3b3c] hover:bg-[#d8dadf] dark:hover:bg-[#4e4f50] flex items-center justify-center text-[30px] leading-none text-[#65676b] dark:text-[#b0b3b8]"
              >
                ×
              </button>
            </div>

            <div className="p-3 overflow-y-auto max-h-[calc(80vh-60px)]">
              {likesLoading ? (
                <div className="py-6 text-center text-[15px] text-[#65676b] dark:text-[#b0b3b8]">
                  Loading...
                </div>
              ) : likedUsers.length === 0 ? (
                <div className="py-6 text-center text-[15px] text-[#65676b] dark:text-[#b0b3b8]">
                  No likes yet.
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {likedUsers.map((user) => (
                    <a
                      key={user.uid}
                      href={`/profile/${user.uid}`}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c]"
                    >
                      <div className="w-11 h-11 rounded-full overflow-hidden bg-gray-300 dark:bg-[#3a3b3c] flex-shrink-0">
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

                      <span className="text-[15px] font-semibold text-[#050505] dark:text-[#e4e6eb]">
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

      {showSharePopup && (
        <div
          className="fixed inset-0 z-50 bg-white/70 dark:bg-black/60 flex items-center justify-center px-4"
          onClick={() => setShowSharePopup(false)}
        >
          <div
            className="w-[548px] max-w-[calc(100vw-24px)] max-h-[90vh] bg-white dark:bg-[#242526] rounded-lg shadow-[0_12px_28px_rgba(0,0,0,0.25)] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-[52px] flex items-center justify-center border-b border-[#dadde1] dark:border-[#3a3b3c] shrink-0">
              <h2 className="text-[20px] font-bold text-[#050505] dark:text-[#e4e6eb]">
                Share
              </h2>

              <button
                onClick={() => setShowSharePopup(false)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[#e4e6eb] dark:bg-[#3a3b3c] hover:bg-[#d8dadf] dark:hover:bg-[#4e4f50] flex items-center justify-center"
              >
                <span className="text-[32px] leading-none text-[#050505] dark:text-[#e4e6eb] font-light">
                  ×
                </span>
              </button>
            </div>

            <div className="overflow-y-auto flex-1">
              <div className="px-4 pt-4 pb-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-300 dark:bg-[#3a3b3c] flex-shrink-0">
                    {safeCurrentUserPhoto ? (
                      <img
                        src={safeCurrentUserPhoto}
                        alt={safeCurrentUserName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#1877f2] flex items-center justify-center text-white font-semibold">
                        {safeCurrentUserName[0]?.toUpperCase() || "U"}
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <p className="text-[15px] font-semibold text-[#050505] dark:text-[#e4e6eb] leading-[18px]">
                      {safeCurrentUserName}
                    </p>

                    <div className="flex items-center gap-1 mt-1">
                      <button className="h-[24px] px-2 rounded-md bg-[#e4e6eb] dark:bg-[#3a3b3c] hover:bg-[#d8dadf] dark:hover:bg-[#4e4f50] text-[13px] font-semibold text-[#050505] dark:text-[#e4e6eb]">
                        Feed
                      </button>

                      <button className="h-[24px] px-2 rounded-md bg-[#e4e6eb] dark:bg-[#3a3b3c] hover:bg-[#d8dadf] dark:hover:bg-[#4e4f50] flex items-center gap-1 text-[13px] font-semibold text-[#050505] dark:text-[#e4e6eb]">
                        <svg
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-3.5 h-3.5"
                        >
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm6.93 6h-2.95a15.7 15.7 0 00-1.38-3.56A8.05 8.05 0 0118.93 8zM12 4.04c.83 1.2 1.48 2.52 1.87 3.96h-3.74A13.4 13.4 0 0112 4.04zM4.26 14a8.2 8.2 0 010-4h3.35a16.8 16.8 0 000 4H4.26zm.81 2h2.95c.32 1.25.79 2.45 1.38 3.56A8.05 8.05 0 015.07 16zm2.95-8H5.07A8.05 8.05 0 019.4 4.44 15.7 15.7 0 008.02 8zM12 19.96A13.4 13.4 0 0110.13 16h3.74A13.4 13.4 0 0112 19.96zM14.3 14H9.7a14.7 14.7 0 010-4h4.6a14.7 14.7 0 010 4zm.3 5.56c.59-1.11 1.06-2.31 1.38-3.56h2.95a8.05 8.05 0 01-4.33 3.56zM16.39 14a16.8 16.8 0 000-4h3.35a8.2 8.2 0 010 4h-3.35z" />
                        </svg>
                        Public
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
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <textarea
                    value={shareText}
                    onChange={(e) => setShareText(e.target.value)}
                    placeholder="Say something about this..."
                    className="flex-1 h-[54px] resize-none border-none outline-none text-[15px] leading-[20px] text-[#050505] dark:text-[#e4e6eb] placeholder-[#65676b] dark:placeholder-[#b0b3b8] bg-transparent"
                  />

                  <button className="w-9 h-9 rounded-full hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c] flex items-center justify-center">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#bcc0c4"
                      strokeWidth="1.8"
                      className="w-7 h-7"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <circle
                        cx="8.5"
                        cy="10"
                        r="1"
                        fill="#bcc0c4"
                        stroke="none"
                      />
                      <circle
                        cx="15.5"
                        cy="10"
                        r="1"
                        fill="#bcc0c4"
                        stroke="none"
                      />
                      <path d="M8 14c1 1.4 2.3 2.1 4 2.1s3-.7 4-2.1" />
                    </svg>
                  </button>
                </div>

                <div className="flex justify-end mt-1">
                  <button
                    onClick={() => setShowSharePopup(false)}
                    className="w-[150px] h-[36px] rounded-md bg-[#1877f2] hover:bg-[#166fe5] text-white text-[15px] font-semibold"
                  >
                    Share now
                  </button>
                </div>
              </div>

              <div className="border-t border-[#dadde1] dark:border-[#3a3b3c]" />

              <div className="px-4 py-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[17px] font-semibold text-[#050505] dark:text-[#e4e6eb]">
                    Send in Messenger
                  </h3>

                  <button className="w-9 h-9 rounded-full bg-[#e4e6eb] dark:bg-[#3a3b3c] hover:bg-[#d8dadf] dark:hover:bg-[#4e4f50] flex items-center justify-center">
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-5 h-5 text-[#050505] dark:text-[#e4e6eb]"
                    >
                      <path d="M12 2C6 2 2 6 2 11.5c0 3 1.2 5.5 3.2 7.2l.1 2c0 .5.5.9 1 .7l2-1c.2 0 .4-.1.6 0 .6.2 1.2.3 1.9.3 6 0 10-4 10-9.5S18 2 12 2z" />
                    </svg>
                  </button>
                </div>

                <div className="relative">
                  {shareFriends.length === 0 ? (
                    <div className="py-4 text-[14px] text-[#65676b] dark:text-[#b0b3b8]">
                      No friends to send to.
                    </div>
                  ) : (
                    <div className="flex items-start gap-4 overflow-hidden">
                      {shareFriends.map((friend) => (
                        <div
                          key={friend.uid}
                          className="w-[70px] flex-shrink-0 text-center"
                        >
                          <div className="w-[54px] h-[54px] mx-auto rounded-full overflow-hidden bg-gray-300 dark:bg-[#3a3b3c]">
                            {friend.photoURL ? (
                              <img
                                src={friend.photoURL}
                                alt={friend.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-[#1877f2] flex items-center justify-center text-white font-semibold">
                                {friend.name[0]?.toUpperCase() || "U"}
                              </div>
                            )}
                          </div>

                          <p className="mt-1 text-[13px] text-[#050505] dark:text-[#e4e6eb] leading-[16px] line-clamp-2">
                            {friend.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  <button className="absolute right-0 top-[18px] w-12 h-12 rounded-full bg-white dark:bg-[#3a3b3c] shadow-[0_2px_8px_rgba(0,0,0,0.25)] flex items-center justify-center hover:bg-[#f0f2f5] dark:hover:bg-[#4e4f50]">
                    <span className="text-[28px] leading-none text-[#65676b] dark:text-[#b0b3b8]">
                      ›
                    </span>
                  </button>
                </div>
              </div>

              <div className="px-4 pb-5">
                <h3 className="text-[17px] font-semibold text-[#050505] dark:text-[#e4e6eb] mb-3">
                  Share to
                </h3>

                <div className="grid grid-cols-6 gap-3 sm:grid-cols-3">
                  {[
                    ["Messenger", "M"],
                    ["WhatsApp", "W"],
                    ["Copy link", "🔗"],
                    ["Group", "👥"],
                    ["Friend's profile", "👤"],
                    ["X", "𝕏"],
                  ].map(([label, icon]) => (
                    <button
                      key={label}
                      className="flex flex-col items-center gap-2"
                    >
                      <div className="w-[58px] h-[58px] rounded-full bg-[#e4e6eb] dark:bg-[#3a3b3c] hover:bg-[#d8dadf] dark:hover:bg-[#4e4f50] flex items-center justify-center text-[24px] font-bold text-[#050505] dark:text-[#e4e6eb]">
                        {icon}
                      </div>

                      <span className="text-[13px] text-[#050505] dark:text-[#e4e6eb] text-center leading-[16px]">
                        {label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

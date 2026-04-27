"use client";

import Image from "next/image";
import { useState } from "react";

export interface Post {
  id: string;
  authorName: string;
  authorPhoto: string | null;
  authorId: string;
  content: string;
  mediaURL?: string;
  mediaType?: "image" | "video";
  createdAt: string;
  isPublic: boolean;
  likes: number;
  comments: number;
  shares: number;
  likedByMe?: boolean;
}

interface PostCardProps {
  post: Post;
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
}

export default function PostCard({
  post,
  onLike,
  onComment,
  onShare,
}: PostCardProps) {
  const [liked, setLiked] = useState(post.likedByMe || false);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [showMore, setShowMore] = useState(false);

  const handleLike = () => {
    setLiked((prev) => !prev);
    setLikesCount((prev) => (liked ? prev - 1 : prev + 1));
    onLike?.(post.id);
  };

  const isLongContent = post.content.length > 250;
  const displayContent =
    isLongContent && !showMore
      ? post.content.slice(0, 250) + "..."
      : post.content;

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="flex items-start justify-between px-4 pt-3 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-300 flex-shrink-0 cursor-pointer">
            {post.authorPhoto ? (
              <Image
                src={post.authorPhoto}
                alt={post.authorName}
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#1877f2] flex items-center justify-center text-white font-semibold text-sm">
                {post.authorName[0]?.toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <p className="text-[15px] font-semibold text-[#050505] hover:underline cursor-pointer leading-tight">
              {post.authorName}
            </p>
            <div className="flex items-center gap-1">
              <span className="text-[13px] text-[#8a8d91]">
                {post.createdAt}
              </span>
              <span className="text-[#8a8d91]">·</span>
              {post.isPublic ? (
                <svg
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="w-3.5 h-3.5 text-[#8a8d91]"
                >
                  <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm0 14.5a6.5 6.5 0 110-13 6.5 6.5 0 010 13zm0-11a.75.75 0 000 1.5h.01a.75.75 0 000-1.5H8zm.75 3.25a.75.75 0 00-1.5 0v4a.75.75 0 001.5 0v-4z" />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="w-3.5 h-3.5 text-[#8a8d91]"
                >
                  <path d="M8 1a7 7 0 100 14A7 7 0 008 1zM2 8a6 6 0 1112 0A6 6 0 012 8z" />
                </svg>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="w-9 h-9 rounded-full hover:bg-[#f0f2f5] flex items-center justify-center transition-colors">
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5 text-[#606770]"
            >
              <path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
            </svg>
          </button>
          <button className="w-9 h-9 rounded-full hover:bg-[#f0f2f5] flex items-center justify-center transition-colors">
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5 text-[#606770]"
            >
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        </div>
      </div>

      {post.content && (
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
        <div className="relative w-full bg-[#f0f2f5] max-h-[500px] overflow-hidden cursor-pointer">
          <Image
            src={post.mediaURL}
            alt="Post media"
            width={600}
            height={400}
            className="w-full object-cover"
          />
        </div>
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

      {(likesCount > 0 || post.comments > 0 || post.shares > 0) && (
        <div className="flex items-center justify-between px-4 py-2 text-[15px] text-[#8a8d91]">
          <div className="flex items-center gap-1 hover:underline cursor-pointer">
            {likesCount > 0 && (
              <>
                <div className="flex items-center">
                  <span className="w-[18px] h-[18px] rounded-full bg-[#1877f2] flex items-center justify-center text-[10px]">
                    👍
                  </span>
                </div>
                <span>{likesCount.toLocaleString()}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            {post.comments > 0 && (
              <button className="hover:underline">
                {post.comments.toLocaleString()} comments
              </button>
            )}
            {post.shares > 0 && (
              <button className="hover:underline">
                {post.shares.toLocaleString()} shares
              </button>
            )}
          </div>
        </div>
      )}

      <hr className="border-[#ced0d4] mx-4" />

      <div className="flex items-center px-2 py-1">
        <button
          onClick={handleLike}
          className={`flex items-center justify-center gap-1.5 flex-1 py-1.5 rounded-lg hover:bg-[#f0f2f5] transition-colors ${
            liked ? "text-[#1877f2]" : "text-[#606770]"
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            fill={liked ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={liked ? 0 : 2}
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"
            />
          </svg>
          <span className="text-[15px] font-semibold">Like</span>
        </button>

        <button
          onClick={() => onComment?.(post.id)}
          className="flex items-center justify-center gap-1.5 flex-1 py-1.5 rounded-lg hover:bg-[#f0f2f5] transition-colors text-[#606770]"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <span className="text-[15px] font-semibold">Comment</span>
        </button>

        <button
          onClick={() => onShare?.(post.id)}
          className="flex items-center justify-center gap-1.5 flex-1 py-1.5 rounded-lg hover:bg-[#f0f2f5] transition-colors text-[#606770]"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
          <span className="text-[15px] font-semibold">Share</span>
        </button>
      </div>
    </div>
  );
}

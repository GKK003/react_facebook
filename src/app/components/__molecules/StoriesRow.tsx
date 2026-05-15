"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Mousewheel } from "swiper/modules";
import ProfilePicture from "@/app/components/__atoms/ProfilePicture";

export interface Story {
  id: string;
  authorId: string;
  authorName: string;
  authorPhoto: string | null;
  imageURL: string;
  createdAt?: any;
}

interface StoriesRowProps {
  user: {
    uid: string;
    displayName: string | null;
    photoURL: string | null;
  } | null;
  stories?: Story[];
}

type StoryBucket = {
  authorId: string;
  authorName: string;
  authorPhoto: string | null;
  thumbnailURL: string;
  stories: Story[];
};

export default function StoriesRow({ user, stories = [] }: StoriesRowProps) {
  const [activeBucket, setActiveBucket] = useState<StoryBucket | null>(null);
  const [activeBucketIndex, setActiveBucketIndex] = useState(0);
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const storyBuckets = useMemo(() => {
    const map = new Map<string, StoryBucket>();

    stories.forEach((story) => {
      const existing = map.get(story.authorId);

      if (existing) {
        existing.stories.push(story);
        return;
      }

      map.set(story.authorId, {
        authorId: story.authorId,
        authorName: story.authorName || "User",
        authorPhoto: story.authorPhoto || null,
        thumbnailURL: story.imageURL,
        stories: [story],
      });
    });

    return Array.from(map.values()).map((bucket) => ({
      ...bucket,
      stories: bucket.stories.sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() || 0;
        const bTime = b.createdAt?.toMillis?.() || 0;
        return aTime - bTime;
      }),
      thumbnailURL:
        bucket.stories[bucket.stories.length - 1]?.imageURL ||
        bucket.thumbnailURL,
    }));
  }, [stories]);

  const activeStory = activeBucket?.stories[activeStoryIndex] || null;

  const openBucket = (bucket: StoryBucket, index: number) => {
    setActiveBucket(bucket);
    setActiveBucketIndex(index);
    setActiveStoryIndex(0);
    setProgress(0);
  };

  const closeStory = () => {
    setActiveBucket(null);
    setActiveBucketIndex(0);
    setActiveStoryIndex(0);
    setProgress(0);
  };

  const goNext = () => {
    if (!activeBucket) return;

    if (activeStoryIndex < activeBucket.stories.length - 1) {
      setActiveStoryIndex((prev) => prev + 1);
      setProgress(0);
      return;
    }

    if (activeBucketIndex < storyBuckets.length - 1) {
      const nextBucketIndex = activeBucketIndex + 1;
      setActiveBucket(storyBuckets[nextBucketIndex]);
      setActiveBucketIndex(nextBucketIndex);
      setActiveStoryIndex(0);
      setProgress(0);
      return;
    }

    closeStory();
  };

  const goPrev = () => {
    if (!activeBucket) return;

    if (activeStoryIndex > 0) {
      setActiveStoryIndex((prev) => prev - 1);
      setProgress(0);
      return;
    }

    if (activeBucketIndex > 0) {
      const prevBucketIndex = activeBucketIndex - 1;
      const prevBucket = storyBuckets[prevBucketIndex];

      setActiveBucket(prevBucket);
      setActiveBucketIndex(prevBucketIndex);
      setActiveStoryIndex(Math.max(prevBucket.stories.length - 1, 0));
      setProgress(0);
    }
  };

  useEffect(() => {
    if (!activeStory) return;

    setProgress(0);

    const duration = 5000;
    const step = 100;
    let elapsed = 0;

    const interval = setInterval(() => {
      elapsed += step;
      const nextProgress = Math.min((elapsed / duration) * 100, 100);

      setProgress(nextProgress);

      if (nextProgress >= 100) {
        clearInterval(interval);
        goNext();
      }
    }, step);

    return () => clearInterval(interval);
  }, [activeStory?.id]);

  const handleCreateStory = async (file: File | undefined) => {
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      alert("Please choose an image.");
      return;
    }

    setUploading(true);

    try {
      const imageURL = await uploadToCloudinary(file);

      await addDoc(collection(db, "stories"), {
        authorId: user.uid,
        authorName: user.displayName || "User",
        authorPhoto: user.photoURL || null,
        imageURL,
        createdAt: serverTimestamp(),
      });
    } catch (err: any) {
      console.error("Create story error:", err);
      alert(err.message || "Story upload failed.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <>
      <div className="relative">
        <Swiper
          modules={[Navigation, Mousewheel]}
          navigation={{
            nextEl: ".stories-next",
            prevEl: ".stories-prev",
          }}
          slidesPerView="auto"
          spaceBetween={8}
          mousewheel={true}
        >
          <SwiperSlide style={{ width: "112px" }}>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-[112px] h-[200px] rounded-xl overflow-hidden relative cursor-pointer group bg-white shadow-sm disabled:opacity-70"
            >
              <div className="w-full h-full bg-[#e4e6ea] overflow-hidden relative flex items-start">
                {user?.photoURL ? (
                  <Image
                    src={user.photoURL}
                    alt="Your photo"
                    fill
                    className="object-cover object-top group-hover:scale-105 transition-transform h-full"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-b from-[#b0b3b8] to-[#e4e6ea]" />
                )}
              </div>

              <div className="absolute bottom-0 left-0 right-0 h-[25%] bg-white dark:bg-[#242526] flex flex-col items-center pt-5 pb-2">
                <div className="absolute top-[-16px] w-8 h-8 rounded-full bg-[#1877f2] border-4 border-white dark:border-0 flex items-center justify-center">
                  {uploading ? (
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  ) : (
                    <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
                      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                    </svg>
                  )}
                </div>

                <span className="text-[13px] font-semibold text-[#050505] text-center leading-4 mt-1 dark:text-white">
                  {uploading ? "Uploading..." : "Create story"}
                </span>
              </div>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => handleCreateStory(e.target.files?.[0])}
            />
          </SwiperSlide>

          {storyBuckets.length === 0
            ? [1, 2, 3, 4].map((i) => (
                <SwiperSlide key={i} style={{ width: "112px" }}>
                  <div className="w-[112px] h-[200px] rounded-xl bg-[#e4e6ea] animate-pulse" />
                </SwiperSlide>
              ))
            : storyBuckets.map((bucket, index) => (
                <SwiperSlide key={bucket.authorId} style={{ width: "112px" }}>
                  <button
                    type="button"
                    onClick={() => openBucket(bucket, index)}
                    className="w-[112px] h-[200px] rounded-xl overflow-hidden relative cursor-pointer group text-left bg-[#e4e6ea]"
                  >
                    <div className="absolute inset-0 bg-[#b0b3b8]">
                      <Image
                        src={bucket.thumbnailURL}
                        alt={bucket.authorName}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/65" />
                    </div>

                    <ProfilePicture
                      uid={bucket.authorId}
                      src={bucket.authorPhoto}
                      name={bucket.authorName}
                      size={36}
                      live
                      className="absolute top-2 left-2 border-4 border-[#1877f2] bg-gray-400"
                      textClassName="text-[13px] font-bold"
                    />

                    <div className="absolute bottom-2 left-2 right-2">
                      <span className="text-white text-[13px] font-semibold line-clamp-2 drop-shadow">
                        {bucket.authorName}
                      </span>
                    </div>
                  </button>
                </SwiperSlide>
              ))}
        </Swiper>

        <button className="stories-prev absolute left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-[#f2f2f2] transition-colors disabled:opacity-0">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
          </svg>
        </button>

        <button className="stories-next absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-[#f2f2f2] transition-colors disabled:opacity-0">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />
          </svg>
        </button>
      </div>

      {activeBucket && activeStory && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={closeStory}
        >
          <div
            className="relative w-[380px] h-[680px] max-w-[calc(100vw-24px)] max-h-[calc(100vh-24px)] rounded-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-2 left-2 right-2 z-20 flex gap-1">
              {activeBucket.stories.map((story, i) => (
                <div
                  key={story.id}
                  className="flex-1 h-[3px] rounded-full bg-white/40"
                >
                  <div
                    className="h-full rounded-full bg-white transition-all duration-100"
                    style={{
                      width:
                        i < activeStoryIndex
                          ? "100%"
                          : i === activeStoryIndex
                            ? `${progress}%`
                            : "0%",
                    }}
                  />
                </div>
              ))}
            </div>

            <div className="absolute top-6 left-3 z-20 flex items-center gap-2">
              <ProfilePicture
                uid={activeBucket.authorId}
                src={activeBucket.authorPhoto}
                name={activeBucket.authorName}
                size={36}
                live
                className="border-2 border-white bg-gray-400"
                textClassName="text-[13px] font-bold"
              />

              <span className="text-white text-[14px] font-semibold drop-shadow">
                {activeBucket.authorName}
              </span>
            </div>

            <button
              onClick={closeStory}
              className="absolute top-6 right-3 z-20 w-9 h-9 rounded-full bg-black/40 flex items-center justify-center hover:bg-black/60 transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </button>

            <div className="w-full h-full bg-[#1c1e21] flex items-center justify-center">
              <div className="relative w-full h-[82%] bg-[#2f3031]">
                <Image
                  src={activeStory.imageURL}
                  alt={activeBucket.authorName}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
            </div>

            <button
              onClick={goPrev}
              className="absolute left-0 top-0 w-1/2 h-full z-10"
            />

            <button
              onClick={goNext}
              className="absolute right-0 top-0 w-1/2 h-full z-10"
            />
          </div>

          {(activeBucketIndex > 0 || activeStoryIndex > 0) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              className="absolute left-[calc(50%-230px)] w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg hover:bg-[#f2f2f2] transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
              </svg>
            </button>
          )}

          {(activeBucketIndex < storyBuckets.length - 1 ||
            activeStoryIndex < activeBucket.stories.length - 1) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              className="absolute right-[calc(50%-230px)] w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg hover:bg-[#f2f2f2] transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />
              </svg>
            </button>
          )}
        </div>
      )}
    </>
  );
}

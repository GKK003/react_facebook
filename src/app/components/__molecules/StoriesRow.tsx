"use client";

import Image from "next/image";
import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Mousewheel } from "swiper/modules";

interface Story {
  id: string;
  authorName: string;
  authorPhoto: string | null;
  thumbnailURL: string | null;
  isLive?: boolean;
}

interface StoriesRowProps {
  user: {
    displayName: string | null;
    photoURL: string | null;
  } | null;
  stories?: Story[];
}

export default function StoriesRow({ user, stories = [] }: StoriesRowProps) {
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const openStory = (story: Story, index: number) => {
    setActiveStory(story);
    setActiveIndex(index);
    setProgress(0);
  };

  const closeStory = () => setActiveStory(null);

  const goNext = () => {
    if (activeIndex < stories.length - 1) {
      setActiveIndex(activeIndex + 1);
      setActiveStory(stories[activeIndex + 1]);
      setProgress(0);
    } else {
      closeStory();
    }
  };

  const goPrev = () => {
    if (activeIndex > 0) {
      setActiveIndex(activeIndex - 1);
      setActiveStory(stories[activeIndex - 1]);
      setProgress(0);
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
            <div className="w-[112px] h-[200px] rounded-xl overflow-hidden relative cursor-pointer group">
              <div className="w-full h-[75%] bg-[#e4e6ea] overflow-hidden relative">
                {user?.photoURL ? (
                  <Image
                    src={user.photoURL}
                    alt="Your photo"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-b from-[#b0b3b8] to-[#e4e6ea]" />
                )}
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-[40%] bg-white flex flex-col items-center pt-5 pb-2">
                <div className="absolute top-[-16px] w-8 h-8 rounded-full bg-[#1877f2] border-4 border-white flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                  </svg>
                </div>
                <span className="text-[13px] font-semibold text-[#050505] text-center leading-4 mt-1">
                  Create story
                </span>
              </div>
            </div>
          </SwiperSlide>

          {stories.length === 0
            ? [1, 2, 3, 4, 5].map((i) => (
                <SwiperSlide key={i} style={{ width: "112px" }}>
                  <div className="w-[112px] h-[200px] rounded-xl bg-[#e4e6ea] animate-pulse" />
                </SwiperSlide>
              ))
            : stories.map((story, index) => (
                <SwiperSlide key={story.id} style={{ width: "112px" }}>
                  <div
                    onClick={() => openStory(story, index)}
                    className="w-[112px] h-[200px] rounded-xl overflow-hidden relative cursor-pointer group"
                  >
                    <div className="absolute inset-0 bg-[#b0b3b8]">
                      {story.thumbnailURL && (
                        <Image
                          src={story.thumbnailURL}
                          alt={story.authorName}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
                    </div>
                    <div className="absolute top-2 left-2 w-9 h-9 rounded-full border-4 border-[#1877f2] overflow-hidden bg-gray-400">
                      {story.authorPhoto && (
                        <Image
                          src={story.authorPhoto}
                          alt={story.authorName}
                          width={36}
                          height={36}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    {story.isLive && (
                      <div className="absolute top-2 right-2 bg-[#f02849] text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">
                        LIVE
                      </div>
                    )}
                    <div className="absolute bottom-2 left-2 right-2">
                      <span className="text-white text-[13px] font-semibold line-clamp-2 drop-shadow">
                        {story.authorName}
                      </span>
                    </div>
                  </div>
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

      {activeStory && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={closeStory}
        >
          <div
            className="relative w-[380px] h-[680px] rounded-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-2 left-2 right-2 z-10 flex gap-1">
              {stories.map((_, i) => (
                <div
                  key={i}
                  className="flex-1 h-[3px] rounded-full bg-white/40"
                >
                  <div
                    className="h-full rounded-full bg-white transition-all duration-100"
                    style={{
                      width:
                        i < activeIndex
                          ? "100%"
                          : i === activeIndex
                            ? `${progress}%`
                            : "0%",
                    }}
                  />
                </div>
              ))}
            </div>

            <div className="absolute top-6 left-3 z-10 flex items-center gap-2">
              <div className="w-9 h-9 rounded-full border-2 border-white overflow-hidden bg-gray-400">
                {activeStory.authorPhoto && (
                  <Image
                    src={activeStory.authorPhoto}
                    alt={activeStory.authorName}
                    width={36}
                    height={36}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <span className="text-white text-[14px] font-semibold drop-shadow">
                {activeStory.authorName}
              </span>
            </div>

            <button
              onClick={closeStory}
              className="absolute top-6 right-3 z-10 w-9 h-9 rounded-full bg-black/40 flex items-center justify-center hover:bg-black/60 transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </button>

            <div className="w-full h-full bg-[#1c1e21]">
              {activeStory.thumbnailURL ? (
                <Image
                  src={activeStory.thumbnailURL}
                  alt={activeStory.authorName}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-b from-[#3a3b3c] to-[#1c1e21]" />
              )}
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

          {activeIndex > 0 && (
            <button
              onClick={goPrev}
              className="absolute left-[calc(50%-230px)] w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg hover:bg-[#f2f2f2] transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
              </svg>
            </button>
          )}

          {activeIndex < stories.length - 1 && (
            <button
              onClick={goNext}
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

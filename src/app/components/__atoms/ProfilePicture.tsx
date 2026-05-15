"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase/firebase";

type Props = {
  uid?: string | null;
  src?: any;
  name?: string | null;
  size?: number;
  width?: number | string;
  height?: number | string;
  live?: boolean;
  className?: string;
  imageClassName?: string;
  textClassName?: string;
  unoptimized?: boolean;
};

export default function ProfilePicture({
  uid,
  src,
  name,
  size = 40,
  width,
  height,
  live = false,
  className = "",
  imageClassName = "",
  textClassName = "",
  unoptimized = true,
}: Props) {
  const [liveSrc, setLiveSrc] = useState<any>(src || null);

  useEffect(() => {
    setLiveSrc(src || null);
  }, [src]);

  useEffect(() => {
    if (!live || !uid) return;

    const unsub = onSnapshot(doc(db, "users", uid), (snap) => {
      if (!snap.exists()) return;

      const data = snap.data();
      setLiveSrc(data.photoURL || null);
    });

    return () => unsub();
  }, [uid, live]);

  const firstLetter = name?.trim()?.[0]?.toUpperCase() || "U";

  return (
    <div
      className={`rounded-full overflow-hidden bg-[#1877f2] flex items-center justify-center text-white font-semibold flex-shrink-0 ${className}`}
      style={{
        width: width || size,
        height: height || size,
      }}
    >
      {liveSrc ? (
        <Image
          src={liveSrc}
          alt={name || "Profile"}
          width={
            typeof (width || size) === "number"
              ? (width as number) || size
              : size
          }
          height={
            typeof (height || size) === "number"
              ? (height as number) || size
              : size
          }
          className={`w-full h-full object-cover ${imageClassName}`}
          unoptimized={unoptimized}
        />
      ) : (
        <span className={textClassName}>{firstLetter}</span>
      )}
    </div>
  );
}

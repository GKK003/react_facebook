"use client";

import Image from "next/image";
import ProfilePicture from "@/app/components/__atoms/ProfilePicture";

interface CreatePostBoxProps {
  user: {
    displayName: string | null;
    photoURL: string | null;
  } | null;
  onOpen: () => void;
}

export default function CreatePostBox({ user, onOpen }: CreatePostBoxProps) {
  return (
    <div className="bg-white dark:bg-[#242526] rounded-xl shadow-sm border border-[#ced0d4] dark:border-[#3a3b3c] px-4 py-3 md:h-[90px]">
      <div className="flex items-center gap-3">
        <ProfilePicture
          src={user?.photoURL}
          name={user?.displayName}
          size={40}
          className="bg-gray-300 dark:bg-[#3a3b3c]"
          textClassName="text-lg"
        />

        <button
          onClick={onOpen}
          className="flex-1 bg-[#f0f2f5] dark:bg-[#3a3b3c] hover:bg-[#e4e6ea] dark:hover:bg-[#4e4f50] transition-colors rounded-full px-4 py-2.5 text-left text-[#8a8d91] dark:text-[#b0b3b8] text-[15px] md:h-17 md:rounded-2xl truncate"
        >
          What's on your mind, {user?.displayName?.split(" ")[0] || "you"}?
        </button>

        <div className="flex items-center gap-1">
          <button
            onClick={onOpen}
            className="w-9 h-9 flex items-center justify-center rounded-[8px] hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c] transition-colors cursor-pointer"
          >
            <Image
              src="https://static.xx.fbcdn.net/rsrc.php/yE/r/f0XMdTi7eQy.webp?_nc_eui2=AeF6HdqovoqEel1djjy0Kr24WOK2rF8KwnxY4rasXwrCfGMrOn7lHAY3NRHjoxa8YRmoVFNtDufnYlzgQaGF61rE"
              alt=""
              width={24}
              height={24}
              unoptimized
            />
          </button>

          <button
            onClick={onOpen}
            className="w-9 h-9 flex items-center justify-center rounded-[8px] hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c] transition-colors cursor-pointer"
          >
            <Image
              src="https://static.xx.fbcdn.net/rsrc.php/yX/r/8_VnccIZfRa.webp?_nc_eui2=AeEBL_cDNQc_opfChelZCbEdtIBijxuqePS0gGKPG6p49LW21NmMjaD28WK2ZKAOosrOzVdwnBi_NPOPs--Ml1fS"
              alt=""
              width={24}
              height={24}
              unoptimized
            />
          </button>

          <button
            onClick={onOpen}
            className="w-9 h-9 flex items-center justify-center rounded-[8px] hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c] transition-colors cursor-pointer"
          >
            <img
              src="https://static.xx.fbcdn.net/rsrc.php/ya/r/XlpCJi9w2HF.webp?_nc_eui2=AeFR_6-Dj0VGhlXhb726y36TwIB16X8qm_nAgHXpfyqb-SfUGHSXRttsYM0-5XyRnZeMi249piBh_p9hoILb97g0"
              alt=""
              width={24}
              height={24}
            />
          </button>
        </div>
      </div>
    </div>
  );
}

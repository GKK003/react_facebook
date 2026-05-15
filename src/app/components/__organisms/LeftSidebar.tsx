"use client";

import Image from "next/image";
import Link from "next/link";
import ProfilePicture from "@/app/components/__atoms/ProfilePicture";

interface LeftSidebarProps {
  user: {
    displayName: string | null;
    photoURL: string | null;
  } | null;
}

export default function LeftSidebar({ user }: LeftSidebarProps) {
  return (
    <div className="flex flex-col w-[360px] min-w-[220px] max-w-[360px] flex-shrink sticky top-[56px] h-[calc(100vh-56px)] overflow-y-auto scrollbar-hide px-2 pb-4 ml-auto lg:hidden">
      <Link
        href="/profile"
        className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-[#f2f2f2] dark:hover:bg-[#3a3b3c] transition-colors mt-2"
      >
        <ProfilePicture
          src={user?.photoURL}
          name={user?.displayName}
          size={36}
          className="bg-gray-300 dark:bg-[#3a3b3c]"
          textClassName="text-sm"
        />

        <span className="text-[15px] font-semibold text-[#050505] dark:text-[#e4e6eb]">
          {user?.displayName || "User"}
        </span>
      </Link>

      <Link
        href="https://www.meta.ai/?utm_source=facebook_bookmarks"
        target="_blank"
        className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-[#e4e6ea] dark:hover:bg-[#3a3b3c] transition-colors"
      >
        <div className="w-9 h-9 flex items-center justify-center flex-shrink-0">
          <i
            data-visualcompletion="css-img"
            style={{
              backgroundImage:
                "url('https://static.xx.fbcdn.net/rsrc.php/yC/r/uekCFt9ago0.webp?_nc_eui2=AeGTxUguzOrrz5O34QCuKQtxTy1NlfYC_KlPLU2V9gL8qXeX8H1zcqBK3_IqIKif0xVCTY-J5W2ET73REJ4X4qdY')",
              backgroundPosition: "0 0",
              backgroundSize: "auto",
              width: "36px",
              height: "36px",
              backgroundRepeat: "no-repeat",
              display: "inline-block",
            }}
          />
        </div>

        <span className="text-[15px] font-semibold text-[#050505] dark:text-[#e4e6eb]">
          Meta AI
        </span>
      </Link>

      <Link
        href="/friends"
        className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-[#e4e6ea] dark:hover:bg-[#3a3b3c] transition-colors"
      >
        <div className="w-9 h-9 flex items-center justify-center flex-shrink-0">
          <i
            data-visualcompletion="css-img"
            style={{
              backgroundImage:
                "url('https://static.xx.fbcdn.net/rsrc.php/yq/r/6aum_pQMnLN.webp?_nc_eui2=AeFBPUslSaFS3_j96jAP4Lzb8ctQYTbLk1Pxy1BhNsuTUyrB7ksykrkuK0uy3dKxUktRmTpsRH503iAz66rlMVAX')",
              backgroundPosition: "0 -814px",
              backgroundSize: "auto",
              width: "36px",
              height: "36px",
              backgroundRepeat: "no-repeat",
              display: "inline-block",
            }}
          />
        </div>

        <span className="text-[15px] font-semibold text-[#050505] dark:text-[#e4e6eb]">
          Friends
        </span>
      </Link>

      <Link
        href="https://www.facebook.com/onthisday/?source=bookmark"
        target="_blank"
        className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-[#e4e6ea] dark:hover:bg-[#3a3b3c] transition-colors"
      >
        <div className="w-9 h-9 flex items-center justify-center flex-shrink-0">
          <i
            data-visualcompletion="css-img"
            style={{
              backgroundImage:
                "url('https://static.xx.fbcdn.net/rsrc.php/yq/r/6aum_pQMnLN.webp?_nc_eui2=AeFBPUslSaFS3_j96jAP4Lzb8ctQYTbLk1Pxy1BhNsuTUyrB7ksykrkuK0uy3dKxUktRmTpsRH503iAz66rlMVAX')",
              backgroundPosition: "0 -1221px",
              backgroundSize: "auto",
              width: "36px",
              height: "36px",
              backgroundRepeat: "no-repeat",
              display: "inline-block",
            }}
          />
        </div>

        <span className="text-[15px] font-semibold text-[#050505] dark:text-[#e4e6eb]">
          Memories
        </span>
      </Link>

      <Link
        href="/saved"
        className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-[#e4e6ea] dark:hover:bg-[#3a3b3c] transition-colors"
      >
        <div className="w-9 h-9 flex items-center justify-center flex-shrink-0">
          <i
            data-visualcompletion="css-img"
            style={{
              backgroundImage:
                "url('https://static.xx.fbcdn.net/rsrc.php/yq/r/6aum_pQMnLN.webp?_nc_eui2=AeFBPUslSaFS3_j96jAP4Lzb8ctQYTbLk1Pxy1BhNsuTUyrB7ksykrkuK0uy3dKxUktRmTpsRH503iAz66rlMVAX')",
              backgroundPosition: "0 -518px",
              backgroundSize: "auto",
              width: "36px",
              height: "36px",
              backgroundRepeat: "no-repeat",
              display: "inline-block",
            }}
          />
        </div>

        <span className="text-[15px] font-semibold text-[#050505] dark:text-[#e4e6eb]">
          Saved
        </span>
      </Link>

      <Link
        href="https://www.facebook.com/groups/?ref=bookmarks"
        target="_blank"
        className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-[#e4e6ea] dark:hover:bg-[#3a3b3c] transition-colors cursor-pointer"
      >
        <div className="w-9 h-9 flex items-center justify-center flex-shrink-0">
          <i
            data-visualcompletion="css-img"
            style={{
              backgroundImage:
                "url('https://static.xx.fbcdn.net/rsrc.php/yq/r/6aum_pQMnLN.webp?_nc_eui2=AeFBPUslSaFS3_j96jAP4Lzb8ctQYTbLk1Pxy1BhNsuTUyrB7ksykrkuK0uy3dKxUktRmTpsRH503iAz66rlMVAX')",
              backgroundPosition: "0 -185px",
              backgroundSize: "auto",
              width: "36px",
              height: "36px",
              backgroundRepeat: "no-repeat",
              display: "inline-block",
            }}
          />
        </div>

        <span className="text-[15px] font-semibold text-[#050505] dark:text-[#e4e6eb]">
          Groups
        </span>
      </Link>

      <Link
        href="https://www.facebook.com/reel/?s=tab"
        target="_blank"
        className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-[#e4e6ea] dark:hover:bg-[#3a3b3c] transition-colors"
      >
        <div className="w-9 h-9 flex items-center justify-center flex-shrink-0">
          <i
            data-visualcompletion="css-img"
            style={{
              backgroundImage:
                "url('https://static.xx.fbcdn.net/rsrc.php/yq/r/6aum_pQMnLN.webp?_nc_eui2=AeFBPUslSaFS3_j96jAP4Lzb8ctQYTbLk1Pxy1BhNsuTUyrB7ksykrkuK0uy3dKxUktRmTpsRH503iAz66rlMVAX')",
              backgroundPosition: "0 -111px",
              backgroundSize: "auto",
              width: "36px",
              height: "36px",
              backgroundRepeat: "no-repeat",
              display: "inline-block",
            }}
          />
        </div>

        <span className="text-[15px] font-semibold text-[#050505] dark:text-[#e4e6eb]">
          Reels
        </span>
      </Link>

      <Link
        href="https://www.facebook.com/marketplace/?ref=bookmark"
        target="_blank"
        className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-[#e4e6ea] dark:hover:bg-[#3a3b3c] transition-colors"
      >
        <div className="w-9 h-9 flex items-center justify-center flex-shrink-0">
          <i
            data-visualcompletion="css-img"
            style={{
              backgroundImage:
                "url('https://static.xx.fbcdn.net/rsrc.php/yC/r/uekCFt9ago0.webp?_nc_eui2=AeGTxUguzOrrz5O34QCuKQtxTy1NlfYC_KlPLU2V9gL8qXeX8H1zcqBK3_IqIKif0xVCTY-J5W2ET73REJ4X4qdY')",
              backgroundPosition: "0 0",
              backgroundSize: "auto",
              width: "36px",
              height: "36px",
              backgroundRepeat: "no-repeat",
              display: "inline-block",
            }}
          />
        </div>

        <span className="text-[15px] font-semibold text-[#050505] dark:text-[#e4e6eb]">
          Marketplace
        </span>
      </Link>

      <button className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-[#f2f2f2] dark:hover:bg-[#3a3b3c] transition-colors w-full text-left">
        <div className="w-9 h-9 rounded-full bg-[#e4e6ea] dark:bg-[#3a3b3c] flex items-center justify-center flex-shrink-0">
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5 text-[#050505] dark:text-[#e4e6eb]"
          >
            <path d="M10 13.5L5 8.5 6.4 7.1 10 10.7l3.6-3.6L15 8.5l-5 5z" />
          </svg>
        </div>

        <span className="text-[15px] font-semibold text-[#050505] dark:text-[#e4e6eb]">
          See more
        </span>
      </button>

      <hr className="my-2 border-[#ccc] dark:border-[#3a3b3c]" />

      <div className="px-2 py-1">
        <div className="flex items-center justify-between">
          <span className="text-[17px] font-semibold text-[#606770] dark:text-[#b0b3b8]">
            Your shortcuts
          </span>

          <button className="text-[14px] font-semibold text-[#1877f2] hover:underline px-2 py-1 cursor-pointer">
            Edit
          </button>
        </div>
      </div>

      <hr className="my-2 border-[#ccc] dark:border-[#3a3b3c]" />

      <div className="px-2 mt-2">
        <p className="text-[12px] text-[#8a8d91] dark:text-[#b0b3b8] leading-5">
          Privacy · Terms · Advertising · Ad Choices · Cookies · More
        </p>
      </div>
    </div>
  );
}

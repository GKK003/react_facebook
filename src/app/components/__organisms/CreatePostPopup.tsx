"use client";

import ProfilePicture from "@/app/components/__atoms/ProfilePicture";

type User = {
  displayName: string | null;
  photoURL: string | null;
  uid: string;
};

type Props = {
  user: User | null;
  postText: string;
  setPostText: (value: string) => void;
  selectedFiles: File[];
  setSelectedFiles: (value: File[]) => void;
  previewURLs: string[];
  setPreviewURLs: (value: string[]) => void;
  posting: boolean;
  closeCreatePost: () => void;
  handleCreatePost: () => void;
  handleFileSelect: (files: FileList | null) => void;
};

export default function CreatePostPopup({
  user,
  postText,
  setPostText,
  selectedFiles,
  setSelectedFiles,
  previewURLs,
  setPreviewURLs,
  posting,
  closeCreatePost,
  handleCreatePost,
  handleFileSelect,
}: Props) {
  const removePreviews = () => {
    previewURLs.forEach((url) => URL.revokeObjectURL(url));
    setSelectedFiles([]);
    setPreviewURLs([]);
  };

  const imageBoxClass = (count: number, index: number) => {
    if (count === 1) return "h-[360px]";
    if (count === 2) return "h-[260px]";
    if (count === 3 && index === 0) return "h-[260px] row-span-2";
    if (count === 3) return "h-[128px]";
    if (count === 4) return "h-[180px]";
    if (count === 5 && index < 2) return "h-[180px]";
    if (count === 5) return "h-[118px]";
    return "h-[140px]";
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-white/70 dark:bg-black/60 backdrop-blur-[1px] flex items-start justify-center pt-[80px] px-4"
      onClick={closeCreatePost}
    >
      <div
        className="w-[500px] max-h-[90vh] bg-white dark:bg-[#242526] rounded-xl shadow-[0_12px_28px_rgba(0,0,0,0.25)] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-[60px] flex items-center justify-center border-b border-[#dadde1] dark:border-[#3a3b3c]">
          <h2 className="text-[20px] font-bold text-[#050505] dark:text-[#e4e6eb]">
            Create post
          </h2>

          <button
            onClick={closeCreatePost}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#e4e6eb] dark:bg-[#3a3b3c] hover:bg-[#d8dadf] dark:hover:bg-[#4e4f50] flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="text-[34px] leading-none text-[#65676b] dark:text-[#b0b3b8] font-light">
              ×
            </span>
          </button>
        </div>

        <div className="px-4 pt-3 pb-4">
          <div className="flex items-center gap-3 mb-3">
            <ProfilePicture
              uid={user?.uid}
              src={user?.photoURL}
              name={user?.displayName}
              size={40}
              className="bg-gray-300 dark:bg-[#3a3b3c]"
              textClassName="text-sm"
            />

            <div>
              <p className="text-[15px] leading-[18px] font-semibold text-[#050505] dark:text-[#e4e6eb]">
                {user?.displayName || "Giorgi"}
              </p>

              <button
                type="button"
                className="mt-1 h-[24px] px-2 rounded-md bg-[#e4e6eb] dark:bg-[#3a3b3c] hover:bg-[#d8dadf] dark:hover:bg-[#4e4f50] flex items-center gap-1 text-[13px] cursor-pointer font-semibold text-[#050505] dark:text-[#e4e6eb]"
              >
                <img
                  src="https://static.xx.fbcdn.net/rsrc.php/yh/r/-V__UHZHkz0.webp?_nc_eui2=AeFpHJ2y6RmPb4-qKNiMZR1a9KzMkQPrWyn0rMyRA-tbKcqogbj1D9JjcRhLnvEIYxHnuk04DXOdZYgdmhgOF7U1"
                  alt=""
                  width={12}
                  height={12}
                />
                Friends
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-3.5 h-3.5 "
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
            className="w-full min-h-[135px] resize-none border-none outline-none bg-transparent text-[24px] leading-[30px] text-[#050505] dark:text-[#e4e6eb] placeholder-[#65676b] dark:placeholder-[#b0b3b8]"
            autoFocus
          />

          {previewURLs.length > 0 && (
            <div className="relative rounded-lg overflow-hidden border border-[#ced0d4] dark:border-[#3a3b3c] mb-3">
              <button
                onClick={removePreviews}
                className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-white dark:bg-[#3a3b3c] shadow flex items-center justify-center text-[22px] text-[#050505] dark:text-[#e4e6eb] cursor-pointer"
              >
                ×
              </button>

              <div
                className={`grid gap-1 bg-white dark:bg-[#242526] ${
                  previewURLs.length === 1 ? "grid-cols-1" : "grid-cols-2"
                }`}
              >
                {previewURLs.slice(0, 6).map((url, index) => (
                  <div
                    key={url}
                    className={`relative overflow-hidden bg-[#f0f2f5] dark:bg-[#18191a] ${imageBoxClass(
                      previewURLs.length,
                      index,
                    )}`}
                  >
                    <img
                      src={url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              className=" overflow-hidden  hover:brightness-95"
            >
              <img
                src="https://www.facebook.com/images/composer/SATP_Aa_square-2x.png"
                alt=""
                width={38}
                height={38}
                className="h-[38px] w-[38px] cursor-pointer"
              />
            </button>

            <button
              type="button"
              className="w-9 h-9 rounded-full hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c] flex items-center justify-center"
            >
              <i
                data-visualcompletion="css-img"
                aria-label="Emoji"
                role="img"
                className="inline-block h-6 w-6 bg-no-repeat cursor-pointer"
                style={{
                  backgroundImage:
                    'url("https://static.xx.fbcdn.net/rsrc.php/yU/r/7-A4siEWt6h.webp?_nc_eui2=AeHnnEPqcLjHprBUJ8t1o2h-UIdaYtQI3JpQh1pi1AjcmilivPILWWw29H42V5q1c7XKf6n3zhSsD-0jpast-dGv")',
                  backgroundPosition: "0px -87px",
                  backgroundSize: "auto",
                }}
              />
            </button>
          </div>

          <div className="h-[58px] border border-[#ced0d4] dark:border-[#3a3b3c] rounded-lg flex items-center justify-between px-4 mb-4">
            <span className="text-[15px] font-semibold text-[#050505] dark:text-[#e4e6eb]">
              Add to your post
            </span>

            <div className="flex items-center gap-2 sm:gap-1 ss:gap-0.5">
              <label className="w-9 h-9 rounded-full hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c] flex items-center justify-center cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={(e) => handleFileSelect(e.target.files)}
                />

                <img
                  src="https://static.xx.fbcdn.net/rsrc.php/yX/r/8_VnccIZfRa.webp?_nc_eui2=AeEBL_cDNQc_opfChelZCbEdtIBijxuqePS0gGKPG6p49LW21NmMjaD28WK2ZKAOosrOzVdwnBi_NPOPs--Ml1fS"
                  alt=""
                  width={24}
                  height={24}
                />
              </label>

              <button className="w-9 h-9 rounded-full hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c] flex items-center justify-center cursor-pointer">
                <img
                  src="https://static.xx.fbcdn.net/rsrc.php/yO/r/UnRgJelt7Mg.webp?_nc_eui2=AeH3mMt4LYRscGUGKvgZCsIBKt0A9dA7yJwq3QD10DvInBNquo9K_WwC0K1twrWSXreEcFCtUIJTRs0W6Emac0Lz"
                  alt=""
                  width={24}
                  height={24}
                />
              </button>

              <button className="w-9 h-9 rounded-full hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c] flex items-center justify-center cursor-pointer">
                <img
                  src="https://static.xx.fbcdn.net/rsrc.php/ya/r/XlpCJi9w2HF.webp?_nc_eui2=AeFR_6-Dj0VGhlXhb726y36TwIB16X8qm_nAgHXpfyqb-SfUGHSXRttsYM0-5XyRnZeMi249piBh_p9hoILb97g0"
                  alt=""
                  width={24}
                  height={24}
                />
              </button>

              <button className="w-9 h-9 rounded-full hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c] flex items-center justify-center cursor-pointer">
                <img
                  src="https://static.xx.fbcdn.net/rsrc.php/yC/r/glLNpLPayUm.webp?_nc_eui2=AeEMvF9L-7Jlf_owFIM6KkbLgn8XdsByLzuCfxd2wHIvOyfg0x9i4tBzEoo2L8kjgnqla5IFgpX1rxAl3nmlLctF"
                  alt=""
                  width={24}
                  height={24}
                />
              </button>

              <button className="w-9 h-9 rounded-full hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c] flex items-center justify-center ss:hidden cursor-pointer">
                <img
                  src="https://static.xx.fbcdn.net/rsrc.php/y1/r/pfuEaSjPXaI.webp?_nc_eui2=AeGyXLDFAYbp3nZBlmqYWLQbThQzZWtrp9hOFDNla2un2PIp8NEUHpv7utEFL54U3rI6NZ0e_-z44zC0PtOyUMdq"
                  alt=""
                  width={24}
                  height={24}
                />
              </button>

              <button className="w-9 h-9 rounded-full hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c] flex items-center justify-center sm:w-5 sm:h-5 gg:hidden cursor-pointer">
                <i
                  data-visualcompletion="css-img"
                  className="inline-block w-6 h-6 bg-no-repeat"
                  style={{
                    backgroundImage:
                      'url("https://static.xx.fbcdn.net/rsrc.php/yo/r/CZJCF7JUHD_.webp?_nc_eui2=AeGavi4Im7xFB0BJ-DPgl984K5z5Z-L5U4ErnPln4vlTgbRAqV9-ETbQcu7c1f2PA1gxjx2wt5WDfnWXCk8eQUbZ")',
                    backgroundPosition: "0px -83px",
                    backgroundSize: "auto",
                  }}
                />
              </button>
            </div>
          </div>

          <button
            onClick={handleCreatePost}
            disabled={
              (!postText.trim() && selectedFiles.length === 0) || posting
            }
            className="w-full h-[40px] rounded-lg bg-[#1877f2] hover:bg-[#166fe5] disabled:bg-[#e4e6eb] dark:disabled:bg-[#3a3b3c] disabled:text-[#bcc0c4] dark:disabled:text-[#777] disabled:hover:bg-[#e4e6eb] dark:disabled:hover:bg-[#3a3b3c] disabled:cursor-not-allowed text-white text-[15px] font-semibold transition-colors cursor-pointer"
          >
            {posting ? "Posting..." : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
}

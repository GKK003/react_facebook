"use client";

import Link from "next/link";
import Image from "next/image";
import Fb from "@/assets/images/fblogo.png";
import Collage from "@/assets/images/loginimage.webp";
import Meta from "@/assets/images/Metalogo.png";

export default function ForLogin() {
  return (
    <div className="bg-white flex flex-col font-sans relative">
      <div className="absolute top-10 left-11 lg:left-1/2 lg:-translate-x-1/2">
        <Image src={Fb} alt="Facebook" width={60} height={60} priority />
      </div>
      <div className="hidden lg:block absolute top-[131px] left-0 w-full border-t border-[#DADDE1]" />

      <div className="absolute bottom-60 left-10 max-w-[320px] lg:hidden">
        <h1 className="text-[58px] font-black leading-[1.05] tracking-tight">
          Explore <br /> the <br /> things <br />
          <span className="text-[#1877F2]">you love</span>.
        </h1>
      </div>

      <div className="flex items-center min-h-screen">
        <div className="w-full max-w-[1200px] ml-65 flex items-center lg:ml-0 lg:justify-center">
          <div className="flex-1 flex items-center lg:hidden">
            <div>
              <Image
                src={Collage}
                alt="Collage"
                width={1240}
                height={1540}
                className="object-contain "
              />
            </div>
          </div>

          <div className="w-[1px] bg-[#DADDE1] self-stretch mx-4 lg:hidden" />

          <div className="max-w-[550px] flex lg:w-full lg:justify-center xl:pr-6 lg:pr-0 sm:px-4 lg:pt-32 ">
            <div className="max-w-[550px] w-full ml-2   lg:ml-0">
              <h2 className="text-[17px] font-semibold text-[#1C1E21] mb-5">
                Log in to Facebook
              </h2>
              <input
                type="text"
                placeholder="Email address or mobile number"
                className="w-full h-[58px] px-4 mb-3 border border-[#CED0D4] rounded-[16px] text-[15px] outline-none focus:border-[#1877F2] focus:ring-2 focus:ring-[#1877F2]/20"
              />
              <input
                type="password"
                placeholder="Password"
                className="w-full h-[58px] px-4 mb-4 border border-[#CED0D4] rounded-[16px] text-[15px] outline-none focus:border-[#1877F2] focus:ring-2 focus:ring-[#1877F2]/20"
              />
              <button className="w-full h-[44px] bg-[#1877F2] hover:bg-[#166FE5] active:bg-[#145FDB] text-white text-[17px] font-semibold rounded-full transition">
                Log in
              </button>
              <div className="mt-4">
                <Link
                  href="#"
                  className="w-full h-[44px] flex items-center justify-center text-[15px] text-[#1C1E21] rounded-full hover:bg-[#F0F2F5] transition"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="border-t border-[#DADDE1] my-6" />
              <Link
                href="#"
                className="w-full h-[44px] flex items-center justify-center border border-[#1877F2] text-[#1877F2] text-[15px] font-semibold rounded-full hover:bg-[#e7f3ff]"
              >
                Create new account
              </Link>
              <div className="flex justify-center mt-6">
                <Image src={Meta} alt="Meta" width={50} height={26} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="border-t border-[#DADDE1] py-6 px-50">
        <div className="max-w-[980px] mx-auto text-[#606770] text-xs">
          <div className="flex flex-wrap gap-3 mb-3">
            {[
              "English (US)",
              "ქართული",
              "Русский",
              "Türkçe",
              "Deutsch",
              "Azərbaycan dili",
              "العربية",
              "More languages…",
            ].map((lang) => (
              <span key={lang} className="cursor-pointer">
                {lang}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 ">
            {[
              "Sign Up",
              "Log In",
              "Messenger",
              "Facebook Lite",
              "Video",
              "Meta Pay",
              "Meta Store",
              "Meta Quest",
              "Ray-Ban Meta",
              "Meta AI",
              "Instagram",
              "Threads",
              "Privacy Policy",
              "Privacy Center",
              "About",
              "Create ad",
              "Create Page",
              "Developers",
              "Careers",
              "Cookies",
              "Ad choices",
              "Terms",
              "Help",
              "Contact Uploading & Non-Users",
            ].map((item) => (
              <span key={item} className="cursor-pointer">
                {item}
              </span>
            ))}
          </div>

          <div className="mt-3">Meta © 2026.</div>
        </div>
      </footer>
    </div>
  );
}

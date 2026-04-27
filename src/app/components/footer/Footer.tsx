import React from "react";

function Footer() {
  return (
    <footer className="border-t border-[#DADDE1] py-6 px-50 lg:px30 sm:px-10">
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
  );
}

export default Footer;

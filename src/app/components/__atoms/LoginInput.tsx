"use client";

import { forwardRef } from "react";

type Props = {
  type?: string;
  placeholder: string;
  error?: string;
};

const LoginInput = forwardRef<HTMLInputElement, Props>(
  ({ type = "text", placeholder, error, ...rest }, ref) => {
    return (
      <div className="w-full mb-3">
        <input
          ref={ref}
          type={type}
          placeholder={placeholder}
          {...rest}
          className={`w-full h-[53px] px-4 rounded-[14px] border bg-white text-[#1c1e21] placeholder-[#8a8d91] outline-none transition-all duration-150
            ${
              error
                ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                : "border-[#ccd0d5] hover:border-[#1c1e21] focus:border-[#1877F2] focus:ring-2 focus:ring-[#e7f3ff]"
            }`}
        />

        {error && (
          <p className="flex items-center gap-1 text-red-500 text-[13px] mt-1">
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              width={16}
              height={16}
              aria-hidden="true"
              className="shrink-0"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm0 2c6.075 0 11-4.925 11-11S18.075 1 12 1 1 5.925 1 12s4.925 11 11 11zm1.25-7.002c0 .6-.416 1-1.25 1-.833 0-1.25-.4-1.25-1s.417-1 1.25-1zm-.374-8.125a.875.875 0 0 0-1.75 0v4.975a.875.875 0 1 0 1.75 0V7.873z"
              />
            </svg>

            <span>{error}</span>
          </p>
        )}
      </div>
    );
  },
);

LoginInput.displayName = "LoginInput";
export default LoginInput;

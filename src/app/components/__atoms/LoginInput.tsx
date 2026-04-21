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
      <div className="w-full px-4 mb-3">
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
        {error && <p className="text-red-500 text-[13px] mt-1">❗ {error}</p>}
      </div>
    );
  },
);

LoginInput.displayName = "LoginInput";
export default LoginInput;

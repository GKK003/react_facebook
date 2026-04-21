"use client";

import { forwardRef } from "react";

type Props = {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  error?: string;
};

const Input = forwardRef<HTMLInputElement, Props>(
  ({ value, onChange, placeholder, type = "text", error, ...rest }, ref) => {
    return (
      <div className="w-full">
        <input
          ref={ref}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          {...rest}
          className={`w-full h-[52px] px-4 rounded-xl border outline-none font-extrabold transition-all duration-150
            ${
              error
                ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                : "border-[#CED0D4] hover:border-[#1c1e21] focus:border-[#1877F2] focus:ring-2 focus:ring-[#e7f3ff]"
            }`}
        />
        {error && <p className="text-red-500 text-[13px] mt-1">❗ {error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";
export default Input;

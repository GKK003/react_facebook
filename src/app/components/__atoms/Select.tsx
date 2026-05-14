"use client";

import { useRef, useEffect } from "react";

type Option = {
  label: string;
  value: string;
};

type Props = {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  error?: string;
  open: boolean;
  setOpen: () => void;
};

export default function Select({
  options,
  value,
  onChange,
  placeholder,
  error,
  open,
  setOpen,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        if (open) setOpen();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [open]);

  return (
    <div ref={ref} className="relative w-full">
      <div
        onClick={setOpen}
        className={`h-[52px] px-4 flex items-center justify-between rounded-xl border cursor-pointer
          bg-white text-[#1c1e21] transition-all duration-150
          ${error ? "border-red-500" : "border-[#ccd0d5] hover:border-[#1c1e21]"}
          ${open ? "border-[#1877F2] ring-2 ring-[#e7f3ff]" : ""}
        `}
      >
        <span className={!value ? "text-gray-400" : ""}>
          {selected ? selected.label : placeholder}
        </span>
        <svg
          className={`${error ? "text-red-500" : "text-black"} `}
          viewBox="0 0 24 24"
          fill="currentColor"
          width={20}
          height={20}
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M4.341 7.247a1 1 0 0 0-.094 1.412l7 8a1 1 0 0 0 1.506 0l7-8a1 1 0 0 0-1.506-1.318L12 14.482l-6.247-7.14a1 1 0 0 0-1.412-.094z"
          />
        </svg>
      </div>

      {open && (
        <div className="absolute z-50 mt-2 w-full bg-white rounded-2xl shadow-lg max-h-[250px] overflow-y-auto">
          {options.map((opt) => (
            <div
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setOpen();
              }}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

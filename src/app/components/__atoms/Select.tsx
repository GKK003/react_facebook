"use client";

import { useState } from "react";

type Option = {
  label: string;
  value: string;
};

type Props = {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  error?: string; // ✅ STRING
};

export default function Select({
  options,
  value,
  onChange,
  placeholder,
  error,
}: Props) {
  const [open, setOpen] = useState(false);

  const selected = options.find((o) => o.value === value);

  return (
    <div className="relative w-full">
      <div
        onClick={() => setOpen(!open)}
        className={`h-[52px] px-4 flex items-center justify-between rounded-xl border cursor-pointer
          ${error ? "border-red-500" : "border-[#CED0D4]"}`}
      >
        <span className={!value ? "text-gray-400" : ""}>
          {selected ? selected.label : placeholder}
        </span>
        <span>⌄</span>
      </div>

      {open && (
        <div className="absolute z-50 mt-2 w-full bg-white rounded-2xl shadow-lg max-h-[250px] overflow-y-auto">
          {options.map((opt) => (
            <div
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
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

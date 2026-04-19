"use client";

type Props = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  error?: string;
};

export default function Input({
  value,
  onChange,
  placeholder,
  type = "text",
  error,
}: Props) {
  return (
    <div className="w-full">
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
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
}

type Props = {
  type?: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function LoginInput({
  type = "text",
  placeholder,
  value,
  onChange,
}: Props) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full h-[53px] px-4 mx-4 mb-3 rounded-[14px] border border-[#ccd0d5] bg-white text-[#1c1e21] placeholder-[#8a8d91] outline-none transition-all duration-150 hover:border-[#1c1e21] focus:border-[#1877F2] focus:ring-2 focus:ring-[#e7f3ff]"
    />
  );
}

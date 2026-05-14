"use client";

import Select from "../__atoms/Select";

type OpenSelect = "month" | "day" | "year" | "gender" | null;

type Props = {
  value: string;
  onChange: (v: string) => void;
  error?: string;
  openSelect: OpenSelect;
  setOpenSelect: (v: OpenSelect) => void;
};

export default function GenderField({
  value,
  onChange,
  error,
  openSelect,
  setOpenSelect,
}: Props) {
  return (
    <div>
      <label className="text-sm mb-1 block">Gender</label>
      <Select
        options={[
          { label: "Female", value: "female" },
          { label: "Male", value: "male" },
        ]}
        value={value}
        onChange={onChange}
        placeholder="Select gender"
        error={error}
        open={openSelect === "gender"}
        setOpen={() => setOpenSelect(openSelect === "gender" ? null : "gender")}
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
      )}{" "}
    </div>
  );
}

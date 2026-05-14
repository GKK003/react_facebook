"use client";

import Select from "../__atoms/Select";

type Birthday = {
  day: string;
  month: string;
  year: string;
};

type OpenSelect = "month" | "day" | "year" | "gender" | null;

type Props = {
  value: Birthday;
  onChange: (v: Birthday) => void;
  error?: string;
  openSelect: OpenSelect;
  setOpenSelect: (v: OpenSelect) => void;
};

export default function BirthdayFields({
  value,
  onChange,
  error,
  openSelect,
  setOpenSelect,
}: Props) {
  const months = [
    { label: "January", value: "1" },
    { label: "February", value: "2" },
    { label: "March", value: "3" },
    { label: "April", value: "4" },
    { label: "May", value: "5" },
    { label: "June", value: "6" },
    { label: "July", value: "7" },
    { label: "August", value: "8" },
    { label: "September", value: "9" },
    { label: "October", value: "10" },
    { label: "November", value: "11" },
    { label: "December", value: "12" },
  ];

  return (
    <div>
      <label className="text-sm mb-1 block">Birthday</label>
      <div className="flex gap-3">
        <Select
          options={months}
          value={value.month}
          onChange={(v) => onChange({ ...value, month: v })}
          placeholder="Month"
          error={error}
          open={openSelect === "month"}
          setOpen={() => setOpenSelect(openSelect === "month" ? null : "month")}
        />

        <Select
          options={[...Array(31)].map((_, i) => ({
            label: String(i + 1),
            value: String(i + 1),
          }))}
          value={value.day}
          onChange={(v) => onChange({ ...value, day: v })}
          placeholder="Day"
          error={error}
          open={openSelect === "day"}
          setOpen={() => setOpenSelect(openSelect === "day" ? null : "day")}
        />

        <Select
          options={[...Array(100)].map((_, i) => ({
            label: String(2025 - i),
            value: String(2025 - i),
          }))}
          value={value.year}
          onChange={(v) => onChange({ ...value, year: v })}
          placeholder="Year"
          error={error}
          open={openSelect === "year"}
          setOpen={() => setOpenSelect(openSelect === "year" ? null : "year")}
        />
      </div>
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

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

      {error && <p className="text-red-500 text-[13px] mt-1">❗ {error}</p>}
    </div>
  );
}

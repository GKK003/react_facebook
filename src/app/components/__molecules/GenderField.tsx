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

      {error && <p className="text-red-500 text-[13px] mt-1">❗ {error}</p>}
    </div>
  );
}

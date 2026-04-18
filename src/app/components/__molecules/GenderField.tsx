"use client";

import Select from "../__atoms/Select";

type Props = {
  value: string;
  onChange: (v: string) => void;
  error?: string;
};

export default function GenderField({ value, onChange, error }: Props) {
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
      />

      {error && <p className="text-red-500 text-[13px] mt-1">❗ {error}</p>}
    </div>
  );
}

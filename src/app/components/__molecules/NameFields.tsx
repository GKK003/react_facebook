import Input from "../__atoms/Input";

type Props = {
  firstName: string;
  lastName: string;
  setFirstName: (v: string) => void;
  setLastName: (v: string) => void;
  errors: {
    firstName: string;
    lastName: string;
  };
};

export default function NameFields({
  firstName,
  lastName,
  setFirstName,
  setLastName,
  errors,
}: Props) {
  return (
    <div className="flex gap-3">
      <Input
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        placeholder="First name"
        error={errors.firstName}
      />

      <Input
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        placeholder="Last name"
        error={errors.lastName}
      />
    </div>
  );
}

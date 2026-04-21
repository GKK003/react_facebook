import { UseFormRegister } from "react-hook-form";
import { RegisterFormValues } from "@/schemas/registerSchema";
import Input from "../__atoms/Input";

type Props = {
  register: UseFormRegister<RegisterFormValues>;
  errors: {
    firstName?: string;
    lastName?: string;
  };
};

export default function NameFields({ register, errors }: Props) {
  return (
    <div className="flex gap-3">
      <Input
        placeholder="First name"
        error={errors.firstName}
        {...register("firstName")}
      />

      <Input
        placeholder="Last name"
        error={errors.lastName}
        {...register("lastName")}
      />
    </div>
  );
}

"use client";

import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { registerSchema, RegisterFormValues } from "@/schemas/registerSchema";

import NameFields from "../__molecules/NameFields";
import BirthdayFields from "../__molecules/BirthdayFields";
import GenderField from "../__molecules/GenderField";
import Input from "../__atoms/Input";

import { auth, db } from "@/firebase/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRegisterStore } from "@/store/useRegisterStore";

export default function RegisterForm() {
  const router = useRouter();
  const { openSelect, setOpenSelect } = useRegisterStore();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      birthday: { day: "", month: "", year: "" },
      gender: "",
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      const userCred = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password,
      );

      const fullName = `${data.firstName} ${data.lastName}`.trim();

      await updateProfile(userCred.user, { displayName: fullName });

      await setDoc(doc(db, "users", userCred.user.uid), {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        birthday: data.birthday,
        gender: data.gender,
        createdAt: new Date(),
      });

      router.push("/home");
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div className="w-full flex flex-col gap-4 mb-5">
      <NameFields
        register={register}
        errors={{
          firstName: errors.firstName?.message,
          lastName: errors.lastName?.message,
        }}
      />

      <Controller
        name="birthday"
        control={control}
        render={({ field }) => (
          <BirthdayFields
            value={field.value}
            onChange={field.onChange}
            error={errors.birthday?.message}
            openSelect={openSelect}
            setOpenSelect={setOpenSelect}
          />
        )}
      />

      <Controller
        name="gender"
        control={control}
        render={({ field }) => (
          <GenderField
            value={field.value}
            onChange={field.onChange}
            error={errors.gender?.message}
            openSelect={openSelect}
            setOpenSelect={setOpenSelect}
          />
        )}
      />

      <Input
        placeholder="Mobile number or email"
        error={errors.email?.message}
        {...register("email")}
      />

      <p className="text-[13px] text-[#1c1e21]">
        You may receive notifications from us.{" "}
        <span className="text-[#1877F2] cursor-pointer">
          Learn why we ask for your contact information
        </span>
      </p>

      <Input
        type="password"
        placeholder="Password"
        error={errors.password?.message}
        {...register("password")}
      />

      <p className="text-[13px] text-[#1c1e21]">
        People who use our service may have uploaded your contact information to
        Facebook.{" "}
        <span className="text-[#1877F2] cursor-pointer">Learn more.</span>
      </p>

      <p className="text-[13px] text-[#1c1e21]">
        By tapping Submit, you agree to create an account and to Facebook's{" "}
        <span className="text-[#1877F2] cursor-pointer">Terms</span>,{" "}
        <span className="text-[#1877F2] cursor-pointer">Privacy Policy</span>{" "}
        and{" "}
        <span className="text-[#1877F2] cursor-pointer">Cookies Policy</span>.
      </p>

      <p className="text-[13px] text-[#1c1e21]">
        The{" "}
        <span className="text-[#1877F2] cursor-pointer">Privacy Policy</span>{" "}
        describes the ways we can use the information we collect when you create
        an account. For example, we use this information to provide, personalize
        and improve our products, including ads.
      </p>

      <button
        onClick={handleSubmit(onSubmit)}
        className="w-full h-[40px] bg-[#1877F2] text-white rounded-full cursor-pointer transition-all duration-200 hover:bg-[#166FE5] active:scale-[0.98]"
      >
        Submit
      </button>

      <Link
        href="/"
        className="w-full h-[44px] border border-[#ccd0d5] rounded-full text-[#1c1e21] bg-white transition duration-200 hover:bg-[#f0f2f5] active:bg-[#e4e6eb] flex justify-center items-center"
      >
        I already have an account
      </Link>
    </div>
  );
}

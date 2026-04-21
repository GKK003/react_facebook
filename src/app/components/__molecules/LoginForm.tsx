"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { loginSchema, LoginFormValues } from "@/schemas/loginSchema";

import Link from "next/link";
import LoginInput from "../__atoms/LoginInput";
import { useAuthStore } from "@/store/useAuthStore";

type Props = {
  onLogin: (data: LoginFormValues) => void;
};

export default function LoginForm({ onLogin }: Props) {
  const { setShowProfiles } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: yupResolver(loginSchema),
  });

  return (
    <>
      <h2 className="text-[17px] font-semibold text-[#1C1E21] mb-5 ml-5 flex items-center gap-5">
        <p
          onClick={() => setShowProfiles(true)}
          className="text-[25px] cursor-pointer w-[40px] h-[40px] rounded-full hover:bg-gray-100 flex justify-center items-center"
        >
          &lt;
        </p>
        Log in to Facebook
      </h2>

      <LoginInput
        type="email"
        placeholder="Email address"
        error={errors.email?.message}
        {...register("email")}
      />

      <LoginInput
        type="password"
        placeholder="Password"
        error={errors.password?.message}
        {...register("password")}
      />

      <button
        onClick={handleSubmit(onLogin)}
        className="w-full h-[40px] bg-[#1877F2] mx-4 text-white rounded-full hover:bg-[#166FE5] active:scale-[0.98] cursor-pointer"
      >
        Log in
      </button>

      <div className="mt-4">
        <Link
          href="#"
          className="w-full h-[40px] flex items-center justify-center mx-4 bg-white text-[#1c1e21] text-[14px] rounded-full hover:bg-[#f0f2f5] active:bg-[#e4e6eb]"
        >
          Forgot password?
        </Link>
      </div>

      <div className="border-t border-[#DADDE1] my-6" />

      <Link
        href="/Register"
        className="w-full h-[40px] mx-4 flex items-center justify-center border border-[#1877F2] text-[#1877F2] rounded-full hover:bg-[#f0f2f5] active:bg-[#e4e6eb]"
      >
        Create new account
      </Link>
    </>
  );
}

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
    <div className="w-full">
      <h2 className="text-[17px] font-semibold text-[#1C1E21] mb-5 flex items-center gap-5 px-4">
        <button
          type="button"
          aria-label="Back"
          onClick={() => setShowProfiles(true)}
          className="w-10 h-10 rounded-full flex items-center justify-center text-[#606770] hover:bg-[#f0f2f5] active:bg-[#e4e6eb] cursor-pointer transition-colors"
        >
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            width={20}
            height={20}
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M16.753 4.341a1 1 0 0 0-1.412-.094l-8 7a1 1 0 0 0 0 1.506l8 7a1 1 0 0 0 1.318-1.506L9.518 12l7.14-6.247a1 1 0 0 0 .094-1.412z"
            />
          </svg>
        </button>

        <span>Log in to Facebook</span>
      </h2>

      <div className="w-full px-4 flex flex-col gap-3">
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
          type="button"
          onClick={handleSubmit(onLogin)}
          className="w-full h-[40px] bg-[#1877F2] text-white rounded-full hover:bg-[#166FE5] active:scale-[0.98] cursor-pointer"
        >
          Log in
        </button>

        <Link
          href="#"
          className="w-full h-[40px] flex items-center justify-center bg-white text-[#1c1e21] text-[14px] rounded-full hover:bg-[#f0f2f5] active:bg-[#e4e6eb]"
        >
          Forgot password?
        </Link>

        <div className="border-t border-[#DADDE1] my-3" />

        <Link
          href="/Register"
          className="w-full h-[40px] flex items-center justify-center border border-[#1877F2] text-[#1877F2] rounded-full hover:bg-[#f0f2f5] active:bg-[#e4e6eb]"
        >
          Create new account
        </Link>
      </div>
    </div>
  );
}

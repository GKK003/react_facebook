"use client";

import RegisterForm from "@/app/components/__organisms/Registration";
import Image from "next/image";
import Link from "next/link";
import Meta from "@/assets/images/Metalogo.png";

export default function RegisterPage() {
  return (
    <div className="min-h-screen  flex justify-center">
      <div className="w-full max-w-[600px] flex flex-col">
        <div className="px-4 pt-6">
          <div className="flex items-center gap-3 mb-5">
            <Link href="/">
              <span className="text-[22px] cursor-pointer">←</span>
            </Link>

            <Image src={Meta} alt="Meta" width={40} height={20} />
          </div>

          <h1 className="text-[26px] font-semibold leading-7">
            Get started on Facebook
          </h1>

          <p className="text-[#606770] text-[15px] mt-2">
            Create an account to connect with friends, family and communities of
            people who share your interests.
          </p>
        </div>

        <div className="px-4 mt-6">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}

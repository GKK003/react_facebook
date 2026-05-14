import RegisterForm from "@/app/components/__organisms/Registration";
import Image from "next/image";
import Link from "next/link";
import Meta from "@/assets/images/Metalogo.png";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Facebook",
  description: "Facebook Registration Page",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen  flex justify-center bg-white">
      <div className="w-full max-w-[600px] flex flex-col">
        <div className="px-4 pt-6">
          <div className="flex flex-col justify-center items-start gap-3 mb-5">
            <Link
              href="/"
              className="w-10 h-10 rounded-full flex items-center justify-center text-[#606770] hover:bg-[#f0f2f5] active:bg-[#e4e6eb] cursor-pointer transition-colors"
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                width="20"
                height="20"
                aria-hidden="true"
                className="text-[#606770]"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M16.753 4.341a1 1 0 0 0-1.412-.094l-8 7a1 1 0 0 0 0 1.506l8 7a1 1 0 0 0 1.318-1.506L9.518 12l7.14-6.247a1 1 0 0 0 .094-1.412z"
                />
              </svg>
            </Link>

            <Image src={Meta} alt="Meta" width={60} height={40} />
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

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
    <div className="min-h-screen  flex justify-center">
      <div className="w-full max-w-[600px] flex flex-col">
        <div className="px-4 pt-6">
          <div className="flex flex-col justify-center items-start gap-3 mb-5">
            <Link href="/">
              <p className="text-[25px] cursor-pointer w-[40px] h-[40px] rounded-full hover:bg-gray-100 flex justify-center items-center">
                &lt;
              </p>
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

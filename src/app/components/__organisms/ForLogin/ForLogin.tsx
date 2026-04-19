"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

import { auth } from "@/firebase/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";

import Fb from "@/assets/images/fblogo.png";
import Collage from "@/assets/images/loginimage.webp";
import Meta from "@/assets/images/Metalogo.png";

export default function ForLogin() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      console.log("Logged in:", userCredential.user);
      alert("Login successful");
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(error.message);
      }
    }
  };

  const handleRegister = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      console.log("Registered:", userCredential.user);
      alert("Account created");
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(error.message);
      }
    }
  };

  return (
    <div className="bg-white flex flex-col  relative text-[#111112] overflow-x-hidden">
      <div className="absolute top-10 left-11 lg:left-1/2 lg:-translate-x-1/2">
        <Image src={Fb} alt="Facebook" width={55} height={55} priority />
      </div>

      <div className="hidden lg:block absolute top-[131px] left-0 w-full border-t border-[#DADDE1]" />

      <div className="absolute bottom-30 left-10 max-w-[320px] lg:hidden">
        <h1 className="text-[60px]  font-[600] leading-[1.05] tracking-tight">
          Explore <br /> the <br /> things <br />
          <span className="text-[#1877F2]">you love</span>.
        </h1>
      </div>

      <div className="flex items-center min-h-screen">
        <div className="w-full max-w-[1200px] mx-auto flex items-center justify-center translate-x-[100px] xl:translate-x-0">
          {" "}
          <div className="flex-1 flex items-center lg:hidden">
            <Image
              src={Collage}
              alt="Collage"
              className="object-contain w-[830px] h-[702px]"
            />
          </div>
          <div className="w-[1px] bg-[#DADDE1] self-stretch mx-4 lg:hidden" />
          <div className="max-w-[510px] w-full flex lg:w-full lg:justify-center xl:pr-6 lg:pr-0 sm:px-8 lg:pt-32">
            <div className="max-w-[490px] w-full ml-2 lg:ml-0">
              <h2 className="text-[17px] font-semibold text-[#1C1E21] mb-5 ml-5">
                Log in to Facebook
              </h2>

              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="  w-full h-[53px] px-4 mx-4 mb-3  rounded-[14px] border border-[#ccd0d5] bg-white text-[#1c1e21] placeholder-[#8a8d91] outline-none transition-all duration-150
 hover:border-[#1c1e21] focus:border-[#1877F2] focus:ring-2 focus:ring-[#e7f3ff]"
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="  w-full h-[53px] px-4 mx-4 mb-3  rounded-[14px] border border-[#ccd0d5] bg-white text-[#1c1e21] placeholder-[#8a8d91] outline-none transition-all duration-150
 hover:border-[#1c1e21] focus:border-[#1877F2] focus:ring-2 focus:ring-[#e7f3ff]"
              />

              <button
                onClick={handleLogin}
                className="w-full h-[40px] bg-[#1877F2] mx-4 text-white  rounded-full cursor-pointer transition-all duration-200 hover:bg-[#166FE5] active:scale-[0.98]"
              >
                Log in
              </button>

              <div className="mt-4">
                <Link
                  href="#"
                  className="
    w-full h-[40px]
    flex items-center justify-center
    mx-4

    bg-white
    text-[#1c1e21]
    text-[14px]

    
    rounded-full

    cursor-pointer
    select-none

    transition-colors duration-200

    hover:bg-[#f0f2f5]
    active:bg-[#e4e6eb]
  "
                >
                  Forgot password?
                </Link>
              </div>

              <div className="border-t border-[#DADDE1] my-6" />
              <Link
                href="/Register"
                className=" w-full h-[40px] mx-4 flex items-center justify-center border border-[#1877F2] text-[#1877F2] rounded-full cursor-pointer transition duration-200 hover:bg-[#f0f2f5] active:bg-[#e4e6eb]"
              >
                Create new account
              </Link>

              <div className="flex justify-center mt-6">
                <Image src={Meta} alt="Meta" width={50} height={26} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

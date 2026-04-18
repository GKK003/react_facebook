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
    <div className="bg-white flex flex-col font-sans relative">
      <div className="absolute top-10 left-11 lg:left-1/2 lg:-translate-x-1/2">
        <Image src={Fb} alt="Facebook" width={60} height={60} priority />
      </div>

      <div className="hidden lg:block absolute top-[131px] left-0 w-full border-t border-[#DADDE1]" />

      <div className="absolute bottom-60 left-10 max-w-[320px] lg:hidden">
        <h1 className="text-[58px] font-black leading-[1.05] tracking-tight">
          Explore <br /> the <br /> things <br />
          <span className="text-[#1877F2]">you love</span>.
        </h1>
      </div>

      <div className="flex items-center min-h-screen">
        <div className="w-full max-w-[1200px] ml-65 flex items-center lg:ml-0 lg:justify-center">
          <div className="flex-1 flex items-center lg:hidden">
            <Image
              src={Collage}
              alt="Collage"
              width={1240}
              height={1540}
              className="object-contain"
            />
          </div>

          <div className="w-[1px] bg-[#DADDE1] self-stretch mx-4 lg:hidden" />

          <div className="max-w-[550px] flex lg:w-full lg:justify-center xl:pr-6 lg:pr-0 sm:px-4 lg:pt-32">
            <div className="max-w-[550px] w-full ml-2 lg:ml-0">
              <h2 className="text-[17px] font-semibold text-[#1C1E21] mb-5">
                Log in to Facebook
              </h2>

              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-[58px] px-4 mb-3 border border-[#CED0D4] rounded-[16px]"
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-[58px] px-4 mb-4 border border-[#CED0D4] rounded-[16px]"
              />

              <button
                onClick={handleLogin}
                className="w-full h-[44px] bg-[#1877F2] text-white rounded-full"
              >
                Log in
              </button>

              <div className="mt-4">
                <Link
                  href="#"
                  className="w-full h-[44px] flex items-center justify-center"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="border-t border-[#DADDE1] my-6" />
              <Link
                href="/Register"
                className="w-full h-[44px] flex items-center justify-center border border-[#1877F2] text-[#1877F2] rounded-full"
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

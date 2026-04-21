"use client";

import { useEffect } from "react";
import Image from "next/image";

import { auth, db } from "@/firebase/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import Fb from "@/assets/images/fblogo.png";
import Collage from "@/assets/images/loginimage.webp";
import Meta from "@/assets/images/Metalogo.png";

import { useAuthStore } from "@/store/useAuthStore";
import LoginForm from "../../__molecules/LoginForm";
import ProfileList from "../../__molecules/ProfileList";
import ProfilePopup from "../../__molecules/ProfilePopup";

export default function ForLogin() {
  const {
    email,
    password,
    showProfiles,
    popup,
    selectedProfile,
    popupPassword,
    loadProfiles,
    saveProfile,
    resetLoginForm,
    closePopup,
  } = useAuthStore();

  useEffect(() => {
    loadProfiles();
  }, []);

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      let fullName = user.email || "";
      if (docSnap.exists()) {
        const data = docSnap.data();
        fullName =
          `${data.firstName || ""} ${data.lastName || ""}`.trim() ||
          user.email ||
          "";
      }

      saveProfile({ uid: user.uid, name: fullName, email: user.email || "" });
      resetLoginForm();
      alert("Login successful");
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handlePopupLogin = async () => {
    if (!selectedProfile) return;
    try {
      await signInWithEmailAndPassword(
        auth,
        selectedProfile.email,
        popupPassword,
      );
      closePopup();
      alert("Login successful");
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div className="bg-white flex flex-col relative text-[#111112] overflow-x-hidden">
      <div className="absolute top-10 left-11 lg:left-1/2 lg:-translate-x-1/2">
        <Image src={Fb} alt="Facebook" width={55} height={55} priority />
      </div>

      <div className="hidden lg:block absolute top-[131px] left-0 w-full border-t border-[#DADDE1]" />

      <div className="absolute bottom-30 left-10 max-w-[320px] lg:hidden">
        <h1 className="text-[60px] font-[600] leading-[1.05] tracking-tight">
          Explore <br /> the <br /> things <br />
          <span className="text-[#1877F2]">you love</span>.
        </h1>
      </div>

      <div className="flex items-center min-h-screen">
        <div className="w-full max-w-[1200px] mx-auto flex items-center justify-center translate-x-[100px] xl:translate-x-0">
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
              {!showProfiles ? (
                <LoginForm onLogin={handleLogin} />
              ) : (
                <ProfileList />
              )}

              <div className="flex justify-center mt-6">
                <Image src={Meta} alt="Meta" width={50} height={26} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {popup && selectedProfile && <ProfilePopup onLogin={handlePopupLogin} />}
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

import { auth, db } from "@/firebase/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import Fb from "@/assets/images/fblogo.png";
import Collage from "@/assets/images/loginimage.webp";
import Meta from "@/assets/images/Metalogo.png";
import NoProfile from "@/assets/images/noprofile.webp";

export default function ForLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showProfiles, setShowProfiles] = useState(false);
  const [profiles, setProfiles] = useState<any[]>([]);

  const [popup, setPopup] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [popupPassword, setPopupPassword] = useState("");

  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("profiles") || "[]");
    setProfiles(stored);
  }, []);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setPopup(false);
        setSelectedProfile(null);
        setPopupPassword("");
      }
    };

    if (popup) {
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [popup]);

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

      const stored = JSON.parse(localStorage.getItem("profiles") || "[]");

      const newProfile = {
        uid: user.uid,
        name: fullName,
        email: user.email || "",
      };

      const filtered = stored.filter((p: any) => p.uid !== user.uid);
      const updated = [newProfile, ...filtered].slice(0, 2);

      localStorage.setItem("profiles", JSON.stringify(updated));
      setProfiles(updated);
      setEmail("");
      setPassword("");

      alert("Login successful");
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handlePopupLogin = async () => {
    try {
      await signInWithEmailAndPassword(
        auth,
        selectedProfile.email,
        popupPassword,
      );

      setPopup(false);
      setPopupPassword("");
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

                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-[53px] px-4 mx-4 mb-3 rounded-[14px] border border-[#ccd0d5] bg-white text-[#1c1e21] placeholder-[#8a8d91] outline-none transition-all duration-150 hover:border-[#1c1e21] focus:border-[#1877F2] focus:ring-2 focus:ring-[#e7f3ff]"
                  />

                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-[53px] px-4 mx-4 mb-3 rounded-[14px] border border-[#ccd0d5] bg-white text-[#1c1e21] placeholder-[#8a8d91] outline-none transition-all duration-150 hover:border-[#1c1e21] focus:border-[#1877F2] focus:ring-2 focus:ring-[#e7f3ff]"
                  />

                  <button
                    onClick={handleLogin}
                    className="w-full h-[40px] bg-[#1877F2] mx-4 text-white rounded-full hover:bg-[#166FE5] active:scale-[0.98]"
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
              ) : (
                <>
                  <h2 className="text-[18px] font-semibold mb-6 text-center">
                    Log in to Facebook
                  </h2>

                  <div className="flex flex-col gap-4 px-4">
                    {profiles.map((profile) => (
                      <div
                        key={profile.uid}
                        className="flex items-center justify-between p-3 hover:bg-gray-100 rounded-xl cursor-pointer"
                        onClick={() => {
                          setSelectedProfile(profile);
                          setPopup(true);
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <Image
                            src={NoProfile}
                            alt="no profile pic"
                            width={55}
                            height={55}
                            className="rounded-full"
                          />
                          <span>{profile.name}</span>
                        </div>
                        <span>{">"}</span>
                      </div>
                    ))}

                    <button
                      onClick={() => setShowProfiles(false)}
                      className="w-full h-[45px] border rounded-full mt-4 hover:bg-gray-100 active:bg-gray-200"
                    >
                      Use another profile
                    </button>

                    <Link
                      href="/Register"
                      className="w-full h-[45px] flex items-center justify-center border border-[#1877F2] text-[#1877F2] rounded-full hover:bg-[#f0f2f5] active:bg-[#e4e6eb]"
                    >
                      Create new account
                    </Link>
                  </div>
                </>
              )}

              <div className="flex justify-center mt-6">
                <Image src={Meta} alt="Meta" width={50} height={26} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {popup && selectedProfile && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div
            ref={popupRef}
            className="bg-white w-[500px] rounded-2xl pt-10 pb-6 px-8 relative shadow-xl"
          >
            <button
              onClick={() => {
                setPopup(false);
                setSelectedProfile(null);
                setPopupPassword("");
              }}
              className="absolute top-4 right-4 text-[22px] text-gray-500 hover:text-black cursor-pointer"
            >
              ×
            </button>

            <div className="flex flex-col items-center">
              <Image
                src={selectedProfile.photoURL || NoProfile}
                alt="profile"
                width={110}
                height={110}
                className="rounded-full mb-4 object-cover"
              />

              <h2 className="text-[22px] font-semibold mb-4">
                {selectedProfile.name}
              </h2>

              <input
                type="password"
                placeholder="Password"
                value={popupPassword}
                onChange={(e) => setPopupPassword(e.target.value)}
                className="w-full h-[50px] px-4 rounded-xl border border-[#ccd0d5] outline-none
                  hover:border-black focus:border-[#1877F2] focus:ring-2 focus:ring-[#e7f3ff] mb-4"
              />

              <button
                onClick={handlePopupLogin}
                className="w-full h-[45px] bg-[#1877F2] text-white rounded-full
                  hover:bg-[#166FE5] active:scale-[0.98] transition cursor-pointer"
              >
                Log in
              </button>

              <p className="mt-4 text-[14px] text-gray-500 cursor-pointer hover:underline">
                Forgotten password?
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

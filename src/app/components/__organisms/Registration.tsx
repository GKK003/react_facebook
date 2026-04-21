"use client";

import NameFields from "../__molecules/NameFields";
import BirthdayFields from "../__molecules/BirthdayFields";
import GenderField from "../__molecules/GenderField";
import Input from "../__atoms/Input";

import { auth, db } from "@/firebase/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRegisterStore } from "@/store/useRegisterStore";

export default function RegisterForm() {
  const router = useRouter();

  const {
    firstName,
    lastName,
    email,
    password,
    birthday,
    gender,
    openSelect,
    errors,
    setFirstName,
    setLastName,
    setEmail,
    setPassword,
    setBirthday,
    setGender,
    setOpenSelect,
    setErrors,
    resetForm,
  } = useRegisterStore();

  const nameRegex = /^[A-Za-z]{2,30}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

  const validate = () => {
    const newErrors = {
      firstName:
        !firstName.trim() || !nameRegex.test(firstName)
          ? "What's your first name?"
          : "",
      lastName:
        !lastName.trim() || !nameRegex.test(lastName)
          ? "What's your last name?"
          : "",
      email:
        !email.trim() || !emailRegex.test(email)
          ? "Please enter a valid mobile number or email address."
          : "",
      password:
        !password || !passwordRegex.test(password)
          ? "Enter a combination of at least six numbers, letters and punctuation marks."
          : "",
      birthday:
        !birthday.day || !birthday.month || !birthday.year
          ? "Select your birthday. You can change who can see this later."
          : "",
      gender: !gender
        ? "Please choose a gender. You can change who can see this later."
        : "",
    };

    setErrors(newErrors);
    return Object.values(newErrors).every((e) => !e);
  };

  const handleRegister = async () => {
    if (!validate()) return;

    try {
      const userCred = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      await setDoc(doc(db, "users", userCred.user.uid), {
        firstName,
        lastName,
        email,
        birthday,
        gender,
        createdAt: new Date(),
      });

      resetForm();
      router.push("/");
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div className="w-full flex flex-col gap-4 mb-5">
      <NameFields
        firstName={firstName}
        lastName={lastName}
        setFirstName={setFirstName}
        setLastName={setLastName}
        errors={{ firstName: errors.firstName, lastName: errors.lastName }}
      />

      <BirthdayFields
        value={birthday}
        onChange={setBirthday}
        error={errors.birthday}
        openSelect={openSelect}
        setOpenSelect={setOpenSelect}
      />

      <GenderField
        value={gender}
        onChange={setGender}
        error={errors.gender}
        openSelect={openSelect}
        setOpenSelect={setOpenSelect}
      />

      <Input
        placeholder="Mobile number or email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
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
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
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
        onClick={handleRegister}
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

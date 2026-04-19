import Image from "next/image";
import HomePage from "./(pages)/HomePage/page";
import ForLogin from "./components/__organisms/ForLogin/ForLogin";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Facebook",
  description: "Facebook Login Page",
};

export default function Home() {
  return (
    <>
      <ForLogin />
    </>
  );
}

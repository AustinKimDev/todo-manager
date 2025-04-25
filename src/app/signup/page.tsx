"use client"; // Need client component to use useSearchParams

import { SignUpForm } from "@/components/auth/SignUpForm";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function SignUpPage() {
  const searchParams = useSearchParams();
  const message = searchParams.get("message");

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900 font-sans">
      <div className="w-full max-w-sm p-6 sm:p-8 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg shadow-xl">
        <h1 className="mb-6 text-center text-2xl font-semibold text-white/90">
          회원가입
        </h1>
        <SignUpForm />
        {message && (
          <p className="mt-4 text-center text-sm text-green-400/90 border border-green-400/30 bg-green-900/20 rounded p-2">
            {message}
          </p>
        )}
        <p className="mt-6 text-center text-sm text-gray-400">
          이미 계정이 있으신가요?{" "}
          <Link
            href="/login"
            className="font-medium text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
          >
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}

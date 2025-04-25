"use client"; // Need client component to use useSearchParams

import { LoginForm } from "@/components/auth/LoginForm";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const message = searchParams.get("message");

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900 font-sans">
      <div className="w-full max-w-sm p-6 sm:p-8 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg shadow-xl">
        <h1 className="mb-6 text-center text-2xl font-semibold text-white/90">
          로그인
        </h1>
        <LoginForm />
        {message && (
          <p className="mt-4 text-center text-sm text-yellow-400/90 border border-yellow-400/30 bg-yellow-900/20 rounded p-2">
            {message}
          </p>
        )}
        <p className="mt-6 text-center text-sm text-gray-400">
          계정이 없으신가요?{" "}
          <Link
            href="/signup"
            className="font-medium text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
          >
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}

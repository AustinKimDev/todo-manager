"use client";

import { login } from "@/app/(auth)/actions"; // Import the server action
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  return (
    <form className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="email">이메일</Label>
        <Input
          id="email"
          name="email" // Add name attribute for FormData
          type="email"
          required
          placeholder="you@example.com"
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="password">비밀번호</Label>
        <Input
          id="password"
          name="password" // Add name attribute for FormData
          type="password"
          required
          minLength={6}
        />
      </div>
      {/* Display error messages passed via URL search params if needed */}
      {/* Example: const searchParams = useSearchParams(); const errorMessage = searchParams.get('message'); */}
      <Button formAction={login} type="submit" className="w-full">
        로그인
      </Button>
    </form>
  );
}

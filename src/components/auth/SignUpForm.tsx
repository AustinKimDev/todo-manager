"use client";

import { signup } from "@/app/(auth)/actions"; // Import the server action
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignUpForm() {
  return (
    <form className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="email">이메일</Label>
        <Input
          id="email"
          name="email" // Add name attribute
          type="email"
          required
          placeholder="you@example.com"
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="password">비밀번호</Label>
        <Input
          id="password"
          name="password" // Add name attribute
          type="password"
          required
          minLength={6}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="confirmPassword">비밀번호 확인</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword" // This isn't directly used by Supabase signup, but good for client-side validation
          type="password"
          required
          minLength={6}
        />
      </div>
      <Button formAction={signup} type="submit" className="w-full">
        회원가입
      </Button>
    </form>
  );
}

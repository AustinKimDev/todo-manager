"use client"; // Make Header a Client Component to use usePathname

import { logout } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { type User } from "@supabase/supabase-js"; // Import User type
import clsx from "clsx"; // Import clsx
import { Gaegu } from "next/font/google"; // Import Gaegu
import Link from "next/link";
import { usePathname } from "next/navigation";

// Setup Gaegu font
const gaegu = Gaegu({
  // No need for variable here, just use className
  weight: ["400", "700"], // Specify weights
  subsets: ["latin"],
  display: "swap",
});

// Define props for Header
interface HeaderProps {
  user: User | null;
}

export default function Header({ user }: HeaderProps) {
  // Destructure user from props
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 p-3 sm:p-4 bg-gradient-to-b from-gray-900/50 via-gray-900/20 to-transparent">
      <div className="container mx-auto flex h-9 items-center justify-between max-w-screen-2xl px-1 sm:px-4">
        {/* Left side: Conditionally render Link to main page */}
        <div className="flex-1">
          {!isHomePage && (
            <Link
              href="/"
              className={clsx(
                "text-lg font-bold text-white/90 hover:text-white transition-colors duration-150",
                gaegu.className // Add Gaegu font class using clsx
              )}
            >
              My Planner
            </Link>
          )}
        </div>

        {/* Right side: Auth Status directly rendered here */}
        <div className="flex-none">
          {user ? (
            // Logged in state
            <div className="flex items-center gap-x-3 sm:gap-x-4">
              <span className="text-sm text-gray-300/90 hidden sm:inline">
                {user.email}
              </span>
              <form action={logout}>
                <Button
                  type="submit"
                  variant="link"
                  size="sm"
                  className="text-white/80 hover:text-white"
                >
                  로그아웃
                </Button>
              </form>
            </div>
          ) : (
            // Logged out state
            <div className="flex items-center">
              <Button
                asChild
                variant="link"
                size="sm"
                className="text-white/80 hover:text-white"
              >
                <Link href="/login">로그인</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

"use client"; // Error components must be Client Components

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const errorMessage =
    searchParams.get("message") || "An unexpected error occurred.";

  // You can add logging here
  useEffect(() => {
    console.error("Error page displayed:", errorMessage);
  }, [errorMessage]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-var(--header-height))]">
      <h2 className="text-2xl font-semibold text-destructive mb-4">
        오류 발생
      </h2>
      <p className="text-muted-foreground">{errorMessage}</p>
      {/* Optionally add a button to go back or retry */}
    </div>
  );
}

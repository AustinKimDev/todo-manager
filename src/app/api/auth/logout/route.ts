import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Supabase logout error:", error);
      return NextResponse.json({ error: "Logout failed" }, { status: 500 });
    }

    // Successfully signed out. Client will handle redirection.
    return NextResponse.json({ message: "Logout successful" });
  } catch (err) {
    console.error("Logout internal error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

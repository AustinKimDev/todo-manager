import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  // const requestUrl = new URL(request.url); // Removed unused variable
  const formData = await request.formData();
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));
  const supabase = await createClient(); // Add await and remove 'as any'

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Supabase login error:", error);
      // Provide a more generic error message to the client for security
      return NextResponse.json(
        { error: "Invalid login credentials" },
        { status: 400 }
      );
    }

    // On successful login, Supabase client handles the session cookie automatically.
    // Redirect the user to the desired page after login.
    // Using NextResponse.redirect might be preferable in some cases, but here we just confirm success.
    // The client-side logic will handle the actual redirection based on this success response.
    return NextResponse.json({ message: "Login successful" });
  } catch (err) {
    console.error("Login internal error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

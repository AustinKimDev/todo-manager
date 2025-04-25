import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
// import { PrismaClient } from '@/generated/prisma'; // Not used currently

// const prisma = new PrismaClient(); // Not used currently

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  const formData = await request.formData();
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));
  const supabase = createClient();

  try {
    // Use Supabase Auth for sign up
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${requestUrl.origin}/api/auth/callback`, // Or your desired redirect
      },
    });

    if (authError) {
      console.error("Supabase sign up error:", authError);
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    if (!authData.user) {
      console.error("Supabase sign up error: User data missing");
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }

    // Optionally, sync user data with your Prisma User model if needed
    // You might want to create a user profile or link data here.
    // Example: Create a user in your own DB after Supabase confirms sign-up
    // Be careful about race conditions or confirmation flows.
    // await prisma.user.create({
    //   data: {
    //     id: authData.user.id, // Use the ID from Supabase Auth
    //     email: authData.user.email,
    //   },
    // });

    // Usually, Supabase sends a confirmation email. The user is created but needs confirmation.
    // You might redirect the user to a page saying "Check your email"
    // Or handle the session immediately if email confirmation is disabled.

    return NextResponse.json({
      message: "Sign up successful, please check your email for confirmation.",
      userId: authData.user.id,
    });
  } catch (error) {
    console.error("Sign up internal error:", error);
    let errorMessage = "Internal Server Error";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

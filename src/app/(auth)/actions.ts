"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Login error:", error.message);
    // Redirect back to login page with an error message
    return redirect("/login?message=Could not authenticate user");
  }

  revalidatePath("/", "layout"); // Revalidate all paths
  redirect("/"); // Redirect to home page
}

export async function signup(formData: FormData) {
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));
  // It's often better to get origin from headers in server actions if needed
  // For emailRedirectTo, configure it directly in Supabase dashboard or use a fixed URL
  // const origin = headers().get('origin');
  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Configure the redirect URL in your Supabase project settings
      // emailRedirectTo: `${origin}/auth/confirm`,
    },
  });

  if (error) {
    console.error("Signup error:", error.message);
    // Redirect back to signup page with an error message
    return redirect("/signup?message=Could not authenticate user");
  }

  // Redirect to a page informing the user to check their email
  // Or handle differently based on whether email confirmation is enabled
  revalidatePath("/", "layout");
  return redirect("/signup?message=Check email to continue sign in process");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  revalidatePath("/", "layout");
  redirect("/login"); // Redirect to login page after logout
}

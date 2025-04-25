import App from "@/app/components/todo-app"; // Import the main app component
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  // Pass the user object (or null if not logged in) to the App component
  return <App user={data.user} />;
}

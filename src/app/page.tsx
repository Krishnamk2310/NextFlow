import { redirect } from "next/navigation";

export default function HomePage() {
  // Redirect the base URL directly to the application dashboard
  redirect("/dashboard");
}

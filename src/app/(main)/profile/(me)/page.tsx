import { redirect } from "next/navigation";

export default function ProfilePage() {
  // Redirect to tips tab (default tab)
  redirect("/profile/tips");
}

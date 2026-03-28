import { redirect } from "next/navigation";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  if (userId === "me") {
    redirect("/profile/tips");
  }
  redirect(`/profile/${userId}/tips`);
}

import { redirect } from "next/navigation";

export default async function SpotDefaultPage({ params }: { params: Promise<{ citySlug: string; spotSlug: string }> }) {
  const { citySlug, spotSlug } = await params;
  redirect(`/spots/${citySlug}/${spotSlug}/tips`);
}
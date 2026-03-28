import { ProfileTabsNav } from '@/components/profile/profile-tabs-nav';

export default function TabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Tab Navigation */}
      <ProfileTabsNav userId="me" />

      {/* Tab Content */}
      {children}
    </>
  );
}

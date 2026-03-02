import NavDock from "@/components/layout/nav-dock";
import TopBar from "@/components/layout/top-bar";
import Sidebar from "@/components/layout/sidebar";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-[#FDFDFD] selection:bg-cyan-100 selection:text-cyan-900">
      <NavDock />
      <div className="md:pl-20 min-h-screen flex flex-col">
        <TopBar />
        <div className="flex flex-1 w-full max-w-[1440px] mx-auto px-4 md:px-8 py-10 lg:gap-12">
          <main className="flex-1 min-w-0 pb-32 md:pb-12">
            {children}
          </main>
          <Sidebar />
        </div>
      </div>
    </div>
  );
}

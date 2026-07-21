import Header from "./Header";
import MobileNavigation from "./MobileNavigation";
import Sidebar from "./Sidebar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#f3f6fb]">
      <Sidebar />

      <div className="min-w-0 flex-1">
        <Header />
        <main className="mx-auto w-full max-w-[1680px] p-4 pb-28 md:p-7 md:pb-28 lg:pb-7">
          {children}
        </main>
      </div>

      <MobileNavigation />
    </div>
  );
}

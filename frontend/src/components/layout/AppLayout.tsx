import type { ReactNode } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";

type AppLayoutProps = {
  children: ReactNode;
};

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <main className="min-h-screen bg-slate-100">
      <div className="flex min-h-screen">
        <Sidebar />

        <section className="flex-1">
          <Header />
          {children}
        </section>
      </div>
    </main>
  );
}

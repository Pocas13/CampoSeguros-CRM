"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import AppLayout from "./AppLayout";
import { useAuth } from "@/providers/AuthProvider";

const publicPaths = ["/login", "/accept-invitation"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const isPublic = publicPaths.includes(pathname);

  useEffect(() => {
    if (!loading && !user && !isPublic) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
    if (!loading && user && pathname === "/login") {
      router.replace(user.role === "SUPER_ADMIN" ? "/platform/organizations" : "/dashboard");
    }
  }, [loading, user, isPublic, pathname, router]);

  if (isPublic) return <>{children}</>;
  if (loading || !user) return <div className="flex min-h-screen items-center justify-center bg-slate-950"><div className="h-11 w-11 animate-spin rounded-full border-4 border-cyan-400/15 border-t-cyan-400" aria-label="A validar sessão" /></div>;
  return <AppLayout>{children}</AppLayout>;
}

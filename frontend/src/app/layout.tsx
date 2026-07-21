import "./globals.css";
import type { Metadata } from "next";
import QueryProvider from "@/providers/QueryProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import AppShell from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "InsureFlow",
  description: "Plataforma privada de gestão e comparação para mediação de seguros",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="pt"><body><QueryProvider><AuthProvider><AppShell>{children}</AppShell></AuthProvider></QueryProvider></body></html>;
}

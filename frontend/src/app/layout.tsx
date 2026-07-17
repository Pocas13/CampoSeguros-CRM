import "./globals.css";

import type { Metadata } from "next";

import AppLayout from "@/components/layout/AppLayout";

export const metadata: Metadata = {
  title: "InsureFlow",
  description: "Software de Gestão de Seguros",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt">

      <body>

        <AppLayout>

          {children}

        </AppLayout>

      </body>

    </html>
  );
}
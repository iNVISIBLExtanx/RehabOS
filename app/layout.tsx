import type { Metadata } from "next";
import { SyntheticBanner } from "@/components/shared/SyntheticBanner";
import "./globals.css";

export const metadata: Metadata = {
  title: "RehabOS — FunctionAbility Demo",
  description:
    "AI Clinical Notes Pipeline · DB & SQL Explorer · WinForms Modernization Demo. Synthetic data only.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <SyntheticBanner />
        {children}
      </body>
    </html>
  );
}

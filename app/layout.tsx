import type React from "react";
import type { Metadata } from "next";
import { Inter, Roboto } from "next/font/google";
import "./globals.css";
import AuthGuard from "@/components/AuthGuard";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { WithSidebar } from "@/components/leftsidebar";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const roboto = Roboto({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto",
  weight: ["300", "400", "500", "700"],
});

export const metadata: Metadata = {
  title: "LegalEase AI - Demystify Legal Documents with AI",
  description:
    "Upload contracts, agreements, or terms of service and get clear, simple explanations instantly.",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${roboto.variable} antialiased`}
    >
      <body className="font-sans">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <LanguageProvider>
            <AuthGuard>
              <WithSidebar>{children}</WithSidebar>
            </AuthGuard>
            <Toaster />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

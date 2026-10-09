import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/lib/auth-context";
import { Navbar } from "@/components/navbar";
import { BottomNav } from "@/components/bottom-nav";
import { FloatingGrace } from "@/components/floating-grace";
import { Footer } from "@/components/footer";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "graceAI — Eat well. Live gracefully.",
  description:
    "Your calm, personalized wellness and culinary guide. Meal planning, nutrition tracking, global recipes, and warm AI guidance. 100% free and privacy-first.",
  keywords: [
    "graceAI",
    "meal planner",
    "health tracker",
    "nutrition calculator",
    "diet planner India",
    "global healthy recipes",
    "wellness companion",
  ],
  authors: [{ name: "graceAI Team" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--text)] selection:bg-[var(--primary)]/20 selection:text-[var(--text)] pb-16 md:pb-0">
        <ThemeProvider>
          <AuthProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <FloatingGrace />
            <BottomNav />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

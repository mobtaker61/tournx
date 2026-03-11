import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "پنل ادمین تورنمنت تخته‌نرد",
  description: "مدیریت تورنمنت تخته‌نرد - حذف دوگانه",
};

const nav = [
  { href: "/dashboard", label: "داشبورد" },
  { href: "/players", label: "بازیکنان" },
  { href: "/matches", label: "مسابقات" },
  { href: "/rounds", label: "راندها" },
  { href: "/bracket", label: "براکت" },
];

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}>
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/dashboard" className="font-bold text-lg">
              🎲 تورنمنت تخته‌نرد
            </Link>
            <nav className="flex gap-4">
              {nav.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="container mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
}

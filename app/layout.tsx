import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar"; // ✅ 1. Import Navbar
import InstallPWAButton from "@/components/InstallPWAButton"


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BuildSite App", // Updated title
  description: "Construction site management platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* ✅ 2. Add Navbar here */}
        <Navbar />
        
        {/* ✅ 3. Add padding-top (pt-16) so content isn't hidden behind the fixed navbar */}
        <main className="pt-16">


        <InstallPWAButton />
          {children}
        </main>
      </body>
    </html>
  );
}
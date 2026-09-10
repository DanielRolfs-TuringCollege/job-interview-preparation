import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Interview Practice App",
  description:
    "Paste a job description, get the skills it asks for and practice them with multiple choice questions.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`h-full font-sans antialiased ${inter.variable} ${geistMono.variable}`}
    >
      <body className="h-full flex flex-col overflow-hidden">{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display, Lato } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const lato = Lato({
  variable: "--font-lato",
  weight: ["300", "400"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Under the Stars",
  description: "A digital memory.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} ${lato.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

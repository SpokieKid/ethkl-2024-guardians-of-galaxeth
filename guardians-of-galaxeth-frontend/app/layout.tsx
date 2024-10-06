import type { Metadata } from "next";
import { Pixelify_Sans, Inter, Roboto_Mono } from 'next/font/google';
import "./globals.css";

const pixelifySans = Pixelify_Sans({
  subsets: ['latin'],
  variable: '--font-pixelify-sans',
});

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto-mono',
});

export const metadata: Metadata = {
  title: "Guardians of GalaxETH",
  description: "An on-chain game to protect the Ethereum network",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={pixelifySans.variable}>
      <body>{children}</body>
    </html>
  );
}
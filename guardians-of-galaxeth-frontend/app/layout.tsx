import type { Metadata } from "next";
import { Pixelify_Sans, Inter, Roboto_Mono } from 'next/font/google';
import "./globals.css";

const pixelifySans = Pixelify_Sans({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
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
    <html lang="en">
      <body
        className={`${pixelifySans.variable} ${inter.variable} ${robotoMono.variable} font-sans antialiased bg-black text-white min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
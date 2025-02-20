import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Footer from "./footer";

export const dynamic = "force-dynamic";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Claim Deployments Demo",
  description: "Claiming deployments using Project transfer flow",
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
        <div className="min-h-screen flex flex-col justify-between items-center bg-neutral-50 pt-5">
          <div className="my-auto w-full max-w-2xl">{children}</div>
          <Footer />
        </div>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";
import Footer from "./footer";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";

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
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} antialiased h-full`}
    >
      <body className="flex min-h-full flex-col flex-col justify-between items-center sm:bg-neutral-50 pt-5 sm:px-6">
        <div className="flex-1 sm:flex-none bg-white rounded-xl sm:shadow-md overflow-hidden sm:border sm:border-neutral-200 p-6 sm:my-auto w-full max-w-2xl">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}

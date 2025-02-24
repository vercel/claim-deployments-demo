import type { Metadata } from "next";
import "./globals.css";
import Footer from "./footer";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";

export const dynamic = "force-dynamic";

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
      className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
    >
      <body>
        <div className="font-geist-sans min-h-screen flex flex-col justify-between items-center bg-neutral-50 pt-5">
          <div className="my-auto w-full max-w-2xl">{children}</div>
          <Footer />
        </div>
      </body>
    </html>
  );
}

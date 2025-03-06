"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ClaimDeploymentButton({ code }: { code: string }) {
  const [returnUrl, setReturnUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setReturnUrl(window.location.origin);
    }
  }, []);

  return (
    <Link
      href={`https://vercel.com/claim-deployment?code=${code}&returnUrl=${returnUrl}`}
    >
      {" "}
      <button
        type="button"
        className="w-full h-10 flex items-center justify-center p-2 rounded-lg transition-colors duration-200 border bg-black text-white text-sm hover:opacity-80 focus:outline-hidden focus:ring-0"
      >
        <Image
          alt="Vercel Logo"
          src="/icons/vercel.svg"
          width={17}
          height={17}
          className="mr-2"
          loading="eager"
        />
        Claim Deployment
      </button>
    </Link>
  );
}

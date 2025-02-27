"use client";

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
        className="mt-6 w-full h-10 flex items-center justify-center p-2 rounded-lg transition-colors duration-200 border bg-black text-white text-sm hover:opacity-80 focus:outline-none focus:ring-0"
      >
        <svg
          width={17}
          height={17}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="mr-2"
        >
          <title>Claim Deployment Icon</title>
          <path d="M12 2L22 22H2L12 2Z" fill="white" />
        </svg>
        Claim Deployment
      </button>
    </Link>
  );
}

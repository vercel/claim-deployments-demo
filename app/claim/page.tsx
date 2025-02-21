"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function ClaimPage() {
  const searchParams = useSearchParams();

  const code = searchParams.get("code");
  const previewUrl = searchParams.get("previewUrl");

  if (!code || !previewUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Invalid Link
            </h1>
            <p className="text-gray-600">
              This claim link appears to be invalid or expired.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-neutral-200 p-8">
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-neutral-800">
            Your Deployment is Ready
          </h2>
          <p className="text-sm text-neutral-500 mt-2">
            Preview your site and claim it to your account
          </p>
        </div>

        <button
          type="button"
          className="w-full flex items-center gap-2 p-4 rounded-lg transition-colors duration-200 border bg-white border-gray-200 text-sm text-gray-700 hover:bg-gray-100"
          onClick={() => window.open(previewUrl, "_blank")}
        >
          <span className="flex-1 text-left break-all">{previewUrl}</span>
          <Image
            alt="External link"
            src="icons/external-link.svg"
            width={16}
            height={16}
          />
        </button>

        <p className="text-sm text-neutral-700">
          By claiming this deployment, you&apos;ll be able to manage it from
          your own account and make future updates.
        </p>

        <Link
          href={`https://vercel.com/claim-deployment?code=${code}&returnUrl=${window.location.origin}`}
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
      </div>
    </div>
  );
}

import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <div className="mb-5 mt-5">
      <div className="flex items-center justify-center space-x-4">
        <Link
          href="https://github.com/vercel/claim-deployments-demo"
          target="_blank"
          title="GitHub Repository"
        >
          <Image
            alt="GitHub Repository"
            src="/icons/github.svg"
            width={20}
            height={20}
          />
          <span className="sr-only">Repository</span>
        </Link>
        <div className="mx-2 h-4 w-px bg-gray-300" />
        <Link
          href="https://vercel.com/docs/deployments/claim-deployments"
          target="_blank"
          title="Documentation"
        >
          <Image
            alt="Documentation"
            src="/icons/document.svg"
            width={20}
            height={20}
          />
          <span className="sr-only">Documentation</span>
        </Link>
      </div>
      <div className="text-sm text-gray-500 mt-4">
        © {new Date().getFullYear()} Vercel, Inc. All rights reserved.
      </div>
    </div>
  );
}

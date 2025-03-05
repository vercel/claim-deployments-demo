import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="py-8">
      <div className="flex flex-wrap items-center justify-center space-x-6">
        <Link
          className="flex items-center hover:text-gray-600 transition-colors"
          href="https://github.com/vercel/claim-deployments-demo"
          target="_blank"
          rel="noopener noreferrer"
          title="GitHub Repository"
        >
          <Image
            alt="GitHub Repository"
            src="/icons/github.svg"
            width={20}
            height={20}
            className="flex-shrink-0"
          />
          <span className="ml-2">GitHub Repository</span>
        </Link>
        <div className="h-6 w-px bg-gray-300" />
        <Link
          className="flex items-center hover:text-gray-600 transition-colors"
          href="https://vercel.com/docs/deployments/claim-deployments"
          target="_blank"
          rel="noopener noreferrer"
          title="Documentation"
        >
          <Image
            alt="Documentation"
            src="/icons/document.svg"
            width={20}
            height={20}
            className="flex-shrink-0"
          />
          <span className="ml-2">Documentation</span>
        </Link>
        <div className="hidden sm:block h-6 w-px bg-gray-300" />
        <Link
          className="flex items-center hover:text-gray-600 transition-colors sm:w-auto w-full justify-center sm:justify-start pt-4 sm:pt-0"
          href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvercel%2Fclaim-deployments-demo&env=ACCESS_TOKEN,TEAM_ID"
          target="_blank"
          rel="noopener noreferrer"
          title="Deploy to Vercel"
        >
          <Image
            alt="Deploy to Vercel"
            src="/icons/vercel-dark.svg"
            width={20}
            height={20}
            className="flex-shrink-0"
          />
          <span className="ml-2">Deploy to Vercel</span>
        </Link>
      </div>
      <div className="mt-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Vercel, Inc. All rights reserved.
      </div>
    </footer>
  );
}

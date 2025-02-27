"use client";

import Image from "next/image";

export default function PreviewUrlIcon({ previewUrl }: { previewUrl: string }) {
  return (
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
  );
}

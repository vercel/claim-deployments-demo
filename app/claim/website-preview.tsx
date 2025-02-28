import Image from "next/image";
import { generatePreview } from "../actions/generate-preview";

export default async function WebsitePreview({ url }: { url: string }) {
  const result = await generatePreview(url);

  if (result.error) {
    return (
      <div className="h-[200px] flex items-center justify-center bg-gray-100 rounded-lg p-6">
        <p className="text-sm text-gray-600">{result.error}</p>
      </div>
    );
  }

  return (
    <Image
      src={result.imageUrl as string}
      alt="Website preview"
      width={1280}
      height={720}
      className="h-[200px] object-cover rounded-lg border"
    />
  );
}

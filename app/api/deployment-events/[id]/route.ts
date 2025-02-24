import { VERCEL_API_URL } from "@/app/utils/constants";
import type { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return fetch(
    `${VERCEL_API_URL}/v3/deployments/${
      (await params).id
    }/events?${req.nextUrl.searchParams.toString()}`,
    {
      headers: {
        authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
      },
    }
  );
}

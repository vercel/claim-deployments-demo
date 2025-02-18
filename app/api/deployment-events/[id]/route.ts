import { VERCEL_API_URL } from "@/app/utils/constants";
import { type NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return fetch(
    `${VERCEL_API_URL}/v3/deployments/${
      params.id
    }/events?${req.nextUrl.searchParams.toString()}`,
    {
      headers: {
        authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
      },
    }
  );
}

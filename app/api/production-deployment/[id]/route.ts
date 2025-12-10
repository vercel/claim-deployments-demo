import { VERCEL_API_URL } from "@/app/utils/constants";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const res = await fetch(
    `${VERCEL_API_URL}/v1/projects/${(await params).id}/production-deployment`,
    {
      headers: {
        authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
      },
    }
  );

  const json = await res.json();

  return NextResponse.json(json, { status: res.status });
}

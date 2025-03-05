import { VERCEL_API_URL } from "@/app/utils/constants";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { projectId } = await req.json();

  const res = await fetch(
    `${VERCEL_API_URL}/v9/projects/${projectId}/transfer-request?teamId=${process.env.TEAM_ID}`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
      },
      body: JSON.stringify({}),
    }
  );

  const json = await res.json();

  return NextResponse.json(json, { status: res.status });
}

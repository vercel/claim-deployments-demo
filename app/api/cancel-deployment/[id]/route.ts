import { VERCEL_API_URL } from "@/app/utils/constants";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const deploymentId = (await params).id;

  try {
    const response = await fetch(
      `${VERCEL_API_URL}/v12/deployments/${deploymentId}/cancel`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to cancel deployment: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

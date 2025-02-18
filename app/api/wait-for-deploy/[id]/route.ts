import { VERCEL_API_URL } from "@/app/utils/constants";
import { type NextRequest, NextResponse } from "next/server";

async function checkDeploymentStatus(url: string) {
  const response = await fetch(
    `${VERCEL_API_URL}/v13/deployments/get/?url=${url}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
        "Cache-Control": "no-cache",
      },
      cache: "no-cache",
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to check deployment status: ${response.statusText}`
    );
  }

  return response.json();
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id: deploymentId } = params;

  try {
    const maxWaitTime = 4 * 60000; // 4 minutes
    const intervalTime = 3000; // 3 seconds
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitTime) {
      const deploymentStatus = await checkDeploymentStatus(deploymentId);

      if (deploymentStatus.readyState === "READY") {
        return NextResponse.json({ status: "success", data: deploymentStatus });
      }

      if (deploymentStatus.readyState === "ERROR") {
        return NextResponse.json(
          { status: "error", message: "Deployment failed" },
          { status: 400 }
        );
      }

      await new Promise((resolve) => setTimeout(resolve, intervalTime));
    }

    return NextResponse.json(
      { status: "error", message: "Deployment status check timed out" },
      { status: 408 }
    );
  } catch (error) {
    console.error("Error checking deployment status:", error);
    return NextResponse.json(
      { status: "error", message: "Failed to check deployment status" },
      { status: 500 }
    );
  }
}

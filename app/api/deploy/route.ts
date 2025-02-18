import { type NextRequest, NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { VERCEL_API_URL } from "@/app/utils/constants";

const token = process.env.VERCEL_TOKEN;
const teamId = process.env.VERCEL_TEAM_ID;

if (!token) {
  throw new Error("VERCEL_TOKEN is required");
}

if (!teamId) {
  throw new Error("VERCEL_TEAM_ID is required");
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const templateKey = formData.get("template") as string;
    const file = formData.get("file") as File;

    let localFileBuffer: Buffer | undefined;
    let localFileSha: string | undefined;
    let fileSha: string | undefined;

    if (templateKey) {
      const templateFilePath = path.join(
        process.cwd(),
        "templates",
        `${templateKey}.tgz`
      );
      try {
        localFileBuffer = await fs.readFile(templateFilePath);
        localFileSha = crypto
          .createHash("sha1")
          .update(localFileBuffer)
          .digest("hex");
      } catch (err) {
        console.error(`Error reading template file: ${(err as Error).message}`);
        return NextResponse.json(
          { error: `Template file '${templateKey}' not found` },
          { status: 400 }
        );
      }
    } else {
      const fileArrayBuffer = await file.arrayBuffer();
      const fileBuffer = Buffer.from(fileArrayBuffer);
      fileSha = crypto.createHash("sha1").update(fileBuffer).digest("hex");
    }

    const uploadResponse = await fetch(
      `${VERCEL_API_URL}/v2/files?teamId=${teamId}`,
      {
        method: "POST",
        body: localFileBuffer || file,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/octet-stream",
          "x-vercel-digest": (localFileSha || fileSha) as string,
        },
      }
    );

    if (!uploadResponse.ok) {
      return NextResponse.json(
        { error: "Failed to upload file" },
        { status: 500 }
      );
    }

    const deploymentResponse = await fetch(
      `${VERCEL_API_URL}/v12/now/deployments?teamId=${teamId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          files: [
            {
              file: ".vercel/source.tgz",
              sha: localFileSha || fileSha,
            },
          ],
          projectSettings: {
            framework: templateKey || "nextjs",
          },
          name: `temp-project-${generateRandomId(10)}`,
        }),
      }
    );

    if (!deploymentResponse.ok) {
      return NextResponse.json(
        { error: "Failed to create deployment" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { deployment: await deploymentResponse.json() },
      { status: 200 }
    );
  } catch (error) {
    console.error("Deployment error:", error);
    return NextResponse.json(
      { error: "Failed to create deployment" },
      { status: 500 }
    );
  }
}

function generateRandomId(length: number) {
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  let randomId = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomId += characters[randomIndex];
  }
  return randomId;
}

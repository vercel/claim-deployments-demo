"use server";

import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import * as chromeLauncher from "chrome-launcher";

export async function generatePreview(url: string) {
  try {
    const chromePath = await getChromePath();

    const browser = await puppeteer.launch({
      executablePath: chromePath,
      headless: true,
    });

    const page = await browser.newPage();

    await page.setViewport({
      width: 1280,
      height: 720,
      deviceScaleFactor: 1,
    });

    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    const screenshot = await page.screenshot({
      type: "jpeg",
      quality: 80,
      encoding: "base64",
    });

    await browser.close();

    return {
      imageUrl: `data:image/jpeg;base64,${screenshot}`,
    };
  } catch (error) {
    console.error("Error generating preview:", error);
    return {
      error: "Failed to generate preview.",
    };
  }
}

async function getChromePath() {
  if (process.env.NODE_ENV === "development") {
    return chromeLauncher.Launcher.getFirstInstallation();
  }

  return chromium.executablePath();
}

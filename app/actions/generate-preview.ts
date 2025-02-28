"use server";

import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import * as chromeLauncher from "chrome-launcher";

export async function generatePreview(url: string) {
  try {
    const options = await getPuppeteerOptions();

    const browser = await puppeteer.launch(options);

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

async function getPuppeteerOptions() {
  if (process.env.NODE_ENV === "development") {
    return {
      executablePath: chromeLauncher.Launcher.getFirstInstallation(),
    };
  }

  return {
    args: chromium.args,
    executablePath: await chromium.executablePath(),
  };
}

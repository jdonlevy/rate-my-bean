import { auth } from "@/auth";
import { addRating, createBean, findDuplicateBean, getBeans, getBeanFieldSuggestions } from "@/lib/db";
import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
import os from "os";

export async function GET() {
  const beans = await getBeans();
  const suggestions = await getBeanFieldSuggestions();
  return Response.json({ beans, suggestions });
}

export async function POST(request) {
  const session = await auth();
  if (!session?.user?.email) {
    return Response.json(
      { error: "Sign in required to add a bean." },
      { status: 401 }
    );
  }

  const body = await request.formData();
  const name = body.get("name");
  const originCountry = body.get("originCountry");
  const roaster = body.get("roaster");
  const reviewerName = body.get("reviewerName");
  const roasterUrlInput = body.get("roasterUrl");
  const originRegion = body.get("originRegion");
  const blend = body.get("blend");
  const process = body.get("process");
  const roastLevel = body.get("roastLevel");
  const priceUsd = body.get("priceUsd");
  const flavorNotes = body.get("flavorNotes");
  const bagImage = body.get("bagImage");
  const coffeeImage = body.get("coffeeImage");
  const ratingScore = body.get("ratingScore");
  const ratingNotes = body.get("ratingNotes");
  const ratingPricePaid = body.get("ratingPricePaid");

  if (!name || !originCountry) {
    return Response.json(
      { error: "name and originCountry are required" },
      { status: 400 }
    );
  }

  const duplicate = await findDuplicateBean({
    name: name.toString(),
    roaster: roaster?.toString() || "",
    originCountry: originCountry.toString(),
    originRegion: originRegion?.toString() || "",
  });
  if (duplicate) {
    return Response.json(
      { error: "A bean with the same name, roaster, and origin already exists." },
      { status: 409 }
    );
  }

  const maxBytes = 5 * 1024 * 1024;
  const allowedTypes = new Set([
    "image/jpeg",
    "image/png",
    "image/heic",
    "image/heif",
  ]);
  const ocrTypes = new Set(["image/jpeg", "image/png", "image/heic", "image/heif"]);

  async function readImage(file) {
    if (!file || typeof file === "string") {
      return { buffer: null, type: null };
    }
    if (file.size > maxBytes) {
      throw new Error("Images must be 5MB or smaller.");
    }
    if (!allowedTypes.has(file.type)) {
      throw new Error("Only JPEG, PNG, or HEIC images are allowed.");
    }
    const arrayBuffer = await file.arrayBuffer();
    return { buffer: Buffer.from(arrayBuffer), type: file.type };
  }

  const execFileAsync = promisify(execFile);

  function pickBestUrl(urls) {
    if (!urls || urls.length === 0) return null;
    const normalized = urls.map((url) => {
      const trimmed = url.replace(/[),.;:]+$/, "");
      return trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
    });

    const preferredTlds = [".coffee", ".co", ".com", ".org", ".net"];
    for (const tld of preferredTlds) {
      const hit = normalized.find((url) => url.includes(tld));
      if (hit) return hit;
    }
    return normalized[0];
  }

  async function extractUrlFromImage(buffer, type) {
    if (!buffer || !ocrTypes.has(type)) return null;

    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "rmb-ocr-"));
    const inputExt = type === "image/heic" || type === "image/heif" ? "heic" : "png";
    const inputPath = path.join(tmpDir, `image.${inputExt}`);
    const outputPath = path.join(tmpDir, "out");
    await fs.writeFile(inputPath, buffer);

    try {
      let ocrInput = inputPath;

      if (type === "image/heic" || type === "image/heif") {
        const jpegPath = path.join(tmpDir, "image.jpg");
        await execFileAsync("sips", ["-s", "format", "jpeg", inputPath, "--out", jpegPath]);
        ocrInput = jpegPath;
      }

      await execFileAsync("tesseract", [ocrInput, outputPath, "-l", "eng"]);
      const text = await fs.readFile(`${outputPath}.txt`, "utf8");
      const urlMatch = text.match(
        /\b((https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,})(\/[^\s]*)?\b/gi
      );
      if (!urlMatch || urlMatch.length === 0) return null;
      return pickBestUrl(urlMatch);
    } catch {
      return null;
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  }

  let bagImageData = { buffer: null, type: null };
  let coffeeImageData = { buffer: null, type: null };
  let roasterUrl = roasterUrlInput?.toString().trim() || null;

  try {
    bagImageData = await readImage(bagImage);
    coffeeImageData = await readImage(coffeeImage);
    if (!roasterUrl) {
      roasterUrl = await extractUrlFromImage(
        bagImageData.buffer,
        bagImageData.type
      );
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }

  const scoreValue =
    ratingScore === "" || ratingScore == null ? null : Number(ratingScore);
  const notesValue = ratingNotes?.toString().trim() || "";
  const pricePaidValue =
    ratingPricePaid === "" || ratingPricePaid == null
      ? null
      : Number(ratingPricePaid);

  if (scoreValue != null && (!Number.isFinite(scoreValue) || scoreValue < 1 || scoreValue > 5)) {
    return Response.json({ error: "rating score must be 1-5" }, { status: 400 });
  }
  if (scoreValue != null && !notesValue) {
    return Response.json({ error: "rating notes are required" }, { status: 400 });
  }
  if (scoreValue != null && !Number.isFinite(pricePaidValue)) {
    return Response.json({ error: "rating price is required" }, { status: 400 });
  }

  const id = await createBean({
    name: name.trim(),
    reviewerName: reviewerName?.toString().trim() || "",
    roaster: roaster?.toString().trim() || "",
    roasterUrl,
    originCountry: originCountry.toString().trim(),
    originRegion: originRegion?.toString().trim() || "",
    blend: String(blend) === "true",
    process: process?.toString().trim() || "",
    roastLevel: roastLevel?.toString().trim() || "",
    priceUsd: priceUsd === "" || priceUsd == null ? null : Number(priceUsd),
    flavorNotes: flavorNotes?.toString().trim() || "",
    createdBy: session.user.email,
    bagImage: bagImageData.buffer,
    bagImageType: bagImageData.type,
    coffeeImage: coffeeImageData.buffer,
    coffeeImageType: coffeeImageData.type,
  });

  if (scoreValue != null) {
    await addRating(id, {
      score: scoreValue,
      notes: notesValue,
      pricePaid: pricePaidValue,
      createdBy: session.user.email,
    });
  }

  return Response.json({ id });
}

import { getBeanFieldSuggestions } from "@/lib/db";
import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
import os from "os";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/heic",
  "image/heif",
]);

const ROAST_LEVELS = [
  "light",
  "light-medium",
  "medium",
  "medium-dark",
  "dark",
];

const PROCESS_TYPES = [
  "washed",
  "natural",
  "honey",
  "wet-hulled",
  "anaerobic",
  "carbonic maceration",
];

function normalize(value) {
  return (value || "").toString().trim().toLowerCase();
}

function pickFirstLine(lines) {
  return lines.find((line) => line && /[a-z]/i.test(line)) || "";
}

function findRoaster(lines) {
  const roasterLine = lines.find((line) =>
    /roaster|roastery|roasted by/i.test(line)
  );
  if (roasterLine) {
    return roasterLine.replace(/roaster|roastery|roasted by/i, "").trim();
  }
  return "";
}

function findBlend(lines) {
  const blendLine = lines.find((line) => /blend|espresso/i.test(line));
  return blendLine ? blendLine.trim() : "";
}

function matchCountryRegion(text, countryRegions) {
  const normalizedText = normalize(text);
  const countries = Array.from(
    new Set(countryRegions.map((row) => row.country))
  );

  let matchedCountry = "";
  for (const country of countries) {
    if (normalizedText.includes(normalize(country))) {
      if (country.length > matchedCountry.length) {
        matchedCountry = country;
      }
    }
  }

  let matchedRegion = "";
  if (matchedCountry) {
    const regions = countryRegions
      .filter((row) => row.country === matchedCountry)
      .map((row) => row.region);
    for (const region of regions) {
      if (normalizedText.includes(normalize(region))) {
        if (region.length > matchedRegion.length) {
          matchedRegion = region;
        }
      }
    }
  }

  return { matchedCountry, matchedRegion };
}

function matchEnum(text, values) {
  const normalizedText = normalize(text);
  const hit = values.find((value) => normalizedText.includes(value));
  return hit ? hit : "";
}

function toTitleCase(value) {
  return value
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

async function readImage(file) {
  if (!file || typeof file === "string") return { buffer: null, type: null };
  if (file.size > MAX_BYTES) {
    throw new Error("Images must be 5MB or smaller.");
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Only JPEG, PNG, or HEIC images are allowed.");
  }
  const arrayBuffer = await file.arrayBuffer();
  return { buffer: Buffer.from(arrayBuffer), type: file.type };
}

async function extractTextFromImage(buffer, type) {
  if (!buffer) return "";

  const execFileAsync = promisify(execFile);
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
    return await fs.readFile(`${outputPath}.txt`, "utf8");
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true });
  }
}

function extractUrl(text) {
  if (!text) return "";
  const urlMatch = text.match(
    /\b((https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,})(\/[^\s]*)?\b/gi
  );
  if (!urlMatch || urlMatch.length === 0) return "";
  const trimmed = urlMatch[0].replace(/[),.;:]+$/, "");
  return trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
}

export async function POST(request) {
  const body = await request.formData();
  const bagImage = body.get("bagImage");

  if (!bagImage || typeof bagImage === "string") {
    return Response.json({ error: "bagImage is required" }, { status: 400 });
  }

  try {
    const { buffer, type } = await readImage(bagImage);
    const text = await extractTextFromImage(buffer, type);
    const lines = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    const suggestions = await getBeanFieldSuggestions();
    const { matchedCountry, matchedRegion } = matchCountryRegion(
      text,
      suggestions.countryRegions || []
    );

    const roastMatch = matchEnum(text, ROAST_LEVELS);
    const processMatch = matchEnum(text, PROCESS_TYPES);

    const roasterFromText = findRoaster(lines);
    const blendFromText = findBlend(lines) || pickFirstLine(lines);
    const roasterUrl = extractUrl(text);

    return Response.json({
      text,
      blendName: blendFromText,
      roasterName: roasterFromText,
      roasterUrl,
      originCountry: matchedCountry,
      originRegion: matchedRegion,
      roastLevel: roastMatch ? toTitleCase(roastMatch) : "",
      process: processMatch ? toTitleCase(processMatch) : "",
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }
}

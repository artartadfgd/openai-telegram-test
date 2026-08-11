import fs from "node:fs";
import path from "node:path";
import OpenAI from "openai";
import { getLibraryTemplates } from "../src/lib/library-content";
import type { CuratedTemplate } from "../src/lib/volleyball";

const OUT_DIR = path.join(process.cwd(), "public", "library-covers");

function buildPrompt(t: CuratedTemplate) {
  return (
    `Clean flat-illustration diagram of an indoor volleyball court seen from a high elevated 3/4 aerial angle, ` +
    `in the style of a premium sports-coaching mobile app. Warm wood-tone court floor, white court lines, a low net across ` +
    `the middle. Small stylized illustrated players (not photorealistic, simple flat-shaded character style like a modern ` +
    `training app icon) in two team colors — one team in blue jerseys, the other in orange/yellow jerseys — positioned to ` +
    `demonstrate this drill: ${t.subtitle.toLowerCase()} (${t.objective.toLowerCase()}). A smooth curved dashed white line ` +
    `shows the ball's movement path between players, with a small volleyball icon on the trajectory. Vibrant, polished, ` +
    `flat-design illustration with soft shadows, similar to a tactical training-session cover image. No readable text, ` +
    `no logos, no watermarks, no UI elements, 16:9 wide composition.`
  );
}

async function main() {
  const apiKey = process.env.OPENAI_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.log("[library-images] OPENAI_KEY not set, skipping cover photo generation (using vector covers only).");
    return;
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const templates = getLibraryTemplates("pt");
  const openai = new OpenAI({ apiKey });

  let generated = 0;
  let skipped = 0;
  let failed = 0;

  for (const t of templates) {
    const outPath = path.join(OUT_DIR, `${t.slug}.jpg`);
    if (fs.existsSync(outPath)) {
      skipped++;
      continue;
    }
    try {
      const res = await openai.images.generate({
        model: "gpt-image-1",
        prompt: buildPrompt(t),
        size: "1536x1024",
        quality: "medium",
      });
      const b64 = res.data?.[0]?.b64_json;
      if (!b64) throw new Error("no image data returned");
      fs.writeFileSync(outPath, Buffer.from(b64, "base64"));
      generated++;
      console.log(`[library-images] generated ${t.slug}.jpg`);
    } catch (err) {
      failed++;
      console.error(`[library-images] failed for ${t.slug}:`, err instanceof Error ? err.message : err);
    }
  }

  console.log(`[library-images] done. generated=${generated} skipped=${skipped} failed=${failed}`);
}

main().catch((err) => {
  console.error("[library-images] fatal error, continuing build without new cover photos:", err instanceof Error ? err.message : err);
});

import fs from "node:fs";
import path from "node:path";
import OpenAI from "openai";
import { getLibraryTemplates } from "../src/lib/library-content";
import type { CuratedBlock } from "../src/lib/volleyball";

const OUT_DIR = path.join(process.cwd(), "public", "library-covers");

const ARROW_LABEL: Record<string, string> = {
  serve: "a serve arrow starting from the back line and traveling over the net into the opposite court",
  set: "a setting-pass arrow arcing upward from one player to a teammate near the net",
  spike: "an attack/spike arrow angling sharply downward into the opponent's court",
  block: "a short vertical jump arrow for a blocker at the net",
  dig: "a defensive dig arrow from the floor toward a teammate",
  move: "a movement/positioning arrow showing a player repositioning on the court",
};

function describeArrows(block: CuratedBlock) {
  const types = Array.from(new Set(block.diagram.arrows.map((a) => a.type)));
  if (types.length === 0) return "";
  const descriptions = types.map((t) => ARROW_LABEL[t]).filter(Boolean);
  if (descriptions.length === 0) return "";
  return ` Draw clear bold colored arrows directly on the court illustrating the action: ${descriptions.join("; ")}. The arrows are the main focal point, clearly explaining the movement.`;
}

function buildPrompt(block: CuratedBlock) {
  return (
    `Clean flat-illustration tactical diagram of an indoor volleyball court seen from a high elevated 3/4 aerial angle, ` +
    `in the style of a premium sports-coaching mobile app. Warm wood-tone court floor, white court lines, a low net across ` +
    `the middle. Small stylized illustrated players (not photorealistic, simple flat-shaded character style like a modern ` +
    `training app icon) in two team colors — one team in blue jerseys, the other in orange/yellow jerseys — positioned to ` +
    `demonstrate this specific exercise: ${block.title.toLowerCase()}. ${block.description}` +
    describeArrows(block) +
    ` Vibrant, polished, flat-design illustration with soft shadows, similar to a tactical training-session cover image. ` +
    `No readable text, no logos, no watermarks, no UI elements, 16:9 wide composition.`
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
    for (const block of t.blocks) {
      const outPath = path.join(OUT_DIR, `${t.slug}-${block.order}.jpg`);
      if (fs.existsSync(outPath)) {
        skipped++;
        continue;
      }
      try {
        const res = await openai.images.generate({
          model: "gpt-image-1",
          prompt: buildPrompt(block),
          size: "1536x1024",
          quality: "medium",
        });
        const b64 = res.data?.[0]?.b64_json;
        if (!b64) throw new Error("no image data returned");
        fs.writeFileSync(outPath, Buffer.from(b64, "base64"));
        generated++;
        console.log(`[library-images] generated ${t.slug}-${block.order}.jpg`);
      } catch (err) {
        failed++;
        console.error(`[library-images] failed for ${t.slug}-${block.order}:`, err instanceof Error ? err.message : err);
      }
    }
  }

  console.log(`[library-images] done. generated=${generated} skipped=${skipped} failed=${failed}`);
}

main().catch((err) => {
  console.error("[library-images] fatal error, continuing build without new cover photos:", err instanceof Error ? err.message : err);
});

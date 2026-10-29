import { promises as fs } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { UPLOADS_DIR } from "@/lib/storage";

// Link-preview image for Facebook, WhatsApp, LinkedIn, X, Telegram, Slack and Discord: the page's photo cropped to
// the 1200×630 they all use, darkened at the bottom, with the white AQS logo. The logo is a picture, not drawn text,
// so it looks the same on any server; titles come from og:title, which every platform prints under the image.
const WIDTH = 1200;
const HEIGHT = 630;
const LOGO_HEIGHT = 150;
const MARGIN = 56;
const FALLBACK = "/images/hero-food-plant.jpg";
const PUBLIC_DIR = path.join(/* turbopackIgnore: true */ process.cwd(), "public");

// Only photos the site itself serves: /images/<name> from public, /uploads/<name> from DATA_DIR.
function sourceFile(src: string | null) {
  const match = /^\/(images|uploads)\/([\w.-]+\.(?:jpe?g|png|webp|avif))$/i.exec(src ?? "");
  if (!match || match[2].startsWith(".")) return null;
  return match[1] === "images" ? path.join(PUBLIC_DIR, "images", match[2]) : path.join(UPLOADS_DIR, match[2]);
}

const shade = Buffer.from(
  `<svg width="${WIDTH}" height="${HEIGHT}"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0.35" stop-color="#00112e" stop-opacity="0.05"/><stop offset="1" stop-color="#00112e" stop-opacity="0.85"/>
  </linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/></svg>`,
);

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const rtl = params.get("lang") === "ar";
  const file = sourceFile(params.get("src")) ?? sourceFile(FALLBACK)!;
  // Paths come from sourceFile, which only allows the two image folders.
  const photo = await fs.readFile(/* turbopackIgnore: true */ file).catch(() => fs.readFile(/* turbopackIgnore: true */ sourceFile(FALLBACK)!));
  const logo = await sharp(path.join(PUBLIC_DIR, "brand", "logo-full-light.png")).resize({ height: LOGO_HEIGHT }).toBuffer({ resolveWithObject: true });

  const image = await sharp(photo)
    .resize(WIDTH, HEIGHT, { fit: "cover", position: "attention" })
    .composite([
      { input: shade },
      // Bottom corner on the reading side: left for English, right for Arabic.
      { input: logo.data, top: HEIGHT - LOGO_HEIGHT - MARGIN, left: rtl ? WIDTH - logo.info.width - MARGIN : MARGIN },
    ])
    // WhatsApp skips previews over ~600 KB; this lands around 100–200 KB.
    .jpeg({ quality: 80, mozjpeg: true })
    .toBuffer();

  return new Response(new Uint8Array(image), {
    headers: { "Content-Type": "image/jpeg", "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800" },
  });
}

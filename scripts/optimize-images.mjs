// Makes WebP copies of every image in public/assets at a few widths, plus a manifest
// (src/data/images.json) that <Img> uses to build srcset. Run: npm run images
import { mkdir, readdir, stat, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const SRC = 'public/assets'
const OUT = 'public/img'
const WIDTHS = [480, 960, 1440]
const MAX = 2400
const FORCE = process.argv.includes('--force') // re-encode everything, e.g. after changing quality

// Photos: high quality with full-resolution colour (smartSubsample keeps edges and text crisp).
// Plans/renders with transparency: near-lossless, because the journeys zoom into them ~2×.
const PHOTO = { quality: 86, smartSubsample: true, effort: 6 }
const CUTOUT = { quality: 92, alphaQuality: 100, smartSubsample: true, effort: 6 }

await mkdir(OUT, { recursive: true })
const manifest = {}
let before = 0
let after = 0

for (const file of (await readdir(SRC)).filter((f) => /\.(jpe?g|png)$/i.test(f)).sort()) {
  const input = path.join(SRC, file)
  const { width, height, hasAlpha } = await sharp(input).metadata()
  const base = file.replace(/\.(jpe?g|png)$/i, '')
  const widths = [...new Set([...WIDTHS.filter((w) => w < width), Math.min(width, MAX)])].sort((a, b) => a - b)
  const srcStat = await stat(input)
  before += srcStat.size
  for (const w of widths) {
    const out = path.join(OUT, `${base}-${w}.webp`)
    const fresh = !FORCE && (await stat(out).then((s) => s.mtimeMs >= srcStat.mtimeMs).catch(() => false))
    if (!fresh) {
      let img = sharp(input).resize({ width: w, withoutEnlargement: true, kernel: 'lanczos3' })
      // scaling down softens detail; a light sharpen brings it back without halos
      if (w < width) img = img.sharpen({ sigma: 0.55, m1: 0.6, m2: 1.2 })
      await img.webp(hasAlpha ? CUTOUT : PHOTO).toFile(out)
    }
    if (w === widths[widths.length - 1]) after += (await stat(out)).size
  }
  manifest[file] = { w: width, h: height, sizes: widths }
}

// remove WebP files this run no longer produces (old widths, deleted sources)
const wanted = new Set(
  Object.entries(manifest).flatMap(([file, m]) => m.sizes.map((w) => `${file.replace(/\.(jpe?g|png)$/i, '')}-${w}.webp`)),
)
for (const f of await readdir(OUT)) if (f.endsWith('.webp') && !wanted.has(f)) await unlink(path.join(OUT, f))

await writeFile('src/data/images.json', JSON.stringify(manifest, null, 2) + '\n')
console.log(`${Object.keys(manifest).length} images · largest sizes ${(before / 1048576).toFixed(1)} MB → ${(after / 1048576).toFixed(1)} MB`)

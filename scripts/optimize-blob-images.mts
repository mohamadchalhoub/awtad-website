/**
 * Create web-sized copies of oversized portfolio images.
 *
 * Several originals are 5000px / 2–6 MB camera files. The Next.js image
 * optimizer has to download the whole original before resizing, and gives
 * up after ~7s, so on a slow link those images fail with 500/504 and the
 * page falls back to the multi-megabyte original.
 *
 * This script writes a ≤1800px JPEG next to each large original in Blob
 * storage (originals are never touched) and records original → web URL in
 * lib/web-images.json, which lib/work.ts and lib/site.ts read. The database
 * is not modified, so removing the JSON entry reverts an image.
 *
 *   npx tsx scripts/optimize-blob-images.mts
 *
 * New uploads are resized at upload time (app/api/upload-image), so this
 * only needs re-running for images uploaded before that change.
 */
import { readFile, writeFile } from "node:fs/promises"
import { config } from "dotenv"
import sharp from "sharp"
import { put } from "@vercel/blob"
import { createClient } from "@supabase/supabase-js"

config({ path: ".env.local", quiet: true })

const MAX_EDGE = 1800
const THRESHOLD = 300 * 1024
const MANIFEST = "lib/web-images.json"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

const manifest: Record<string, string> = JSON.parse(await readFile(MANIFEST, "utf8").catch(() => "{}"))

const { data, error } = await supabase.from("images").select("id,url")
if (error) throw error

const todo = (data ?? []).filter((i) => i.url?.startsWith("https://") && !manifest[i.url])
console.log(`${todo.length} image(s) to check`)

await Promise.all(
  todo.map(async ({ id, url }) => {
    const res = await fetch(url)
    if (!res.ok) return console.warn(`skip ${id}: HTTP ${res.status}`)
    const original = Buffer.from(await res.arrayBuffer())
    if (original.length <= THRESHOLD) return

    const web = await sharp(original)
      .rotate()
      .resize(MAX_EDGE, MAX_EDGE, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 80, mozjpeg: true, progressive: true })
      .toBuffer()

    const blob = await put(`project-images/web/${id}.jpg`, web, {
      access: "public",
      contentType: "image/jpeg",
      addRandomSuffix: false,
      allowOverwrite: true,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })
    manifest[url] = blob.url
    console.log(`${id}: ${(original.length / 1024).toFixed(0)} KB -> ${(web.length / 1024).toFixed(0)} KB`)
  })
)

await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + "\n")
console.log(`manifest: ${Object.keys(manifest).length} entr(ies)`)

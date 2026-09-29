import { put } from "@vercel/blob"
import { NextResponse } from "next/server"

/**
 * Public upload for reference files attached to a custom request (photos,
 * sketches, logos, PDFs). Files land under customer-ideas/ and their public
 * URLs are included in the WhatsApp message the visitor sends.
 */
const MAX_BYTES = 10 * 1024 * 1024
const ALLOWED = /^(image\/(jpeg|png|webp|heic|heif|gif|svg\+xml)|application\/pdf)$/

export async function POST(request: Request) {
  try {
    const form = await request.formData()
    const file = form.get("file")
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }
    if (!ALLOWED.test(file.type)) {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 415 })
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "File is larger than 10 MB" }, { status: 413 })
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "-").toLowerCase().slice(-80)
    const blob = await put(`customer-ideas/${Date.now()}-${safeName}`, file, {
      access: "public",
      addRandomSuffix: true,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })

    return NextResponse.json({ url: blob.url, name: file.name, type: file.type })
  } catch (error) {
    console.error("Idea upload failed:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}

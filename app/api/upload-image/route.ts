import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import sharp from 'sharp';

// Node runtime: sharp is a native module and cannot run on the Edge.
export const runtime = 'nodejs';

/** Longest edge stored. Camera originals (5000px+) made the optimizer time out. */
const MAX_EDGE = 1800;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedName = file.name
      .replace(/[^a-zA-Z0-9.-]/g, '-')
      .toLowerCase();

    // Store a web-sized JPEG instead of the camera original. Animated GIFs
    // and SVGs are kept as uploaded.
    const resizable = !/^image\/(gif|svg\+xml)$/.test(file.type);
    const body = resizable
      ? await sharp(Buffer.from(await file.arrayBuffer()))
          .rotate()
          .resize(MAX_EDGE, MAX_EDGE, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 82, mozjpeg: true, progressive: true })
          .toBuffer()
      : file;
    const baseName = resizable ? sanitizedName.replace(/\.[a-z0-9]+$/, '') + '.jpg' : sanitizedName;
    const filename = `project-images/${timestamp}-${baseName}`;

    // Upload to Vercel Blob
    const blob = await put(filename, body, {
      access: 'public',
      contentType: resizable ? 'image/jpeg' : file.type,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return NextResponse.json({
      url: blob.url,
      filename: file.name,
      size: resizable ? (body as Buffer).length : file.size,
      type: resizable ? 'image/jpeg' : file.type,
    });
  } catch (error) {
    console.error('Error uploading to Vercel Blob:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}


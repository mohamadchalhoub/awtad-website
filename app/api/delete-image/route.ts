import { del } from '@vercel/blob';
import { NextResponse } from 'next/server';

export const runtime = 'edge'; // Use Edge Runtime for better performance

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json(
        { error: 'No URL provided' },
        { status: 400 }
      );
    }

    // Only delete if it's a Vercel Blob URL
    if (!url.includes('blob.vercel-storage.com')) {
      return NextResponse.json(
        { error: 'Not a Vercel Blob URL' },
        { status: 400 }
      );
    }

    // Delete from Vercel Blob
    await del(url, {
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return NextResponse.json({
      success: true,
      message: 'Image deleted from Vercel Blob',
    });
  } catch (error) {
    console.error('Error deleting from Vercel Blob:', error);
    return NextResponse.json(
      { error: 'Failed to delete image from Vercel Blob' },
      { status: 500 }
    );
  }
}


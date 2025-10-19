/**
 * Migration Script: Base64 Images → Vercel Blob
 * 
 * This script:
 * 1. Fetches all images with base64 data from Supabase
 * 2. Uploads each image to Vercel Blob
 * 3. Updates the database with new Vercel Blob URLs
 * 4. Reports progress and results
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { put } from '@vercel/blob';

// Load environment variables from .env.local
config({ path: '.env.local' });

// Load environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN!;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

if (!BLOB_TOKEN) {
  console.error('❌ Missing BLOB_READ_WRITE_TOKEN in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface ImageRow {
  id: string;
  name: string;
  url: string;
  project_id: string;
  created_at: string;
}

/**
 * Convert base64 string to Buffer
 */
function base64ToBuffer(base64: string): Buffer {
  // Remove data URI prefix if present
  const base64Data = base64.replace(/^data:image\/\w+;base64,/, '');
  return Buffer.from(base64Data, 'base64');
}

/**
 * Get file extension from base64 data URI
 */
function getExtensionFromBase64(base64: string): string {
  const match = base64.match(/^data:image\/(\w+);base64,/);
  if (match && match[1]) {
    return match[1] === 'jpeg' ? 'jpg' : match[1];
  }
  return 'jpg'; // Default to jpg
}

/**
 * Upload image to Vercel Blob
 */
async function uploadToVercelBlob(
  imageBuffer: Buffer,
  filename: string
): Promise<string> {
  try {
    const blob = await put(filename, imageBuffer, {
      access: 'public',
      token: BLOB_TOKEN,
    });
    return blob.url;
  } catch (error) {
    console.error(`Error uploading ${filename}:`, error);
    throw error;
  }
}

/**
 * Main migration function
 */
async function migrateImages() {
  console.log('🚀 Starting image migration to Vercel Blob...\n');

  try {
    // Step 1: Fetch all images from database
    console.log('📥 Fetching images from Supabase...');
    const { data: images, error: fetchError } = await supabase
      .from('images')
      .select('id, name, url, project_id, created_at')
      .order('created_at', { ascending: true });

    if (fetchError) {
      throw new Error(`Failed to fetch images: ${fetchError.message}`);
    }

    if (!images || images.length === 0) {
      console.log('⚠️  No images found in database');
      return;
    }

    console.log(`✅ Found ${images.length} images\n`);

    // Step 2: Process each image
    let successCount = 0;
    let failCount = 0;
    const results: Array<{ id: string; name: string; status: string; newUrl?: string }> = [];

    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      const progress = `[${i + 1}/${images.length}]`;

      console.log(`${progress} Processing: ${image.name || `Image ${image.id}`}`);

      try {
        // Check if URL is already a Vercel Blob URL
        if (image.url.startsWith('https://') && !image.url.startsWith('data:')) {
          console.log(`  ℹ️  Already migrated (external URL)`);
          results.push({ id: image.id, name: image.name, status: 'skipped (already external URL)' });
          successCount++;
          continue;
        }

        // Convert base64 to buffer
        const imageBuffer = base64ToBuffer(image.url);
        const extension = getExtensionFromBase64(image.url);
        
        // Generate filename
        const timestamp = Date.now();
        const sanitizedName = (image.name || `image-${image.id}`)
          .replace(/[^a-zA-Z0-9.-]/g, '-')
          .toLowerCase();
        const filename = `project-images/${timestamp}-${sanitizedName}.${extension}`;

        console.log(`  📤 Uploading to Vercel Blob...`);
        
        // Upload to Vercel Blob
        const blobUrl = await uploadToVercelBlob(imageBuffer, filename);
        
        console.log(`  ✅ Uploaded: ${blobUrl.substring(0, 60)}...`);

        // Update database with new URL
        console.log(`  💾 Updating database...`);
        const { error: updateError } = await supabase
          .from('images')
          .update({ url: blobUrl })
          .eq('id', image.id);

        if (updateError) {
          throw new Error(`Failed to update database: ${updateError.message}`);
        }

        console.log(`  ✅ Database updated\n`);
        
        results.push({
          id: image.id,
          name: image.name,
          status: 'success',
          newUrl: blobUrl,
        });
        successCount++;

      } catch (error) {
        console.error(`  ❌ Failed: ${error}\n`);
        results.push({
          id: image.id,
          name: image.name,
          status: `failed: ${error}`,
        });
        failCount++;
      }
    }

    // Step 3: Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 MIGRATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log(`📝 Total: ${images.length}`);
    console.log('='.repeat(60) + '\n');

    if (failCount > 0) {
      console.log('❌ Failed images:');
      results
        .filter((r) => r.status.startsWith('failed'))
        .forEach((r) => {
          console.log(`  - ${r.name} (${r.id}): ${r.status}`);
        });
      console.log('');
    }

    if (successCount === images.length) {
      console.log('🎉 All images migrated successfully!');
      console.log('✨ Your database now uses Vercel Blob URLs');
      console.log('⚡ Pages should load much faster now!\n');
    } else if (successCount > 0) {
      console.log('⚠️  Migration partially completed');
      console.log('Please check failed images and retry if needed\n');
    }

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateImages()
  .then(() => {
    console.log('✅ Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration script error:', error);
    process.exit(1);
  });


# 🚀 Migration Guide: Base64 Images → Supabase Storage

## Current Problem

Your images are stored as base64 strings in the database:
- **18 MB total** for just 7 images
- **1-8 MB per image**
- Queries were taking 109 seconds!

## Solution: Migrate to Supabase Storage

Store images as files in Supabase Storage, keep only URLs in the database.

---

## Step-by-Step Migration

### 1. Create Storage Bucket

**Go to:** Supabase Dashboard → Storage → Create Bucket

```
Bucket name: project-images
Public: YES (so images are accessible)
```

**Or via SQL:**
```sql
-- Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-images', 'project-images', true);
```

---

### 2. Extract Base64 Images

Run this query to see your current images:

```sql
SELECT 
    id,
    name,
    SUBSTRING(url, 1, 50) as url_preview,
    LENGTH(url) as url_length,
    project_id
FROM public.images
ORDER BY LENGTH(url) DESC;
```

---

### 3. Convert Base64 to Files (Manual Method)

For each image:

1. **Copy the base64 string** from database
2. **Paste into browser console:**
   ```javascript
   // Replace DATA_HERE with your base64 string
   const base64 = "data:image/png;base64,iVBORw0KG...";
   
   // Convert to blob
   fetch(base64)
     .then(res => res.blob())
     .then(blob => {
       const url = URL.createObjectURL(blob);
       const a = document.createElement('a');
       a.href = url;
       a.download = 'image.png'; // Change filename
       a.click();
     });
   ```
3. **Download the image file**
4. **Upload to Supabase Storage:**
   - Go to: Storage → project-images
   - Click "Upload files"
   - Upload the downloaded image

---

### 4. Update Database with Storage URLs

After uploading to Storage, update each row:

```sql
-- Get the public URL format
-- https://[PROJECT_REF].supabase.co/storage/v1/object/public/project-images/[FILENAME]

-- Update each image (replace values)
UPDATE public.images
SET url = 'https://vhezeyapqzoscfffgdzy.supabase.co/storage/v1/object/public/project-images/image1.jpg'
WHERE id = 'image-id-1';

UPDATE public.images
SET url = 'https://vhezeyapqzoscfffgdzy.supabase.co/storage/v1/object/public/project-images/image2.jpg'
WHERE id = 'image-id-2';

-- Repeat for all 7 images
```

---

### 5. Verify Migration

```sql
-- Check new URL lengths (should be ~100 characters, not millions!)
SELECT 
    id,
    name,
    url,
    LENGTH(url) as url_length,
    project_id
FROM public.images;

-- Expected: url_length should be 80-150, not 1,000,000+
```

---

### 6. Test Performance

After migration, run diagnostic again:

**Expected results:**
```
✅ Fetch Images (with URLs): <500ms (was 109 seconds!)
✅ Parent Projects (with thumbnails): <1000ms
✅ Images display on all pages
```

---

## Automated Migration Script (Advanced)

If you want to automate the migration, here's a Node.js script:

```typescript
// migration-script.ts
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Need service role key
);

async function migrateImages() {
  // 1. Fetch all images
  const { data: images } = await supabase
    .from('images')
    .select('id, name, url, project_id');

  for (const image of images!) {
    console.log(`Processing: ${image.name}`);
    
    // 2. Check if already migrated
    if (!image.url.startsWith('data:')) {
      console.log('  ✅ Already migrated');
      continue;
    }

    // 3. Convert base64 to buffer
    const base64Data = image.url.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');
    
    // 4. Upload to Storage
    const fileName = `${image.id}-${image.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('project-images')
      .upload(fileName, buffer, {
        contentType: image.url.split(';')[0].split(':')[1], // Extract mime type
        upsert: true
      });

    if (uploadError) {
      console.error(`  ❌ Upload failed: ${uploadError.message}`);
      continue;
    }

    // 5. Get public URL
    const { data: urlData } = supabase.storage
      .from('project-images')
      .getPublicUrl(fileName);

    // 6. Update database
    const { error: updateError } = await supabase
      .from('images')
      .update({ url: urlData.publicUrl })
      .eq('id', image.id);

    if (updateError) {
      console.error(`  ❌ Update failed: ${updateError.message}`);
    } else {
      console.log(`  ✅ Migrated: ${urlData.publicUrl}`);
    }
  }

  console.log('\n🎉 Migration complete!');
}

migrateImages();
```

Run with: `npx tsx migration-script.ts`

---

## Expected Impact

| Metric | Before | After Migration |
|--------|--------|-----------------|
| Database size | 18 MB | <1 MB |
| Images query time | 109 seconds | <500ms |
| URL length | 1-8 million chars | 80-150 chars |
| Data transfer per page | 18 MB | <50 KB |
| Thumbnails visible | ❌ No | ✅ Yes |
| Load time | 81+ seconds | <1 second |

---

## Need Help?

1. **Can't download base64 images?** Use online converter: https://base64.guru/converter/decode/image
2. **Storage upload fails?** Check bucket is public and RLS policies allow uploads
3. **URLs don't work?** Verify bucket name and file paths match

---

## After Migration

Once migrated, I can re-enable image URLs in queries and everything will be fast! 🚀


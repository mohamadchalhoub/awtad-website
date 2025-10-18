# 🗄️ Database Indexes Verification

## Why This Matters

The joined queries we implemented will be **MUCH FASTER** if proper database indexes exist. Without indexes, Postgres has to scan entire tables, which is slow.

---

## ✅ Required Indexes

These indexes should already exist from the previous optimization (`scripts/CREATE-INDEXES-PROPERLY.sql`):

### Projects Table
```sql
-- Composite index for active projects ordered by date
CREATE INDEX IF NOT EXISTS idx_projects_is_active_created_at 
  ON projects(is_active, created_at DESC);

-- Index for finding subprojects by parent
CREATE INDEX IF NOT EXISTS idx_projects_parent_id 
  ON projects(parent_id);

-- Index for direct ID lookups
CREATE INDEX IF NOT EXISTS idx_projects_id 
  ON projects(id);

-- Index for featured projects
CREATE INDEX IF NOT EXISTS idx_projects_featured 
  ON projects(featured);

-- Index for category filtering
CREATE INDEX IF NOT EXISTS idx_projects_category 
  ON projects(category);
```

### Images Table
```sql
-- Index for finding images by project
CREATE INDEX IF NOT EXISTS idx_images_project_id 
  ON images(project_id);

-- Index for direct ID lookups (used in joins)
CREATE INDEX IF NOT EXISTS idx_images_id 
  ON images(id);

-- Index for ordering by date
CREATE INDEX IF NOT EXISTS idx_images_created_at 
  ON images(created_at DESC);

-- Index for category filtering
CREATE INDEX IF NOT EXISTS idx_images_category 
  ON images(category);
```

---

## 🔍 How to Verify Indexes Exist

### Option 1: Quick Check (Recommended)
1. Open **Supabase Dashboard**
2. Go to **SQL Editor**
3. Run this query:

```sql
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename IN ('projects', 'images')
  AND schemaname = 'public'
ORDER BY tablename, indexname;
```

4. **Expected Output:** Should see 9+ indexes listed

### Option 2: Check Specific Indexes
```sql
-- Check if critical indexes exist
SELECT 
  indexname,
  CASE 
    WHEN indexname IS NOT NULL THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status
FROM pg_indexes 
WHERE indexname IN (
  'idx_projects_is_active_created_at',
  'idx_projects_parent_id',
  'idx_projects_id',
  'idx_images_project_id',
  'idx_images_id',
  'idx_images_created_at'
)
AND schemaname = 'public';
```

---

## 🚨 If Indexes Are Missing

### Run the Index Creation Script:

1. Open **Supabase Dashboard** → **SQL Editor**
2. Open the file `scripts/CREATE-INDEXES-PROPERLY.sql` in your code editor
3. **Copy the entire contents**
4. **Paste into Supabase SQL Editor**
5. Click **RUN**
6. Wait for completion (should take 5-10 seconds)

### Or Create Indexes Manually:

If you prefer, copy and paste these commands one by one:

```sql
-- Projects indexes
CREATE INDEX IF NOT EXISTS idx_projects_is_active_created_at 
  ON projects(is_active, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_projects_parent_id 
  ON projects(parent_id);

CREATE INDEX IF NOT EXISTS idx_projects_id 
  ON projects(id);

CREATE INDEX IF NOT EXISTS idx_projects_featured 
  ON projects(featured);

CREATE INDEX IF NOT EXISTS idx_projects_category 
  ON projects(category);

-- Images indexes
CREATE INDEX IF NOT EXISTS idx_images_project_id 
  ON images(project_id);

CREATE INDEX IF NOT EXISTS idx_images_id 
  ON images(id);

CREATE INDEX IF NOT EXISTS idx_images_created_at 
  ON images(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_images_category 
  ON images(category);
```

---

## 🔑 Critical: Foreign Key Constraint

The joined queries rely on a foreign key relationship. Verify it exists:

```sql
SELECT 
  constraint_name,
  table_name,
  column_name
FROM information_schema.key_column_usage
WHERE table_name = 'projects'
  AND column_name = 'cover_image_id';
```

**Expected:** Should see a constraint like `projects_cover_image_id_fkey`

### If Foreign Key Is Missing:

```sql
-- Add foreign key constraint
ALTER TABLE projects 
ADD CONSTRAINT projects_cover_image_id_fkey 
FOREIGN KEY (cover_image_id) 
REFERENCES images(id) 
ON DELETE SET NULL;
```

---

## 📊 Performance Impact

| Scenario | Without Indexes | With Indexes | Improvement |
|----------|----------------|--------------|-------------|
| **Filter active projects** | Full table scan (slow) | Index scan (fast) | **10-100x faster** |
| **Find subprojects** | Full table scan | Index lookup | **50-200x faster** |
| **Join with images** | Nested loop scan | Index join | **20-100x faster** |
| **Order by date** | Sort entire table | Index scan | **10-50x faster** |

---

## 🧪 Test Index Performance

After creating indexes, you can test their effectiveness:

```sql
-- Explain query plan (should show "Index Scan" not "Seq Scan")
EXPLAIN ANALYZE
SELECT * FROM projects 
WHERE is_active = true 
ORDER BY created_at DESC 
LIMIT 30;
```

**Look for:**
- ✅ "Index Scan using idx_projects_is_active_created_at"
- ❌ "Seq Scan on projects" (means no index used)

---

## 🎯 Success Criteria

Indexes are properly configured if:
- ✅ All 9+ indexes exist in `pg_indexes` query
- ✅ Foreign key constraint exists
- ✅ `EXPLAIN ANALYZE` shows "Index Scan" not "Seq Scan"
- ✅ Query times in console are < 1 second

---

## 🚀 After Indexes Are Applied

1. **Restart your dev server** (Ctrl+C, then `pnpm run dev`)
2. **Clear browser cache** (Ctrl+Shift+Delete)
3. **Test `/projects` page** → Should load in < 1 second
4. **Test `/admin/projects` page** → Should load in < 1 second
5. **Check console logs** → Query times should be 200-800ms

---

## 📝 Maintenance

### When to Re-run VACUUM ANALYZE:

After creating indexes, optimize table statistics:

```sql
-- Run these ONE AT A TIME (not in a transaction)
VACUUM ANALYZE projects;
VACUUM ANALYZE images;
```

**Note:** These commands must be run separately, not in a transaction block.

### Monitor Index Usage:

```sql
-- Check which indexes are being used
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans,
  idx_tup_read as tuples_read
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND tablename IN ('projects', 'images')
ORDER BY idx_scan DESC;
```

---

## 🎉 Summary

1. ✅ Verify indexes exist using the SQL queries above
2. ✅ Create missing indexes if needed
3. ✅ Verify foreign key constraint exists
4. ✅ Run VACUUM ANALYZE for optimization
5. ✅ Test query performance in console

**With proper indexes, your queries should be 10-100x faster!** 🚀


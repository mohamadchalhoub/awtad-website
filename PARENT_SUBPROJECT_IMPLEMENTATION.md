# Parent/Subproject Implementation Guide

## 🎉 Implementation Complete!

The Awtad website now fully supports parent projects with nested subprojects! This document explains what was implemented, how to use the new features, and what to do next.

---

## ✅ What Was Implemented

### 1. **Database Changes**
- ✅ Added `parent_id` column to the `projects` table
- ✅ Set up foreign key constraint with CASCADE delete
- ✅ Added database indexes for performance
- ✅ Updated TypeScript types to include `parent_id` and `featured` fields

### 2. **Backend/Service Layer**
- ✅ Added `getParentProjects()` method to fetch only parent projects
- ✅ Added `getSubProjects(parentId)` method to fetch subprojects
- ✅ Updated `getFeaturedProjects()` to only return parent projects (subprojects cannot be featured)
- ✅ Updated cache management to handle parent/subproject relationships

### 3. **Admin Dashboard**
- ✅ Added parent/subproject selection UI in "Add Project" dialog
- ✅ Added parent/subproject selection UI in "Edit Project" dialog
- ✅ Updated project list to show hierarchy (parent projects with nested subprojects)
- ✅ Visual indicators:
  - 📁 icon for parent projects
  - ↳ icon for subprojects
  - "Featured" badge for featured parent projects
  - "Subproject" badge for subprojects
  - Subprojects are indented and styled differently
- ✅ Automatic rules:
  - Subprojects cannot be featured
  - Only parent projects can be selected as parents
  - When toggling "Is this a subproject?", featured status is automatically cleared

### 4. **Public Website**
- ✅ Projects page shows only parent projects in main view
- ✅ Subprojects are displayed on their parent project's detail page
- ✅ Featured projects section on homepage only shows parent projects
- ✅ Filtering by category works with parent/subproject hierarchy

### 5. **Data Integrity**
- ✅ Cascade delete: Deleting a parent project automatically deletes all its subprojects and images
- ✅ Type safety: Full TypeScript support for parent/subproject relationships
- ✅ Backward compatibility: Existing projects remain as parent projects (parent_id = NULL)

---

## 📋 How to Use

### **Step 1: Run the Database Migration**

1. Open your Supabase Dashboard
2. Go to the SQL Editor
3. Copy and paste the contents of `scripts/add-sub-projects-support.sql`
4. Click "Run" to execute the migration

This will:
- Add the `parent_id` column to your projects table
- Set up foreign key constraints
- Create performance indexes
- Add helpful comments for documentation

### **Step 2: Using the Admin Dashboard**

#### **Creating a Parent Project**
1. Go to Admin → Projects
2. Click "Add New Project"
3. Fill in the project details
4. Leave "Is this a subproject?" toggle OFF
5. Optionally check "Featured Project" to show it on the homepage
6. Click "Add Project"

#### **Creating a Subproject**
1. Go to Admin → Projects
2. Click "Add New Project"
3. Fill in the project details
4. Toggle "Is this a subproject?" ON
5. Select a parent project from the dropdown
6. Note: Featured option is automatically disabled for subprojects
7. Click "Add Project"

#### **Converting Existing Project to Subproject**
1. Go to Admin → Projects
2. Find the project you want to convert
3. Click "Edit"
4. Toggle "Is this a subproject?" ON
5. Select the parent project
6. Click "Save Changes"

#### **Converting Subproject Back to Parent Project**
1. Go to Admin → Projects
2. Find the subproject
3. Click "Edit"
4. Toggle "Is this a subproject?" OFF
5. Click "Save Changes"

### **Step 3: Viewing on the Public Website**

#### **Projects Page**
- Only parent projects are shown in the main grid
- Each parent project card shows the number of subprojects
- Clicking a parent project takes you to its detail page

#### **Project Detail Page**
- Displays the parent project's information and images
- Below the main gallery, shows a "Related Sub-Projects" section
- Each subproject has its own card with a link to view its details
- Clicking a subproject takes you to its individual detail page

#### **Homepage**
- Featured Projects section only shows parent projects
- Only projects with "Featured" checked AND parent_id = NULL appear here

---

## 🎨 Visual Hierarchy

### **In Admin Dashboard**

**Parent Projects:**
```
┌─────────────────────────────────────┐
│ 📁 Sports Complex                   │  ← Folder icon
│ ⭐ Featured (if applicable)         │  ← Featured badge
│ Category | Year                     │
│ Description...                      │
│ 5 images • 2 subprojects            │
│ [Edit] [Delete]                     │
└─────────────────────────────────────┘
```

**Subprojects (indented under parent):**
```
    ┌───────────────────────────────┐
    │ ↳ Basketball Court            │  ← Arrow icon
    │ Subproject badge              │
    │ Category | Year               │
    │ Description...                │
    │ 3 images                      │
    │ [Edit] [Delete]               │
    └───────────────────────────────┘
```

### **On Public Website**

**Projects Page:**
- Shows only parent projects in grid layout
- Clean, organized view without subprojects cluttering the main page

**Project Detail Page:**
- Parent project details and gallery at the top
- "Related Sub-Projects" section below
- Each subproject has its own clickable card

---

## 🔧 Technical Details

### **Database Schema**
```sql
-- projects table structure
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  year TEXT,
  cover_image_id UUID,
  parent_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  featured BOOLEAN DEFAULT FALSE
);

-- Key constraint:
-- parent_id IS NULL = Parent Project
-- parent_id = <id> = Subproject of project <id>
```

### **Service Methods**

```typescript
// Get all parent projects (no parent_id)
SupabaseContentService.getParentProjects()

// Get subprojects for a specific parent
SupabaseContentService.getSubProjects(parentId)

// Get featured projects (only parents)
SupabaseContentService.getFeaturedProjects(limit)
```

### **TypeScript Types**

```typescript
interface Project {
  id: number
  title: string
  category: string
  description: string
  year: string
  cover_image_id: string | null
  parent_id: number | null  // ← New field
  featured: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}
```

---

## 🚀 Example Use Cases

### **Example 1: Sports Facilities**
```
📁 Sports Complex (Parent Project)
   ↳ Football Field (Subproject)
   ↳ Basketball Court (Subproject)
   ↳ Swimming Pool (Subproject)
```

### **Example 2: Commercial Building**
```
📁 Downtown Office Tower (Parent Project)
   ↳ Structural Steel Framework (Subproject)
   ↳ Facade System (Subproject)
   ↳ Interior Metalwork (Subproject)
```

### **Example 3: Industrial Complex**
```
📁 Manufacturing Plant (Parent Project)
   ↳ Production Hall A (Subproject)
   ↳ Production Hall B (Subproject)
   ↳ Warehouse Facility (Subproject)
```

---

## ✨ Features & Benefits

### **For Admins:**
- ✅ Better project organization
- ✅ Easy to manage related projects together
- ✅ Visual hierarchy in the dashboard
- ✅ Simple toggle to make projects into subprojects
- ✅ Automatic cascade deletion (deleting parent deletes all subprojects)

### **For Visitors:**
- ✅ Cleaner projects page (no clutter)
- ✅ Easier to browse main projects
- ✅ Can dive into subprojects from parent page
- ✅ Better understanding of project scope and components

### **Technical Benefits:**
- ✅ Proper database relationships
- ✅ Performance optimized with indexes
- ✅ Full TypeScript type safety
- ✅ Caching for better performance
- ✅ SEO-friendly URLs
- ✅ Backward compatible with existing data

---

## 🔒 Rules & Constraints

1. **Subprojects cannot be featured**
   - Only parent projects (parent_id = NULL) can be marked as featured
   - When converting a featured project to a subproject, featured status is automatically removed

2. **Cascade deletion**
   - Deleting a parent project deletes all its subprojects
   - Deleting a parent project deletes all images from parent AND subprojects
   - This is automatic and enforced at the database level

3. **Parent selection**
   - A project can only have ONE parent
   - A project cannot be its own parent
   - A subproject cannot be selected as a parent for another project (only top-level parents can have subprojects)

4. **Existing projects**
   - All existing projects are automatically parent projects (parent_id = NULL)
   - No data loss or migration needed
   - Fully backward compatible

---

## 📝 Testing Checklist

- [ ] Run the SQL migration in Supabase
- [ ] Create a new parent project from the admin dashboard
- [ ] Create a subproject under that parent
- [ ] Verify subproject appears indented under parent in admin view
- [ ] Check that subproject cannot be marked as featured
- [ ] Visit the public projects page and verify only parents show
- [ ] Click on parent project and verify subprojects appear on detail page
- [ ] Click on a subproject and verify it has its own detail page
- [ ] Mark a parent project as featured and verify it appears on homepage
- [ ] Delete a parent project and verify all subprojects are deleted
- [ ] Convert an existing project to a subproject and verify it moves under parent
- [ ] Convert a subproject back to a parent and verify it becomes standalone

---

## 🎯 Next Steps (Optional Enhancements)

1. **Breadcrumbs:**
   - Add breadcrumb navigation on subproject pages: Home > Projects > Parent > Subproject

2. **Bulk Operations:**
   - Add ability to move multiple projects under a parent at once

3. **Project Statistics:**
   - Show total number of parent vs. subprojects
   - Show most popular parent projects (by view count)

4. **Advanced Filtering:**
   - Filter by "has subprojects" / "no subprojects"
   - Search across both parent and subprojects

5. **Drag & Drop:**
   - Drag subprojects to reorder them under a parent
   - Drag a parent project to make it a subproject (and vice versa)

---

## 🐛 Troubleshooting

### **Issue: SQL migration fails**
- **Solution:** Make sure you're running the migration in the Supabase SQL Editor, not in your local terminal
- Check that the `projects` table exists
- Check if `parent_id` column already exists (migration is idempotent)

### **Issue: Subprojects don't appear on parent page**
- **Solution:** Make sure the subproject's `parent_id` matches the parent project's `id`
- Check that both projects have `is_active = true`
- Clear your browser cache and refresh

### **Issue: Cannot select parent when creating subproject**
- **Solution:** Make sure you have at least one parent project (a project with parent_id = NULL)
- Check that you're not trying to edit a project and select itself as parent

### **Issue: Featured subprojects still showing**
- **Solution:** The system should prevent this, but you can manually update in Supabase:
  ```sql
  UPDATE projects SET featured = false WHERE parent_id IS NOT NULL;
  ```

---

## 📞 Support

If you encounter any issues or need help:
1. Check this guide first
2. Review the SQL migration file: `scripts/add-sub-projects-support.sql`
3. Check browser console for errors
4. Check Supabase logs for database errors

---

## 🎉 Congratulations!

Your Awtad website now has a fully functional parent/subproject system! This will help you organize your projects better, provide a cleaner user experience, and maintain better data relationships.

Happy organizing! 🏗️✨


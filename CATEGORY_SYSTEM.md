# Category System for AWTAD Projects

This document explains how to set up and use the new category system for managing project categories in the AWTAD website.

## Overview

The category system allows administrators to:
- Create and manage project categories
- Assign categories to projects when creating or editing them
- Filter projects by category on the public projects page
- Organize projects into logical groups

## Setup Instructions

### 1. Database Setup

Run the following SQL script in your Supabase SQL Editor:

```sql
-- Run the contents of scripts/setup-categories.sql
```

This will:
- Create the `categories` table
- Insert default categories (Commercial, Industrial, Residential, Infrastructure, General)
- Set up proper permissions and indexes

### 2. Default Categories

The system comes with these default categories:
- **Commercial** 🏢 - Commercial steel projects
- **Industrial** 🏭 - Industrial steel projects  
- **Residential** 🏠 - Residential steel projects
- **Infrastructure** 🌉 - Infrastructure steel projects
- **General** 🏗️ - General steel projects

## Usage

### For Administrators

#### Managing Categories
1. Go to `/admin/content` in the admin panel
2. Use the "Add Category" button to create new categories
3. Each category can have:
   - Name (required)
   - Description (optional)
   - Color (optional, for visual identification)
   - Icon (optional, emoji or text)

#### Creating Projects with Categories
1. Go to `/admin/projects` in the admin panel
2. When adding a new project, select a category from the dropdown
3. The category dropdown will show all available categories
4. You can also edit existing projects to change their categories

#### Managing Project Images
1. When uploading images to projects, select the appropriate category
2. Images inherit the project's category by default
3. You can change individual image categories if needed

### For Public Users

#### Filtering Projects by Category
1. Visit the `/projects` page
2. Use the category filter dropdown above the project grid
3. Select a category to see only projects in that category
4. Use "All Categories" to see all projects
5. The filter shows how many projects are in the selected category

## Technical Implementation

### Database Schema

```sql
categories table:
- id: Primary key
- name: Category name (unique)
- description: Optional description
- color: Optional hex color code
- icon: Optional icon/emoji
- created_at: Timestamp
- is_active: Boolean flag
```

### Components Updated

1. **Admin Projects Page** (`app/admin/projects/page.tsx`)
   - Category dropdown instead of text input
   - Dynamic category loading from database

2. **Public Projects Page** (`app/projects/page.tsx`)
   - Category filter dropdown
   - Project filtering by category
   - Category count display

3. **Image Upload Component** (`components/image-upload.tsx`)
   - Dynamic category dropdown
   - Fallback to default categories if database fails

4. **Admin Content Page** (`app/admin/content/page.tsx`)
   - Category management interface
   - Add, edit, delete categories

### API Methods

The following methods are available in `SupabaseContentService`:

- `getAllCategories()` - Get all active categories
- `createCategory(category)` - Create a new category
- `updateCategory(id, data)` - Update an existing category
- `deleteCategory(id)` - Soft delete a category (sets is_active to false)

## Benefits

1. **Better Organization**: Projects are logically grouped by type
2. **Improved User Experience**: Users can easily find projects of interest
3. **Flexible Management**: Admins can create custom categories as needed
4. **Visual Appeal**: Categories can have colors and icons for better identification
5. **Scalability**: Easy to add new categories as the project portfolio grows

## Future Enhancements

Potential improvements for the category system:

1. **Subcategories**: Allow categories to have subcategories
2. **Category Statistics**: Show project counts per category
3. **Category Pages**: Dedicated pages for each category
4. **Category-based Navigation**: Add category links to main navigation
5. **Category SEO**: Optimize URLs and meta tags for categories

## Troubleshooting

### Common Issues

1. **Categories not loading**: Check database connection and permissions
2. **Category dropdown empty**: Ensure categories table exists and has data
3. **Filter not working**: Verify category names match between projects and categories table

### Debug Steps

1. Check browser console for errors
2. Verify database connection in Supabase dashboard
3. Run the setup script again if needed
4. Check that categories have `is_active = true`

## Support

If you encounter issues with the category system:

1. Check this documentation first
2. Review the browser console for error messages
3. Verify database setup and permissions
4. Contact the development team for assistance

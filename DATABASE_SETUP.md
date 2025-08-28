# Database Setup Guide

## Setting Up the Categories Table

The "Order Now" button feature requires a `categories` table in your Supabase database. Follow these steps to set it up:

### Option 1: Run the SQL Script (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to the **SQL Editor** section
3. Copy and paste the contents of `scripts/setup-categories.sql`
4. Click **Run** to execute the script

### Option 2: Manual Table Creation

If you prefer to create the table manually:

1. Go to your Supabase project dashboard
2. Navigate to **Table Editor**
3. Click **Create a new table**
4. Use these settings:

**Table Name:** `categories`

**Columns:**
- `id` (int8, primary key, identity)
- `name` (text, not null, unique)
- `description` (text, nullable)
- `color` (text, nullable)
- `icon` (text, nullable)
- `created_at` (timestamptz, default: now())
- `is_active` (bool, default: true)

**RLS Policies:**
- Enable Row Level Security
- Create policy: "Allow anonymous access to categories" with `FOR ALL USING (true)`

### Default Categories

The system will automatically use these fallback categories if the database table is not available:
- Commercial 🏢
- Industrial 🭭
- Residential 🏠
- Infrastructure 🌉
- General 🏗️

### Testing the Order Now Button

After setting up the categories table:

1. Visit `/projects` page
2. Click on any project to view details
3. Look for the "Order Now" button on the top-left of each image
4. Click the button to test the email functionality

### Troubleshooting

If you still see the "Error fetching categories" message:
1. Check that the `categories` table exists in your Supabase database
2. Verify that the table has the correct structure
3. Ensure your Supabase environment variables are properly configured
4. Check the browser console for more detailed error messages

The Order Now button should work even without the categories table (using fallback categories), but setting up the proper database structure will provide the best user experience.

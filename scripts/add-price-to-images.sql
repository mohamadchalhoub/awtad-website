-- Add price column to images table
-- Run this in your Supabase SQL Editor

-- Add price column to images table
ALTER TABLE images 
ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) DEFAULT 0.00;

-- Add a check constraint to ensure price is non-negative
ALTER TABLE images 
ADD CONSTRAINT check_price_non_negative CHECK (price >= 0);

-- Add an index on price for better query performance
CREATE INDEX IF NOT EXISTS idx_images_price ON images(price);

-- Update existing images to have a default price of 0.00 if they don't have one
UPDATE images 
SET price = 0.00 
WHERE price IS NULL;

-- Make price column NOT NULL after setting default values
ALTER TABLE images 
ALTER COLUMN price SET NOT NULL;

-- Add a comment to document the price column
COMMENT ON COLUMN images.price IS 'Price of the image in USD (decimal with 2 decimal places)';

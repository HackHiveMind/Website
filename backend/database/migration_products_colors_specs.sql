-- Migration: Add colors and specs columns to products
-- Created: 2026-02-15
-- Description: Adds columns for colors and specs, plus sample updates

ALTER TABLE products ADD COLUMN IF NOT EXISTS colors jsonb;
ALTER TABLE products ADD COLUMN IF NOT EXISTS specs jsonb;

-- Sample updates (comma-separated values)
UPDATE products SET colors = '["Silver","Space Gray","Midnight","Starlight"]'::jsonb, specs = '["A17 Pro chip","48MP camera","USB-C"]'::jsonb
WHERE product_id = 10;

UPDATE products SET colors = '["Space Gray","Silver"]'::jsonb, specs = '["M2 Pro chip","16-inch display","22-hour battery"]'::jsonb
WHERE product_id = 3;

UPDATE products SET colors = '["Blue","Pink","Yellow","Green","Black"]'::jsonb, specs = '["A16 chip","Dynamic Island","USB-C"]'::jsonb
WHERE product_id = 11;

UPDATE products SET colors = '["White","Black","Blue"]'::jsonb, specs = '["S9 chip","Health sensors","Water resistant"]'::jsonb
WHERE product_id = 15;

UPDATE products SET colors = '["Silver","Space Gray"]'::jsonb, specs = '["M2 chip","13-inch display","18-hour battery"]'::jsonb
WHERE product_id = 4;

-- Defaults for the rest (only if missing)
UPDATE products
SET colors = CASE
	WHEN category IN ('iphone', 'iphones', 'phones') THEN '["Black","White","Blue","Red"]'::jsonb
	WHEN category IN ('ipad', 'ipads', 'tablets') THEN '["Silver","Space Gray"]'::jsonb
	WHEN category IN ('mac', 'macs', 'laptops') THEN '["Silver","Space Gray"]'::jsonb
	WHEN category IN ('watch', 'watches') THEN '["Black","Silver"]'::jsonb
	ELSE '["Black","White"]'::jsonb
END
WHERE colors IS NULL AND category IS NOT NULL;

UPDATE products
SET specs = CASE
	WHEN category IN ('iphone', 'iphones', 'phones') THEN '["OLED display","5G","Face ID"]'::jsonb
	WHEN category IN ('ipad', 'ipads', 'tablets') THEN '["Liquid Retina display","USB-C","Apple Pencil support"]'::jsonb
	WHEN category IN ('mac', 'macs', 'laptops') THEN '["Apple Silicon","Retina display","Wi-Fi 6"]'::jsonb
	WHEN category IN ('watch', 'watches') THEN '["Heart rate","GPS","Water resistant"]'::jsonb
	ELSE '["High-quality build","Warranty included"]'::jsonb
END
WHERE specs IS NULL AND category IS NOT NULL;

-- Migration: Create products table
-- Created: 2026-02-15
-- Description: Creates the products table with all necessary columns

CREATE TABLE IF NOT EXISTS products (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  price DECIMAL(10, 2) NOT NULL,
  rating DECIMAL(3, 1),
  image VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Enable read access for all users" ON products
    FOR SELECT USING (true);

-- Allow authenticated insert/update/delete
CREATE POLICY "Enable insert for authenticated users" ON products
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON products
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON products
    FOR DELETE USING (auth.role() = 'authenticated');

-- Insert sample products
INSERT INTO products (name, description, category, price, rating, image) 
VALUES 
  ('iPhone 15 Pro', 'Latest Apple iPhone 15 Pro with advanced camera system', 'iphones', 999.00, 4.8, '/images/iphone15.png'),
  ('iPad Air', 'Powerful iPad Air for professionals', 'ipads', 599.00, 4.6, '/images/ipad.png'),
  ('MacBook Pro 16"', 'Ultimate MacBook Pro for creators and developers', 'macs', 2499.00, 4.9, '/images/macbook.png'),
  ('Apple Watch Ultra', 'Rugged Apple Watch for outdoor adventures', 'watches', 799.00, 4.7, '/images/watch.png'),
  ('AirPods Pro', 'Premium wireless earbuds with noise cancellation', 'accessories', 249.00, 4.5, '/images/airpods.png'),
  ('iPhone 15', 'iPhone 15 with solid performance and great camera', 'iphones', 799.00, 4.7, '/images/iphone15.png'),
  ('MacBook Air', 'Lightweight and powerful MacBook Air', 'macs', 1199.00, 4.6, '/images/macbook-air.png'),
  ('iPad Pro', 'iPad Pro with M2 chip', 'ipads', 1099.00, 4.8, '/images/ipad-pro.png');

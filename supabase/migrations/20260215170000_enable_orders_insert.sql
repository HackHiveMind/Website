-- Migration: Allow inserts into orders and order_items
-- Created: 2026-02-15

-- Enable RLS if not already enabled
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Allow public insert for checkout (adjust if you require auth)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'orders' AND policyname = 'Allow public insert orders'
  ) THEN
    CREATE POLICY "Allow public insert orders" ON orders
      FOR INSERT WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'order_items' AND policyname = 'Allow public insert order_items'
  ) THEN
    CREATE POLICY "Allow public insert order_items" ON order_items
      FOR INSERT WITH CHECK (true);
  END IF;
END $$;

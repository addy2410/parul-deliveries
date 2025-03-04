
-- Create a new table for storing cart items with quantity
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  restaurant_id TEXT NOT NULL,
  item_id TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, item_id)
);

-- Enable Row Level Security
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own cart items
CREATE POLICY "Allow users to read own cart items" 
ON public.cart_items 
FOR SELECT USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own cart items
CREATE POLICY "Allow users to insert own cart items" 
ON public.cart_items 
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own cart items
CREATE POLICY "Allow users to update own cart items" 
ON public.cart_items 
FOR UPDATE USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own cart items
CREATE POLICY "Allow users to delete own cart items" 
ON public.cart_items 
FOR DELETE USING (auth.uid() = user_id);

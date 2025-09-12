-- StreetR App Database Schema
-- Run these SQL commands in your Supabase SQL editor

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    full_name TEXT,
    mobile_number TEXT,
    street_name TEXT,
    nearby_landmark TEXT,
    district TEXT,
    state TEXT,
    pincode TEXT,
    user_type TEXT DEFAULT 'Customer' CHECK (user_type IN ('Customer', 'Seller')),
    shop_name TEXT,
    address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create menu_items table
CREATE TABLE IF NOT EXISTS menu_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url TEXT,
    category TEXT,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create likes table
CREATE TABLE IF NOT EXISTS likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, menu_item_id)
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    payment_token TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    total_amount DECIMAL(10,2) NOT NULL,
    platform_fee DECIMAL(10,2) NOT NULL DEFAULT 5.00,
    gst DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    delivery_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    seller_amount DECIMAL(10,2) NOT NULL,
    company_profit DECIMAL(10,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'preparing', 'ready', 'delivered', 'cancelled')),
    order_details JSONB NOT NULL,
    otp TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_tokens table for tracking payment tokens
CREATE TABLE IF NOT EXISTS order_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id TEXT NOT NULL UNIQUE,
    cashfree_order_id TEXT,
    order_token TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    total_amount DECIMAL(10,2) NOT NULL,
    is_delivery BOOLEAN NOT NULL DEFAULT false,
    cart_data JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_pincode ON profiles(pincode);
CREATE INDEX IF NOT EXISTS idx_menu_items_seller_id ON menu_items(seller_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_menu_item_id ON likes(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_tokens_user_id ON order_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_order_tokens_status ON order_tokens(status);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_tokens ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Profiles: Users can only see and modify their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Menu items: Public read access
CREATE POLICY "Menu items are publicly readable" ON menu_items
    FOR SELECT USING (true);

-- Likes: Users can only manage their own likes
CREATE POLICY "Users can view own likes" ON likes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own likes" ON likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own likes" ON likes
    FOR DELETE USING (auth.uid() = user_id);

-- Orders: Users can only see their own orders
CREATE POLICY "Users can view own orders" ON orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders" ON orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Order tokens: Users can only see their own order tokens
CREATE POLICY "Users can view own order tokens" ON order_tokens
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own order tokens" ON order_tokens
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_order_tokens_updated_at BEFORE UPDATE ON order_tokens
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to get menu items with likes
CREATE OR REPLACE FUNCTION get_menu_items_with_likes(p_seller_ids UUID[], p_user_id UUID)
RETURNS TABLE (
    id UUID,
    seller_id UUID,
    name TEXT,
    description TEXT,
    price DECIMAL,
    image_url TEXT,
    category TEXT,
    is_available BOOLEAN,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    is_liked_by_user BOOLEAN,
    like_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        mi.id,
        mi.seller_id,
        mi.name,
        mi.description,
        mi.price,
        mi.image_url,
        mi.category,
        mi.is_available,
        mi.created_at,
        mi.updated_at,
        CASE WHEN l.user_id IS NOT NULL THEN true ELSE false END as is_liked_by_user,
        COALESCE(like_counts.count, 0) as like_count
    FROM menu_items mi
    LEFT JOIN likes l ON mi.id = l.menu_item_id AND l.user_id = p_user_id
    LEFT JOIN (
        SELECT menu_item_id, COUNT(*) as count
        FROM likes
        GROUP BY menu_item_id
    ) like_counts ON mi.id = like_counts.menu_item_id
    WHERE mi.seller_id = ANY(p_seller_ids)
    AND mi.is_available = true
    ORDER BY mi.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
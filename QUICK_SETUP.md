# 🚀 StreetR App - Quick Setup Guide

## ❌ Error: "supabase is not defined"

This error means Supabase isn't properly configured. Follow these steps:

### 1. Get Your Supabase Credentials

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → API
4. Copy your:
   - **Project URL** (looks like: `https://abcdefgh.supabase.co`)
   - **Anon Key** (long string starting with `eyJ...`)

### 2. Update Configuration

Open `js_supabase.js` and replace these lines:

```javascript
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';
```

With your actual credentials:

```javascript
const SUPABASE_URL = 'https://abcdefgh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

### 3. Test Your Setup

1. Open `test-setup.html` in your browser
2. Check if the connection test passes
3. If successful, open `index.html` to use the app

### 4. Set Up Database

1. Go to your Supabase project dashboard
2. Click on "SQL Editor"
3. Copy and paste the entire content from `database-schema.sql`
4. Click "Run" to create the database tables

### 5. Add Test Data

Add some sample data to test the app:

```sql
-- Insert a test seller
INSERT INTO profiles (user_id, full_name, mobile_number, pincode, user_type, shop_name, address)
VALUES ('00000000-0000-0000-0000-000000000000', 'Test Seller', '9999999999', '560001', 'Seller', 'Test Restaurant', 'Test Address');

-- Insert some menu items
INSERT INTO menu_items (seller_id, name, description, price, category)
VALUES 
  ((SELECT id FROM profiles WHERE shop_name = 'Test Restaurant'), 'Pizza', 'Delicious pizza', 299.00, 'Main Course'),
  ((SELECT id FROM profiles WHERE shop_name = 'Test Restaurant'), 'Burger', 'Tasty burger', 199.00, 'Fast Food');
```

## ✅ That's It!

Your StreetR app should now work perfectly! The "supabase is not defined" error will be resolved.

## 🔧 Still Having Issues?

1. **Check browser console** for any error messages
2. **Verify internet connection** - Supabase needs to load from CDN
3. **Check credentials** - Make sure URL and key are correct
4. **Clear browser cache** and refresh the page

## 📱 Next Steps

Once the app is working:
1. Create a user account
2. Complete your profile
3. Browse and order food
4. Test the payment system (with Cashfree setup)

Happy coding! 🎉

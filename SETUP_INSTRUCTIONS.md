# StreetR App - Complete Setup Instructions

## 🚀 Quick Start Guide

### 1. Supabase Setup

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note down your project URL and anon key

2. **Update Configuration**
   - Open `js_supabase.js`
   - Replace `SUPABASE_URL` and `SUPABASE_ANON_KEY` with your actual values

3. **Deploy Database Schema**
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Copy and paste the entire content from `database-schema.sql`
   - Run the SQL commands

### 2. Cashfree Payment Setup

1. **Create Cashfree Account**
   - Go to [cashfree.com](https://cashfree.com)
   - Create a developer account
   - Get your App ID and Secret Key

2. **Deploy Edge Function**
   - In your Supabase project, go to Edge Functions
   - Create a new function called `create-cashfree-order`
   - Copy the content from `supabase-edge-function-create-cashfree-order.js`
   - Set these environment variables:
     - `CASHFREE_APP_ID`: Your Cashfree App ID
     - `CASHFREE_SECRET_KEY`: Your Cashfree Secret Key
     - `SITE_URL`: Your website URL (e.g., `https://yourdomain.com`)

### 3. Deploy the App

1. **Option A: Deploy to Netlify/Vercel**
   - Upload all files to your hosting platform
   - Make sure all files are in the root directory

2. **Option B: Local Development**
   - Open `index.html` in a web browser
   - Use a local server for better performance

### 4. Test the App

1. **Create Test Data**
   - Add some menu items in your Supabase database
   - Create seller profiles with pincodes
   - Test the complete flow

## 📱 Features Included

### ✅ Core Features
- **User Authentication** - Magic link login
- **Profile Management** - Complete user profiles
- **Food Browsing** - Browse items by location
- **Cart Management** - Add/remove items
- **Door Delivery Switch** - ON/OFF toggle with dynamic pricing
- **Order Disclaimer** - Popup before payment
- **Payment Integration** - Cashfree payment gateway
- **Order Tracking** - View orders with OTP
- **Search Functionality** - Search food and shops
- **Likes System** - Like/unlike items
- **Map Integration** - View nearby sellers
- **QR Scanner** - Scan seller QR codes

### ✅ Professional Features
- **Responsive Design** - Works on all devices
- **Loading States** - Professional loading indicators
- **Error Handling** - Comprehensive error management
- **Animations** - Smooth transitions and confetti
- **Notifications** - Popup notifications
- **Empty States** - Beautiful empty state designs

## 🔧 Configuration

### Environment Variables (Supabase Edge Function)
```
CASHFREE_APP_ID=your_app_id
CASHFREE_SECRET_KEY=your_secret_key
SITE_URL=https://yourdomain.com
```

### Database Tables
- `profiles` - User and seller profiles
- `menu_items` - Food items
- `likes` - User likes
- `orders` - Order history
- `order_tokens` - Payment tokens

## 🎯 Key Modifications Made

### 1. Door Delivery Switch
- Added ON/OFF toggle in cart page
- Dynamic pricing calculation
- Shows/hides GST and delivery charges based on switch state

### 2. Order Disclaimer
- Popup appears when "Place Order" is clicked
- User must click "OK" to proceed to payment
- Disclaimer text: "Once you place an order, it cannot be canceled. Sorry for the inconvenience."

### 3. OTP Display
- 6-digit alphanumeric OTP shown on each order
- Black-colored OTP for delivery confirmation
- Generated when order is placed

### 4. Payment Integration
- Complete Cashfree integration
- Order token generation
- Payment success handling
- OTP generation and storage

## 🐛 Troubleshooting

### Common Issues
1. **Supabase connection error** - Check your URL and API key
2. **Payment not working** - Verify Cashfree credentials
3. **Items not loading** - Check if you have sellers in your pincode
4. **Profile not saving** - Ensure all required fields are filled

### Debug Mode
- Open browser developer tools
- Check console for error messages
- Verify network requests in Network tab

## 📞 Support

For any issues or questions:
- Check the console for error messages
- Verify all environment variables are set correctly
- Ensure database schema is deployed properly

## 🎉 You're All Set!

Your StreetR app is now ready to use! It's a complete food delivery app similar to Zomato with all the requested features implemented.
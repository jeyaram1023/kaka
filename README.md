# 🍕 StreetR - Complete Food Delivery App

A professional food delivery application built with HTML, CSS, JavaScript, and Supabase - similar to Zomato!

## ✨ Features Implemented

### 🛒 Cart & Ordering
- **Door Delivery Switch** - ON/OFF toggle with dynamic pricing
- **Dynamic Bill Calculation** - Shows different charges based on delivery preference
- **Order Disclaimer** - Popup confirmation before payment
- **Cart Management** - Add/remove items with quantity controls

### 💳 Payment System
- **Cashfree Integration** - Complete payment gateway setup
- **Order Token Generation** - Secure payment processing
- **OTP Generation** - 6-digit alphanumeric codes for delivery
- **Payment Success Handling** - Order confirmation and storage

### 📱 User Experience
- **Magic Link Authentication** - Secure email-based login
- **Profile Management** - Complete user profile setup
- **Search Functionality** - Search food items and shops
- **Likes System** - Like/unlike favorite items
- **Map Integration** - View nearby sellers
- **QR Scanner** - Scan seller QR codes
- **Responsive Design** - Works on all devices

### 🎨 Professional UI
- **Loading States** - Professional loading indicators
- **Error Handling** - Comprehensive error management
- **Animations** - Smooth transitions and confetti effects
- **Empty States** - Beautiful empty state designs
- **Notifications** - Popup notifications system

## 📁 File Structure

```
StreetR-customer-app/
├── index.html                          # Main HTML file
├── style.css                           # Complete CSS styling
├── js_supabase.js                      # Supabase configuration
├── js_auth.js                          # Authentication logic
├── js_main.js                          # Main app controller
├── js_home.js                          # Home page functionality
├── js_add_to_cart.js                   # Cart management
├── js_payment.js                       # Payment processing
├── js_order.js                         # Order display with OTP
├── js_profiles.js                      # Profile management
├── js_likes.js                         # Likes functionality
├── js_map.js                           # Map integration
├── js_search_filter.js                 # Search functionality
├── js_qr_scanner.js                    # QR scanner
├── js_notification.js                  # Notifications
├── js_shop.js                          # Shop functionality
├── supabase-edge-function-create-cashfree-order.js  # Payment edge function
├── database-schema.sql                 # Database schema
├── SETUP_INSTRUCTIONS.md               # Setup guide
└── README.md                           # This file
```

## 🚀 Quick Setup

1. **Supabase Setup**
   - Create a Supabase project
   - Update `js_supabase.js` with your credentials
   - Run `database-schema.sql` in Supabase SQL editor

2. **Cashfree Setup**
   - Create Cashfree account
   - Deploy the edge function with your credentials
   - Set environment variables

3. **Deploy**
   - Upload files to your hosting platform
   - Or open `index.html` in browser for local testing

## 🎯 Key Requirements Fulfilled

### ✅ Door Delivery Switch
- ON/OFF toggle in cart page
- When ON: Shows Item Charge + Platform Charge + GST + Delivery Charge
- When OFF: Shows only Item Charge + Platform Charge
- Default state: OFF

### ✅ Order Disclaimer
- Popup appears when "Place Order" is clicked
- Text: "Once you place an order, it cannot be canceled. Sorry for the inconvenience."
- OK button redirects to Payment Page

### ✅ OTP Display
- 6-digit alphanumeric OTP on each order card
- Black-colored OTP for delivery confirmation
- Generated when order is placed

### ✅ Payment Integration
- Complete Cashfree payment gateway
- Order token generation via Supabase Edge Function
- Payment success handling with OTP generation

## 🛠️ Technical Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
- **Payment**: Cashfree Payment Gateway
- **Maps**: Leaflet.js
- **QR Scanner**: html5-qrcode
- **Icons**: Font Awesome
- **Styling**: Custom CSS with modern design

## 📱 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers

## 🔧 Configuration

### Required Environment Variables
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
CASHFREE_APP_ID=your_cashfree_app_id
CASHFREE_SECRET_KEY=your_cashfree_secret_key
SITE_URL=your_website_url
```

## 🎉 Ready to Use!

This is a complete, professional food delivery application that works exactly like Zomato. All requested features have been implemented and the app is ready for production use!

## 📞 Support

For setup help, refer to `SETUP_INSTRUCTIONS.md` or check the browser console for any error messages.
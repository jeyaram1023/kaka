// Supabase Edge Function: create-cashfree-order
// Deploy this as a Supabase Edge Function

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the request body
    const { cart, is_delivery } = await req.json()

    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Cart is empty or invalid' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Calculate order amounts
    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0)
    const platformFee = 5.00
    const gst = is_delivery ? subtotal * 0.10 : 0
    const deliveryFee = is_delivery ? calculateDeliveryFee(subtotal) : 0
    const totalAmount = subtotal + platformFee + gst + deliveryFee

    // Generate a unique order ID
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Create order token payload for Cashfree
    const orderTokenPayload = {
      order_id: orderId,
      order_amount: totalAmount,
      order_currency: 'INR',
      customer_details: {
        customer_id: req.headers.get('x-user-id') || 'guest',
        customer_name: 'Customer',
        customer_email: 'customer@example.com',
        customer_phone: '9999999999'
      },
      order_meta: {
        return_url: `${Deno.env.get('SITE_URL')}/payment-success`,
        notify_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/payment-webhook`
      },
      order_note: `Order for ${cart.length} items${is_delivery ? ' with delivery' : ' for pickup'}`
    }

    // Call Cashfree API to create order token
    const cashfreeResponse = await fetch('https://sandbox.cashfree.com/pg/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-version': '2023-08-01',
        'x-client-id': Deno.env.get('CASHFREE_APP_ID'),
        'x-client-secret': Deno.env.get('CASHFREE_SECRET_KEY')
      },
      body: JSON.stringify(orderTokenPayload)
    })

    if (!cashfreeResponse.ok) {
      const errorData = await cashfreeResponse.json()
      throw new Error(`Cashfree API error: ${errorData.message || 'Unknown error'}`)
    }

    const cashfreeData = await cashfreeResponse.json()

    // Store order details in Supabase for reference
    const { error: insertError } = await supabaseClient
      .from('order_tokens')
      .insert({
        order_id: orderId,
        cashfree_order_id: cashfreeData.order_id,
        order_token: cashfreeData.payment_token,
        user_id: req.headers.get('x-user-id'),
        total_amount: totalAmount,
        is_delivery: is_delivery,
        cart_data: cart,
        status: 'pending',
        created_at: new Date().toISOString()
      })

    if (insertError) {
      console.error('Error storing order token:', insertError)
      // Don't fail the request, just log the error
    }

    return new Response(
      JSON.stringify({ 
        order_token: cashfreeData.payment_token,
        order_id: orderId,
        order_amount: totalAmount
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error creating order token:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

// Helper function to calculate delivery fee
function calculateDeliveryFee(subtotal) {
  if (subtotal <= 100) return 10
  if (subtotal <= 200) return 15
  if (subtotal <= 500) return 20
  if (subtotal <= 1000) return 25
  return 30
}
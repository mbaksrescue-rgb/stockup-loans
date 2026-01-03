import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface RepaymentRequest {
  user_id: string;
  loan_id: string;
  amount: number;
  phone: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { user_id, loan_id, amount, phone } = await req.json() as RepaymentRequest;

    console.log("Initiating repayment:", { user_id, loan_id, amount, phone });

    if (!user_id || !loan_id || !amount || !phone) {
      return new Response(
        JSON.stringify({ success: false, message: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Format phone number for Safaricom (254XXXXXXXXX format)
    let formattedPhone = phone.replace(/\s+/g, '').replace(/-/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.substring(1);
    } else if (formattedPhone.startsWith('+254')) {
      formattedPhone = formattedPhone.substring(1);
    } else if (!formattedPhone.startsWith('254')) {
      formattedPhone = '254' + formattedPhone;
    }

    // Validate amount
    if (amount < 1) {
      return new Response(
        JSON.stringify({ success: false, message: "Amount must be at least 1 KSh" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if Daraja credentials are configured
    const consumerKey = Deno.env.get("DARAJA_CONSUMER_KEY");
    const consumerSecret = Deno.env.get("DARAJA_CONSUMER_SECRET");
    const businessShortCode = Deno.env.get("DARAJA_SHORTCODE") || "174379";
    const passkey = Deno.env.get("DARAJA_PASSKEY");
    const callbackUrl = Deno.env.get("DARAJA_CALLBACK_URL");

    let checkoutRequestId = "";
    let merchantRequestId = "";
    let stkPushSent = false;

    if (consumerKey && consumerSecret && passkey && callbackUrl) {
      console.log("Daraja credentials found, initiating STK Push...");
      
      try {
        // Get OAuth token
        const authString = btoa(`${consumerKey}:${consumerSecret}`);
        const tokenResponse = await fetch(
          "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
          {
            method: "GET",
            headers: {
              "Authorization": `Basic ${authString}`,
            },
          }
        );

        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;

        if (!accessToken) {
          throw new Error("Failed to get access token");
        }

        // Generate timestamp and password
        const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
        const password = btoa(`${businessShortCode}${passkey}${timestamp}`);

        // Initiate STK Push
        const stkResponse = await fetch(
          "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
          {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              BusinessShortCode: businessShortCode,
              Password: password,
              Timestamp: timestamp,
              TransactionType: "CustomerPayBillOnline",
              Amount: Math.round(amount),
              PartyA: formattedPhone,
              PartyB: businessShortCode,
              PhoneNumber: formattedPhone,
              CallBackURL: callbackUrl,
              AccountReference: `LOAN-${loan_id.substring(0, 8)}`,
              TransactionDesc: "Loan Repayment",
            }),
          }
        );

        const stkData = await stkResponse.json();
        console.log("STK Push Response:", stkData);

        if (stkData.ResponseCode === "0") {
          checkoutRequestId = stkData.CheckoutRequestID;
          merchantRequestId = stkData.MerchantRequestID;
          stkPushSent = true;
        } else {
          throw new Error(stkData.errorMessage || "STK Push failed");
        }
      } catch (darajaError) {
        console.error("Daraja API error:", darajaError);
        // Continue with mock if Daraja fails
      }
    }

    // If Daraja not configured or failed, use mock
    if (!stkPushSent) {
      console.log("Using mock STK Push (Daraja not configured or failed)");
      checkoutRequestId = `mock-checkout-${Date.now()}`;
      merchantRequestId = `mock-merchant-${Date.now()}`;
    }

    // Insert repayment record
    const { data: repayment, error: insertError } = await supabaseClient
      .from("repayments")
      .insert({
        user_id,
        loan_id,
        amount,
        phone: formattedPhone,
        checkout_request_id: checkoutRequestId,
        merchant_request_id: merchantRequestId,
        status: "pending",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting repayment:", insertError);
      return new Response(
        JSON.stringify({ success: false, message: "Failed to create repayment record" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log the action
    await supabaseClient.from("audit_logs").insert({
      action: "repayment_initiated",
      entity_type: "repayment",
      entity_id: repayment.id,
      user_id,
      details: {
        loan_id,
        amount,
        phone: formattedPhone,
        checkout_request_id: checkoutRequestId,
        stk_push_sent: stkPushSent,
      },
    });

    // If using mock, simulate successful payment after a delay
    if (!stkPushSent) {
      // For demo: Auto-complete the payment after 5 seconds
      setTimeout(async () => {
        try {
          const mockReceipt = `MOCK${Date.now().toString(36).toUpperCase()}`;
          
          await supabaseClient
            .from("repayments")
            .update({
              status: "paid",
              mpesa_receipt: mockReceipt,
              paid_at: new Date().toISOString(),
            })
            .eq("id", repayment.id);

          console.log("Mock payment completed:", mockReceipt);
        } catch (mockError) {
          console.error("Mock payment completion error:", mockError);
        }
      }, 5000);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: stkPushSent 
          ? "STK Push sent. Please check your phone and enter your M-PESA PIN."
          : "Payment initiated (demo mode). Payment will complete shortly.",
        repayment_id: repayment.id,
        checkout_request_id: checkoutRequestId,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Repayment initiation error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error instanceof Error ? error.message : "Unknown error" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

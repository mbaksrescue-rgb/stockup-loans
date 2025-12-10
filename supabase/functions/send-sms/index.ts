import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SmsRequest {
  phone: string;
  message: string;
  applicationId?: string;
  notificationType: 'approved' | 'rejected' | 'pending' | 'disbursed' | 'custom';
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

    const { phone, message, applicationId, notificationType } = await req.json() as SmsRequest;

    if (!phone || !message) {
      return new Response(
        JSON.stringify({ error: "Phone number and message are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Format phone number for Kenya (add +254 if needed)
    let formattedPhone = phone.replace(/\s+/g, '').replace(/-/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '+254' + formattedPhone.substring(1);
    } else if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+254' + formattedPhone;
    }

    // Check if Africa's Talking credentials are configured
    const apiKey = Deno.env.get("AFRICASTALKING_API_KEY");
    const username = Deno.env.get("AFRICASTALKING_USERNAME");

    let smsResult: { success: boolean; provider: string; messageId?: string; error?: string };

    if (apiKey && username) {
      // Send via Africa's Talking
      try {
        const response = await fetch("https://api.africastalking.com/version1/messaging", {
          method: "POST",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
            "apiKey": apiKey,
          },
          body: new URLSearchParams({
            username: username,
            to: formattedPhone,
            message: message,
          }),
        });

        const result = await response.json();
        
        if (result.SMSMessageData?.Recipients?.[0]?.status === "Success") {
          smsResult = {
            success: true,
            provider: "africastalking",
            messageId: result.SMSMessageData.Recipients[0].messageId,
          };
        } else {
          smsResult = {
            success: false,
            provider: "africastalking",
            error: result.SMSMessageData?.Recipients?.[0]?.status || "Unknown error",
          };
        }
      } catch (error) {
        smsResult = {
          success: false,
          provider: "africastalking",
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    } else {
      // Mock SMS - log to console and return success
      console.log("=== MOCK SMS ===");
      console.log(`To: ${formattedPhone}`);
      console.log(`Message: ${message}`);
      console.log(`Type: ${notificationType}`);
      console.log("================");

      smsResult = {
        success: true,
        provider: "mock",
        messageId: `mock-${Date.now()}`,
      };
    }

    // Log the SMS attempt in audit_logs
    await supabaseClient.from("audit_logs").insert({
      action: "sms_notification",
      entity_type: "loan_application",
      entity_id: applicationId || null,
      details: {
        phone: formattedPhone,
        notification_type: notificationType,
        message_preview: message.substring(0, 50) + (message.length > 50 ? "..." : ""),
        result: smsResult,
      },
    });

    return new Response(
      JSON.stringify({
        success: smsResult.success,
        provider: smsResult.provider,
        messageId: smsResult.messageId,
        message: smsResult.success
          ? `SMS ${smsResult.provider === "mock" ? "(mock)" : ""} sent successfully`
          : `Failed to send SMS: ${smsResult.error}`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("SMS Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
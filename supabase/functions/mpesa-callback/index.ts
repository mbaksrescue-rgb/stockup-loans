import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface MpesaCallback {
  Body: {
    stkCallback: {
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResultCode: number;
      ResultDesc: string;
      CallbackMetadata?: {
        Item: Array<{
          Name: string;
          Value?: string | number;
        }>;
      };
    };
  };
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

    const callback = await req.json() as MpesaCallback;
    console.log("Received M-PESA callback:", JSON.stringify(callback, null, 2));

    const { stkCallback } = callback.Body;
    const { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = stkCallback;

    // Find the repayment record
    const { data: repayment, error: fetchError } = await supabaseClient
      .from("repayments")
      .select("*, loan_applications(user_id, business_name, loan_amount, owner_phone)")
      .eq("checkout_request_id", CheckoutRequestID)
      .single();

    if (fetchError || !repayment) {
      console.error("Repayment not found for checkout request:", CheckoutRequestID);
      return new Response(
        JSON.stringify({ success: false, message: "Repayment not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let mpesaReceipt = "";
    let transactionAmount = 0;
    let phoneNumber = "";

    if (ResultCode === 0 && CallbackMetadata) {
      // Payment successful - extract details
      for (const item of CallbackMetadata.Item) {
        switch (item.Name) {
          case "MpesaReceiptNumber":
            mpesaReceipt = String(item.Value);
            break;
          case "Amount":
            transactionAmount = Number(item.Value);
            break;
          case "PhoneNumber":
            phoneNumber = String(item.Value);
            break;
        }
      }

      // Update repayment as paid
      const { error: updateError } = await supabaseClient
        .from("repayments")
        .update({
          status: "paid",
          mpesa_receipt: mpesaReceipt,
          paid_at: new Date().toISOString(),
        })
        .eq("id", repayment.id);

      if (updateError) {
        console.error("Error updating repayment:", updateError);
      }

      // Calculate total paid for this loan
      const { data: allRepayments } = await supabaseClient
        .from("repayments")
        .select("amount")
        .eq("loan_id", repayment.loan_id)
        .eq("status", "paid");

      const totalPaid = allRepayments?.reduce((sum, r) => sum + Number(r.amount), 0) || 0;

      // Get disbursement for repayment amount
      const { data: disbursement } = await supabaseClient
        .from("disbursements")
        .select("repayment_amount")
        .eq("application_id", repayment.loan_id)
        .single();

      const totalDue = disbursement?.repayment_amount || (repayment.amount * 1.1);

      // If fully paid, update loan status
      if (totalPaid >= totalDue) {
        await supabaseClient
          .from("loan_applications")
          .update({ status: "completed" })
          .eq("id", repayment.loan_id);

        // Also update disbursement repayment status
        await supabaseClient
          .from("disbursements")
          .update({ repayment_status: "completed" })
          .eq("application_id", repayment.loan_id);
      }

      // Log successful payment
      await supabaseClient.from("audit_logs").insert({
        action: "repayment_successful",
        entity_type: "repayment",
        entity_id: repayment.id,
        user_id: repayment.user_id,
        details: {
          loan_id: repayment.loan_id,
          amount: transactionAmount,
          mpesa_receipt: mpesaReceipt,
          phone: phoneNumber,
          total_paid: totalPaid,
          total_due: totalDue,
          fully_paid: totalPaid >= totalDue,
        },
      });

      // Send success SMS notification
      try {
        await supabaseClient.functions.invoke("send-sms", {
          body: {
            phone: repayment.phone,
            message: totalPaid >= totalDue
              ? `Your loan is fully repaid! Receipt: ${mpesaReceipt}. Thank you for banking with Zion Links.`
              : `Payment of KSh ${transactionAmount.toLocaleString()} received. Receipt: ${mpesaReceipt}. Outstanding: KSh ${(totalDue - totalPaid).toLocaleString()}. Thank you.`,
            applicationId: repayment.loan_id,
            notificationType: "custom",
          },
        });
      } catch (smsError) {
        console.error("Failed to send SMS notification:", smsError);
      }

      console.log("Payment successful:", {
        repayment_id: repayment.id,
        receipt: mpesaReceipt,
        amount: transactionAmount,
      });

    } else {
      // Payment failed
      await supabaseClient
        .from("repayments")
        .update({ status: "failed" })
        .eq("id", repayment.id);

      // Log failed payment
      await supabaseClient.from("audit_logs").insert({
        action: "repayment_failed",
        entity_type: "repayment",
        entity_id: repayment.id,
        user_id: repayment.user_id,
        details: {
          loan_id: repayment.loan_id,
          result_code: ResultCode,
          result_desc: ResultDesc,
        },
      });

      // Send failure SMS notification
      try {
        await supabaseClient.functions.invoke("send-sms", {
          body: {
            phone: repayment.phone,
            message: `Payment failed. ${ResultDesc}. Please try again. - Zion Links`,
            applicationId: repayment.loan_id,
            notificationType: "custom",
          },
        });
      } catch (smsError) {
        console.error("Failed to send SMS notification:", smsError);
      }

      console.log("Payment failed:", {
        repayment_id: repayment.id,
        result_code: ResultCode,
        result_desc: ResultDesc,
      });
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Callback processing error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error instanceof Error ? error.message : "Unknown error" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

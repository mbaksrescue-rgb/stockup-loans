import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    const { applicationId, documentUrls, businessData } = await req.json();

    console.log('Analyzing risk for application:', applicationId);
    console.log('Business data:', businessData);

    // Build the analysis prompt
    const analysisPrompt = `You are a loan risk assessment AI for a liquor store financing company. Analyze the following loan application and provide a risk assessment.

Business Information:
- Business Name: ${businessData.businessName}
- Registration Number: ${businessData.registrationNumber}
- Years in Operation: ${businessData.yearsInOperation}
- Physical Address: ${businessData.physicalAddress}
- Loan Amount Requested: KSh ${businessData.loanAmount}
- Loan Purpose: ${businessData.loanPurpose}
- Distributor: ${businessData.distributorName}

Documents Submitted:
- ID Document: ${documentUrls.idDocument ? 'Uploaded' : 'Missing'}
- Business Registration: ${documentUrls.businessRegistration ? 'Uploaded' : 'Missing'}
- Selfie Verification: ${documentUrls.selfie ? 'Uploaded' : 'Missing'}

Based on this information, provide a JSON response with the following structure:
{
  "riskScore": <number 0-100, where 0 is lowest risk and 100 is highest risk>,
  "riskLevel": <"low" | "medium" | "high">,
  "kycStatus": <"verified" | "pending" | "flagged">,
  "amlStatus": <"clear" | "pending" | "flagged">,
  "fraudFlags": <array of strings describing any concerns>,
  "recommendation": <"approve" | "review" | "reject">,
  "reasons": <array of strings explaining the assessment>,
  "confidenceScore": <number 0-100>
}

Consider these factors:
1. Years in operation (2+ years is good, higher is better)
2. Loan amount vs typical business size
3. Document completeness
4. Business registration presence
5. Any inconsistencies in the data

Respond ONLY with valid JSON, no additional text.`;

    // Call Lovable AI for risk analysis
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a precise risk assessment AI. Always respond with valid JSON only." },
          { role: "user", content: analysisPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits depleted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiData = await response.json();
    const aiResponse = aiData.choices?.[0]?.message?.content;

    console.log('AI Response:', aiResponse);

    // Parse the AI response
    let riskAssessment;
    try {
      // Clean the response (remove markdown code blocks if present)
      let cleanedResponse = aiResponse.trim();
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.slice(7);
      }
      if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.slice(3);
      }
      if (cleanedResponse.endsWith('```')) {
        cleanedResponse = cleanedResponse.slice(0, -3);
      }
      riskAssessment = JSON.parse(cleanedResponse.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Fallback assessment
      riskAssessment = {
        riskScore: 50,
        riskLevel: "medium",
        kycStatus: "pending",
        amlStatus: "pending",
        fraudFlags: [],
        recommendation: "review",
        reasons: ["AI analysis could not be completed. Manual review required."],
        confidenceScore: 0
      };
    }

    // Store the risk assessment in the database
    const { data: existingAssessment, error: fetchError } = await supabase
      .from('risk_assessments')
      .select('id')
      .eq('application_id', applicationId)
      .maybeSingle();

    if (existingAssessment) {
      // Update existing assessment
      const { error: updateError } = await supabase
        .from('risk_assessments')
        .update({
          risk_score: riskAssessment.riskScore,
          risk_level: riskAssessment.riskLevel,
          kyc_status: riskAssessment.kycStatus,
          aml_status: riskAssessment.amlStatus,
          fraud_flags: riskAssessment.fraudFlags,
          verification_notes: JSON.stringify({
            recommendation: riskAssessment.recommendation,
            reasons: riskAssessment.reasons,
            confidenceScore: riskAssessment.confidenceScore
          }),
          updated_at: new Date().toISOString()
        })
        .eq('id', existingAssessment.id);

      if (updateError) {
        console.error('Error updating risk assessment:', updateError);
      }
    } else {
      // Insert new assessment
      const { error: insertError } = await supabase
        .from('risk_assessments')
        .insert({
          application_id: applicationId,
          risk_score: riskAssessment.riskScore,
          risk_level: riskAssessment.riskLevel,
          kyc_status: riskAssessment.kycStatus,
          aml_status: riskAssessment.amlStatus,
          fraud_flags: riskAssessment.fraudFlags,
          verification_notes: JSON.stringify({
            recommendation: riskAssessment.recommendation,
            reasons: riskAssessment.reasons,
            confidenceScore: riskAssessment.confidenceScore
          })
        });

      if (insertError) {
        console.error('Error inserting risk assessment:', insertError);
      }
    }

    // Update the KYC data with analysis results
    const { error: kycUpdateError } = await supabase
      .from('kyc_data')
      .update({
        analysis_result: riskAssessment,
        risk_score: riskAssessment.riskScore,
        updated_at: new Date().toISOString()
      })
      .eq('application_id', applicationId);

    if (kycUpdateError) {
      console.error('Error updating KYC data:', kycUpdateError);
    }

    console.log('Risk assessment completed:', riskAssessment);

    return new Response(JSON.stringify({ 
      success: true, 
      riskAssessment 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-risk function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
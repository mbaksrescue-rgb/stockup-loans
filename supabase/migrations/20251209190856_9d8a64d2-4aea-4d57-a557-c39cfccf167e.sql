-- Create storage bucket for KYC documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('kyc-documents', 'kyc-documents', false);

-- RLS policies for kyc-documents bucket
CREATE POLICY "Users can upload their own documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'kyc-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'kyc-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view all KYC documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'kyc-documents' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Add columns to loan_applications for document tracking
ALTER TABLE public.loan_applications
ADD COLUMN IF NOT EXISTS id_document_url TEXT,
ADD COLUMN IF NOT EXISTS business_registration_url TEXT,
ADD COLUMN IF NOT EXISTS selfie_url TEXT,
ADD COLUMN IF NOT EXISTS documents_verified BOOLEAN DEFAULT FALSE;

-- Create table for risk analysis data
CREATE TABLE IF NOT EXISTS public.kyc_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES public.loan_applications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  document_type TEXT NOT NULL,
  document_url TEXT NOT NULL,
  analysis_result JSONB,
  risk_score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on kyc_data
ALTER TABLE public.kyc_data ENABLE ROW LEVEL SECURITY;

-- Users can view their own KYC data
CREATE POLICY "Users can view own KYC data"
ON public.kyc_data FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own KYC data
CREATE POLICY "Users can insert own KYC data"
ON public.kyc_data FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can manage all KYC data
CREATE POLICY "Admins can manage KYC data"
ON public.kyc_data FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));
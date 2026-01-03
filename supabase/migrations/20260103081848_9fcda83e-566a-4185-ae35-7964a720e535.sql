-- Create repayments table for tracking M-PESA loan repayments
CREATE TABLE public.repayments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  loan_id UUID NOT NULL REFERENCES public.loan_applications(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  phone TEXT NOT NULL,
  mpesa_receipt TEXT,
  checkout_request_id TEXT,
  merchant_request_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed')),
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.repayments ENABLE ROW LEVEL SECURITY;

-- Users can insert their own repayments
CREATE POLICY "Users can insert own repayments"
ON public.repayments
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can view their own repayments
CREATE POLICY "Users can view own repayments"
ON public.repayments
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can manage all repayments
CREATE POLICY "Admins can manage all repayments"
ON public.repayments
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for faster queries
CREATE INDEX idx_repayments_user_id ON public.repayments(user_id);
CREATE INDEX idx_repayments_loan_id ON public.repayments(loan_id);
CREATE INDEX idx_repayments_status ON public.repayments(status);

-- Enable realtime for repayments table
ALTER PUBLICATION supabase_realtime ADD TABLE public.repayments;
-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Create loan_applications table
CREATE TABLE public.loan_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  business_name TEXT NOT NULL,
  registration_number TEXT NOT NULL,
  years_in_operation INTEGER NOT NULL CHECK (years_in_operation >= 2),
  physical_address TEXT NOT NULL,
  distributor_name TEXT NOT NULL,
  distributor_paybill TEXT NOT NULL,
  distributor_contact TEXT NOT NULL,
  loan_amount DECIMAL NOT NULL CHECK (loan_amount >= 5000 AND loan_amount <= 300000),
  loan_purpose TEXT,
  owner_name TEXT NOT NULL,
  owner_phone TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'disbursed')),
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.loan_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own applications"
  ON public.loan_applications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own applications"
  ON public.loan_applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all applications"
  ON public.loan_applications FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all applications"
  ON public.loan_applications FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Create disbursements table
CREATE TABLE public.disbursements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES public.loan_applications(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL NOT NULL,
  distributor_paybill TEXT NOT NULL,
  transaction_ref TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  disbursed_at TIMESTAMP WITH TIME ZONE,
  repayment_due_date TIMESTAMP WITH TIME ZONE,
  repayment_status TEXT DEFAULT 'pending' CHECK (repayment_status IN ('pending', 'partial', 'completed', 'overdue')),
  repayment_amount DECIMAL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.disbursements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage disbursements"
  ON public.disbursements FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Create customers table for CRM
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  physical_address TEXT,
  business_type TEXT CHECK (business_type IN ('bar', 'liquor_store', 'restaurant', 'wines_spirits')),
  registration_number TEXT,
  years_in_operation INTEGER,
  distributor_name TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blacklisted')),
  total_loans DECIMAL DEFAULT 0,
  successful_repayments INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage customers"
  ON public.customers FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Create customer_interactions table
CREATE TABLE public.customer_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
  interaction_type TEXT CHECK (interaction_type IN ('call', 'email', 'meeting', 'sms', 'whatsapp', 'note')),
  subject TEXT NOT NULL,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.customer_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage interactions"
  ON public.customer_interactions FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_loan_applications_updated_at
  BEFORE UPDATE ON public.loan_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_disbursements_updated_at
  BEFORE UPDATE ON public.disbursements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'phone'
  );
  
  -- Assign default 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
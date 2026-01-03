export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      customer_interactions: {
        Row: {
          created_at: string | null
          created_by: string | null
          customer_id: string
          id: string
          interaction_type: string | null
          notes: string | null
          subject: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          customer_id: string
          id?: string
          interaction_type?: string | null
          notes?: string | null
          subject: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          customer_id?: string
          id?: string
          interaction_type?: string | null
          notes?: string | null
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_interactions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          business_name: string
          business_type: string | null
          contact_person: string
          created_at: string | null
          distributor_name: string | null
          email: string | null
          id: string
          phone: string
          physical_address: string | null
          registration_number: string | null
          status: string | null
          successful_repayments: number | null
          total_loans: number | null
          updated_at: string | null
          years_in_operation: number | null
        }
        Insert: {
          business_name: string
          business_type?: string | null
          contact_person: string
          created_at?: string | null
          distributor_name?: string | null
          email?: string | null
          id?: string
          phone: string
          physical_address?: string | null
          registration_number?: string | null
          status?: string | null
          successful_repayments?: number | null
          total_loans?: number | null
          updated_at?: string | null
          years_in_operation?: number | null
        }
        Update: {
          business_name?: string
          business_type?: string | null
          contact_person?: string
          created_at?: string | null
          distributor_name?: string | null
          email?: string | null
          id?: string
          phone?: string
          physical_address?: string | null
          registration_number?: string | null
          status?: string | null
          successful_repayments?: number | null
          total_loans?: number | null
          updated_at?: string | null
          years_in_operation?: number | null
        }
        Relationships: []
      }
      disbursements: {
        Row: {
          amount: number
          application_id: string
          created_at: string | null
          disbursed_at: string | null
          distributor_paybill: string
          id: string
          repayment_amount: number | null
          repayment_due_date: string | null
          repayment_status: string | null
          status: string | null
          transaction_ref: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          application_id: string
          created_at?: string | null
          disbursed_at?: string | null
          distributor_paybill: string
          id?: string
          repayment_amount?: number | null
          repayment_due_date?: string | null
          repayment_status?: string | null
          status?: string | null
          transaction_ref?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          application_id?: string
          created_at?: string | null
          disbursed_at?: string | null
          distributor_paybill?: string
          id?: string
          repayment_amount?: number | null
          repayment_due_date?: string | null
          repayment_status?: string | null
          status?: string | null
          transaction_ref?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "disbursements_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "loan_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      distributors: {
        Row: {
          account_number: string | null
          bank_name: string | null
          contact_person: string
          created_at: string | null
          email: string
          id: string
          last_payment_date: string | null
          license_number: string | null
          name: string
          paybill_number: string | null
          phone: string
          physical_address: string | null
          status: string | null
          total_payments: number | null
          updated_at: string | null
        }
        Insert: {
          account_number?: string | null
          bank_name?: string | null
          contact_person: string
          created_at?: string | null
          email: string
          id?: string
          last_payment_date?: string | null
          license_number?: string | null
          name: string
          paybill_number?: string | null
          phone: string
          physical_address?: string | null
          status?: string | null
          total_payments?: number | null
          updated_at?: string | null
        }
        Update: {
          account_number?: string | null
          bank_name?: string | null
          contact_person?: string
          created_at?: string | null
          email?: string
          id?: string
          last_payment_date?: string | null
          license_number?: string | null
          name?: string
          paybill_number?: string | null
          phone?: string
          physical_address?: string | null
          status?: string | null
          total_payments?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      founders: {
        Row: {
          bio: string | null
          created_at: string
          display_order: number | null
          email: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          linkedin_url: string | null
          name: string
          phone: string | null
          title: string
          updated_at: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          display_order?: number | null
          email?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          linkedin_url?: string | null
          name: string
          phone?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          display_order?: number | null
          email?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          linkedin_url?: string | null
          name?: string
          phone?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      kyc_data: {
        Row: {
          analysis_result: Json | null
          application_id: string | null
          created_at: string | null
          document_type: string
          document_url: string
          id: string
          risk_score: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          analysis_result?: Json | null
          application_id?: string | null
          created_at?: string | null
          document_type: string
          document_url: string
          id?: string
          risk_score?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          analysis_result?: Json | null
          application_id?: string | null
          created_at?: string | null
          document_type?: string
          document_url?: string
          id?: string
          risk_score?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kyc_data_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "loan_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      loan_applications: {
        Row: {
          business_name: string
          business_registration_url: string | null
          created_at: string | null
          distributor_contact: string
          distributor_name: string
          distributor_paybill: string
          documents_verified: boolean | null
          id: string
          id_document_url: string | null
          loan_amount: number
          loan_purpose: string | null
          owner_name: string
          owner_phone: string
          physical_address: string
          registration_number: string
          rejection_reason: string | null
          selfie_url: string | null
          status: string | null
          updated_at: string | null
          user_id: string
          years_in_operation: number
        }
        Insert: {
          business_name: string
          business_registration_url?: string | null
          created_at?: string | null
          distributor_contact: string
          distributor_name: string
          distributor_paybill: string
          documents_verified?: boolean | null
          id?: string
          id_document_url?: string | null
          loan_amount: number
          loan_purpose?: string | null
          owner_name: string
          owner_phone: string
          physical_address: string
          registration_number: string
          rejection_reason?: string | null
          selfie_url?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
          years_in_operation: number
        }
        Update: {
          business_name?: string
          business_registration_url?: string | null
          created_at?: string | null
          distributor_contact?: string
          distributor_name?: string
          distributor_paybill?: string
          documents_verified?: boolean | null
          id?: string
          id_document_url?: string | null
          loan_amount?: number
          loan_purpose?: string | null
          owner_name?: string
          owner_phone?: string
          physical_address?: string
          registration_number?: string
          rejection_reason?: string | null
          selfie_url?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
          years_in_operation?: number
        }
        Relationships: []
      }
      page_views: {
        Row: {
          city: string | null
          country: string | null
          created_at: string
          id: string
          page_path: string
          referrer: string | null
          user_agent: string | null
          visitor_id: string
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          page_path: string
          referrer?: string | null
          user_agent?: string | null
          visitor_id: string
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          page_path?: string
          referrer?: string | null
          user_agent?: string | null
          visitor_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      repayments: {
        Row: {
          amount: number
          checkout_request_id: string | null
          created_at: string
          id: string
          loan_id: string
          merchant_request_id: string | null
          mpesa_receipt: string | null
          paid_at: string | null
          phone: string
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          checkout_request_id?: string | null
          created_at?: string
          id?: string
          loan_id: string
          merchant_request_id?: string | null
          mpesa_receipt?: string | null
          paid_at?: string | null
          phone: string
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          checkout_request_id?: string | null
          created_at?: string
          id?: string
          loan_id?: string
          merchant_request_id?: string | null
          mpesa_receipt?: string | null
          paid_at?: string | null
          phone?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "repayments_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "loan_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      risk_assessments: {
        Row: {
          aml_status: string | null
          application_id: string | null
          created_at: string | null
          customer_id: string | null
          fraud_flags: Json | null
          id: string
          kyc_status: string | null
          risk_level: string | null
          risk_score: number | null
          updated_at: string | null
          verification_notes: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          aml_status?: string | null
          application_id?: string | null
          created_at?: string | null
          customer_id?: string | null
          fraud_flags?: Json | null
          id?: string
          kyc_status?: string | null
          risk_level?: string | null
          risk_score?: number | null
          updated_at?: string | null
          verification_notes?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          aml_status?: string | null
          application_id?: string | null
          created_at?: string | null
          customer_id?: string | null
          fraud_flags?: Json | null
          id?: string
          kyc_status?: string | null
          risk_level?: string | null
          risk_score?: number | null
          updated_at?: string | null
          verification_notes?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "risk_assessments_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "loan_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "risk_assessments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          category: string
          created_at: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const

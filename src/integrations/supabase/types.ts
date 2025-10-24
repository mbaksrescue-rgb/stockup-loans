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
      loan_applications: {
        Row: {
          business_name: string
          created_at: string | null
          distributor_contact: string
          distributor_name: string
          distributor_paybill: string
          id: string
          loan_amount: number
          loan_purpose: string | null
          owner_name: string
          owner_phone: string
          physical_address: string
          registration_number: string
          rejection_reason: string | null
          status: string | null
          updated_at: string | null
          user_id: string
          years_in_operation: number
        }
        Insert: {
          business_name: string
          created_at?: string | null
          distributor_contact: string
          distributor_name: string
          distributor_paybill: string
          id?: string
          loan_amount: number
          loan_purpose?: string | null
          owner_name: string
          owner_phone: string
          physical_address: string
          registration_number: string
          rejection_reason?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
          years_in_operation: number
        }
        Update: {
          business_name?: string
          created_at?: string | null
          distributor_contact?: string
          distributor_name?: string
          distributor_paybill?: string
          id?: string
          loan_amount?: number
          loan_purpose?: string | null
          owner_name?: string
          owner_phone?: string
          physical_address?: string
          registration_number?: string
          rejection_reason?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
          years_in_operation?: number
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

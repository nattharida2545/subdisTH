export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      appointments: {
        Row: {
          created_at: string
          date: string
          id: string
          notes: string | null
          patient_id: string
          purpose: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          notes?: string | null
          patient_id: string
          purpose: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          patient_id?: string
          purpose?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      line_settings: {
        Row: {
          access_token: string
          callback_url: string | null
          channel_id: string
          channel_secret: string
          created_at: string
          id: string
          liff_id: string | null
          login_channel_id: string | null
          login_channel_secret: string | null
          queue_called_message: string
          queue_received_message: string
          tts_config: Json
          updated_at: string
          welcome_message: string
        }
        Insert: {
          access_token: string
          callback_url?: string | null
          channel_id: string
          channel_secret: string
          created_at?: string
          id?: string
          liff_id?: string | null
          login_channel_id?: string | null
          login_channel_secret?: string | null
          queue_called_message: string
          queue_received_message: string
          tts_config?: Json
          updated_at?: string
          welcome_message: string
        }
        Update: {
          access_token?: string
          callback_url?: string | null
          channel_id?: string
          channel_secret?: string
          created_at?: string
          id?: string
          liff_id?: string | null
          login_channel_id?: string | null
          login_channel_secret?: string | null
          queue_called_message?: string
          queue_received_message?: string
          tts_config?: Json
          updated_at?: string
          welcome_message?: string
        }
        Relationships: []
      }
      medications: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          min_stock: number
          name: string
          stock: number
          unit: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          min_stock?: number
          name: string
          stock?: number
          unit: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          min_stock?: number
          name?: string
          stock?: number
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      patient_medications: {
        Row: {
          created_at: string
          dosage: string
          end_date: string | null
          id: string
          instructions: string | null
          medication_id: string
          notes: string | null
          patient_id: string
          start_date: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          dosage: string
          end_date?: string | null
          id?: string
          instructions?: string | null
          medication_id: string
          notes?: string | null
          patient_id: string
          start_date?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          dosage?: string
          end_date?: string | null
          id?: string
          instructions?: string | null
          medication_id?: string
          notes?: string | null
          patient_id?: string
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_medications_medication_id_fkey"
            columns: ["medication_id"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_medications_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          address: string | null
          birth_date: string | null
          created_at: string
          distance_from_hospital: number | null
          gender: string | null
          id: string
          line_id: string | null
          line_picture_url: string | null
          line_status_message: string | null
          line_user_id: string | null
          name: string
          patient_id: string
          phone: string
          profile_image: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          birth_date?: string | null
          created_at?: string
          distance_from_hospital?: number | null
          gender?: string | null
          id?: string
          line_id?: string | null
          line_picture_url?: string | null
          line_status_message?: string | null
          line_user_id?: string | null
          name: string
          patient_id: string
          phone: string
          profile_image?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          birth_date?: string | null
          created_at?: string
          distance_from_hospital?: number | null
          gender?: string | null
          id?: string
          line_id?: string | null
          line_picture_url?: string | null
          line_status_message?: string | null
          line_user_id?: string | null
          name?: string
          patient_id?: string
          phone?: string
          profile_image?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      pharmacy_queue_services: {
        Row: {
          created_at: string
          forwarded_to: string | null
          id: string
          pharmacist_notes: string | null
          queue_id: string
          service_end_at: string | null
          service_start_at: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          forwarded_to?: string | null
          id?: string
          pharmacist_notes?: string | null
          queue_id: string
          service_end_at?: string | null
          service_start_at?: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          forwarded_to?: string | null
          id?: string
          pharmacist_notes?: string | null
          queue_id?: string
          service_end_at?: string | null
          service_start_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pharmacy_queue_services_queue_id_fkey"
            columns: ["queue_id"]
            isOneToOne: false
            referencedRelation: "queues"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["app_role"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      queue_types: {
        Row: {
          algorithm: string
          code: string
          created_at: string
          enabled: boolean
          format: string
          id: string
          name: string
          prefix: string
          priority: number
          purpose: string | null
          updated_at: string
        }
        Insert: {
          algorithm: string
          code: string
          created_at?: string
          enabled?: boolean
          format: string
          id?: string
          name: string
          prefix: string
          priority?: number
          purpose?: string | null
          updated_at?: string
        }
        Update: {
          algorithm?: string
          code?: string
          created_at?: string
          enabled?: boolean
          format?: string
          id?: string
          name?: string
          prefix?: string
          priority?: number
          purpose?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      queues: {
        Row: {
          appointment_id: string | null
          called_at: string | null
          cancelled_at: string | null
          completed_at: string | null
          created_at: string
          id: string
          notes: string | null
          number: number
          patient_id: string
          paused_at: string | null
          pharmacy_status: string | null
          queue_date: string
          service_point_id: string | null
          skipped_at: string | null
          status: string
          transferred_at: string | null
          transferred_to_service_point_id: string | null
          type: string
          updated_at: string
        }
        Insert: {
          appointment_id?: string | null
          called_at?: string | null
          cancelled_at?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          number: number
          patient_id: string
          paused_at?: string | null
          pharmacy_status?: string | null
          queue_date?: string
          service_point_id?: string | null
          skipped_at?: string | null
          status: string
          transferred_at?: string | null
          transferred_to_service_point_id?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          appointment_id?: string | null
          called_at?: string | null
          cancelled_at?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          number?: number
          patient_id?: string
          paused_at?: string | null
          pharmacy_status?: string | null
          queue_date?: string
          service_point_id?: string | null
          skipped_at?: string | null
          status?: string
          transferred_at?: string | null
          transferred_to_service_point_id?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "queues_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "queues_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "queues_service_point_id_fkey"
            columns: ["service_point_id"]
            isOneToOne: false
            referencedRelation: "service_points"
            referencedColumns: ["id"]
          },
        ]
      }
      service_point_queue_types: {
        Row: {
          created_at: string
          id: string
          queue_type_id: string
          service_point_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          queue_type_id: string
          service_point_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          queue_type_id?: string
          service_point_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_point_queue_types_queue_type_id_fkey"
            columns: ["queue_type_id"]
            isOneToOne: false
            referencedRelation: "queue_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_point_queue_types_service_point_id_fkey"
            columns: ["service_point_id"]
            isOneToOne: false
            referencedRelation: "service_points"
            referencedColumns: ["id"]
          },
        ]
      }
      service_points: {
        Row: {
          code: string
          created_at: string
          enabled: boolean
          id: string
          location: string | null
          name: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          code: string
          created_at?: string
          enabled?: boolean
          id?: string
          location?: string | null
          name: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          enabled?: boolean
          id?: string
          location?: string | null
          name?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      settings: {
        Row: {
          category: string
          created_at: string
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          value?: Json
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
      create_queues_from_appointments: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      sync_appointment_queue_status: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "staff" | "patient"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "staff", "patient"],
    },
  },
} as const

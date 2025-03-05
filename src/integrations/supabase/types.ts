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
      menu_items: {
        Row: {
          created_at: string
          id: string
          name: string
          price: number
          shop_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          price: number
          shop_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          price?: number
          shop_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          is_read: boolean
          message: string
          recipient_id: string
          type: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean
          message: string
          recipient_id: string
          type: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean
          message?: string
          recipient_id?: string
          type?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string
          delivery_location: string
          estimated_delivery_time: string | null
          id: string
          items: Json
          restaurant_id: string
          status: string
          student_id: string
          student_name: string
          total_amount: number
          vendor_id: string
        }
        Insert: {
          created_at?: string
          delivery_location: string
          estimated_delivery_time?: string | null
          id?: string
          items: Json
          restaurant_id: string
          status: string
          student_id: string
          student_name: string
          total_amount: number
          vendor_id: string
        }
        Update: {
          created_at?: string
          delivery_location?: string
          estimated_delivery_time?: string | null
          id?: string
          items?: Json
          restaurant_id?: string
          status?: string
          student_id?: string
          student_name?: string
          total_amount?: number
          vendor_id?: string
        }
        Relationships: []
      }
      shops: {
        Row: {
          created_at: string
          cuisine: string | null
          delivery_time: string | null
          description: string | null
          id: string
          is_open: boolean | null
          location: string
          name: string
          rating: number | null
          tags: string[] | null
          vendor_id: string
        }
        Insert: {
          created_at?: string
          cuisine?: string | null
          delivery_time?: string | null
          description?: string | null
          id?: string
          is_open?: boolean | null
          location: string
          name: string
          rating?: number | null
          tags?: string[] | null
          vendor_id: string
        }
        Update: {
          created_at?: string
          cuisine?: string | null
          delivery_time?: string | null
          description?: string | null
          id?: string
          is_open?: boolean | null
          location?: string
          name?: string
          rating?: number | null
          tags?: string[] | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shops_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      student_users: {
        Row: {
          created_at: string | null
          id: string
          name: string
          password_hash: string
          phone: string
        }
        Insert: {
          created_at?: string | null
          id: string
          name: string
          password_hash: string
          phone: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          password_hash?: string
          phone?: string
        }
        Relationships: []
      }
      vendors: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_shop_owner: {
        Args: {
          menu_item_id: string
        }
        Returns: boolean
      }
      is_shop_owner_by_shop_id: {
        Args: {
          shop_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

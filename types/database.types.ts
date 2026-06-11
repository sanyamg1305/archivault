export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          first_name: string | null;
          last_name: string | null;
          email: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          first_name?: string | null;
          last_name?: string | null;
          email?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          first_name?: string | null;
          last_name?: string | null;
          email?: string | null;
          created_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          name: string;
          client_reference: string | null;
          total_budget: number;
          organization_id: string;
          created_by: string;
          client_id: string | null;
          status: string | null;
          description: string | null;
          start_date: string | null;
          target_date: string | null;
          phase: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          client_reference?: string | null;
          total_budget: number;
          organization_id: string;
          created_by: string;
          client_id?: string | null;
          status?: string | null;
          description?: string | null;
          start_date?: string | null;
          target_date?: string | null;
          phase?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          client_reference?: string | null;
          total_budget?: number;
          organization_id?: string;
          created_by?: string;
          client_id?: string | null;
          status?: string | null;
          description?: string | null;
          start_date?: string | null;
          target_date?: string | null;
          phase?: string | null;
          created_at?: string;
        };
      };
      rooms: {
        Row: {
          id: string;
          project_id: string;
          name: string;
          floor_area_sqft: number | null;
          ceiling_height_ft: number | null;
          room_type: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          name: string;
          floor_area_sqft?: number | null;
          ceiling_height_ft?: number | null;
          room_type?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          name?: string;
          floor_area_sqft?: number | null;
          ceiling_height_ft?: number | null;
          room_type?: string | null;
          notes?: string | null;
          created_at?: string;
        };
      };
      materials: {
        Row: {
          id: string;
          project_id: string;
          room_id: string | null;
          name: string;
          category: string | null;
          brand: string | null;
          vendor: string | null;
          estimated_cost: number;
          status: string;
          revision_note: string | null;
          image_path: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          room_id?: string | null;
          name: string;
          category?: string | null;
          brand?: string | null;
          vendor?: string | null;
          estimated_cost: number;
          status?: string;
          revision_note?: string | null;
          image_path?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          room_id?: string | null;
          name?: string;
          category?: string | null;
          brand?: string | null;
          vendor?: string | null;
          estimated_cost?: number;
          status?: string;
          revision_note?: string | null;
          image_path?: string | null;
          created_at?: string;
        };
      };
      designs: {
        Row: {
          id: string;
          project_id: string;
          room_id: string | null;
          title: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          room_id?: string | null;
          title: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          room_id?: string | null;
          title?: string;
          description?: string | null;
          created_at?: string;
        };
      };
      design_versions: {
        Row: {
          id: string;
          design_id: string;
          file_path: string;
          version_number: number;
          change_notes: string | null;
          status: string;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          design_id: string;
          file_path: string;
          version_number?: number;
          change_notes?: string | null;
          status?: string;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          design_id?: string;
          file_path?: string;
          version_number?: number;
          change_notes?: string | null;
          status?: string;
          created_by?: string | null;
          created_at?: string;
        };
      };
      project_messages: {
        Row: {
          id: string;
          project_id: string;
          sender_id: string;
          sender_name: string;
          content: string;
          channel: "internal" | "external";
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          sender_id: string;
          sender_name: string;
          content: string;
          channel: "internal" | "external";
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          sender_id?: string;
          sender_name?: string;
          content?: string;
          channel?: "internal" | "external";
          created_at?: string;
        };
      };
      activity_logs: {
        Row: {
          id: string;
          project_id: string;
          user_id: string;
          action_description: string;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          user_id: string;
          action_description: string;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          user_id?: string;
          action_description?: string;
          metadata?: Json | null;
          created_at?: string;
        };
      };
    };
  };
}

// Convenience row types
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Project = Database["public"]["Tables"]["projects"]["Row"];
export type Room = Database["public"]["Tables"]["rooms"]["Row"];
export type Material = Database["public"]["Tables"]["materials"]["Row"];
export type Design = Database["public"]["Tables"]["designs"]["Row"];
export type DesignVersion = Database["public"]["Tables"]["design_versions"]["Row"];
export type ActivityLog = Database["public"]["Tables"]["activity_logs"]["Row"];

// Joined types used across the app
export type DesignWithVersions = Design & { design_versions: DesignVersion[] };
export type RoomWithMaterials = Room & { materials: Material[] };
export type MaterialStatus = "Pending" | "Approved" | "Rejected" | "Revision Requested" | "Superseded";
export type DesignVersionStatus = "Pending" | "Approved" | "Rejected" | "Revision Requested" | "Superseded";

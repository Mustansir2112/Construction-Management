export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: 'manager' | 'engineer' | 'construction_worker'
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: 'manager' | 'engineer' | 'construction_worker'
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: 'manager' | 'engineer' | 'construction_worker'
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          description: string | null
          status: 'planning' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled'
          start_date: string | null
          end_date: string | null
          budget: number | null
          location: string | null
          manager_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          status?: 'planning' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled'
          start_date?: string | null
          end_date?: string | null
          budget?: number | null
          location?: string | null
          manager_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          status?: 'planning' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled'
          start_date?: string | null
          end_date?: string | null
          budget?: number | null
          location?: string | null
          manager_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      project_assignments: {
        Row: {
          id: string
          project_id: string
          user_id: string
          assigned_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          assigned_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          assigned_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          project_id: string
          title: string
          description: string | null
          assigned_to: string | null
          status: string
          due_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          title: string
          description?: string | null
          assigned_to?: string | null
          status?: string
          due_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          title?: string
          description?: string | null
          assigned_to?: string | null
          status?: string
          due_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'manager' | 'engineer' | 'construction_worker'
      project_status: 'planning' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled'
    }
  }
}
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
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: string
          department: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: string
          department?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: string
          department?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      clients: {
        Row: {
          id: string
          name: string
          logo_url: string | null
          website: string | null
          contact_name: string | null
          contact_email: string | null
          contact_phone: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          logo_url?: string | null
          website?: string | null
          contact_name?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          logo_url?: string | null
          website?: string | null
          contact_name?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          description: string | null
          client_id: string | null
          status: 'planning' | 'in_progress' | 'review' | 'completed' | 'on_hold' | 'cancelled'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          progress: number
          stage: string | null
          url: string | null
          is_internal: boolean
          start_date: string | null
          end_date: string | null
          responsible_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          client_id?: string | null
          status?: 'planning' | 'in_progress' | 'review' | 'completed' | 'on_hold' | 'cancelled'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          progress?: number
          stage?: string | null
          url?: string | null
          is_internal?: boolean
          start_date?: string | null
          end_date?: string | null
          responsible_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          client_id?: string | null
          status?: 'planning' | 'in_progress' | 'review' | 'completed' | 'on_hold' | 'cancelled'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          progress?: number
          stage?: string | null
          url?: string | null
          is_internal?: boolean
          start_date?: string | null
          end_date?: string | null
          responsible_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      sprints: {
        Row: {
          id: string
          project_id: string
          name: string
          goal: string | null
          status: 'planning' | 'active' | 'completed' | 'cancelled'
          start_date: string | null
          end_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          name: string
          goal?: string | null
          status?: 'planning' | 'active' | 'completed' | 'cancelled'
          start_date?: string | null
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          name?: string
          goal?: string | null
          status?: 'planning' | 'active' | 'completed' | 'cancelled'
          start_date?: string | null
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          project_id: string
          sprint_id: string | null
          title: string
          description: string | null
          status: 'backlog' | 'todo' | 'in_progress' | 'review' | 'done' | 'cancelled'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          assignee_id: string | null
          due_date: string | null
          estimated_hours: number | null
          actual_hours: number | null
          tags: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          sprint_id?: string | null
          title: string
          description?: string | null
          status?: 'backlog' | 'todo' | 'in_progress' | 'review' | 'done' | 'cancelled'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          assignee_id?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          actual_hours?: number | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          sprint_id?: string | null
          title?: string
          description?: string | null
          status?: 'backlog' | 'todo' | 'in_progress' | 'review' | 'done' | 'cancelled'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          assignee_id?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          actual_hours?: number | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      deals: {
        Row: {
          id: string
          client_id: string | null
          title: string
          description: string | null
          value: number
          currency: string
          stage: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost'
          probability: number
          expected_close_date: string | null
          responsible_id: string | null
          is_priority: boolean
          is_stalled: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id?: string | null
          title: string
          description?: string | null
          value?: number
          currency?: string
          stage?: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost'
          probability?: number
          expected_close_date?: string | null
          responsible_id?: string | null
          is_priority?: boolean
          is_stalled?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string | null
          title?: string
          description?: string | null
          value?: number
          currency?: string
          stage?: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost'
          probability?: number
          expected_close_date?: string | null
          responsible_id?: string | null
          is_priority?: boolean
          is_stalled?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      activity_log: {
        Row: {
          id: string
          user_id: string | null
          action: string
          entity_type: string
          entity_id: string | null
          entity_name: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          entity_type: string
          entity_id?: string | null
          entity_name?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          entity_type?: string
          entity_id?: string | null
          entity_name?: string | null
          metadata?: Json | null
          created_at?: string
        }
      }
      approvals: {
        Row: {
          id: string
          title: string
          description: string | null
          type: string
          status: 'pending' | 'approved' | 'rejected'
          requester_id: string | null
          approver_id: string | null
          project_id: string | null
          due_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          type: string
          status?: 'pending' | 'approved' | 'rejected'
          requester_id?: string | null
          approver_id?: string | null
          project_id?: string | null
          due_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          type?: string
          status?: 'pending' | 'approved' | 'rejected'
          requester_id?: string | null
          approver_id?: string | null
          project_id?: string | null
          due_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      calendar_events: {
        Row: {
          id: string
          title: string
          description: string | null
          event_type: string
          start_time: string
          end_time: string | null
          all_day: boolean
          location: string | null
          project_id: string | null
          created_by: string | null
          attendees: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          event_type?: string
          start_time: string
          end_time?: string | null
          all_day?: boolean
          location?: string | null
          project_id?: string | null
          created_by?: string | null
          attendees?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          event_type?: string
          start_time?: string
          end_time?: string | null
          all_day?: boolean
          location?: string | null
          project_id?: string | null
          created_by?: string | null
          attendees?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      alerts: {
        Row: {
          id: string
          title: string
          message: string | null
          type: 'info' | 'warning' | 'error' | 'success'
          is_dismissed: boolean
          user_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          message?: string | null
          type?: 'info' | 'warning' | 'error' | 'success'
          is_dismissed?: boolean
          user_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          message?: string | null
          type?: 'info' | 'warning' | 'error' | 'success'
          is_dismissed?: boolean
          user_id?: string | null
          created_at?: string
        }
      }
      checklists: {
        Row: {
          id: string
          task_id: string
          title: string
          is_completed: boolean
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          task_id: string
          title: string
          is_completed?: boolean
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          title?: string
          is_completed?: boolean
          order_index?: number
          created_at?: string
        }
      }
      project_links: {
        Row: {
          id: string
          project_id: string
          title: string
          url: string
          type: string
          username: string | null
          password_encrypted: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          title: string
          url: string
          type?: string
          username?: string | null
          password_encrypted?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          title?: string
          url?: string
          type?: string
          username?: string | null
          password_encrypted?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      deliveries: {
        Row: {
          id: string
          project_id: string
          title: string
          description: string | null
          status: 'pending' | 'in_progress' | 'delivered' | 'approved' | 'rejected'
          due_date: string | null
          delivered_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          title: string
          description?: string | null
          status?: 'pending' | 'in_progress' | 'delivered' | 'approved' | 'rejected'
          due_date?: string | null
          delivered_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          title?: string
          description?: string | null
          status?: 'pending' | 'in_progress' | 'delivered' | 'approved' | 'rejected'
          due_date?: string | null
          delivered_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          entity_type: string
          entity_id: string
          user_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          entity_type: string
          entity_id: string
          user_id: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          entity_type?: string
          entity_id?: string
          user_id?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      tags: {
        Row: {
          id: string
          name: string
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          color?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          color?: string
          created_at?: string
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
      [_ in never]: never
    }
  }
}

// Utility types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Entity types for easier use
export type Profile = Tables<'profiles'>
export type Client = Tables<'clients'>
export type Project = Tables<'projects'>
export type Sprint = Tables<'sprints'>
export type Task = Tables<'tasks'>
export type Deal = Tables<'deals'>
export type ActivityLog = Tables<'activity_log'>
export type Approval = Tables<'approvals'>
export type CalendarEvent = Tables<'calendar_events'>
export type Alert = Tables<'alerts'>
export type Checklist = Tables<'checklists'>
export type ProjectLink = Tables<'project_links'>
export type Delivery = Tables<'deliveries'>
export type Comment = Tables<'comments'>
export type Tag = Tables<'tags'>

// Extended types with relations
export type ProjectWithClient = Project & {
  client: Client | null
  responsible: Profile | null
}

export type TaskWithRelations = Task & {
  project: Project | null
  sprint: Sprint | null
  assignee: Profile | null
  checklists: Checklist[]
}

export type DealWithClient = Deal & {
  client: Client | null
  responsible: Profile | null
}

export type ActivityLogWithUser = ActivityLog & {
  user: Profile | null
}

export type ApprovalWithRelations = Approval & {
  requester: Profile | null
  approver: Profile | null
  project: Project | null
}

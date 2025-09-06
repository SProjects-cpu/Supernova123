import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Database types (you'll need to generate these from your schema)
export interface Database {
  public: {
    Tables: {
      events: {
        Row: {
          id: string
          title: string
          description: string
          category: string
          start_date: string
          end_date: string
          location: string
          max_participants: number
          registration_deadline: string
          status: 'draft' | 'published' | 'ongoing' | 'completed'
          organizer_id: string
          judges: string[]
          requirements: string[]
          prizes: any[]
          banner_image?: string
          event_image?: string
          registration_fee: number
          payment_link?: string
          tags: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          category: string
          start_date: string
          end_date: string
          location: string
          max_participants: number
          registration_deadline: string
          status?: 'draft' | 'published' | 'ongoing' | 'completed'
          organizer_id: string
          judges?: string[]
          requirements?: string[]
          prizes?: any[]
          banner_image?: string
          event_image?: string
          registration_fee?: number
          payment_link?: string
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          category?: string
          start_date?: string
          end_date?: string
          location?: string
          max_participants?: number
          registration_deadline?: string
          status?: 'draft' | 'published' | 'ongoing' | 'completed'
          organizer_id?: string
          judges?: string[]
          requirements?: string[]
          prizes?: any[]
          banner_image?: string
          event_image?: string
          registration_fee?: number
          payment_link?: string
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      participant_registrations: {
        Row: {
          id: string
          event_id?: string
          full_name: string
          college_university: string
          department_year: string
          contact_number: string
          email_id: string
          team_name?: string
          team_size: number
          role_in_team: 'Leader' | 'Member'
          technical_skills: string
          previous_experience?: string
          agree_to_rules: boolean
          registered_at: string
          ip_address?: string
          attachments: string[]
          event_specific_data: any
        }
        Insert: {
          id?: string
          event_id?: string
          full_name: string
          college_university: string
          department_year: string
          contact_number: string
          email_id: string
          team_name?: string
          team_size?: number
          role_in_team?: 'Leader' | 'Member'
          technical_skills: string
          previous_experience?: string
          agree_to_rules: boolean
          registered_at?: string
          ip_address?: string
          attachments?: string[]
          event_specific_data?: any
        }
        Update: {
          id?: string
          event_id?: string
          full_name?: string
          college_university?: string
          department_year?: string
          contact_number?: string
          email_id?: string
          team_name?: string
          team_size?: number
          role_in_team?: 'Leader' | 'Member'
          technical_skills?: string
          previous_experience?: string
          agree_to_rules?: boolean
          registered_at?: string
          ip_address?: string
          attachments?: string[]
          event_specific_data?: any
        }
      }
      organizer_credentials: {
        Row: {
          id: string
          email: string
          password: string
          role: 'organizer' | 'judge'
          first_name: string
          last_name: string
          organization?: string
          is_active: boolean
          created_at: string
          created_by: string
          last_login?: string
          password_reset_required: boolean
          linked_user_id?: string
        }
        Insert: {
          id?: string
          email: string
          password: string
          role: 'organizer' | 'judge'
          first_name: string
          last_name: string
          organization?: string
          is_active?: boolean
          created_at?: string
          created_by: string
          last_login?: string
          password_reset_required?: boolean
          linked_user_id?: string
        }
        Update: {
          id?: string
          email?: string
          password?: string
          role?: 'organizer' | 'judge'
          first_name?: string
          last_name?: string
          organization?: string
          is_active?: boolean
          created_at?: string
          created_by?: string
          last_login?: string
          password_reset_required?: boolean
          linked_user_id?: string
        }
      }
      pre_qualifier_tests: {
        Row: {
          id: string
          title: string
          description: string
          test_link: string
          is_active: boolean
          start_date: string
          end_date: string
          duration: number
          instructions: string
          eligibility_criteria: string
          max_attempts: number
          passing_score?: number
          created_by: string
          created_at: string
          updated_at: string
          event_id?: string
          tags: string[]
          difficulty: 'Easy' | 'Medium' | 'Hard'
          total_questions?: number
          test_type: 'MCQ' | 'Coding' | 'Mixed'
        }
        Insert: {
          id?: string
          title: string
          description: string
          test_link: string
          is_active?: boolean
          start_date: string
          end_date: string
          duration: number
          instructions: string
          eligibility_criteria: string
          max_attempts?: number
          passing_score?: number
          created_by: string
          created_at?: string
          updated_at?: string
          event_id?: string
          tags?: string[]
          difficulty?: 'Easy' | 'Medium' | 'Hard'
          total_questions?: number
          test_type?: 'MCQ' | 'Coding' | 'Mixed'
        }
        Update: {
          id?: string
          title?: string
          description?: string
          test_link?: string
          is_active?: boolean
          start_date?: string
          end_date?: string
          duration?: number
          instructions?: string
          eligibility_criteria?: string
          max_attempts?: number
          passing_score?: number
          created_by?: string
          created_at?: string
          updated_at?: string
          event_id?: string
          tags?: string[]
          difficulty?: 'Easy' | 'Medium' | 'Hard'
          total_questions?: number
          test_type?: 'MCQ' | 'Coding' | 'Mixed'
        }
      }
      participating_institutions: {
        Row: {
          id: string
          name: string
          type: 'college' | 'university' | 'company'
          logo?: string
          description?: string
          website?: string
          location?: string
          student_count: number
          is_active: boolean
          order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type: 'college' | 'university' | 'company'
          logo?: string
          description?: string
          website?: string
          location?: string
          student_count?: number
          is_active?: boolean
          order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: 'college' | 'university' | 'company'
          logo?: string
          description?: string
          website?: string
          location?: string
          student_count?: number
          is_active?: boolean
          order?: number
          created_at?: string
          updated_at?: string
        }
      }
      news_updates: {
        Row: {
          id: string
          title: string
          subtitle?: string
          content: string
          category: 'Announcement' | 'Event Update' | 'Important Notice' | 'General News'
          image?: string
          video_link?: string
          publish_date: string
          author_name: string
          author_email: string
          status: 'draft' | 'published'
          attachments: string[]
          created_at: string
          updated_at: string
          views: number
          featured: boolean
        }
        Insert: {
          id?: string
          title: string
          subtitle?: string
          content: string
          category: 'Announcement' | 'Event Update' | 'Important Notice' | 'General News'
          image?: string
          video_link?: string
          publish_date?: string
          author_name: string
          author_email: string
          status?: 'draft' | 'published'
          attachments?: string[]
          created_at?: string
          updated_at?: string
          views?: number
          featured?: boolean
        }
        Update: {
          id?: string
          title?: string
          subtitle?: string
          content?: string
          category?: 'Announcement' | 'Event Update' | 'Important Notice' | 'General News'
          image?: string
          video_link?: string
          publish_date?: string
          author_name?: string
          author_email?: string
          status?: 'draft' | 'published'
          attachments?: string[]
          created_at?: string
          updated_at?: string
          views?: number
          featured?: boolean
        }
      }
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

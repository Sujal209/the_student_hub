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
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          college_email: string | null
          college_domain: string | null
          user_role: 'student' | 'admin'
          bio: string | null
          year_of_study: number | null
          major: string | null
          is_verified: boolean
          is_active: boolean
          last_login_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          college_email?: string | null
          college_domain?: string | null
          user_role?: 'student' | 'admin'
          bio?: string | null
          year_of_study?: number | null
          major?: string | null
          is_verified?: boolean
          is_active?: boolean
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          college_email?: string | null
          college_domain?: string | null
          user_role?: 'student' | 'admin'
          bio?: string | null
          year_of_study?: number | null
          major?: string | null
          is_verified?: boolean
          is_active?: boolean
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      subjects: {
        Row: {
          id: string
          name: string
          code: string | null
          description: string | null
          college_domain: string
          color: string
          is_active: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          code?: string | null
          description?: string | null
          college_domain: string
          color?: string
          is_active?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          code?: string | null
          description?: string | null
          college_domain?: string
          color?: string
          is_active?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      notes: {
        Row: {
          id: string
          title: string
          description: string | null
          subject_id: string | null
          uploader_id: string
          file_name: string
          file_path: string
          file_size: number
          file_type: 'pdf' | 'docx' | 'pptx' | 'jpg' | 'jpeg' | 'png' | 'gif'
          mime_type: string
          semester: string | null
          year_of_study: number | null
          tags: string[] | null
          visibility: 'public' | 'private' | 'college_only'
          college_domain: string
          download_count: number
          is_verified: boolean
          is_flagged: boolean
          flag_reason: string | null
          flagged_by: string | null
          flagged_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          subject_id?: string | null
          uploader_id: string
          file_name: string
          file_path: string
          file_size: number
          file_type: 'pdf' | 'docx' | 'pptx' | 'jpg' | 'jpeg' | 'png' | 'gif'
          mime_type: string
          semester?: string | null
          year_of_study?: number | null
          tags?: string[] | null
          visibility?: 'public' | 'private' | 'college_only'
          college_domain: string
          download_count?: number
          is_verified?: boolean
          is_flagged?: boolean
          flag_reason?: string | null
          flagged_by?: string | null
          flagged_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          subject_id?: string | null
          uploader_id?: string
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: 'pdf' | 'docx' | 'pptx' | 'jpg' | 'jpeg' | 'png' | 'gif'
          mime_type?: string
          semester?: string | null
          year_of_study?: number | null
          tags?: string[] | null
          visibility?: 'public' | 'private' | 'college_only'
          college_domain?: string
          download_count?: number
          is_verified?: boolean
          is_flagged?: boolean
          flag_reason?: string | null
          flagged_by?: string | null
          flagged_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      note_downloads: {
        Row: {
          id: string
          note_id: string
          user_id: string | null
          ip_address: string | null
          user_agent: string | null
          downloaded_at: string
        }
        Insert: {
          id?: string
          note_id: string
          user_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          downloaded_at?: string
        }
        Update: {
          id?: string
          note_id?: string
          user_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          downloaded_at?: string
        }
      }
      note_ratings: {
        Row: {
          id: string
          note_id: string
          user_id: string
          rating: number
          review: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          note_id: string
          user_id: string
          rating: number
          review?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          note_id?: string
          user_id?: string
          rating?: number
          review?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      note_comments: {
        Row: {
          id: string
          note_id: string
          user_id: string
          content: string
          parent_id: string | null
          is_deleted: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          note_id: string
          user_id: string
          content: string
          parent_id?: string | null
          is_deleted?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          note_id?: string
          user_id?: string
          content?: string
          parent_id?: string | null
          is_deleted?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      reports: {
        Row: {
          id: string
          note_id: string | null
          reported_by: string
          reason: string
          description: string | null
          status: string
          reviewed_by: string | null
          reviewed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          note_id?: string | null
          reported_by: string
          reason: string
          description?: string | null
          status?: string
          reviewed_by?: string | null
          reviewed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          note_id?: string | null
          reported_by?: string
          reason?: string
          description?: string | null
          status?: string
          reviewed_by?: string | null
          reviewed_at?: string | null
          created_at?: string
        }
      }
      college_configs: {
        Row: {
          id: string
          domain: string
          name: string
          logo_url: string | null
          primary_color: string
          secondary_color: string
          description: string | null
          contact_email: string | null
          is_active: boolean
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          domain: string
          name: string
          logo_url?: string | null
          primary_color?: string
          secondary_color?: string
          description?: string | null
          contact_email?: string | null
          is_active?: boolean
          settings?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          domain?: string
          name?: string
          logo_url?: string | null
          primary_color?: string
          secondary_color?: string
          description?: string | null
          contact_email?: string | null
          is_active?: boolean
          settings?: Json
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      note_stats: {
        Row: {
          college_domain: string | null
          total_notes: number | null
          public_notes: number | null
          unique_uploaders: number | null
          total_downloads: number | null
          avg_file_size: number | null
        }
      }
      user_stats: {
        Row: {
          id: string | null
          full_name: string | null
          college_domain: string | null
          notes_uploaded: number | null
          total_downloads_received: number | null
          notes_downloaded: number | null
          ratings_given: number | null
          avg_rating_received: number | null
        }
      }
    }
    Functions: {
      get_popular_tags: {
        Args: {
          college_domain_param?: string | null
          limit_count?: number
        }
        Returns: {
          tag: string
          count: number
        }[]
      }
      get_subjects_by_college: {
        Args: {
          college_domain_param: string
        }
        Returns: {
          id: string
          name: string
          code: string
          description: string
          color: string
          note_count: number
        }[]
      }
      search_notes: {
        Args: {
          search_query: string
          college_domain_param: string
          subject_id_param?: string | null
          tags_param?: string[] | null
          semester_param?: string | null
          year_param?: number | null
          limit_count?: number
          offset_count?: number
        }
        Returns: {
          id: string
          title: string
          description: string
          file_name: string
          file_type: string
          file_size: number
          tags: string[]
          semester: string
          year_of_study: number
          download_count: number
          uploader_name: string
          subject_name: string
          subject_color: string
          created_at: string
          relevance: number
        }[]
      }
    }
    Enums: {
      user_role: 'student' | 'admin'
      note_visibility: 'public' | 'private' | 'college_only'
      file_type: 'pdf' | 'docx' | 'pptx' | 'jpg' | 'jpeg' | 'png' | 'gif'
    }
  }
}
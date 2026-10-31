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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      assignment_submissions: {
        Row: {
          assignment_id: string
          created_at: string
          feedback: string | null
          graded_by: string | null
          id: string
          score: number | null
          student_id: string
          updated_at: string
          work: string
        }
        Insert: {
          assignment_id: string
          created_at?: string
          feedback?: string | null
          graded_by?: string | null
          id?: string
          score?: number | null
          student_id: string
          updated_at?: string
          work: string
        }
        Update: {
          assignment_id?: string
          created_at?: string
          feedback?: string | null
          graded_by?: string | null
          id?: string
          score?: number | null
          student_id?: string
          updated_at?: string
          work?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignment_submissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "class_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignment_submissions_graded_by_fkey"
            columns: ["graded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignment_submissions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bridge_bookmarks: {
        Row: {
          created_at: string
          subject_id: number
          user_id: string
        }
        Insert: {
          created_at?: string
          subject_id: number
          user_id: string
        }
        Update: {
          created_at?: string
          subject_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bridge_bookmarks_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bridge_bookmarks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bridge_certificates: {
        Row: {
          id: string
          issued_at: string
          learner_name: string
          subject_id: number
          subject_name: string
          user_id: string
        }
        Insert: {
          id?: string
          issued_at?: string
          learner_name: string
          subject_id: number
          subject_name: string
          user_id: string
        }
        Update: {
          id?: string
          issued_at?: string
          learner_name?: string
          subject_id?: number
          subject_name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bridge_certificates_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bridge_certificates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bridge_ratings: {
        Row: {
          rating: number
          subject_id: number
          user_id: string
        }
        Insert: {
          rating: number
          subject_id: number
          user_id: string
        }
        Update: {
          rating?: number
          subject_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bridge_ratings_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bridge_ratings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bridge_study_messages: {
        Row: {
          created_at: string
          id: string
          message: Json
          message_id: string
          thread_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: Json
          message_id: string
          thread_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: Json
          message_id?: string
          thread_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bridge_study_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "bridge_study_threads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bridge_study_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bridge_study_threads: {
        Row: {
          created_at: string
          id: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bridge_study_threads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      class_assignments: {
        Row: {
          class_id: string
          created_at: string
          created_by: string
          due_at: string | null
          id: string
          instructions: string
          max_score: number
          title: string
          updated_at: string
        }
        Insert: {
          class_id: string
          created_at?: string
          created_by: string
          due_at?: string | null
          id?: string
          instructions: string
          max_score?: number
          title: string
          updated_at?: string
        }
        Update: {
          class_id?: string
          created_at?: string
          created_by?: string
          due_at?: string | null
          id?: string
          instructions?: string
          max_score?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_assignments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_assignments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      class_content: {
        Row: {
          body: string | null
          class_id: string
          created_at: string
          created_by: string
          file_path: string | null
          id: string
          kind: string
          link_url: string | null
          questions: Json | null
          title: string
        }
        Insert: {
          body?: string | null
          class_id: string
          created_at?: string
          created_by?: string
          file_path?: string | null
          id?: string
          kind: string
          link_url?: string | null
          questions?: Json | null
          title: string
        }
        Update: {
          body?: string | null
          class_id?: string
          created_at?: string
          created_by?: string
          file_path?: string | null
          id?: string
          kind?: string
          link_url?: string | null
          questions?: Json | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_content_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      class_invites: {
        Row: {
          class_id: string
          code_hash: string
          created_at: string
          created_by: string
          expires_at: string
          id: string
          max_uses: number
          revoked_at: string | null
          use_count: number
        }
        Insert: {
          class_id: string
          code_hash: string
          created_at?: string
          created_by: string
          expires_at: string
          id?: string
          max_uses?: number
          revoked_at?: string | null
          use_count?: number
        }
        Update: {
          class_id?: string
          code_hash?: string
          created_at?: string
          created_by?: string
          expires_at?: string
          id?: string
          max_uses?: number
          revoked_at?: string | null
          use_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "class_invites_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_invites_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      class_lesson_completions: {
        Row: {
          content_id: string
          created_at: string
          student_id: string
        }
        Insert: {
          content_id: string
          created_at?: string
          student_id: string
        }
        Update: {
          content_id?: string
          created_at?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_lesson_completions_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "class_content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_lesson_completions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      class_memberships: {
        Row: {
          class_id: string
          created_at: string
          id: string
          status: string
          student_id: string
        }
        Insert: {
          class_id: string
          created_at?: string
          id?: string
          status?: string
          student_id: string
        }
        Update: {
          class_id?: string
          created_at?: string
          id?: string
          status?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_memberships_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_memberships_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      class_message_reads: {
        Row: {
          message_id: string
          user_id: string
        }
        Insert: {
          message_id: string
          user_id: string
        }
        Update: {
          message_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_message_reads_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "class_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_message_reads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      class_messages: {
        Row: {
          body: string
          class_id: string
          created_at: string
          id: string
          read_at: string | null
          recipient_id: string | null
          sender_id: string
        }
        Insert: {
          body: string
          class_id: string
          created_at?: string
          id?: string
          read_at?: string | null
          recipient_id?: string | null
          sender_id?: string
        }
        Update: {
          body?: string
          class_id?: string
          created_at?: string
          id?: string
          read_at?: string | null
          recipient_id?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_messages_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      class_quiz_attempts: {
        Row: {
          answers: Json
          content_id: string
          id: string
          score: number
          student_id: string
          submitted_at: string
          total_questions: number
        }
        Insert: {
          answers: Json
          content_id: string
          id?: string
          score: number
          student_id: string
          submitted_at?: string
          total_questions: number
        }
        Update: {
          answers?: Json
          content_id?: string
          id?: string
          score?: number
          student_id?: string
          submitted_at?: string
          total_questions?: number
        }
        Relationships: [
          {
            foreignKeyName: "class_quiz_attempts_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "class_content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_quiz_attempts_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      class_quiz_keys: {
        Row: {
          answers: Json
          content_id: string
        }
        Insert: {
          answers: Json
          content_id: string
        }
        Update: {
          answers?: Json
          content_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_quiz_keys_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: true
            referencedRelation: "class_content"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          academic_year: number | null
          created_at: string
          created_by: string
          education_level: string | null
          grade_level: string | null
          id: string
          name: string
          school_id: string | null
          status: string
          subject_id: number | null
          updated_at: string
        }
        Insert: {
          academic_year?: number | null
          created_at?: string
          created_by: string
          education_level?: string | null
          grade_level?: string | null
          id?: string
          name: string
          school_id?: string | null
          status?: string
          subject_id?: number | null
          updated_at?: string
        }
        Update: {
          academic_year?: number | null
          created_at?: string
          created_by?: string
          education_level?: string | null
          grade_level?: string | null
          id?: string
          name?: string
          school_id?: string | null
          status?: string
          subject_id?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "classes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classes_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classes_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      course_enrollments: {
        Row: {
          created_at: string
          id: string
          subject_id: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          subject_id: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          subject_id?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_enrollments_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_enrollments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_attempts: {
        Row: {
          answers: Json
          id: string
          score: number
          subject_id: number | null
          submitted_at: string
          total_questions: number
          user_id: string
        }
        Insert: {
          answers?: Json
          id?: string
          score: number
          subject_id?: number | null
          submitted_at?: string
          total_questions: number
          user_id: string
        }
        Update: {
          answers?: Json
          id?: string
          score?: number
          subject_id?: number | null
          submitted_at?: string
          total_questions?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_attempts_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_papers: {
        Row: {
          created_at: string
          exam_year: number
          examination: string
          file_path: string
          id: number
          is_published: boolean
          subject_id: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          exam_year: number
          examination?: string
          file_path: string
          id?: number
          is_published?: boolean
          subject_id: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          exam_year?: number
          examination?: string
          file_path?: string
          id?: number
          is_published?: boolean
          subject_id?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_papers_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_question_answers: {
        Row: {
          correct_option: string
          created_at: string
          created_by: string | null
          question_id: string
        }
        Insert: {
          correct_option: string
          created_at?: string
          created_by?: string | null
          question_id: string
        }
        Update: {
          correct_option?: string
          created_at?: string
          created_by?: string | null
          question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_question_answers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_question_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: true
            referencedRelation: "exam_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_questions: {
        Row: {
          created_at: string
          created_by: string | null
          exam_type: string
          explanation: string | null
          id: string
          is_published: boolean
          options: Json
          prompt: string
          subject_id: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          exam_type?: string
          explanation?: string | null
          id?: string
          is_published?: boolean
          options?: Json
          prompt: string
          subject_id: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          exam_type?: string
          explanation?: string | null
          id?: string
          is_published?: boolean
          options?: Json
          prompt?: string
          subject_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_questions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_questions_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_settings: {
        Row: {
          created_at: string
          enabled: boolean
          key: string
          label: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          key: string
          label: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          key?: string
          label?: string
          updated_at?: string
        }
        Relationships: []
      }
      lesson_completions: {
        Row: {
          created_at: string
          id: string
          lesson_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          lesson_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          lesson_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_completions_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_completions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          education_level: string
          grade_level: string | null
          id: string
          is_published: boolean
          subject_id: number
          summary: string | null
          title: string
          updated_at: string
        }
        Insert: {
          content?: string
          created_at?: string
          created_by?: string | null
          education_level?: string
          grade_level?: string | null
          id?: string
          is_published?: boolean
          subject_id: number
          summary?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          education_level?: string
          grade_level?: string | null
          id?: string
          is_published?: boolean
          subject_id?: number
          summary?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lessons_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lessons_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      premium_payment_transactions: {
        Row: {
          amount_minor: number | null
          created_at: string
          currency: string | null
          id: string
          status: string | null
          user_id: string | null
        }
        Insert: {
          amount_minor?: number | null
          created_at?: string
          currency?: string | null
          id?: string
          status?: string | null
          user_id?: string | null
        }
        Update: {
          amount_minor?: number | null
          created_at?: string
          currency?: string | null
          id?: string
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "premium_payment_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          county: string | null
          created_at: string
          education_level: string | null
          full_name: string | null
          grade_level: string | null
          id: string
          learner_path: string | null
          onboarding_completed: boolean | null
          role: string | null
          school_name: string | null
          target_exam_year: number | null
          updated_at: string
        }
        Insert: {
          county?: string | null
          created_at?: string
          education_level?: string | null
          full_name?: string | null
          grade_level?: string | null
          id: string
          learner_path?: string | null
          onboarding_completed?: boolean | null
          role?: string | null
          school_name?: string | null
          target_exam_year?: number | null
          updated_at?: string
        }
        Update: {
          county?: string | null
          created_at?: string
          education_level?: string | null
          full_name?: string | null
          grade_level?: string | null
          id?: string
          learner_path?: string | null
          onboarding_completed?: boolean | null
          role?: string | null
          school_name?: string | null
          target_exam_year?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      scholarships: {
        Row: {
          application_url: string
          created_at: string
          deadline: string
          description: string | null
          id: number
          is_published: boolean
          organization: string | null
          title: string
          updated_at: string
        }
        Insert: {
          application_url: string
          created_at?: string
          deadline: string
          description?: string | null
          id?: number
          is_published?: boolean
          organization?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          application_url?: string
          created_at?: string
          deadline?: string
          description?: string | null
          id?: number
          is_published?: boolean
          organization?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      school_invoices: {
        Row: {
          amount_minor: number | null
          created_at: string
          currency: string | null
          id: string
          invoice_number: string | null
          school_id: string | null
          status: string | null
        }
        Insert: {
          amount_minor?: number | null
          created_at?: string
          currency?: string | null
          id?: string
          invoice_number?: string | null
          school_id?: string | null
          status?: string | null
        }
        Update: {
          amount_minor?: number | null
          created_at?: string
          currency?: string | null
          id?: string
          invoice_number?: string | null
          school_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "school_invoices_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      school_payment_transactions: {
        Row: {
          amount_minor: number | null
          created_at: string
          currency: string | null
          id: string
          invoice_id: string | null
          status: string | null
        }
        Insert: {
          amount_minor?: number | null
          created_at?: string
          currency?: string | null
          id?: string
          invoice_id?: string | null
          status?: string | null
        }
        Update: {
          amount_minor?: number | null
          created_at?: string
          currency?: string | null
          id?: string
          invoice_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "school_payment_transactions_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "school_invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      schools: {
        Row: {
          county: string | null
          created_at: string
          created_by: string
          id: string
          name: string
          school_type: string
          status: string
          updated_at: string
        }
        Insert: {
          county?: string | null
          created_at?: string
          created_by: string
          id?: string
          name: string
          school_type?: string
          status?: string
          updated_at?: string
        }
        Update: {
          county?: string | null
          created_at?: string
          created_by?: string
          id?: string
          name?: string
          school_type?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "schools_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          created_at: string
          description: string | null
          id: number
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          amount_minor: number | null
          created_at: string
          currency: string | null
          description: string | null
          id: string
          name: string
          status: string | null
        }
        Insert: {
          amount_minor?: number | null
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          name: string
          status?: string | null
        }
        Update: {
          amount_minor?: number | null
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          name?: string
          status?: string | null
        }
        Relationships: []
      }
      teacher_class_assignments: {
        Row: {
          assigned_by: string
          class_id: string
          created_at: string
          id: string
          teacher_id: string
        }
        Insert: {
          assigned_by: string
          class_id: string
          created_at?: string
          id?: string
          teacher_id: string
        }
        Update: {
          assigned_by?: string
          class_id?: string
          created_at?: string
          id?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_class_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_class_assignments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_class_assignments_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      bridge_course_metrics: {
        Args: never
        Returns: {
          lesson_count: number
          rating_average: number
          rating_count: number
          student_count: number
          subject_id: number
        }[]
      }
      bridge_issue_certificate: { Args: { p_subject: number }; Returns: string }
      bridge_my_certificates: {
        Args: never
        Returns: {
          id: string
          issued_at: string
          learner_name: string
          subject_id: number
          subject_name: string
          user_id: string
        }[]
        SetofOptions: {
          from: "*"
          to: "bridge_certificates"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      bridge_practice_feedback: {
        Args: { p_option: string; p_question: string }
        Returns: Json
      }
      create_class_invite: {
        Args: { p_class_id: string; p_days?: number; p_max_uses?: number }
        Returns: string
      }
      delete_exam_question: { Args: { p_id: string }; Returns: undefined }
      has_role: { Args: { _role: string; _user_id: string }; Returns: boolean }
      is_class_member: { Args: { _class_id: string }; Returns: boolean }
      is_class_teacher: { Args: { _class_id: string }; Returns: boolean }
      redeem_class_invite: { Args: { p_code: string }; Returns: string }
      save_exam_question: {
        Args: { p_correct_option: string; p_id?: string; p_question: Json }
        Returns: string
      }
      set_user_role: {
        Args: { p_role: string; p_user_id: string }
        Returns: undefined
      }
      submit_class_quiz: {
        Args: { p_answers: Json; p_content: string }
        Returns: Json
      }
      submit_exam_attempt: { Args: { p_answers: Json }; Returns: Json }
      try_uuid: { Args: { t: string }; Returns: string }
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string | null;
          name: string | null;
          avatar_url: string | null;
          growth_tier: string;
          household_id: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          name?: string | null;
          avatar_url?: string | null;
          growth_tier?: string;
          household_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          name?: string | null;
          avatar_url?: string | null;
          growth_tier?: string;
          household_id?: string | null;
          created_at?: string;
        };
      };
      households: {
        Row: {
          id: string;
          name: string;
          owner_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name?: string;
          owner_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          owner_id?: string;
          created_at?: string;
        };
      };
      household_members: {
        Row: {
          household_id: string;
          user_id: string;
          role: string;
          joined_at: string;
        };
        Insert: {
          household_id: string;
          user_id: string;
          role?: string;
          joined_at?: string;
        };
        Update: {
          household_id?: string;
          user_id?: string;
          role?: string;
          joined_at?: string;
        };
      };
      activities: {
        Row: {
          id: string;
          user_id: string;
          category: string;
          subcategory: string | null;
          amount: number;
          unit: string;
          co2_kg: number;
          source: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category: string;
          subcategory?: string | null;
          amount: number;
          unit: string;
          co2_kg: number;
          source?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category?: string;
          subcategory?: string | null;
          amount?: number;
          unit?: string;
          co2_kg?: number;
          source?: string | null;
          created_at?: string;
        };
      };
      emission_factors: {
        Row: {
          id: string;
          category: string;
          subcategory: string;
          unit: string;
          kg_co2_per_unit: number;
        };
        Insert: {
          id?: string;
          category: string;
          subcategory: string;
          unit: string;
          kg_co2_per_unit: number;
        };
        Update: {
          id?: string;
          category?: string;
          subcategory?: string;
          unit?: string;
          kg_co2_per_unit?: number;
        };
      };
      assessment_responses: {
        Row: {
          id: string;
          user_id: string;
          module: string;
          question_key: string;
          answer_value: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          module: string;
          question_key: string;
          answer_value: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          module?: string;
          question_key?: string;
          answer_value?: string;
          created_at?: string;
        };
      };
      footprint_baselines: {
        Row: {
          id: string;
          user_id: string;
          baseline_co2_kg: number;
          calculated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          baseline_co2_kg: number;
          calculated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          baseline_co2_kg?: number;
          calculated_at?: string;
        };
      };
      goals: {
        Row: {
          id: string;
          user_id: string;
          target_pct: number;
          duration_days: number;
          started_at: string;
          ends_at: string;
          baseline_co2_kg: number;
          status: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          target_pct: number;
          duration_days: number;
          started_at?: string;
          ends_at?: string;
          baseline_co2_kg?: number;
          status?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          target_pct?: number;
          duration_days?: number;
          started_at?: string;
          ends_at?: string;
          baseline_co2_kg?: number;
          status?: string;
        };
      };
      daily_missions: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          category: string;
          action_text: string;
          xp_reward: number;
          completed: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          category: string;
          action_text: string;
          xp_reward?: number;
          completed?: boolean;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          category?: string;
          action_text?: string;
          xp_reward?: number;
          completed?: boolean;
        };
      };
      weekly_reviews: {
        Row: {
          id: string;
          user_id: string;
          week_start: string;
          summary_text: string;
          key_metric: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          week_start: string;
          summary_text: string;
          key_metric: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          week_start?: string;
          summary_text?: string;
          key_metric?: string;
          created_at?: string;
        };
      };
      sol_messages: {
        Row: {
          id: string;
          user_id: string;
          role: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: string;
          content?: string;
          created_at?: string;
        };
      };
      challenges: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          criteria: Json;
          featured: boolean;
          glow_eligible: boolean;
          starts_at: string;
          ends_at: string;
          xp_reward: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          criteria?: Json;
          featured?: boolean;
          glow_eligible?: boolean;
          starts_at: string;
          ends_at: string;
          xp_reward?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          criteria?: Json;
          featured?: boolean;
          glow_eligible?: boolean;
          starts_at?: string;
          ends_at?: string;
          xp_reward?: number;
          created_at?: string;
        };
      };
      challenge_participants: {
        Row: {
          id: string;
          user_id: string;
          challenge_id: string;
          progress: number;
          completed_at: string | null;
          joined_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          challenge_id: string;
          progress?: number;
          completed_at?: string | null;
          joined_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          challenge_id?: string;
          progress?: number;
          completed_at?: string | null;
          joined_at?: string;
        };
      };
      xp_transactions: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          source: string;
          ref_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          source: string;
          ref_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount?: number;
          source?: string;
          ref_id?: string | null;
          created_at?: string;
        };
      };
      badges: {
        Row: {
          id: string;
          key: string;
          title: string;
          criteria: Json;
        };
        Insert: {
          id?: string;
          key: string;
          title: string;
          criteria?: Json;
        };
        Update: {
          id?: string;
          key?: string;
          title?: string;
          criteria?: Json;
        };
      };
      user_badges: {
        Row: {
          id: string;
          user_id: string;
          badge_id: string;
          earned_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          badge_id: string;
          earned_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          badge_id?: string;
          earned_at?: string;
        };
      };
      rewards: {
        Row: {
          id: string;
          brand: string;
          title: string;
          xp_cost: number;
          active: boolean;
        };
        Insert: {
          id?: string;
          brand: string;
          title: string;
          xp_cost: number;
          active?: boolean;
        };
        Update: {
          id?: string;
          brand?: string;
          title?: string;
          xp_cost?: number;
          active?: boolean;
        };
      };
      redemptions: {
        Row: {
          id: string;
          user_id: string;
          reward_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          reward_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          reward_id?: string;
          created_at?: string;
        };
      };
      pledges: {
        Row: {
          id: string;
          user_id: string;
          amount_xp: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount_xp: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount_xp?: number;
          created_at?: string;
        };
      };
      friends: {
        Row: {
          id: string;
          user_id: string;
          friend_id: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          friend_id: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          friend_id?: string;
          status?: string;
          created_at?: string;
        };
      };
      integrations: {
        Row: {
          id: string;
          user_id: string;
          provider: string;
          connected: boolean;
          oauth_token_enc: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          provider: string;
          connected?: boolean;
          oauth_token_enc?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          provider?: string;
          connected?: boolean;
          oauth_token_enc?: string | null;
          updated_at?: string;
        };
      };
      notification_prefs: {
        Row: {
          user_id: string;
          reminders: boolean;
          insights: boolean;
          challenges: boolean;
          household: boolean;
          weekly_summary: boolean;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          reminders?: boolean;
          insights?: boolean;
          challenges?: boolean;
          household?: boolean;
          weekly_summary?: boolean;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          reminders?: boolean;
          insights?: boolean;
          challenges?: boolean;
          household?: boolean;
          weekly_summary?: boolean;
          updated_at?: string;
        };
      };
      invites: {
        Row: {
          id: string;
          household_id: string;
          email: string;
          token: string;
          status: string;
          created_at: string;
          expires_at: string;
        };
        Insert: {
          id?: string;
          household_id: string;
          email: string;
          token: string;
          status?: string;
          created_at?: string;
          expires_at?: string;
        };
        Update: {
          id?: string;
          household_id?: string;
          email?: string;
          token?: string;
          status?: string;
          created_at?: string;
          expires_at?: string;
        };
      };
    };
    Views: {
      friend_leaderboard_mv: {
        Row: {
          user_id: string;
          name: string | null;
          avatar_url: string | null;
          current_co2_kg: number;
          prev_co2_kg: number;
          improvement_pct: number;
          computed_at: string;
        };
      };
    };
    Functions: {
      calculate_baseline_footprint: {
        Args: { p_user_id: string };
        Returns: number;
      };
      log_activity: {
        Args: {
          p_user_id: string;
          p_category: string;
          p_subcategory: string;
          p_amount: number;
          p_unit: string;
        };
        Returns: Database['public']['Tables']['activities']['Row'];
      };
      complete_daily_mission: {
        Args: { p_user_id: string; p_date: string };
        Returns: void;
      };
      get_current_streak: {
        Args: { p_user_id: string };
        Returns: number;
      };
      get_category_breakdown: {
        Args: { p_user_id: string; p_month?: string };
        Returns: {
          category: string;
          co2_kg: number;
          share_pct: number;
        }[];
      };
      get_monthly_trend: {
        Args: { p_user_id: string; p_months_back?: number };
        Returns: {
          month: string;
          co2_kg: number;
        }[];
      };
      set_goal: {
        Args: { p_user_id: string; p_target_pct: number; p_duration_days: number };
        Returns: Database['public']['Tables']['goals']['Row'];
      };
      get_top_improving_categories: {
        Args: { p_user_id: string; p_limit?: number };
        Returns: {
          category: string;
          improvement_pct: number;
        }[];
      };
      get_profile_stats: {
        Args: { p_user_id: string };
        Returns: {
          co2_saved_kg: number;
          current_streak: number;
          lifetime_xp: number;
        }[];
      };
      redeem_reward: {
        Args: { p_user_id: string; p_reward_id: string };
        Returns: Json;
      };
      complete_challenge: {
        Args: { p_user_id: string; p_challenge_id: string };
        Returns: void;
      };
    };
  };
}

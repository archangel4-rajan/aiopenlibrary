export interface DbPrompt {
  id: string;
  slug: string;
  title: string;
  description: string;
  category_id: string;
  category_name: string;
  category_slug: string;
  prompt: string;
  tags: string[];
  recommended_model: string;
  model_icon: string;
  use_cases: string[];
  example_output: string | null;
  output_screenshots: string[] | null;
  references: { title: string; url: string }[];
  variables: { name: string; description: string }[];
  tips: string[] | null;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  saves_count: number;
  likes_count: number;
  dislikes_count: number;
  is_published: boolean;
  is_premium: boolean;
  premium_preview_length: number | null;
  created_by: string | null;
  zap_price: number | null;
  created_at: string;
  updated_at: string;
}

export interface DbCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  created_at: string;
}

/** A user's vote on a prompt (like or dislike). */
export interface DbPromptVote {
  id: string;
  user_id: string;
  prompt_id: string;
  vote_type: "like" | "dislike";
  created_at: string;
}

export interface DbProfile {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  username: string | null;
  bio: string | null;
  role: "user" | "admin" | "creator";
  created_at: string;
  updated_at: string;
}

export interface DbComment {
  id: string;
  prompt_id: string;
  user_id: string;
  content: string;
  parent_id: string | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface CommentWithAuthor extends DbComment {
  author: {
    display_name: string | null;
    avatar_url: string | null;
    username: string | null;
  };
  replies?: CommentWithAuthor[];
}

export interface ZapBalance {
  user_id: string;
  balance: number;
  total_earned: number;
  total_spent: number;
  updated_at: string;
}

export interface ZapTransaction {
  id: string;
  user_id: string;
  type: "purchase" | "spend" | "earn" | "refund";
  amount: number;
  description: string;
  reference_type: string | null;
  reference_id: string | null;
  created_at: string;
}

export interface ZapPackage {
  id: string;
  name: string;
  zap_amount: number;
  price_cents: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface PromptPack {
  id: string;
  creator_id: string;
  name: string;
  description: string;
  slug: string;
  cover_image_url: string | null;
  zap_price: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface PromptPackItem {
  id: string;
  pack_id: string;
  prompt_id: string;
  sort_order: number;
}

export interface UserPurchase {
  id: string;
  user_id: string;
  prompt_id: string | null;
  pack_id: string | null;
  zap_amount: number;
  transaction_id: string | null;
  created_at: string;
}

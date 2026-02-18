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
  is_published: boolean;
  created_by: string | null;
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

export interface DbProfile {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  role: "user" | "admin";
  created_at: string;
  updated_at: string;
}

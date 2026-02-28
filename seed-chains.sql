-- Seed 2 example prompt chains using existing prompts
-- Run this in Supabase SQL Editor after the chains feature is deployed

-- Chain 1: "Research & Write a Blog Post" using prompts from Writing/Research categories
DO $$
DECLARE
  v_chain_id uuid;
  v_prompt1 uuid;
  v_prompt2 uuid;
  v_prompt3 uuid;
  v_creator uuid;
BEGIN
  -- Get 3 published prompts (preferring research/writing/content categories)
  SELECT id INTO v_prompt1 FROM prompts WHERE is_published = true ORDER BY category_name ASC, saves_count DESC LIMIT 1;
  SELECT id INTO v_prompt2 FROM prompts WHERE is_published = true AND id != v_prompt1 ORDER BY category_name ASC, saves_count DESC LIMIT 1 OFFSET 1;
  SELECT id INTO v_prompt3 FROM prompts WHERE is_published = true AND id != v_prompt1 AND id != v_prompt2 ORDER BY category_name ASC, saves_count DESC LIMIT 1 OFFSET 2;

  -- Use the first admin as creator, fallback to first creator
  SELECT id INTO v_creator FROM profiles WHERE role IN ('admin', 'creator') LIMIT 1;

  IF v_prompt1 IS NOT NULL AND v_prompt2 IS NOT NULL AND v_prompt3 IS NOT NULL AND v_creator IS NOT NULL THEN
    INSERT INTO prompt_chains (slug, title, description, tags, difficulty, estimated_minutes, use_cases, is_published, created_by)
    VALUES (
      'research-and-write-blog-post',
      'Research & Write a Blog Post',
      'A 3-step workflow that takes you from topic research to a polished blog post. Start with deep research, outline your key points, then generate a full draft.',
      ARRAY['writing', 'research', 'content', 'blog'],
      'Intermediate',
      30,
      ARRAY['Content marketing', 'Personal blogging', 'Thought leadership', 'SEO content'],
      true,
      v_creator
    ) RETURNING id INTO v_chain_id;

    INSERT INTO prompt_chain_steps (chain_id, prompt_id, step_number, title_override, input_instructions, context_note, estimated_minutes) VALUES
    (v_chain_id, v_prompt1, 1, 'Deep Research', NULL, 'Start here — this prompt will help you gather comprehensive background information on your topic.', 10),
    (v_chain_id, v_prompt2, 2, 'Outline & Structure', 'Take the research output from Step 1 and use it as context. Focus on extracting the key themes and arguments.', 'By now you should have a solid research base. This step turns raw information into a structured outline.', 10),
    (v_chain_id, v_prompt3, 3, 'Write the Draft', 'Paste your outline from Step 2 as the starting structure. Reference specific research findings from Step 1.', 'Almost there — this final step transforms your outline into a full, polished blog post.', 10);

    RAISE NOTICE 'Chain 1 created: %', v_chain_id;
  END IF;
END $$;

-- Chain 2: "Build a Product Launch Plan" using different prompts
DO $$
DECLARE
  v_chain_id uuid;
  v_prompt1 uuid;
  v_prompt2 uuid;
  v_prompt3 uuid;
  v_prompt4 uuid;
  v_creator uuid;
BEGIN
  -- Get 4 different published prompts
  SELECT id INTO v_prompt1 FROM prompts WHERE is_published = true ORDER BY saves_count DESC LIMIT 1 OFFSET 3;
  SELECT id INTO v_prompt2 FROM prompts WHERE is_published = true ORDER BY saves_count DESC LIMIT 1 OFFSET 4;
  SELECT id INTO v_prompt3 FROM prompts WHERE is_published = true ORDER BY saves_count DESC LIMIT 1 OFFSET 5;
  SELECT id INTO v_prompt4 FROM prompts WHERE is_published = true ORDER BY saves_count DESC LIMIT 1 OFFSET 6;

  SELECT id INTO v_creator FROM profiles WHERE role IN ('admin', 'creator') LIMIT 1;

  IF v_prompt1 IS NOT NULL AND v_prompt2 IS NOT NULL AND v_prompt3 IS NOT NULL AND v_prompt4 IS NOT NULL AND v_creator IS NOT NULL THEN
    INSERT INTO prompt_chains (slug, title, description, tags, difficulty, estimated_minutes, use_cases, is_published, created_by)
    VALUES (
      'product-launch-plan',
      'Build a Product Launch Plan',
      'A 4-step chain that walks you through creating a complete product launch strategy — from market analysis to launch day checklist.',
      ARRAY['marketing', 'product', 'strategy', 'business'],
      'Advanced',
      45,
      ARRAY['Startup launches', 'Feature releases', 'Product marketing', 'Go-to-market strategy'],
      true,
      v_creator
    ) RETURNING id INTO v_chain_id;

    INSERT INTO prompt_chain_steps (chain_id, prompt_id, step_number, title_override, input_instructions, context_note, estimated_minutes) VALUES
    (v_chain_id, v_prompt1, 1, 'Market Analysis', NULL, 'Start by understanding your market landscape. This prompt will help you analyze competitors and identify opportunities.', 15),
    (v_chain_id, v_prompt2, 2, 'Target Audience Definition', 'Use the market analysis from Step 1 to inform your audience segmentation. Reference specific competitors and gaps you identified.', 'With the market mapped out, now zero in on exactly who you are building for.', 10),
    (v_chain_id, v_prompt3, 3, 'Messaging & Positioning', 'Combine insights from Steps 1 and 2. Your positioning should address the market gaps for your specific audience.', 'You know the market and the audience — now craft the story that connects them to your product.', 10),
    (v_chain_id, v_prompt4, 4, 'Launch Day Checklist', 'Reference your positioning from Step 3 and audience from Step 2 to create a tactical launch plan.', 'Final step — turn strategy into action with a concrete, day-by-day launch checklist.', 10);

    RAISE NOTICE 'Chain 2 created: %', v_chain_id;
  END IF;
END $$;

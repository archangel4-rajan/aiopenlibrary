-- Full-text search optimization for prompts table.
-- Replaces 6-column ilike scans with a single GIN-indexed tsvector.

-- 1. Add generated tsvector column combining searchable fields
ALTER TABLE public.prompts
  ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(category_name, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(prompt, '')), 'D') ||
    setweight(to_tsvector('english', coalesce(array_to_string(tags, ' '), '')), 'B')
  ) STORED;

-- 2. GIN index for fast full-text queries
CREATE INDEX IF NOT EXISTS idx_prompts_search_vector
  ON public.prompts USING gin(search_vector);

-- 3. Trigram extension for fuzzy/partial matching fallback
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 4. Trigram index on title for "did you mean?" style partial matches
CREATE INDEX IF NOT EXISTS idx_prompts_title_trgm
  ON public.prompts USING gin(title gin_trgm_ops);

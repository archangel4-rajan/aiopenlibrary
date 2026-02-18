/**
 * Seed script for AIOpenLibrary
 *
 * Run with: npx tsx scripts/seed.ts
 *
 * Requires .env.local to be set with:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from "@supabase/supabase-js";
import { categories, prompts } from "../src/data/prompts";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  console.error("Make sure .env.local is set up correctly.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seed() {
  console.log("🌱 Starting seed...\n");

  // 1. Clear existing data (in order to avoid conflicts)
  console.log("🗑️  Clearing existing data...");
  await supabase.from("saved_prompts").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("prompts").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("categories").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  // 2. Insert categories
  console.log("📂 Inserting categories...");
  const categoryInserts = categories.map((c) => ({
    name: c.name,
    slug: c.slug,
    icon: c.icon,
    description: c.description,
  }));

  const { data: insertedCategories, error: catError } = await supabase
    .from("categories")
    .insert(categoryInserts)
    .select();

  if (catError) {
    console.error("Error inserting categories:", catError);
    process.exit(1);
  }

  console.log(`  ✅ Inserted ${insertedCategories.length} categories`);

  // Build slug -> id map
  const catMap = new Map<string, string>();
  for (const cat of insertedCategories) {
    catMap.set(cat.slug, cat.id);
  }

  // 3. Insert prompts
  console.log("📝 Inserting prompts...");
  let successCount = 0;

  for (const p of prompts) {
    const categoryId = catMap.get(p.categorySlug);
    if (!categoryId) {
      console.error(`  ❌ Category not found for slug: ${p.categorySlug}`);
      continue;
    }

    const { error } = await supabase.from("prompts").insert({
      slug: p.slug,
      title: p.title,
      description: p.description,
      category_id: categoryId,
      category_name: p.category,
      category_slug: p.categorySlug,
      prompt: p.prompt,
      tags: p.tags,
      recommended_model: p.recommendedModel,
      model_icon: p.modelIcon,
      use_cases: p.useCases,
      example_output: p.exampleOutput ?? null,
      output_screenshots: p.outputScreenshots ?? null,
      references: p.references ?? [],
      variables: p.variables ?? [],
      tips: p.tips ?? null,
      difficulty: p.difficulty,
      saves_count: p.saves,
      is_published: true,
      created_at: new Date(p.createdAt).toISOString(),
    });

    if (error) {
      console.error(`  ❌ Error inserting "${p.title}":`, error.message);
    } else {
      successCount++;
    }
  }

  console.log(`  ✅ Inserted ${successCount}/${prompts.length} prompts`);
  console.log("\n🎉 Seed complete!");
}

seed().catch(console.error);

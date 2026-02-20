import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const SUPABASE_URL = 'https://zrordxixzhczgxdhcmku.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('Set SUPABASE_SERVICE_ROLE_KEY env var');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const data = JSON.parse(readFileSync('prompts-100.json', 'utf8'));

// Extract variables from prompt text like [VARIABLE_NAME]
function extractVariables(promptText) {
  const matches = [...new Set(promptText.match(/\[([A-Z][A-Z0-9_/|]+)\]/g) || [])];
  return matches.map(m => {
    const name = m.slice(1, -1);
    const label = name.replace(/_/g, ' ').replace(/\//g, ' / ')
      .split(' ').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
    return { name, label, placeholder: `Enter ${label.toLowerCase()}...` };
  });
}

// Map difficulty to title case
function normalizeDifficulty(d) {
  if (!d) return 'Intermediate';
  return d.charAt(0).toUpperCase() + d.slice(1).toLowerCase();
}

async function seed() {
  console.log('=== Fetching existing categories ===');
  const { data: existingCats } = await supabase.from('categories').select('*');
  const catMap = {};
  for (const c of existingCats || []) {
    catMap[c.slug] = c;
  }
  console.log(`Found ${Object.keys(catMap).length} existing categories`);

  // Create new categories
  console.log('\n=== Creating new categories ===');
  for (const cat of data.new_categories) {
    if (catMap[cat.slug]) {
      console.log(`  ⏭️  ${cat.name} (${cat.slug}) — already exists`);
      continue;
    }
    const { data: created, error } = await supabase.from('categories').insert({
      name: cat.name,
      slug: cat.slug,
      icon: cat.emoji,
      description: cat.description
    }).select().single();

    if (error) {
      console.error(`  ❌ ${cat.name}: ${error.message}`);
    } else {
      catMap[cat.slug] = created;
      console.log(`  ✅ ${cat.name} (${cat.slug})`);
    }
  }

  // Check for existing prompt slugs to avoid duplicates
  const { data: existingPrompts } = await supabase.from('prompts').select('slug');
  const existingSlugs = new Set((existingPrompts || []).map(p => p.slug));
  console.log(`\nFound ${existingSlugs.size} existing prompts`);

  // Insert prompts
  console.log('\n=== Inserting prompts ===');
  let inserted = 0, skipped = 0, failed = 0;

  for (const prompt of data.prompts) {
    if (existingSlugs.has(prompt.slug)) {
      console.log(`  ⏭️  ${prompt.slug} — already exists`);
      skipped++;
      continue;
    }

    const category = catMap[prompt.category_slug];
    if (!category) {
      console.error(`  ❌ ${prompt.slug} — category '${prompt.category_slug}' not found`);
      failed++;
      continue;
    }

    const variables = extractVariables(prompt.prompt_text);
    const references = prompt.source ? [{ label: 'Source', url: prompt.source }] : [];

    const row = {
      slug: prompt.slug,
      title: prompt.name,
      description: prompt.description,
      category_id: category.id,
      category_name: category.name,
      category_slug: category.slug,
      prompt: prompt.prompt_text,
      tags: prompt.tags || [],
      recommended_model: prompt.recommended_model || '',
      model_icon: '',
      use_cases: [],
      variables: variables,
      references: references,
      tips: prompt.why_it_works ? [prompt.why_it_works] : [],
      difficulty: normalizeDifficulty(prompt.difficulty),
      is_published: true,
    };

    const { error } = await supabase.from('prompts').insert(row);
    if (error) {
      console.error(`  ❌ ${prompt.slug}: ${error.message}`);
      failed++;
    } else {
      console.log(`  ✅ ${prompt.name}`);
      inserted++;
    }
  }

  console.log(`\n=== Done ===`);
  console.log(`Inserted: ${inserted}`);
  console.log(`Skipped (existing): ${skipped}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total prompts in DB: ${existingSlugs.size + inserted}`);
}

seed().catch(console.error);

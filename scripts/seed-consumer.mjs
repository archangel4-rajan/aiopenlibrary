import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
const SUPABASE_URL = 'https://zrordxixzhczgxdhcmku.supabase.co';
const supabase = createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const data = JSON.parse(readFileSync('prompts-consumer-batch.json', 'utf8'));

function extractVariables(text) {
  const matches = [...new Set(text.match(/\[([A-Z][A-Z0-9_/|]+)\]/g) || [])];
  return matches.map(m => {
    const name = m.slice(1, -1);
    const label = name.replace(/_/g, ' ').split(' ').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
    return { name, label, placeholder: `Enter ${label.toLowerCase()}...` };
  });
}

async function seed() {
  const { data: existingCats } = await supabase.from('categories').select('*');
  const catMap = {};
  for (const c of existingCats || []) catMap[c.slug] = c;
  
  console.log('=== New Categories ===');
  for (const cat of data.new_categories) {
    if (catMap[cat.slug]) { console.log(`  ⏭️  ${cat.slug}`); continue; }
    const { data: created, error } = await supabase.from('categories').insert({
      name: cat.name, slug: cat.slug, icon: cat.emoji, description: cat.description
    }).select().single();
    if (error) console.error(`  ❌ ${cat.name}: ${error.message}`);
    else { catMap[cat.slug] = created; console.log(`  ✅ ${cat.name}`); }
  }

  const { data: existing } = await supabase.from('prompts').select('slug');
  const existingSlugs = new Set((existing || []).map(p => p.slug));
  
  console.log('\n=== Inserting Prompts ===');
  let inserted = 0, skipped = 0, failed = 0;
  for (const prompt of data.prompts) {
    if (existingSlugs.has(prompt.slug)) { skipped++; continue; }
    const category = catMap[prompt.category_slug];
    if (!category) { console.error(`  ❌ ${prompt.slug}: no category`); failed++; continue; }
    const { error } = await supabase.from('prompts').insert({
      slug: prompt.slug, title: prompt.name, description: prompt.description,
      category_id: category.id, category_name: category.name, category_slug: category.slug,
      prompt: prompt.prompt_text, tags: prompt.tags, recommended_model: prompt.recommended_model || '',
      model_icon: '', use_cases: [], variables: extractVariables(prompt.prompt_text),
      references: prompt.source ? [{ label: 'Source', url: prompt.source }] : [],
      tips: prompt.why_it_works ? [prompt.why_it_works] : [],
      difficulty: prompt.difficulty.charAt(0).toUpperCase() + prompt.difficulty.slice(1),
      is_published: true,
    });
    if (error) { console.error(`  ❌ ${prompt.slug}: ${error.message}`); failed++; }
    else { console.log(`  ✅ ${prompt.name}`); inserted++; }
  }
  console.log(`\nInserted: ${inserted}, Skipped: ${skipped}, Failed: ${failed}`);
  const { data: final } = await supabase.from('prompts').select('id');
  console.log(`Total prompts in DB: ${(final||[]).length}`);
}
seed().catch(console.error);

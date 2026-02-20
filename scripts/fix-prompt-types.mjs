import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://zrordxixzhczgxdhcmku.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Override misclassified prompts back to text
const FORCE_TEXT = [
  'prd-generator', 'data-analysis-pipeline', 'dashboard-kpi-designer',
  'financial-model-builder', 'investor-update', 'user-story-writer',
  'startup-pitch-deck', 'business-model-canvas', 'worldbuilder',
  'user-persona-generator', 'design-system-creator',
];

// These are genuinely image generation prompts
const FORCE_IMAGE = [
  // Only prompts that would actually generate an image via AI
];

// These are genuinely video prompts
const FORCE_VIDEO = [
  'video-script-writer', 'video-storyboard-generator', 
  'youtube-video-script-writer', 'short-form-video-hook-creator',
  'storyboard-generator', 'video-hook-generator',
];

async function main() {
  for (const slug of FORCE_TEXT) {
    const { data: prompt } = await supabase
      .from('prompts')
      .select('id, tags')
      .eq('slug', slug)
      .single();
    
    if (!prompt) continue;
    
    const tags = (prompt.tags || []).filter(t => !t.startsWith('type:'));
    tags.push('type:text');
    
    await supabase.from('prompts').update({ tags }).eq('id', prompt.id);
    console.log(`📝 ${slug} → text (corrected)`);
  }

  // Also fix ux-design-critique — it's a review prompt, not image gen
  const fixMore = ['ux-design-critique'];
  for (const slug of fixMore) {
    const { data: prompt } = await supabase
      .from('prompts')
      .select('id, tags')
      .eq('slug', slug)
      .single();
    
    if (!prompt) continue;
    
    const tags = (prompt.tags || []).filter(t => !t.startsWith('type:'));
    tags.push('type:text');
    
    await supabase.from('prompts').update({ tags }).eq('id', prompt.id);
    console.log(`📝 ${slug} → text (corrected)`);
  }

  console.log('\nDone — all corrections applied.');
}

main().catch(console.error);

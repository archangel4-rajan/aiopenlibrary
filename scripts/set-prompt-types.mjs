import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://zrordxixzhczgxdhcmku.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Classification rules
const IMAGE_SLUGS = [
  'ux-design-critique', 'design-system-creator', 'user-persona-generator',
  'storyboard-generator',
];

const VIDEO_SLUGS = [
  'video-script-writer', 'video-hook-generator', 'storyboard-generator',
];

const IMAGE_TAGS = ['image', 'art', 'visual', 'illustration', 'design-system', 'UI', 'midjourney', 'dall-e', 'stable-diffusion'];
const VIDEO_TAGS = ['video', 'filmmaking', 'storyboard', 'video-production', 'TikTok', 'YouTube'];

function classifyPrompt(slug, tags, categorySlug) {
  // Explicit slug matches
  if (VIDEO_SLUGS.includes(slug)) return 'video';
  if (IMAGE_SLUGS.includes(slug)) return 'image';
  
  // Category-based
  if (categorySlug === 'video-creation') return 'video';
  
  // Tag-based
  const lowerTags = (tags || []).map(t => t.toLowerCase());
  if (lowerTags.some(t => VIDEO_TAGS.some(v => t.includes(v.toLowerCase())))) return 'video';
  if (lowerTags.some(t => IMAGE_TAGS.some(v => t.includes(v.toLowerCase())))) return 'image';
  
  // Default to text
  return 'text';
}

async function main() {
  const { data: prompts, error } = await supabase
    .from('prompts')
    .select('id, slug, tags, category_slug')
    .order('created_at');
  
  if (error) { console.error(error); return; }
  
  let counts = { text: 0, image: 0, video: 0 };
  
  for (const p of prompts) {
    const type = classifyPrompt(p.slug, p.tags, p.category_slug);
    counts[type]++;
    
    // Add type tag if not already present
    const typeTag = `type:${type}`;
    const currentTags = p.tags || [];
    
    // Remove any existing type: tags
    const cleanedTags = currentTags.filter(t => !t.startsWith('type:'));
    cleanedTags.push(typeTag);
    
    const { error: updateError } = await supabase
      .from('prompts')
      .update({ tags: cleanedTags })
      .eq('id', p.id);
    
    if (updateError) {
      console.error(`❌ ${p.slug}: ${updateError.message}`);
    } else {
      console.log(`${type === 'text' ? '📝' : type === 'image' ? '🎨' : '🎬'} ${p.slug} → ${type}`);
    }
  }
  
  console.log(`\n=== Summary ===`);
  console.log(`Text: ${counts.text}`);
  console.log(`Image: ${counts.image}`);
  console.log(`Video: ${counts.video}`);
  console.log(`Total: ${prompts.length}`);
}

main().catch(console.error);

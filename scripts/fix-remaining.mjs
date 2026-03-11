import { createClient } from '@supabase/supabase-js';
const SUPABASE_URL = 'https://zrordxixzhczgxdhcmku.supabase.co';
const supabase = createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const refMap = {
  'email-copywriter': [{ label: 'Really Good Emails', url: 'https://reallygoodemails.com/' }],
  'storytelling-framework': [{ label: "StoryBrand Framework", url: 'https://storybrand.com/' }],
  'product-launch-campaign': [{ label: 'Product Hunt Launch Guide', url: 'https://www.producthunt.com/launch' }],
  'landing-page-copywriter': [{ label: 'Unbounce Best Practices', url: 'https://unbounce.com/landing-page-articles/landing-page-best-practices/' }],
  'lesson-plan-creator': [{ label: 'Understanding by Design', url: 'https://cft.vanderbilt.edu/guides-sub-pages/understanding-by-design/' }],
  'concept-explainer': [{ label: "Bloom's Taxonomy", url: 'https://cft.vanderbilt.edu/guides-sub-pages/blooms-taxonomy/' }],
  'user-interview-script': [{ label: "Steve Krug's Interview Tips", url: 'https://sensible.com/rocket-surgery-made-easy/' }],
  'viral-twitter-thread': [{ label: 'Twitter/X Content Best Practices', url: 'https://business.twitter.com/en/blog.html' }],
  'research-analyst-skill': [{ label: 'Research Methods Guide', url: 'https://libguides.usc.edu/writingguide' }],
  'data-analysis-pipeline': [{ label: 'Pandas Documentation', url: 'https://pandas.pydata.org/docs/' }],
  'video-storyboard-generator': [{ label: 'Storyboard Template Guide', url: 'https://boords.com/how-to-storyboard' }],
  'garry-tan-open-claw-system-prompt': [{ label: 'Garry Tan on AI', url: 'https://twitter.com/garrytan' }],
  'ml-model-selector': [{ label: 'Scikit-learn Algorithm Cheat Sheet', url: 'https://scikit-learn.org/stable/tutorial/machine_learning_map/' }],
  'competitive-analysis': [{ label: "Porter's Five Forces", url: 'https://hbr.org/1979/03/how-competitive-forces-shape-strategy' }],
  'seo-content-strategy': [{ label: 'Ahrefs SEO Strategy Guide', url: 'https://ahrefs.com/blog/seo-strategy/' }],
  'api-endpoint-generator': [{ label: 'REST API Design', url: 'https://restfulapi.net/' }],
  'openclaw-agent-orchestration': [{ label: 'OpenClaw Documentation', url: 'https://docs.openclaw.ai' }],
  'openclaw-skill-builder': [{ label: 'OpenClaw Skills', url: 'https://docs.openclaw.ai' }],
  'openclaw-security-hardening': [{ label: 'OpenClaw Security', url: 'https://docs.openclaw.ai' }],
};

async function fix() {
  for (const [slug, refs] of Object.entries(refMap)) {
    const { data: prompt } = await supabase.from('prompts').select('id, references').eq('slug', slug).single();
    if (prompt && (!prompt.references || prompt.references.length === 0)) {
      const { error } = await supabase.from('prompts').update({ references: refs }).eq('id', prompt.id);
      console.log(error ? `  ❌ ${slug}: ${error.message}` : `  ✅ ${slug}`);
    } else if (!prompt) {
      console.log(`  ⏭️  ${slug}: not found`);
    } else {
      console.log(`  ⏭️  ${slug}: already has refs`);
    }
  }
  // Verify
  const { data: all } = await supabase.from('prompts').select('slug, references');
  const missing = (all||[]).filter(p => !p.references || p.references.length === 0);
  console.log(`\nRemaining without references: ${missing.length}`);
  if (missing.length) missing.forEach(p => console.log(`  - ${p.slug}`));
}
fix().catch(console.error);

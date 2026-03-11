import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://zrordxixzhczgxdhcmku.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function fix() {
  // 1. Fix celebrity-shared prompts missing type tags
  console.log('=== Fix 1: Add type:text tags to celebrity-shared prompts ===');
  const { data: celebPrompts } = await supabase
    .from('prompts')
    .select('id, slug, tags')
    .eq('category_slug', 'celebrity-shared');
  
  for (const p of celebPrompts || []) {
    const hasTypeTag = (p.tags || []).some(t => t.startsWith('type:'));
    if (!hasTypeTag) {
      const newTags = [...(p.tags || []), 'type:text'];
      const { error } = await supabase.from('prompts').update({ tags: newTags }).eq('id', p.id);
      console.log(error ? `  ❌ ${p.slug}: ${error.message}` : `  ✅ ${p.slug}: added type:text`);
    }
  }

  // 2. Backfill references on prompts missing them
  console.log('\n=== Fix 2: Backfill references on older prompts ===');
  const refMap = {
    'dashboard-kpi-designer': [{ label: 'KPI Best Practices', url: 'https://www.klipfolio.com/blog/kpi-examples' }],
    'data-analysis-pipeline-builder': [{ label: 'Pandas Documentation', url: 'https://pandas.pydata.org/docs/' }],
    'ml-model-selection-advisor': [{ label: 'Scikit-learn Algorithm Cheat Sheet', url: 'https://scikit-learn.org/stable/tutorial/machine_learning_map/' }],
    'sql-query-optimizer': [{ label: 'Use The Index Luke', url: 'https://use-the-index-luke.com/' }],
    'responsive-layout-generator': [{ label: 'CSS Tricks Responsive Guide', url: 'https://css-tricks.com/snippets/css/a-guide-to-flexbox/' }],
    'ux-audit-framework': [{ label: 'Nielsen Norman Group', url: 'https://www.nngroup.com/articles/ten-usability-heuristics/' }],
    'interactive-lesson-plan-creator': [{ label: 'Understanding by Design', url: 'https://cft.vanderbilt.edu/guides-sub-pages/understanding-by-design/' }],
    'multi-level-concept-explainer': [{ label: "Bloom's Taxonomy", url: 'https://cft.vanderbilt.edu/guides-sub-pages/blooms-taxonomy/' }],
    'ad-creative-generator': [{ label: 'Facebook Ad Library', url: 'https://www.facebook.com/ads/library/' }],
    'high-converting-landing-page-copy': [{ label: 'Unbounce Landing Page Best Practices', url: 'https://unbounce.com/landing-page-articles/landing-page-best-practices/' }],
    'product-launch-campaign-planner': [{ label: 'Product Hunt Launch Guide', url: 'https://www.producthunt.com/launch' }],
    'seo-content-strategy-builder': [{ label: 'Ahrefs SEO Guide', url: 'https://ahrefs.com/blog/seo-strategy/' }],
    'goal-decomposition-framework': [{ label: 'SMART Goals Framework', url: 'https://www.mindtools.com/a4wo118/smart-goals' }],
    'strategic-project-planner': [{ label: 'PMI Project Planning', url: 'https://www.pmi.org/learning/library/project-planning-basics-6457' }],
    'weekly-sprint-planner': [{ label: 'Scrum Guide', url: 'https://scrumguides.org/scrum-guide.html' }],
    'user-interview-script-generator': [{ label: "Steve Krug's Interview Tips", url: 'https://sensible.com/rocket-surgery-made-easy/' }],
    'competitive-analysis-framework': [{ label: "Porter's Five Forces", url: 'https://hbr.org/1979/03/how-competitive-forces-shape-strategy' }],
    'competitive-landscape-analyzer': [{ label: 'Competitive Intelligence Guide', url: 'https://www.crayon.co/blog/competitive-intelligence' }],
    'comprehensive-topic-deep-dive': [{ label: 'Research Methods Guide', url: 'https://libguides.usc.edu/writingguide/researchdesigns' }],
    'literature-review-assistant': [{ label: 'Cochrane Review Methods', url: 'https://training.cochrane.org/handbook' }],
    'test-case-generator': [{ label: 'ISTQB Testing Standards', url: 'https://www.istqb.org/' }],
    'debug-detective': [{ label: 'Debugging Best Practices', url: 'https://blog.regehr.org/archives/199' }],
    'git-commit-message-pro': [{ label: 'Conventional Commits', url: 'https://www.conventionalcommits.org/' }],
    'rest-api-endpoint-generator': [{ label: 'REST API Design Best Practices', url: 'https://restfulapi.net/' }],
    'system-architecture-designer': [{ label: 'System Design Primer', url: 'https://github.com/donnemartin/system-design-primer' }],
    'ai-video-storyboard-generator': [{ label: 'Storyboard Template Guide', url: 'https://boords.com/how-to-storyboard' }],
    'short-form-video-hook-creator': [{ label: 'TikTok Creator Portal', url: 'https://www.tiktok.com/creators/creator-portal/' }],
    'youtube-video-script-writer': [{ label: 'YouTube Creator Academy', url: 'https://creatoracademy.youtube.com/' }],
    'blog-post-architect': [{ label: 'HubSpot Blog Writing Guide', url: 'https://blog.hubspot.com/marketing/how-to-start-a-blog' }],
    'high-converting-email-copywriter': [{ label: 'Really Good Emails', url: 'https://reallygoodemails.com/' }],
    'story-driven-content-framework': [{ label: "StoryBrand Framework", url: 'https://storybrand.com/' }],
    'technical-documentation-writer': [{ label: 'Write the Docs', url: 'https://www.writethedocs.org/guide/' }],
    'viral-twitter-thread-creator': [{ label: 'Twitter/X Best Practices', url: 'https://business.twitter.com/en/blog.html' }],
    'research-analyst': [{ label: 'Research Methodology Guide', url: 'https://libguides.usc.edu/writingguide' }],
  };

  for (const [slug, refs] of Object.entries(refMap)) {
    const { data: prompt } = await supabase
      .from('prompts')
      .select('id, references')
      .eq('slug', slug)
      .single();
    
    if (prompt && (!prompt.references || prompt.references.length === 0)) {
      const { error } = await supabase.from('prompts').update({ references: refs }).eq('id', prompt.id);
      console.log(error ? `  ❌ ${slug}: ${error.message}` : `  ✅ ${slug}: added reference`);
    } else if (!prompt) {
      console.log(`  ⏭️  ${slug}: not found`);
    } else {
      console.log(`  ⏭️  ${slug}: already has references`);
    }
  }

  // 3. Verify final state
  console.log('\n=== Verification ===');
  const { data: allPrompts } = await supabase
    .from('prompts')
    .select('slug, tags, references, tips');
  
  const missingType = (allPrompts || []).filter(p => !(p.tags || []).some(t => t.startsWith('type:')));
  const missingRefs = (allPrompts || []).filter(p => !p.references || p.references.length === 0);
  const missingTips = (allPrompts || []).filter(p => !p.tips || p.tips.length === 0);
  
  console.log(`Total prompts: ${(allPrompts || []).length}`);
  console.log(`Missing type tags: ${missingType.length}`);
  console.log(`Missing references: ${missingRefs.length}`);
  console.log(`Missing tips: ${missingTips.length}`);
  
  if (missingRefs.length > 0) {
    console.log('\nStill missing references:');
    for (const p of missingRefs) {
      console.log(`  - ${p.slug}`);
    }
  }
}

fix().catch(console.error);

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://zrordxixzhczgxdhcmku.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('Set SUPABASE_SERVICE_ROLE_KEY env var');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Map of slug → proper reference URLs
const REFERENCES = {
  'strategic-business-advisor': [
    { label: 'McKinsey Problem Solving Framework', url: 'https://www.mckinsey.com/capabilities/strategy-and-corporate-finance/our-insights' }
  ],
  'socratic-tutor': [
    { label: 'Khan Academy AI Tutor (Khanmigo)', url: 'https://www.khanacademy.org/khan-labs' },
    { label: 'Socratic Method in Education', url: 'https://en.wikipedia.org/wiki/Socratic_method' }
  ],
  'chain-of-thought-solver': [
    { label: 'Chain-of-Thought Prompting (Google Research)', url: 'https://arxiv.org/abs/2201.11903' }
  ],
  'ceo-briefing': [
    { label: 'Minto Pyramid Principle', url: 'https://www.amazon.com/Minto-Pyramid-Principle-Writing-Thinking/dp/0273710516' }
  ],
  'prd-generator': [
    { label: 'How to Write a PRD (Lenny\'s Newsletter)', url: 'https://www.lennysnewsletter.com/p/how-to-write-a-great-prd' },
    { label: 'Y Combinator Startup School', url: 'https://www.startupschool.org/' }
  ],
  'senior-code-reviewer': [
    { label: 'Awesome ChatGPT Prompts (143k★)', url: 'https://github.com/f/awesome-chatgpt-prompts' },
    { label: 'Google Code Review Guidelines', url: 'https://google.github.io/eng-practices/review/' }
  ],
  'system-design-architect': [
    { label: 'System Design Primer (GitHub)', url: 'https://github.com/donnemartin/system-design-primer' },
    { label: 'Designing Data-Intensive Applications', url: 'https://dataintensive.net/' }
  ],
  'senior-debugger': [
    { label: 'Debugging: The 9 Indispensable Rules', url: 'https://debuggingrules.com/' }
  ],
  'api-documentation-writer': [
    { label: 'Stripe API Docs (Gold Standard)', url: 'https://stripe.com/docs/api' },
    { label: 'Write the Docs Community', url: 'https://www.writethedocs.org/' }
  ],
  'git-commit-message-crafter': [
    { label: 'Conventional Commits Specification', url: 'https://www.conventionalcommits.org/' }
  ],
  'regex-generator': [
    { label: 'Regex101 — Test & Debug', url: 'https://regex101.com/' }
  ],
  'master-copywriter': [
    { label: 'Ogilvy on Advertising', url: 'https://www.amazon.com/Ogilvy-Advertising-David/dp/039472903X' },
    { label: 'Copyblogger', url: 'https://copyblogger.com/' }
  ],
  'seo-blog-architect': [
    { label: 'Ahrefs SEO Blog', url: 'https://ahrefs.com/blog/' },
    { label: 'Google Search Central', url: 'https://developers.google.com/search' }
  ],
  'social-media-calendar': [
    { label: 'Buffer Social Media Calendar Guide', url: 'https://buffer.com/library/social-media-calendar/' }
  ],
  'email-sequence-builder': [
    { label: 'ConvertKit Email Sequence Guide', url: 'https://convertkit.com/email-sequence' }
  ],
  'eli5-to-expert': [
    { label: 'Feynman Technique', url: 'https://fs.blog/feynman-technique/' }
  ],
  'devils-advocate': [
    { label: 'One Useful Thing (Ethan Mollick)', url: 'https://www.oneusefulthing.org/' },
    { label: 'Pre-Mortem Technique (Gary Klein)', url: 'https://hbr.org/2007/09/performing-a-project-premortem' }
  ],
  'decision-matrix': [
    { label: 'Bezos Regret Minimization Framework', url: 'https://sahilbloom.com/newsletter/the-regret-minimization-framework' },
    { label: 'Farnam Street Decision Making', url: 'https://fs.blog/smart-decisions/' }
  ],
  'weekly-planning': [
    { label: 'Eisenhower Matrix', url: 'https://www.eisenhower.me/eisenhower-matrix/' },
    { label: 'Cal Newport — Deep Work', url: 'https://calnewport.com/deep-work-rules-for-focused-success-in-a-distracted-world/' }
  ],
  'okr-creator': [
    { label: 'Measure What Matters (John Doerr)', url: 'https://www.whatmatters.com/' },
    { label: 'Google OKR Guide', url: 'https://rework.withgoogle.com/guides/set-goals-with-okrs/' }
  ],
  'data-analysis-consultant': [
    { label: 'McKinsey Insights', url: 'https://www.mckinsey.com/capabilities/quantumblack/our-insights' }
  ],
  'sql-query-generator': [
    { label: 'PostgreSQL Documentation', url: 'https://www.postgresql.org/docs/' },
    { label: 'Use The Index, Luke', url: 'https://use-the-index-luke.com/' }
  ],
  'python-data-pipeline': [
    { label: 'Pandas Documentation', url: 'https://pandas.pydata.org/docs/' },
    { label: 'Data Engineering Zoomcamp', url: 'https://github.com/DataTalksClub/data-engineering-zoomcamp' }
  ],
  'hypothesis-tester': [
    { label: 'Statistical Tests Cheat Sheet', url: 'https://www.scribbr.com/statistics/statistical-tests/' }
  ],
  'ux-design-critique': [
    { label: 'Nielsen Norman Group — 10 Usability Heuristics', url: 'https://www.nngroup.com/articles/ten-usability-heuristics/' },
    { label: 'WCAG Accessibility Guidelines', url: 'https://www.w3.org/WAI/standards-guidelines/wcag/' }
  ],
  'design-system-creator': [
    { label: 'Design Systems Handbook', url: 'https://www.designbetter.co/design-systems-handbook' }
  ],
  'user-persona-generator': [
    { label: 'Alan Cooper — About Face', url: 'https://www.amazon.com/About-Face-Essentials-Interaction-Design/dp/1118766571' }
  ],
  'market-research-analyst': [
    { label: 'Sequoia Capital — Writing a Business Plan', url: 'https://www.sequoiacap.com/article/writing-a-business-plan/' }
  ],
  'literature-review': [
    { label: 'Google Scholar', url: 'https://scholar.google.com/' },
    { label: 'How to Write a Literature Review', url: 'https://writingcenter.unc.edu/tips-and-tools/literature-reviews/' }
  ],
  'deep-dive-investigator': [
    { label: 'Farnam Street — Mental Models', url: 'https://fs.blog/mental-models/' }
  ],
  'research-paper-summarizer': [
    { label: 'Semantic Scholar', url: 'https://www.semanticscholar.org/' }
  ],
  'video-script-writer': [
    { label: 'YouTube Creator Academy', url: 'https://creatoracademy.youtube.com/' },
    { label: 'ABT Narrative Framework', url: 'https://scienceneedsstory.com/abt-framework/' }
  ],
  'storyboard-generator': [
    { label: 'StudioBinder Storyboard Guide', url: 'https://www.studiobinder.com/blog/storyboard-examples-film/' }
  ],
  'video-hook-generator': [
    { label: 'TikTok Creator Portal', url: 'https://www.tiktok.com/creators/creator-portal/' }
  ],
  'startup-pitch-deck': [
    { label: 'Y Combinator — How to Pitch', url: 'https://www.ycombinator.com/library/6q-how-to-pitch-your-startup' },
    { label: 'Sequoia Pitch Deck Template', url: 'https://www.sequoiacap.com/article/how-to-present-to-investors/' }
  ],
  'business-model-canvas': [
    { label: 'Strategyzer — Business Model Canvas', url: 'https://www.strategyzer.com/library/the-business-model-canvas' },
    { label: 'Lean Canvas', url: 'https://leanstack.com/lean-canvas' }
  ],
  'cold-email-that-gets-replies': [
    { label: 'Alex Berman Cold Email Guide', url: 'https://www.youtube.com/c/AlexBerman' }
  ],
  'sales-objection-handler': [
    { label: 'SPIN Selling (Neil Rackham)', url: 'https://www.amazon.com/SPIN-Selling-Neil-Rackham/dp/0070511136' }
  ],
  'negotiation-strategist': [
    { label: 'Getting to Yes (Harvard Negotiation Project)', url: 'https://www.pon.harvard.edu/daily/negotiation-skills-daily/getting-to-yes/' },
    { label: 'Never Split the Difference (Chris Voss)', url: 'https://www.amazon.com/Never-Split-Difference-Negotiating-Depended/dp/0062407805' }
  ],
  'prompt-optimizer': [
    { label: 'DAIR.AI Prompt Engineering Guide', url: 'https://www.promptingguide.ai/' },
    { label: 'Anthropic Prompt Engineering', url: 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview' }
  ],
  'few-shot-builder': [
    { label: 'Few-Shot Prompting (GPT-3 Paper)', url: 'https://arxiv.org/abs/2005.14165' },
    { label: 'Learn Prompting — Few-Shot', url: 'https://learnprompting.org/docs/basics/few_shot' }
  ],
  'multi-perspective-roundtable': [
    { label: 'Six Thinking Hats (Edward de Bono)', url: 'https://www.amazon.com/Six-Thinking-Hats-Edward-Bono/dp/0316178314' }
  ],
  'resume-optimizer': [
    { label: 'Google XYZ Resume Formula', url: 'https://www.inc.com/bill-murphy-jr/google-recruiters-say-these-5-resume-tips-including-x-y-z-formula-will-improve-your-odds-of-getting-hired-at-google.html' }
  ],
  'interview-prep-coach': [
    { label: 'Awesome ChatGPT Prompts — Interviewer', url: 'https://github.com/f/awesome-chatgpt-prompts#act-as-position-interviewer' },
    { label: 'STAR Method Guide', url: 'https://www.themuse.com/advice/star-interview-method' }
  ],
  'career-transition': [
    { label: 'What Color Is Your Parachute?', url: 'https://www.amazon.com/What-Color-Your-Parachute-2024/dp/1984861204' }
  ],
  'linkedin-profile-rewriter': [
    { label: 'LinkedIn Official Blog', url: 'https://www.linkedin.com/pulse/topics/home/' }
  ],
  'financial-model-builder': [
    { label: 'YC Series A Guide', url: 'https://www.ycombinator.com/library/Fc-a-guide-to-series-a-fundraising' }
  ],
  'budget-optimizer': [
    { label: '50/30/20 Budget Rule (Senator Elizabeth Warren)', url: 'https://www.investopedia.com/ask/answers/022916/what-502030-budget-rule.asp' }
  ],
  'contract-review': [
    { label: 'LegalZoom Contract Guide', url: 'https://www.legalzoom.com/articles/how-to-review-a-contract' }
  ],
  'terms-of-service-generator': [
    { label: 'Termly — Terms of Service Generator', url: 'https://termly.io/products/terms-and-conditions-generator/' }
  ],
  'fitness-plan-generator': [
    { label: 'Awesome ChatGPT Prompts — Personal Trainer', url: 'https://github.com/f/awesome-chatgpt-prompts#act-as-a-personal-trainer' },
    { label: 'NSCA Exercise Science', url: 'https://www.nsca.com/' }
  ],
  'meal-plan-coach': [
    { label: 'Examine.com Nutrition Research', url: 'https://examine.com/' }
  ],
  'therapy-journaling': [
    { label: 'CBT Thought Records', url: 'https://www.psychologytools.com/self-help/thought-records/' },
    { label: '988 Suicide & Crisis Lifeline', url: 'https://988lifeline.org/' }
  ],
  'worldbuilder': [
    { label: 'Brandon Sanderson Worldbuilding Lectures', url: 'https://www.youtube.com/playlist?list=PLSH_xM-KC3Zv-79sVZTTj-YA6IAqh8qeQ' }
  ],
  'character-deep-dive': [
    { label: 'Story (Robert McKee)', url: 'https://www.amazon.com/Story-Substance-Structure-Principles-Screenwriting/dp/0060391685' }
  ],
  'short-story-generator': [
    { label: 'Narrative Structure Guide', url: 'https://www.masterclass.com/articles/what-is-narrative-structure' }
  ],
  'poetry-workshop': [
    { label: 'Poetry Foundation', url: 'https://www.poetryfoundation.org/' }
  ],
  'meeting-agenda': [
    { label: 'Shopify Meeting Cost Calculator', url: 'https://shopify.engineering/meeting-cost-calculator' }
  ],
  'project-kickoff': [
    { label: 'PMI — Project Management Institute', url: 'https://www.pmi.org/' }
  ],
  'technical-blog-writer': [
    { label: 'Hacker News Guidelines', url: 'https://news.ycombinator.com/newsguidelines.html' }
  ],
  'newsletter-writer': [
    { label: 'Newsletter growth benchmarks (Substack)', url: 'https://on.substack.com/p/grow-series-overview' }
  ],
  'twitter-thread-writer': [
    { label: 'Twitter/X Best Practices', url: 'https://business.twitter.com/en/blog.html' }
  ],
  'book-summary-action-plan': [
    { label: 'Blinkist Book Summaries', url: 'https://www.blinkist.com/' }
  ],
  'landing-page-copy': [
    { label: 'Unbounce CRO Research', url: 'https://unbounce.com/conversion-benchmark-report/' }
  ],
  'competitive-intelligence': [
    { label: 'Crayon Competitive Intelligence', url: 'https://www.crayon.co/blog' }
  ],
  'investor-update': [
    { label: 'YC — How to Write Investor Updates', url: 'https://www.ycombinator.com/library/Ee-how-to-write-an-investor-update' }
  ],
  'product-hunt-launch': [
    { label: 'Product Hunt Launch Guide', url: 'https://www.producthunt.com/launch' }
  ],
  'customer-interview-script': [
    { label: 'The Mom Test (Rob Fitzpatrick)', url: 'http://momtestbook.com/' }
  ],
  'feature-prioritization': [
    { label: 'Intercom RICE Framework', url: 'https://www.intercom.com/blog/rice-simple-prioritization-for-product-managers/' }
  ],
  'user-story-writer': [
    { label: 'Atlassian User Story Guide', url: 'https://www.atlassian.com/agile/project-management/user-stories' }
  ],
  'database-schema-designer': [
    { label: 'PostgreSQL Best Practices', url: 'https://wiki.postgresql.org/wiki/Don%27t_Do_This' }
  ],
  'cicd-pipeline-designer': [
    { label: 'GitHub Actions Documentation', url: 'https://docs.github.com/en/actions' }
  ],
  'presentation-outline': [
    { label: 'TED Talks — The Official Guide', url: 'https://www.ted.com/read/ted-talks-the-official-ted-guide-to-public-speaking' }
  ],
  'onboarding-flow-designer': [
    { label: 'Reforge Growth Series', url: 'https://www.reforge.com/blog/growth-series' }
  ],
  'refactoring-advisor': [
    { label: 'Refactoring (Martin Fowler)', url: 'https://refactoring.com/' },
    { label: 'Refactoring Guru', url: 'https://refactoring.guru/' }
  ],
  'email-subject-lines': [
    { label: 'Mailchimp Email Benchmarks', url: 'https://mailchimp.com/resources/email-marketing-benchmarks/' }
  ],
};

async function fix() {
  // Fetch all prompts we inserted
  const { data: prompts, error } = await supabase
    .from('prompts')
    .select('id, slug, prompt, variables, references')
    .order('created_at', { ascending: false })
    .limit(200);
  
  if (error) { console.error(error); return; }
  
  let fixed = 0, varFixed = 0, refFixed = 0;
  
  for (const p of prompts) {
    let updates = {};
    let needsUpdate = false;
    
    // Fix 1: Convert [VARIABLE_NAME] to {{variable_name}} in prompt text
    const bracketVarPattern = /\[([A-Z][A-Z0-9_/|]+)\]/g;
    const matches = [...new Set((p.prompt.match(bracketVarPattern) || []))];
    
    if (matches.length > 0) {
      // Convert prompt text: [VAR_NAME] → {{var_name}}
      let newPrompt = p.prompt;
      const newVariables = [];
      
      for (const match of matches) {
        const varName = match.slice(1, -1);
        const lowerName = varName.toLowerCase();
        const label = varName
          .replace(/_/g, ' ')
          .replace(/\//g, ' / ')
          .split(' ')
          .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(' ');
        
        // Replace all occurrences of [VAR_NAME] with {{var_name}}
        newPrompt = newPrompt.replaceAll(match, `{{${lowerName}}}`);
        
        newVariables.push({
          name: lowerName,
          description: label
        });
      }
      
      updates.prompt = newPrompt;
      updates.variables = newVariables;
      needsUpdate = true;
      varFixed++;
    }
    
    // Fix 2: Add proper references
    const refs = REFERENCES[p.slug];
    if (refs) {
      updates.references = refs;
      needsUpdate = true;
      refFixed++;
    }
    
    if (needsUpdate) {
      const { error: updateError } = await supabase
        .from('prompts')
        .update(updates)
        .eq('id', p.id);
      
      if (updateError) {
        console.error(`❌ ${p.slug}: ${updateError.message}`);
      } else {
        console.log(`✅ ${p.slug}${matches.length > 0 ? ` (${matches.length} vars)` : ''}`);
        fixed++;
      }
    }
  }
  
  console.log(`\n=== Done ===`);
  console.log(`Total prompts checked: ${prompts.length}`);
  console.log(`Variables fixed: ${varFixed}`);
  console.log(`References fixed: ${refFixed}`);
  console.log(`Total updated: ${fixed}`);
}

fix().catch(console.error);

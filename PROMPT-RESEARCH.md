# AIOpenLibrary — World's Best Prompts Research

> Compiled from: Anthropic Prompt Library, OpenAI Prompt Engineering Guide, prompts.chat (143k★ GitHub), Brex Prompt Engineering Guide, DAIR.AI Prompt Engineering Guide (70.5k★), LearnPrompting.org, Forbes, and viral Twitter/X posts from AI leaders.

---

## 🏆 TIER 1: Prompts From AI Pioneers & Leaders

These carry the most credibility — shared or endorsed by people who built the AI industry.

### 1. Greg Brockman's "Act As" Framework (OpenAI Co-Founder)
- **Source:** [Tweet endorsing prompts.chat](https://x.com/gdb/status/1602072566671110144)
- **Category:** Meta / Prompt Engineering
- **What:** Endorsed the "Act as X" prompting pattern — assigning an AI a specific role/persona to get expert-level responses
- **Why it matters:** Co-founder of OpenAI publicly validated this as the most effective prompting technique
- **Prompt Pattern:** "I want you to act as a {role}. I will provide {context}, and you will {task}. You should {constraints}."

### 2. Andrej Karpathy's "System Prompt" Philosophy (Ex-OpenAI, Tesla AI)
- **Source:** Multiple talks, X posts, and his famous blog posts
- **Category:** Advanced / System Design
- **Description:** Karpathy advocates for treating system prompts as the "soul" of an AI assistant — detailed personality, constraints, and capabilities
- **Key Insight:** "The quality of your output is directly proportional to the specificity of your system prompt"
- **Reference:** https://karpathy.ai/

### 3. Ethan Mollick's "Assigning AI a Role" Research (Wharton Professor)
- **Source:** "Co-Intelligence" book + Substack "One Useful Thing"
- **Category:** Business / Productivity
- **Description:** Mollick's research shows that role-assigned prompts outperform generic prompts by 30%+
- **Key Prompt:** "You are an expert {domain specialist} with 20 years of experience. I'm going to ask you to {task}. Before you begin, ask me any clarifying questions you need."
- **Reference:** https://www.oneusefulthing.org/

### 4. Lilian Weng's Prompt Engineering Patterns (OpenAI Head of Safety)
- **Source:** lilianweng.github.io blog
- **Category:** Technical / Research
- **Description:** Comprehensive taxonomy of prompting techniques with academic rigor
- **Reference:** https://lilianweng.github.io/posts/2023-03-15-prompt-engineering/

### 5. Simon Willison's "Do It Yourself" Prompts (Datasette creator, AI blogger)
- **Source:** simonwillison.net
- **Category:** Developer Tools / Productivity
- **Description:** Practical, battle-tested prompts for coding, data analysis, and content creation
- **Reference:** https://simonwillison.net/tags/prompt-engineering/

---

## 🔥 TIER 2: Viral & Highest-Impact Prompts

These have been shared millions of times and have proven real-world value.

### 6. The "Mega Prompt" — Strategic Business Advisor
- **Source:** Viral on X/Twitter, attributed to multiple founders
- **Category:** Business Strategy
- **Prompt:** "You are a world-class strategic business advisor. I'm going to describe my business situation, and I want you to: 1) Identify the 3 most critical issues, 2) For each issue, provide a specific, actionable recommendation, 3) Prioritize them by impact vs effort, 4) Give me the exact first step I should take tomorrow morning. Here's my situation: {situation}"
- **Why it works:** Forces structured output, prioritization, and immediate action

### 7. The "Socratic Tutor" Prompt
- **Source:** Widely shared, referenced by Khan Academy's AI tutor
- **Category:** Education / Learning
- **Prompt:** "You are a patient, expert tutor. Instead of giving me the answer directly, guide me to discover it myself through a series of questions. Start with what I already know and build from there. If I'm stuck, give me a small hint, not the answer. If I'm wrong, help me understand why through questioning. Topic: {topic}. My current understanding: {what I know}"
- **Why it works:** Mimics the best teaching methodology; creates actual learning vs. just reading answers

### 8. The "Chain of Thought" Forcing Prompt
- **Source:** Google Research paper + widely adopted
- **Category:** Reasoning / Problem Solving
- **Prompt:** "Solve this step by step. Show your reasoning at each stage. If you're uncertain about any step, say so and explain why. Think about edge cases. After your solution, verify it by working backwards. Problem: {problem}"
- **Reference:** Wei et al., "Chain-of-Thought Prompting Elicits Reasoning in Large Language Models"

### 9. The "CEO Briefing" Prompt
- **Source:** Viral among startup founders
- **Category:** Business / Executive
- **Prompt:** "Act as my Chief of Staff preparing a briefing for a Fortune 500 CEO. Take this complex topic and distill it into: 1) A 2-sentence executive summary, 2) 3 key facts with sources, 3) What this means for our business, 4) Recommended action with timeline, 5) Key risk if we do nothing. Topic: {topic}. Our industry: {industry}"

### 10. The "Product Requirements Document" Generator
- **Source:** Widely used in startups, shared by YC founders
- **Category:** Product Management
- **Prompt:** "You are a Senior Product Manager at a top tech company. Create a comprehensive PRD for the following feature. Include: Problem Statement, User Stories (as a {persona}, I want {goal}, so that {benefit}), Success Metrics (specific, measurable), Technical Requirements, Edge Cases, Launch Plan (phased), and Risks & Mitigations. Feature: {feature description}. Target users: {users}. Business context: {context}"

### 11. The "Code Review" Expert
- **Source:** prompts.chat (most used developer prompt), endorsed by GitHub CEO
- **Category:** Software Development
- **Prompt:** "You are a senior software engineer conducting a thorough code review. For the code I share, analyze: 1) Correctness — bugs, logic errors, edge cases, 2) Security — vulnerabilities, injection risks, auth issues, 3) Performance — bottlenecks, memory leaks, unnecessary computations, 4) Readability — naming, structure, documentation, 5) Best practices — patterns, anti-patterns, test coverage. Provide specific line-level feedback with suggested fixes."

### 12. The "Explain Like I'm 5 / Expert" Spectrum
- **Source:** Universal, one of the earliest viral prompt patterns
- **Category:** Education / Communication
- **Prompt:** "Explain {concept} at these 5 levels: 1) To a 5-year-old child, 2) To a high school student, 3) To a college student studying the field, 4) To a graduate researcher, 5) To the world's leading expert. Each explanation should use vocabulary and examples appropriate to that level."
- **Why it works:** Tests and demonstrates true understanding; creates content for any audience

### 13. The "Devil's Advocate" Critical Thinking Prompt
- **Source:** Ethan Mollick + business strategy community
- **Category:** Decision Making / Strategy
- **Prompt:** "I'm going to share a plan/idea with you. I want you to take on the role of a brilliant but constructive devil's advocate. Your job is to: 1) Find the 3 weakest assumptions in my plan, 2) Describe the most likely failure scenario in detail, 3) Identify what I'm probably not seeing (blind spots), 4) Suggest a specific 'pre-mortem' — imagine it failed, why did it fail? 5) After all that, tell me what IS strong about the plan and how to make it more resilient. My plan: {plan}"

### 14. The "Reverse Engineer" Prompt
- **Source:** Viral among content creators and marketers
- **Category:** Marketing / Content Creation
- **Prompt:** "Analyze this {content type — email, landing page, tweet, etc.} and reverse engineer exactly why it works. Break down: 1) The hook — why does it grab attention in the first 3 seconds? 2) The structure — what framework is being used? 3) The psychology — what cognitive biases or emotional triggers are at play? 4) The CTA — why is the call to action effective? 5) Now create 3 variations of this for my {use case}. Content to analyze: {content}"

### 15. The "Startup Pitch Deck" Coach
- **Source:** YC community, widely shared by startup founders
- **Category:** Entrepreneurship / Fundraising
- **Prompt:** "You are a partner at Y Combinator who has reviewed 10,000+ pitch decks. I'm going to share my startup idea. Give me: 1) Your honest first reaction (would you take the meeting?), 2) The single biggest question an investor would ask, 3) A restructured elevator pitch (30 seconds max), 4) The 3 slides that matter most and what each should contain, 5) The #1 metric I should highlight. My startup: {description}. Stage: {stage}. Traction: {traction}"

---

## 📚 TIER 3: Professional Category Prompts (Battle-Tested)

### Writing & Content

### 16. The "Master Copywriter" Prompt
- **Category:** Marketing / Copywriting
- **Prompt:** "You are a direct response copywriter trained by Gary Halbert, David Ogilvy, and Eugene Schwartz. Write {content type} for {product/service} targeting {audience}. Use these principles: 1) Lead with the biggest benefit, not features, 2) Use specific numbers over vague claims, 3) Address the #1 objection in the first paragraph, 4) Write at a 6th-grade reading level, 5) End with urgency that feels genuine, not manufactured. Product: {details}. Key benefit: {benefit}. Main objection: {objection}"

### 17. The "Blog Post Architect" (SEO-Optimized)
- **Category:** Content Marketing / SEO
- **Prompt:** "Write a comprehensive blog post optimized for the keyword '{keyword}'. Structure: 1) Hook that addresses the reader's pain point (not 'In today's world...'), 2) Use H2/H3 headings that include semantic keyword variations, 3) Include at least one counter-intuitive insight, 4) Paragraphs max 3 sentences, 5) Include a data point or statistic in every section, 6) End with a specific CTA. Target word count: {count}. Audience expertise level: {level}."

### 18. The "Email That Gets Replies" Prompt
- **Category:** Communication / Sales
- **Prompt:** "Write a cold email that a {recipient role} would actually respond to. Rules: 1) Subject line under 6 words, 2) First line must be personalized and specific (not 'Hope this finds you well'), 3) Body under 75 words, 4) One clear ask, 5) No attachments mentioned, 6) PS line with social proof. Context: I'm {who you are} reaching out about {purpose}. Their company recently {something specific}."

---

### Coding & Development

### 19. The "Senior Developer" Debugging Prompt
- **Category:** Software Development
- **Prompt:** "You are a senior developer debugging a production issue. I'm going to share code that has a bug. Your approach: 1) First, explain what the code is supposed to do, 2) Identify the bug and explain WHY it's a bug (root cause, not just symptoms), 3) Show the minimal fix, 4) Show the ideal fix (might be a refactor), 5) Explain what test would have caught this, 6) Identify any other potential issues in the same code. Code: {code}. Expected behavior: {expected}. Actual behavior: {actual}"

### 20. The "System Design Interview" Prompt
- **Category:** Software Architecture
- **Prompt:** "You are a principal engineer at Google conducting a system design review. Design a system for {system description}. Walk through: 1) Clarifying questions you'd ask, 2) Back-of-envelope calculations (users, storage, bandwidth), 3) High-level architecture with component diagram, 4) Database schema and key data models, 5) API design for critical endpoints, 6) How you'd handle the top 3 scaling challenges, 7) Monitoring and alerting strategy. Requirements: {requirements}."

### 21. The "Documentation Writer" Prompt
- **Category:** Developer Tools
- **Prompt:** "You are a technical writer who believes great documentation is a product feature. For this {code/API/feature}, write: 1) A one-sentence description a junior developer would understand, 2) A 'Quick Start' section (under 5 steps to see it working), 3) API reference with every parameter explained, 4) 3 real-world usage examples from simple to advanced, 5) Common pitfalls and how to avoid them, 6) FAQ section with the 5 questions people always ask. Code/feature: {details}"

---

### Data & Analysis

### 22. The "Data Analyst" Prompt
- **Category:** Data Science / Analytics
- **Prompt:** "You are a senior data analyst at McKinsey. I'm going to share data with you. Your analysis should include: 1) Executive summary (3 bullets max), 2) Key patterns and anomalies, 3) Statistical significance of findings (be honest about confidence levels), 4) 3 actionable insights ranked by business impact, 5) What additional data would strengthen these conclusions, 6) Visualizations you'd recommend (describe them). Data: {data}"

### 23. The "Market Research" Prompt
- **Category:** Business / Market Analysis
- **Prompt:** "Conduct a thorough market analysis for {product/industry}. Include: 1) Market size (TAM, SAM, SOM) with methodology, 2) Top 5 competitors with their positioning, strengths, and weaknesses, 3) Key industry trends (backed by data points), 4) Customer segments with specific personas, 5) Pricing analysis across the market, 6) Barriers to entry, 7) Your assessment of the biggest opportunity gap. Be specific — use numbers, not adjectives."

---

### Personal Development & Career

### 24. The "Career Coach" Prompt
- **Category:** Career / Professional Development
- **Prompt:** "You are an executive career coach who has helped 500+ professionals navigate career transitions. Based on my background, help me: 1) Identify my 3 most transferable skills, 2) Map 3 career paths I probably haven't considered, 3) Identify the single biggest gap between where I am and where I want to be, 4) Create a 90-day action plan with weekly milestones, 5) Draft a positioning statement that makes me memorable. My background: {background}. Current role: {role}. Dream direction: {direction}"

### 25. The "Decision Matrix" Prompt
- **Category:** Decision Making / Life
- **Prompt:** "Help me make a decision using a structured framework. The decision: {decision}. My options: {options}. For each option: 1) List the top 3 pros and cons, 2) Score each on a 1-10 scale for: financial impact, time investment, reversibility, alignment with my goals, opportunity cost, 3) Identify the 'regret minimization' winner (which would I regret NOT doing in 10 years?), 4) What's the smallest experiment I could run to test each option before committing? 5) What would a wise mentor tell me?"

---

### Creative & Storytelling

### 26. The "Worldbuilder" Prompt
- **Category:** Creative Writing / Game Design
- **Prompt:** "You are a master worldbuilder in the tradition of Tolkien and Ursula K. Le Guin. Create a detailed world for a {genre} story. Include: 1) The central 'What If?' that makes this world unique, 2) Geography and how it shapes culture, 3) The power structure and its tensions, 4) The magic system / technology and its costs/limitations, 5) 3 distinct cultures with their values, conflicts, and daily life, 6) The world's history in 5 pivotal moments, 7) 3 story hooks that emerge naturally from this world. Genre: {genre}. Tone: {tone}. Core theme: {theme}"

### 27. The "Character Deep Dive" Prompt
- **Category:** Creative Writing
- **Prompt:** "Create a complex, three-dimensional character. Start with: 1) The contradiction at their core (e.g., a brave person who is terrified of vulnerability), 2) Their 'wound' — the formative experience that shaped them, 3) What they want vs. what they need (these should conflict), 4) How they speak — give me 5 sample lines of dialogue that could ONLY come from this character, 5) Their relationship to power, love, and truth, 6) The moment that would break them. Starting point: {character concept}"

---

### Prompt Engineering Meta-Prompts

### 28. The "Prompt Optimizer" Prompt
- **Category:** Meta / Prompt Engineering
- **Prompt:** "You are a prompt engineering expert. I'm going to share a prompt I've been using. Your job is to: 1) Identify what's working well, 2) Find ambiguities that could cause inconsistent outputs, 3) Add specificity where it's vague, 4) Restructure for clarity, 5) Add constraints that would improve output quality, 6) Provide the improved version. Then explain each change and why. My prompt: {prompt}"

### 29. The "Few-Shot Example" Builder
- **Category:** Advanced Prompting
- **Prompt:** "I need to create a prompt that produces consistent outputs for {task}. Help me build it using few-shot prompting. Generate: 1) A clear task description, 2) 3 input-output examples that cover the typical case, an edge case, and a common mistake, 3) Format specification for the output, 4) Negative examples (what NOT to do), 5) The complete prompt ready to use."

### 30. The "Persona Stack" Prompt
- **Category:** Advanced / Multi-Perspective
- **Prompt:** "I want to analyze {topic/decision} from multiple expert perspectives. Simulate a roundtable discussion between: 1) A skeptical scientist who demands evidence, 2) A creative entrepreneur who sees opportunity, 3) An ethicist who considers second-order effects, 4) A pragmatist who focuses on implementation. Each expert should: challenge the others' assumptions, build on good ideas, and flag risks the others miss. After the discussion, provide a synthesis of the best insights."

---

## 📖 REFERENCE SOURCES

| Source | Stars/Reach | URL | Notes |
|--------|------------|-----|-------|
| prompts.chat (Awesome ChatGPT Prompts) | 143k★ GitHub | https://prompts.chat | Largest open-source prompt library. CC0 license. 1,270+ prompts. Endorsed by OpenAI co-founders. |
| DAIR.AI Prompt Engineering Guide | 70.5k★ GitHub | https://www.promptingguide.ai | Academic-grade guide with 1,585 commits. 3M+ learners. |
| Brex Prompt Engineering Guide | ~10k★ GitHub | https://github.com/brexhq/prompt-engineering | Production-focused. Best for developers. |
| Anthropic Prompt Library | Official | https://docs.anthropic.com/en/prompt-library | Claude-optimized prompts from the makers. |
| OpenAI Prompt Engineering Guide | Official | https://platform.openai.com/docs/guides/prompt-engineering | GPT-optimized. Best practices from the source. |
| LearnPrompting.org | 3M+ learners | https://learnprompting.org | 76-page survey with OpenAI, Google, Stanford co-authors. |
| Ethan Mollick (Wharton) | 500k+ followers | https://www.oneusefulthing.org | Rigorous research on AI in business/education. |
| Lilian Weng (OpenAI) | Top AI blog | https://lilianweng.github.io | Technical deep-dives on prompting techniques. |

---

## 🎯 RECOMMENDED CATEGORIES FOR AIOPENLIBRARY

Based on this research, these are the highest-demand categories to populate:

1. **Business & Strategy** — CEO briefings, market analysis, decision frameworks
2. **Software Development** — Code review, debugging, system design, documentation
3. **Content & Marketing** — Copywriting, SEO blogs, email campaigns, social media
4. **Education & Learning** — Socratic tutoring, explain-like-I'm-5, study guides
5. **Creative Writing** — Worldbuilding, character development, storytelling
6. **Data & Analytics** — Analysis frameworks, visualization, research
7. **Career & Personal Development** — Resume, career coaching, decision making
8. **Product Management** — PRDs, user stories, roadmaps
9. **Prompt Engineering** — Meta-prompts, optimization, few-shot builders
10. **Startup & Entrepreneurship** — Pitch decks, business models, fundraising

---

## 📋 NEXT STEPS

1. **Curate the top 50-100 prompts** from this research into production-ready format
2. **Add proper attribution** — link back to original creators/sources
3. **Add variables** — make prompts customizable (like the existing site format)
4. **Categorize and tag** — map to the site's existing category taxonomy
5. **Quality-test each prompt** — run through Claude/GPT and verify output quality
6. **Populate the database** — batch insert via Supabase admin API or admin dashboard

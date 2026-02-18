export interface Prompt {
  slug: string;
  title: string;
  description: string;
  category: string;
  categorySlug: string;
  prompt: string;
  tags: string[];
  recommendedModel: string;
  modelIcon: string;
  useCases: string[];
  exampleOutput?: string;
  outputScreenshots?: string[];
  references?: { title: string; url: string }[];
  variables?: { name: string; description: string }[];
  tips?: string[];
  saves: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  createdAt: string;
}

export interface Category {
  name: string;
  slug: string;
  icon: string;
  description: string;
  promptCount: number;
}

export const categories: Category[] = [
  {
    name: "Software Engineering",
    slug: "software-engineering",
    icon: "💻",
    description: "Prompts for coding, debugging, architecture, and development workflows",
    promptCount: 6,
  },
  {
    name: "Writing & Content",
    slug: "writing-content",
    icon: "✍️",
    description: "Craft compelling content, articles, and copy",
    promptCount: 5,
  },
  {
    name: "Data Science & Analysis",
    slug: "data-science",
    icon: "📊",
    description: "Analyze data, build models, and extract insights",
    promptCount: 4,
  },
  {
    name: "Marketing",
    slug: "marketing",
    icon: "📣",
    description: "Create campaigns, strategies, and marketing content",
    promptCount: 4,
  },
  {
    name: "Design & UX",
    slug: "design-ux",
    icon: "🎨",
    description: "Design systems, user experiences, and visual content",
    promptCount: 3,
  },
  {
    name: "Education",
    slug: "education",
    icon: "📚",
    description: "Teaching, tutoring, and educational content creation",
    promptCount: 3,
  },
  {
    name: "Product Management",
    slug: "product-management",
    icon: "🚀",
    description: "Product strategy, roadmaps, and feature planning",
    promptCount: 3,
  },
  {
    name: "Research",
    slug: "research",
    icon: "🔬",
    description: "Deep research, literature reviews, and analysis",
    promptCount: 3,
  },
];

export const prompts: Prompt[] = [
  // Software Engineering
  {
    slug: "senior-developer-code-review",
    title: "Senior Developer Code Review",
    description: "Get a thorough code review from an experienced senior developer perspective, covering correctness, performance, security, and maintainability.",
    category: "Software Engineering",
    categorySlug: "software-engineering",
    prompt: `You are a senior software engineer with 15+ years of experience conducting a thorough code review. Review the following code with extreme attention to detail.

**Code to Review:**
\`\`\`{{language}}
{{code}}
\`\`\`

**Context:** {{context}}

Please provide your review covering:

1. **Correctness** - Are there any bugs, edge cases, or logic errors?
2. **Performance** - Any performance bottlenecks or optimization opportunities?
3. **Security** - Any security vulnerabilities (injection, XSS, auth issues)?
4. **Maintainability** - Is the code readable, well-structured, and following best practices?
5. **Testing** - What test cases should be written for this code?

For each issue found, provide:
- Severity: 🔴 Critical / 🟡 Warning / 🔵 Suggestion
- Line reference
- Explanation of the issue
- Suggested fix with code example

End with an overall assessment and a quality score out of 10.`,
    tags: ["code-review", "debugging", "best-practices", "security"],
    recommendedModel: "Claude Opus 4",
    modelIcon: "anthropic",
    useCases: [
      "Pre-merge code reviews",
      "Learning best practices",
      "Finding security vulnerabilities",
      "Improving code quality",
    ],
    variables: [
      { name: "language", description: "Programming language (e.g., Python, TypeScript)" },
      { name: "code", description: "The code to review" },
      { name: "context", description: "What this code does and where it's used" },
    ],
    tips: [
      "Include the full function or module for better context",
      "Mention the framework being used (React, Django, etc.)",
      "Specify any performance constraints or requirements",
    ],
    references: [
      { title: "Google Engineering Practices - Code Review", url: "https://google.github.io/eng-practices/review/" },
    ],
    saves: 342,
    difficulty: "Intermediate",
    createdAt: "2025-01-15",
  },
  {
    slug: "system-architecture-designer",
    title: "System Architecture Designer",
    description: "Design scalable system architectures with detailed component diagrams, trade-off analysis, and implementation roadmaps.",
    category: "Software Engineering",
    categorySlug: "software-engineering",
    prompt: `You are a principal systems architect. Design a comprehensive system architecture for the following:

**System:** {{system_description}}
**Scale:** {{expected_scale}}
**Constraints:** {{constraints}}

Provide:

1. **High-Level Architecture**
   - System components and their responsibilities
   - Data flow between components
   - ASCII diagram of the architecture

2. **Technology Stack Recommendations**
   - Database choices with justification
   - Message queues / event systems
   - Caching strategy
   - API design (REST/GraphQL/gRPC)

3. **Scalability Plan**
   - Horizontal vs vertical scaling strategies
   - Bottleneck identification
   - CDN and edge computing considerations

4. **Trade-offs Analysis**
   - CAP theorem considerations
   - Consistency vs availability decisions
   - Cost vs performance trade-offs

5. **Implementation Roadmap**
   - Phase 1: MVP
   - Phase 2: Scale
   - Phase 3: Optimization`,
    tags: ["architecture", "system-design", "scalability", "infrastructure"],
    recommendedModel: "Claude Opus 4",
    modelIcon: "anthropic",
    useCases: [
      "Designing new systems from scratch",
      "Preparing for system design interviews",
      "Scaling existing architectures",
      "Technical documentation",
    ],
    variables: [
      { name: "system_description", description: "What the system needs to do" },
      { name: "expected_scale", description: "Users, requests/sec, data volume" },
      { name: "constraints", description: "Budget, timeline, team size, existing tech" },
    ],
    tips: [
      "Be specific about expected traffic patterns",
      "Mention any existing infrastructure or constraints",
      "Include non-functional requirements like latency targets",
    ],
    saves: 289,
    difficulty: "Advanced",
    createdAt: "2025-02-01",
  },
  {
    slug: "debug-detective",
    title: "Debug Detective",
    description: "Systematically debug complex issues by analyzing error messages, stack traces, and code behavior with a structured approach.",
    category: "Software Engineering",
    categorySlug: "software-engineering",
    prompt: `You are an expert debugging specialist. Help me systematically debug this issue.

**Error/Symptom:** {{error_description}}

**Stack Trace (if available):**
\`\`\`
{{stack_trace}}
\`\`\`

**Relevant Code:**
\`\`\`{{language}}
{{code}}
\`\`\`

**Environment:** {{environment}}
**What I've already tried:** {{attempted_fixes}}

Please follow this debugging methodology:

1. **Error Analysis** - What does the error actually mean?
2. **Root Cause Hypotheses** - List 3-5 possible root causes ranked by likelihood
3. **Diagnostic Steps** - What to check to confirm each hypothesis
4. **Solution** - For the most likely cause, provide a fix with explanation
5. **Prevention** - How to prevent this class of error in the future`,
    tags: ["debugging", "troubleshooting", "error-handling"],
    recommendedModel: "Claude Sonnet 4",
    modelIcon: "anthropic",
    useCases: [
      "Debugging production issues",
      "Understanding cryptic error messages",
      "Learning systematic debugging",
    ],
    variables: [
      { name: "error_description", description: "The error message or unexpected behavior" },
      { name: "stack_trace", description: "Full stack trace if available" },
      { name: "language", description: "Programming language" },
      { name: "code", description: "Relevant code that's failing" },
      { name: "environment", description: "OS, runtime version, dependencies" },
      { name: "attempted_fixes", description: "What you've already tried" },
    ],
    saves: 267,
    difficulty: "Intermediate",
    createdAt: "2025-01-20",
  },
  {
    slug: "api-endpoint-generator",
    title: "REST API Endpoint Generator",
    description: "Generate complete REST API endpoints with validation, error handling, types, and tests.",
    category: "Software Engineering",
    categorySlug: "software-engineering",
    prompt: `You are a backend API specialist. Generate a complete REST API endpoint implementation.

**Resource:** {{resource_name}}
**Framework:** {{framework}}
**Database:** {{database}}
**Operations needed:** {{operations}}

For each endpoint, provide:

1. **Route definition** with proper HTTP methods
2. **Request validation** schema (body, params, query)
3. **Controller logic** with proper error handling
4. **Database query/model** code
5. **Response format** with status codes
6. **TypeScript/type definitions**
7. **Unit test** for the endpoint
8. **API documentation** (OpenAPI/Swagger format)

Follow these best practices:
- Proper HTTP status codes (201 for creation, 204 for deletion, etc.)
- Input sanitization and validation
- Pagination for list endpoints
- Proper error messages (never expose internal details)
- Rate limiting considerations`,
    tags: ["api", "backend", "rest", "typescript"],
    recommendedModel: "Claude Sonnet 4",
    modelIcon: "anthropic",
    useCases: [
      "Building new APIs quickly",
      "Standardizing API patterns",
      "Learning API best practices",
    ],
    variables: [
      { name: "resource_name", description: "e.g., User, Product, Order" },
      { name: "framework", description: "e.g., Express, FastAPI, NestJS" },
      { name: "database", description: "e.g., PostgreSQL, MongoDB" },
      { name: "operations", description: "e.g., CRUD, search, bulk operations" },
    ],
    saves: 198,
    difficulty: "Intermediate",
    createdAt: "2025-02-05",
  },
  {
    slug: "git-commit-message-pro",
    title: "Git Commit Message Pro",
    description: "Generate clear, conventional commit messages that tell the story of your changes.",
    category: "Software Engineering",
    categorySlug: "software-engineering",
    prompt: `Analyze the following code changes and generate a professional git commit message following the Conventional Commits specification.

**Diff/Changes:**
\`\`\`
{{diff}}
\`\`\`

**Additional context:** {{context}}

Generate:
1. A commit message following this format:
   \`type(scope): subject\`

   Body explaining what and why (not how).

   Footer with breaking changes or issue references.

2. Types: feat, fix, docs, style, refactor, perf, test, build, ci, chore
3. Keep subject under 50 characters
4. Wrap body at 72 characters
5. If multiple logical changes, suggest splitting into separate commits`,
    tags: ["git", "workflow", "collaboration"],
    recommendedModel: "Claude Haiku 3.5",
    modelIcon: "anthropic",
    useCases: [
      "Writing clear commit messages",
      "Maintaining clean git history",
      "Following team conventions",
    ],
    variables: [
      { name: "diff", description: "The git diff or description of changes" },
      { name: "context", description: "Why the change was made, related issue" },
    ],
    saves: 156,
    difficulty: "Beginner",
    createdAt: "2025-01-10",
  },
  {
    slug: "test-case-generator",
    title: "Comprehensive Test Case Generator",
    description: "Generate thorough test suites covering happy paths, edge cases, error scenarios, and integration tests.",
    category: "Software Engineering",
    categorySlug: "software-engineering",
    prompt: `You are a QA engineer and testing specialist. Generate a comprehensive test suite for the following code.

**Code to test:**
\`\`\`{{language}}
{{code}}
\`\`\`

**Testing framework:** {{framework}}
**Type of tests needed:** {{test_types}}

Generate tests covering:

1. **Happy Path Tests** - Normal expected behavior
2. **Edge Cases** - Boundary values, empty inputs, max values
3. **Error Cases** - Invalid inputs, network failures, timeouts
4. **Integration Tests** - How this interacts with other components
5. **Performance Tests** - If applicable

For each test:
- Clear, descriptive test name (it should "do X when Y")
- Arrange-Act-Assert pattern
- Proper mocking of dependencies
- Comments explaining what each test validates

Also provide:
- Test coverage summary
- Any untestable parts and suggestions to make them testable`,
    tags: ["testing", "qa", "tdd", "unit-tests"],
    recommendedModel: "Claude Sonnet 4",
    modelIcon: "anthropic",
    useCases: [
      "Writing comprehensive test suites",
      "Improving test coverage",
      "Learning testing best practices",
    ],
    variables: [
      { name: "language", description: "Programming language" },
      { name: "code", description: "The code to generate tests for" },
      { name: "framework", description: "e.g., Jest, Pytest, JUnit" },
      { name: "test_types", description: "Unit, integration, e2e, or all" },
    ],
    saves: 213,
    difficulty: "Intermediate",
    createdAt: "2025-01-25",
  },

  // Writing & Content
  {
    slug: "blog-post-architect",
    title: "Blog Post Architect",
    description: "Create SEO-optimized, engaging blog posts with structured outlines, compelling hooks, and strategic keyword placement.",
    category: "Writing & Content",
    categorySlug: "writing-content",
    prompt: `You are an expert content strategist and SEO specialist. Create a comprehensive blog post.

**Topic:** {{topic}}
**Target Keyword:** {{keyword}}
**Target Audience:** {{audience}}
**Word Count:** {{word_count}}
**Tone:** {{tone}}

Deliver:

1. **5 Headline Options** (with power words and numbers)
2. **Meta Description** (155 characters, includes keyword)
3. **Blog Post Structure:**
   - Hook introduction (story, statistic, or question)
   - H2/H3 subheading hierarchy
   - Key points for each section
   - Data points or examples to include
   - Internal linking opportunities
   - Call-to-action conclusion

4. **SEO Checklist:**
   - Primary keyword placement (title, first 100 words, H2s)
   - Secondary keyword suggestions
   - Image alt text suggestions
   - Schema markup recommendations

5. **Full Draft** following the structure above`,
    tags: ["blog", "seo", "content-writing", "marketing"],
    recommendedModel: "Claude Opus 4",
    modelIcon: "anthropic",
    useCases: [
      "Creating blog content at scale",
      "SEO-optimized article writing",
      "Content strategy planning",
    ],
    variables: [
      { name: "topic", description: "The blog post topic" },
      { name: "keyword", description: "Primary SEO target keyword" },
      { name: "audience", description: "Who is this for?" },
      { name: "word_count", description: "Target length (e.g., 1500)" },
      { name: "tone", description: "Professional, casual, authoritative, etc." },
    ],
    saves: 445,
    difficulty: "Intermediate",
    createdAt: "2025-01-12",
  },
  {
    slug: "viral-twitter-thread",
    title: "Viral Twitter/X Thread Creator",
    description: "Craft engaging Twitter threads that hook readers and drive engagement using proven viral patterns.",
    category: "Writing & Content",
    categorySlug: "writing-content",
    prompt: `You are a social media expert who has studied viral Twitter threads. Create a compelling thread.

**Topic:** {{topic}}
**Key Message:** {{key_message}}
**Target Audience:** {{audience}}
**Thread Length:** {{length}} tweets

Structure:
1. **Hook Tweet** - Stop the scroll. Use one of these patterns:
   - Contrarian take: "Most people think X. They're wrong."
   - Promise: "I spent 100 hours studying X. Here's what I learned:"
   - Story: Start with a vivid moment

2. **Body Tweets** (one idea per tweet):
   - Each tweet should stand alone AND connect to the next
   - Use short sentences and line breaks
   - Include specific numbers and examples
   - Add "tweet 3 is the game-changer" style teasers

3. **Closing Tweet:**
   - Summarize key takeaway
   - Clear CTA (follow, retweet, reply)
   - Link to resource if applicable

4. **Engagement Boosters:**
   - Reply tweet suggestions
   - Quote tweet bait
   - Poll ideas

Format each tweet with character count.`,
    tags: ["twitter", "social-media", "viral-content", "threads"],
    recommendedModel: "GPT-4o",
    modelIcon: "openai",
    useCases: [
      "Building audience on Twitter/X",
      "Content marketing",
      "Thought leadership",
    ],
    variables: [
      { name: "topic", description: "What the thread is about" },
      { name: "key_message", description: "The core insight to share" },
      { name: "audience", description: "Who should engage with this" },
      { name: "length", description: "Number of tweets (5-15)" },
    ],
    saves: 367,
    difficulty: "Beginner",
    createdAt: "2025-02-08",
  },
  {
    slug: "email-copywriter",
    title: "High-Converting Email Copywriter",
    description: "Write emails that get opened, read, and clicked with proven copywriting frameworks.",
    category: "Writing & Content",
    categorySlug: "writing-content",
    prompt: `You are a direct-response copywriter specializing in email marketing. Write a high-converting email.

**Purpose:** {{purpose}}
**Product/Service:** {{product}}
**Target Audience:** {{audience}}
**Desired Action:** {{cta}}
**Brand Voice:** {{voice}}

Deliver:

1. **3 Subject Line Options** (A/B test ready)
   - Include open rate optimization tips for each

2. **Preview Text** (35-90 characters)

3. **Email Body** using the {{framework}} framework:
   - **PAS:** Problem → Agitation → Solution
   - **AIDA:** Attention → Interest → Desire → Action
   - **BAB:** Before → After → Bridge

4. **CTA Button Text** (3 options)

5. **P.S. Line** (often the most-read part)

6. **Optimization Notes:**
   - Best send time for this audience
   - Personalization opportunities
   - Follow-up email suggestion`,
    tags: ["email", "copywriting", "conversion", "marketing"],
    recommendedModel: "Claude Sonnet 4",
    modelIcon: "anthropic",
    useCases: [
      "Email marketing campaigns",
      "Sales outreach",
      "Newsletter creation",
      "Drip sequences",
    ],
    variables: [
      { name: "purpose", description: "Welcome, promotion, nurture, re-engagement" },
      { name: "product", description: "What you're promoting" },
      { name: "audience", description: "Who receives this email" },
      { name: "cta", description: "What should the reader do?" },
      { name: "voice", description: "Friendly, professional, urgent, etc." },
      { name: "framework", description: "PAS, AIDA, or BAB" },
    ],
    saves: 312,
    difficulty: "Intermediate",
    createdAt: "2025-01-18",
  },
  {
    slug: "technical-documentation-writer",
    title: "Technical Documentation Writer",
    description: "Create clear, comprehensive technical documentation that developers actually want to read.",
    category: "Writing & Content",
    categorySlug: "writing-content",
    prompt: `You are a senior technical writer at a top tech company. Create documentation for the following.

**What to document:** {{subject}}
**Audience:** {{audience}}
**Documentation type:** {{doc_type}}

Produce documentation that includes:

1. **Overview** - What is it, why does it exist, when to use it
2. **Quick Start** - Get running in under 5 minutes
3. **Core Concepts** - Key terms and mental models
4. **Step-by-Step Guide** - Detailed walkthrough with code examples
5. **API Reference** (if applicable) - Parameters, returns, errors
6. **Examples** - Real-world use cases with complete code
7. **Troubleshooting** - Common issues and solutions
8. **FAQ** - Anticipated questions

Style guide:
- Use active voice
- One idea per sentence
- Code examples for every concept
- Progressive disclosure (simple → complex)
- Include "Why" not just "How"`,
    tags: ["documentation", "technical-writing", "developer-experience"],
    recommendedModel: "Claude Opus 4",
    modelIcon: "anthropic",
    useCases: [
      "API documentation",
      "README files",
      "Developer guides",
      "Internal wikis",
    ],
    variables: [
      { name: "subject", description: "The API, tool, or system to document" },
      { name: "audience", description: "Beginner devs, senior engineers, non-technical" },
      { name: "doc_type", description: "API reference, tutorial, guide, README" },
    ],
    saves: 234,
    difficulty: "Intermediate",
    createdAt: "2025-02-10",
  },
  {
    slug: "storytelling-framework",
    title: "Story-Driven Content Framework",
    description: "Transform any message into a compelling narrative using proven storytelling structures.",
    category: "Writing & Content",
    categorySlug: "writing-content",
    prompt: `You are a master storyteller and narrative strategist. Transform this message into a compelling story.

**Core Message:** {{message}}
**Medium:** {{medium}}
**Audience:** {{audience}}
**Emotional Goal:** {{emotion}}

Use the following storytelling framework:

1. **The Hook** - An unexpected opening that creates curiosity
2. **The Setup** - Establish the world, character, and stakes
3. **The Conflict** - The challenge or problem (make it relatable)
4. **The Journey** - The struggle and discovery
5. **The Resolution** - How the challenge was overcome
6. **The Lesson** - The transferable insight
7. **The Call** - What the audience should do next

Also provide:
- 3 opening line options
- Sensory details to include
- Dialogue snippets
- Emotional arc mapping
- Where to place the key message for maximum impact`,
    tags: ["storytelling", "narrative", "content-strategy", "engagement"],
    recommendedModel: "Claude Opus 4",
    modelIcon: "anthropic",
    useCases: [
      "Presentations and talks",
      "Brand storytelling",
      "Case studies",
      "Fundraising pitches",
    ],
    variables: [
      { name: "message", description: "The key message or lesson to convey" },
      { name: "medium", description: "Blog, presentation, video, podcast" },
      { name: "audience", description: "Who you're telling the story to" },
      { name: "emotion", description: "Inspired, motivated, empathetic, curious" },
    ],
    saves: 189,
    difficulty: "Advanced",
    createdAt: "2025-02-12",
  },

  // Data Science
  {
    slug: "data-analysis-pipeline",
    title: "Data Analysis Pipeline Builder",
    description: "Build complete data analysis pipelines with cleaning, exploration, visualization, and insights extraction.",
    category: "Data Science & Analysis",
    categorySlug: "data-science",
    prompt: `You are a senior data scientist. Build a complete analysis pipeline for the following dataset.

**Dataset description:** {{dataset}}
**Columns/Fields:** {{columns}}
**Business question:** {{question}}
**Tools:** {{tools}}

Provide a complete pipeline:

1. **Data Loading & Inspection**
   - Code to load and inspect the data
   - Data types, shape, memory usage

2. **Data Cleaning**
   - Missing value strategy
   - Outlier detection and handling
   - Data type conversions
   - Deduplication

3. **Exploratory Data Analysis**
   - Summary statistics
   - Distribution analysis
   - Correlation analysis
   - 5+ visualization code snippets (matplotlib/plotly)

4. **Feature Engineering**
   - New features to create
   - Encoding strategies
   - Scaling/normalization

5. **Analysis & Insights**
   - Statistical tests if applicable
   - Key findings (3-5 insights)
   - Recommendations based on data

6. **Presentation-Ready Output**
   - Executive summary (3 bullet points)
   - Key chart descriptions
   - Next steps`,
    tags: ["data-analysis", "python", "pandas", "visualization"],
    recommendedModel: "Claude Opus 4",
    modelIcon: "anthropic",
    useCases: [
      "Analyzing business datasets",
      "Creating data reports",
      "Exploratory data analysis",
    ],
    variables: [
      { name: "dataset", description: "What the data represents" },
      { name: "columns", description: "List of columns and their meaning" },
      { name: "question", description: "What business question to answer" },
      { name: "tools", description: "Python/Pandas, R, SQL, etc." },
    ],
    saves: 278,
    difficulty: "Intermediate",
    createdAt: "2025-01-22",
  },
  {
    slug: "sql-query-optimizer",
    title: "SQL Query Optimizer",
    description: "Optimize slow SQL queries with explain plan analysis, indexing suggestions, and rewrite recommendations.",
    category: "Data Science & Analysis",
    categorySlug: "data-science",
    prompt: `You are a database performance specialist. Optimize the following SQL query.

**Query:**
\`\`\`sql
{{query}}
\`\`\`

**Database:** {{database}}
**Table sizes:** {{table_sizes}}
**Current execution time:** {{execution_time}}
**Existing indexes:** {{indexes}}

Provide:

1. **Query Analysis** - What the query does step by step
2. **Performance Bottlenecks** - Why it's slow
3. **Optimized Query** - Rewritten for performance
4. **Index Recommendations** - What indexes to add/modify
5. **Explain Plan Interpretation** - How to read the execution plan
6. **Alternative Approaches** - CTEs, materialized views, denormalization
7. **Estimated Improvement** - Expected speedup factor`,
    tags: ["sql", "database", "performance", "optimization"],
    recommendedModel: "Claude Sonnet 4",
    modelIcon: "anthropic",
    useCases: [
      "Optimizing slow database queries",
      "Database performance tuning",
      "Learning query optimization",
    ],
    variables: [
      { name: "query", description: "The SQL query to optimize" },
      { name: "database", description: "PostgreSQL, MySQL, SQLite, etc." },
      { name: "table_sizes", description: "Approximate row counts" },
      { name: "execution_time", description: "Current query time" },
      { name: "indexes", description: "Existing indexes on relevant tables" },
    ],
    saves: 187,
    difficulty: "Advanced",
    createdAt: "2025-02-03",
  },
  {
    slug: "ml-model-selector",
    title: "ML Model Selection Advisor",
    description: "Get expert guidance on choosing the right machine learning model for your specific problem and dataset.",
    category: "Data Science & Analysis",
    categorySlug: "data-science",
    prompt: `You are a machine learning expert. Help me select the right model for my problem.

**Problem type:** {{problem_type}}
**Dataset size:** {{dataset_size}}
**Features:** {{features}}
**Target variable:** {{target}}
**Constraints:** {{constraints}}

Provide:

1. **Problem Classification** - Supervised/unsupervised, regression/classification
2. **Top 3 Model Recommendations** ranked by suitability:
   - Model name and brief description
   - Pros and cons for this specific problem
   - Expected performance range
   - Training time and resource requirements

3. **Implementation Plan** for the top choice:
   - Data preprocessing steps
   - Hyperparameter tuning strategy
   - Cross-validation approach
   - Evaluation metrics to use

4. **Code Template** - Sklearn/PyTorch/TensorFlow starter code
5. **Common Pitfalls** to avoid for this problem type`,
    tags: ["machine-learning", "model-selection", "scikit-learn", "deep-learning"],
    recommendedModel: "Claude Opus 4",
    modelIcon: "anthropic",
    useCases: [
      "Choosing ML algorithms",
      "Starting new ML projects",
      "Comparing model approaches",
    ],
    variables: [
      { name: "problem_type", description: "Classification, regression, clustering, etc." },
      { name: "dataset_size", description: "Number of samples and features" },
      { name: "features", description: "Types of input features" },
      { name: "target", description: "What you're predicting" },
      { name: "constraints", description: "Latency, interpretability, compute budget" },
    ],
    saves: 203,
    difficulty: "Advanced",
    createdAt: "2025-01-28",
  },
  {
    slug: "dashboard-kpi-designer",
    title: "Dashboard & KPI Designer",
    description: "Design data dashboards with the right KPIs, visualizations, and layout for maximum impact.",
    category: "Data Science & Analysis",
    categorySlug: "data-science",
    prompt: `You are a business intelligence specialist. Design a dashboard for the following.

**Business area:** {{business_area}}
**Stakeholders:** {{stakeholders}}
**Key decisions to support:** {{decisions}}
**Data available:** {{data_sources}}

Deliver:

1. **KPI Selection** (5-8 metrics)
   - Metric name and formula
   - Why it matters
   - Target/benchmark
   - Update frequency

2. **Dashboard Layout**
   - Section organization
   - Chart type for each metric (and why)
   - Filter and drill-down options
   - Mobile responsiveness notes

3. **Visual Design**
   - Color coding strategy
   - Alert thresholds
   - Comparison views (period over period)

4. **Implementation**
   - SQL queries for each KPI
   - Recommended tool (Tableau, Looker, Metabase)
   - Refresh schedule`,
    tags: ["dashboard", "kpi", "business-intelligence", "visualization"],
    recommendedModel: "Claude Sonnet 4",
    modelIcon: "anthropic",
    useCases: [
      "Building executive dashboards",
      "KPI definition",
      "BI tool setup",
    ],
    variables: [
      { name: "business_area", description: "Sales, marketing, product, finance" },
      { name: "stakeholders", description: "Who will use this dashboard" },
      { name: "decisions", description: "What decisions should this inform" },
      { name: "data_sources", description: "Available data tables/sources" },
    ],
    saves: 167,
    difficulty: "Intermediate",
    createdAt: "2025-02-07",
  },

  // Marketing
  {
    slug: "product-launch-campaign",
    title: "Product Launch Campaign Planner",
    description: "Plan a complete product launch campaign with messaging, channels, timeline, and content strategy.",
    category: "Marketing",
    categorySlug: "marketing",
    prompt: `You are a growth marketing strategist planning a product launch. Create a comprehensive launch plan.

**Product:** {{product}}
**Target Market:** {{market}}
**Launch Date:** {{date}}
**Budget:** {{budget}}
**Unique Value Proposition:** {{uvp}}

Deliver:

1. **Launch Strategy**
   - Pre-launch (4 weeks before)
   - Launch week
   - Post-launch (4 weeks after)

2. **Messaging Framework**
   - Hero message (one sentence)
   - Supporting messages (3 pillars)
   - Objection handling scripts
   - Social proof strategy

3. **Channel Plan**
   - Organic channels with content calendar
   - Paid channels with budget allocation
   - PR and influencer outreach
   - Email sequence (5 emails)

4. **Content Deliverables**
   - Landing page copy
   - Launch announcement
   - Social media posts (5 per platform)
   - Press release outline

5. **Metrics & Goals**
   - KPIs for each channel
   - Week-by-week targets
   - A/B test plan`,
    tags: ["product-launch", "campaign", "growth", "strategy"],
    recommendedModel: "Claude Opus 4",
    modelIcon: "anthropic",
    useCases: [
      "Launching new products",
      "Go-to-market strategy",
      "Campaign planning",
    ],
    variables: [
      { name: "product", description: "Product name and description" },
      { name: "market", description: "Target audience and market" },
      { name: "date", description: "Target launch date" },
      { name: "budget", description: "Marketing budget" },
      { name: "uvp", description: "What makes this product unique" },
    ],
    saves: 234,
    difficulty: "Advanced",
    createdAt: "2025-01-14",
  },
  {
    slug: "landing-page-copywriter",
    title: "High-Converting Landing Page Copy",
    description: "Write landing page copy that converts visitors into customers using proven frameworks.",
    category: "Marketing",
    categorySlug: "marketing",
    prompt: `You are a conversion copywriter specializing in landing pages. Write copy for this page.

**Product/Service:** {{product}}
**Target Visitor:** {{visitor}}
**Primary Goal:** {{goal}}
**Price Point:** {{price}}

Write complete landing page copy:

1. **Above the Fold**
   - Headline (benefit-driven, under 10 words)
   - Subheadline (clarify the offer)
   - CTA button text
   - Hero image/video description

2. **Social Proof Section**
   - Testimonial prompts
   - Stats/numbers to highlight
   - Logo bar suggestions

3. **Features → Benefits**
   - 3-5 features translated to benefits
   - Supporting copy for each

4. **Objection Handling**
   - FAQ section (5 questions)
   - Risk reversal (guarantee copy)
   - Trust signals

5. **Final CTA Section**
   - Urgency/scarcity element
   - Final benefit summary
   - CTA with supporting text

Optimize for a conversion rate above 5%.`,
    tags: ["landing-page", "copywriting", "conversion", "cro"],
    recommendedModel: "GPT-4o",
    modelIcon: "openai",
    useCases: [
      "Building landing pages",
      "Improving conversion rates",
      "Product page optimization",
    ],
    variables: [
      { name: "product", description: "What you're selling" },
      { name: "visitor", description: "Who lands on this page" },
      { name: "goal", description: "Sign up, purchase, book demo" },
      { name: "price", description: "Price point or pricing model" },
    ],
    saves: 312,
    difficulty: "Intermediate",
    createdAt: "2025-02-02",
  },
  {
    slug: "seo-content-strategy",
    title: "SEO Content Strategy Builder",
    description: "Build a data-driven SEO content strategy with keyword clusters, content calendar, and ranking roadmap.",
    category: "Marketing",
    categorySlug: "marketing",
    prompt: `You are an SEO strategist. Build a content strategy to rank for the following topic.

**Niche/Industry:** {{industry}}
**Main topic:** {{topic}}
**Current domain authority:** {{da}}
**Competitors:** {{competitors}}

Deliver:

1. **Keyword Research**
   - Primary keywords (5) with estimated difficulty
   - Long-tail keywords (15) for quick wins
   - Question keywords (10) for featured snippets
   - Keyword clusters organized by topic

2. **Content Plan** (3 months)
   - Pillar content (2-3 comprehensive guides)
   - Supporting articles (10-15)
   - Internal linking strategy
   - Content gap analysis vs competitors

3. **On-Page SEO Template**
   - Title tag formula
   - Meta description template
   - H1-H3 hierarchy structure
   - Schema markup recommendations

4. **Technical SEO Checklist**
   - Site speed items
   - Mobile optimization
   - Core Web Vitals focus areas`,
    tags: ["seo", "content-strategy", "keywords", "organic-growth"],
    recommendedModel: "Claude Sonnet 4",
    modelIcon: "anthropic",
    useCases: [
      "Building organic traffic",
      "Content marketing strategy",
      "Competitive SEO analysis",
    ],
    variables: [
      { name: "industry", description: "Your industry or niche" },
      { name: "topic", description: "Main topic to rank for" },
      { name: "da", description: "Domain authority (1-100)" },
      { name: "competitors", description: "Top 3 competitor domains" },
    ],
    saves: 256,
    difficulty: "Intermediate",
    createdAt: "2025-01-30",
  },
  {
    slug: "ad-creative-generator",
    title: "Ad Creative Generator",
    description: "Generate high-performing ad creatives for Meta, Google, and LinkedIn with copy variations and targeting.",
    category: "Marketing",
    categorySlug: "marketing",
    prompt: `You are a performance marketing specialist. Create ad creatives for a campaign.

**Platform:** {{platform}}
**Product/Service:** {{product}}
**Campaign Objective:** {{objective}}
**Target Audience:** {{audience}}
**Budget:** {{budget}}

Generate:

1. **Ad Copy Variations** (5 per format)
   - Headlines (30 char limit for Google, longer for Meta)
   - Primary text / descriptions
   - CTA options

2. **Visual Concepts** (3 ideas)
   - Image/video description
   - Text overlay suggestions
   - Color and mood direction

3. **Audience Targeting**
   - Interest targeting
   - Lookalike suggestions
   - Exclusions to add
   - Retargeting segments

4. **A/B Testing Plan**
   - Variables to test
   - Budget split recommendation
   - Statistical significance calculator settings

5. **Performance Projections**
   - Expected CPM/CPC ranges
   - Conversion benchmarks for industry`,
    tags: ["advertising", "paid-media", "meta-ads", "google-ads"],
    recommendedModel: "GPT-4o",
    modelIcon: "openai",
    useCases: [
      "Running paid campaigns",
      "Creating ad variations",
      "Testing ad performance",
    ],
    variables: [
      { name: "platform", description: "Meta, Google, LinkedIn, TikTok" },
      { name: "product", description: "What you're advertising" },
      { name: "objective", description: "Awareness, traffic, conversions" },
      { name: "audience", description: "Target demographic and psychographic" },
      { name: "budget", description: "Daily or total campaign budget" },
    ],
    saves: 198,
    difficulty: "Intermediate",
    createdAt: "2025-02-06",
  },

  // Design & UX
  {
    slug: "design-system-creator",
    title: "Design System Creator",
    description: "Build a comprehensive design system with tokens, components, patterns, and documentation.",
    category: "Design & UX",
    categorySlug: "design-ux",
    prompt: `You are a design systems architect. Create a design system specification.

**Brand:** {{brand}}
**Platform:** {{platform}}
**Existing brand colors:** {{colors}}
**Target feel:** {{feel}}

Deliver:

1. **Design Tokens**
   - Color palette (primary, secondary, neutral, semantic)
   - Typography scale (sizes, weights, line heights)
   - Spacing scale (4px base grid)
   - Border radius values
   - Shadow definitions
   - Animation/transition values

2. **Component Library** (specifications for)
   - Button (variants, sizes, states)
   - Input fields (types, validation states)
   - Card (layouts, variants)
   - Modal/Dialog
   - Navigation
   - Table
   - Toast/Notification

3. **Patterns**
   - Form layouts
   - Error handling
   - Loading states
   - Empty states
   - Responsive breakpoints

4. **Accessibility**
   - Color contrast ratios
   - Focus states
   - Screen reader considerations
   - Keyboard navigation

Provide CSS custom properties and Tailwind config.`,
    tags: ["design-system", "ui", "components", "accessibility"],
    recommendedModel: "Claude Opus 4",
    modelIcon: "anthropic",
    useCases: [
      "Starting a design system",
      "Standardizing UI components",
      "Improving design consistency",
    ],
    variables: [
      { name: "brand", description: "Brand name and identity" },
      { name: "platform", description: "Web, mobile, both" },
      { name: "colors", description: "Existing brand colors if any" },
      { name: "feel", description: "Modern, playful, corporate, minimal" },
    ],
    saves: 267,
    difficulty: "Advanced",
    createdAt: "2025-01-16",
  },
  {
    slug: "ux-audit-framework",
    title: "UX Audit Framework",
    description: "Conduct a thorough UX audit identifying usability issues, accessibility gaps, and improvement opportunities.",
    category: "Design & UX",
    categorySlug: "design-ux",
    prompt: `You are a senior UX researcher and designer. Conduct a comprehensive UX audit.

**Product/Website:** {{product}}
**Target Users:** {{users}}
**Key User Flows:** {{flows}}
**Known Pain Points:** {{pain_points}}

Audit Framework:

1. **Heuristic Evaluation** (Nielsen's 10 heuristics)
   - Score each heuristic 1-5
   - Specific violations found
   - Severity rating

2. **User Flow Analysis**
   - Steps to complete key tasks
   - Friction points identified
   - Drop-off risk areas
   - Simplification recommendations

3. **Visual Design Review**
   - Consistency issues
   - Information hierarchy
   - White space usage
   - Typography readability

4. **Accessibility Audit**
   - WCAG 2.1 AA compliance
   - Keyboard navigation
   - Screen reader compatibility
   - Color contrast issues

5. **Recommendations**
   - Quick wins (low effort, high impact)
   - Medium-term improvements
   - Strategic redesign areas
   - Priority matrix (Impact vs Effort)`,
    tags: ["ux-audit", "usability", "accessibility", "user-research"],
    recommendedModel: "Claude Opus 4",
    modelIcon: "anthropic",
    useCases: [
      "Improving existing products",
      "Pre-redesign assessment",
      "Accessibility compliance",
    ],
    variables: [
      { name: "product", description: "Product or website to audit" },
      { name: "users", description: "Primary user personas" },
      { name: "flows", description: "Critical user journeys" },
      { name: "pain_points", description: "Known user complaints" },
    ],
    saves: 178,
    difficulty: "Advanced",
    createdAt: "2025-02-04",
  },
  {
    slug: "responsive-layout-generator",
    title: "Responsive Layout Generator",
    description: "Generate responsive CSS/Tailwind layouts with mobile-first approach and proper breakpoints.",
    category: "Design & UX",
    categorySlug: "design-ux",
    prompt: `You are a frontend specialist focusing on responsive design. Create a responsive layout.

**Layout description:** {{layout}}
**Framework:** {{framework}}
**Breakpoints needed:** {{breakpoints}}
**Content types:** {{content}}

Provide:

1. **Mobile Layout** (320px-768px)
   - Single column structure
   - Touch-friendly spacing
   - Collapsible navigation

2. **Tablet Layout** (768px-1024px)
   - Adapted grid
   - Sidebar behavior

3. **Desktop Layout** (1024px+)
   - Full grid implementation
   - Hover states
   - Fixed elements

4. **Code** (HTML + CSS/Tailwind)
   - Semantic HTML structure
   - Complete responsive styles
   - Container queries if applicable
   - CSS Grid + Flexbox combination

5. **Testing Checklist**
   - Key breakpoints to verify
   - Common device sizes
   - Landscape orientation handling`,
    tags: ["responsive", "css", "tailwind", "layout", "mobile-first"],
    recommendedModel: "Claude Sonnet 4",
    modelIcon: "anthropic",
    useCases: [
      "Building responsive pages",
      "Converting designs to code",
      "Mobile optimization",
    ],
    variables: [
      { name: "layout", description: "Describe the layout structure" },
      { name: "framework", description: "Tailwind, plain CSS, Bootstrap" },
      { name: "breakpoints", description: "Mobile, tablet, desktop, widescreen" },
      { name: "content", description: "Text, images, cards, tables, forms" },
    ],
    saves: 145,
    difficulty: "Intermediate",
    createdAt: "2025-02-09",
  },

  // Education
  {
    slug: "lesson-plan-creator",
    title: "Interactive Lesson Plan Creator",
    description: "Design engaging lesson plans with learning objectives, activities, assessments, and differentiation strategies.",
    category: "Education",
    categorySlug: "education",
    prompt: `You are an experienced instructional designer. Create a comprehensive lesson plan.

**Subject:** {{subject}}
**Topic:** {{topic}}
**Grade/Level:** {{level}}
**Duration:** {{duration}}
**Learning Style Focus:** {{style}}

Deliver:

1. **Learning Objectives** (3-5, using Bloom's Taxonomy)
   - Knowledge, Comprehension, Application, Analysis, Synthesis, Evaluation

2. **Lesson Structure**
   - Hook/Warm-up (5 min)
   - Direct instruction (15 min)
   - Guided practice (15 min)
   - Independent practice (10 min)
   - Closure/Assessment (5 min)

3. **Activities**
   - Main activity with step-by-step instructions
   - Alternative activity for different learning styles
   - Extension activity for advanced learners

4. **Assessment**
   - Formative assessment questions
   - Exit ticket
   - Rubric for main activity

5. **Differentiation**
   - Scaffolding for struggling learners
   - Extensions for advanced learners
   - ELL modifications

6. **Materials & Resources** needed`,
    tags: ["lesson-plan", "teaching", "curriculum", "education"],
    recommendedModel: "Claude Sonnet 4",
    modelIcon: "anthropic",
    useCases: [
      "Creating lesson plans",
      "Curriculum development",
      "Training program design",
    ],
    variables: [
      { name: "subject", description: "Subject area" },
      { name: "topic", description: "Specific topic" },
      { name: "level", description: "Grade level or audience level" },
      { name: "duration", description: "Class duration" },
      { name: "style", description: "Visual, auditory, kinesthetic, mixed" },
    ],
    saves: 189,
    difficulty: "Intermediate",
    createdAt: "2025-01-19",
  },
  {
    slug: "socratic-tutor",
    title: "Socratic Method Tutor",
    description: "Learn any concept through guided questioning that builds deep understanding instead of memorization.",
    category: "Education",
    categorySlug: "education",
    prompt: `You are a Socratic tutor. Your role is to help me deeply understand a concept through questioning, NOT by giving direct answers.

**Subject:** {{subject}}
**Topic I want to learn:** {{topic}}
**My current understanding:** {{current_level}}

Rules:
1. NEVER give the answer directly
2. Ask ONE question at a time
3. Start with what I already know
4. Guide me to discover the answer myself
5. If I'm stuck, give a small hint, not the answer
6. Celebrate when I make connections
7. Build complexity gradually
8. Connect new concepts to things I already understand
9. Use analogies and real-world examples
10. After I understand, ask me to explain it back in my own words

Start by asking me what I already know about {{topic}}, then guide me from there. If I give an incorrect answer, don't say "wrong" — instead, ask a question that reveals the flaw in my reasoning.`,
    tags: ["socratic-method", "tutoring", "learning", "critical-thinking"],
    recommendedModel: "Claude Opus 4",
    modelIcon: "anthropic",
    useCases: [
      "Deep learning of new concepts",
      "Preparing for exams",
      "Building critical thinking skills",
    ],
    variables: [
      { name: "subject", description: "The subject area" },
      { name: "topic", description: "The specific topic to learn" },
      { name: "current_level", description: "What you already know" },
    ],
    references: [
      { title: "Socratic Method in AI Tutoring", url: "https://en.wikipedia.org/wiki/Socratic_method" },
    ],
    saves: 445,
    difficulty: "Beginner",
    createdAt: "2025-01-08",
  },
  {
    slug: "concept-explainer",
    title: "Multi-Level Concept Explainer",
    description: "Understand any concept explained at multiple levels of complexity, from ELI5 to expert.",
    category: "Education",
    categorySlug: "education",
    prompt: `Explain the following concept at multiple levels of complexity.

**Concept:** {{concept}}
**Field:** {{field}}

Provide explanations at these levels:

1. **ELI5 (Explain Like I'm 5)** - Simple analogy, no jargon
2. **High School Student** - Basic technical terms, real-world examples
3. **College Student** - Formal definitions, theoretical framework
4. **Professional** - Industry context, practical applications, trade-offs
5. **Expert** - Cutting-edge developments, open problems, research frontiers

For each level:
- Use an appropriate analogy
- Include a concrete example
- Highlight what's new at this level vs. the previous one

End with:
- Common misconceptions about this concept
- How it connects to 3 related concepts
- Resources for further learning at each level`,
    tags: ["explanation", "learning", "teaching", "concepts"],
    recommendedModel: "Claude Sonnet 4",
    modelIcon: "anthropic",
    useCases: [
      "Learning new concepts",
      "Teaching at different levels",
      "Content creation",
    ],
    variables: [
      { name: "concept", description: "The concept to explain" },
      { name: "field", description: "The field or domain" },
    ],
    saves: 356,
    difficulty: "Beginner",
    createdAt: "2025-01-11",
  },

  // Product Management
  {
    slug: "prd-generator",
    title: "Product Requirements Document (PRD)",
    description: "Generate comprehensive PRDs with user stories, acceptance criteria, technical requirements, and success metrics.",
    category: "Product Management",
    categorySlug: "product-management",
    prompt: `You are a senior product manager at a top tech company. Write a comprehensive PRD.

**Feature/Product:** {{feature}}
**Problem Statement:** {{problem}}
**Target Users:** {{users}}
**Business Context:** {{context}}

Produce:

1. **Overview**
   - Problem statement
   - Proposed solution
   - Success metrics (SMART goals)
   - Non-goals (explicitly out of scope)

2. **User Stories** (5-10)
   - As a [user type], I want [action] so that [benefit]
   - Acceptance criteria for each (Given/When/Then)
   - Priority: P0/P1/P2

3. **Functional Requirements**
   - Detailed feature specifications
   - User flows with decision points
   - Edge cases and error states

4. **Technical Requirements**
   - Architecture considerations
   - API requirements
   - Data model changes
   - Performance requirements
   - Security requirements

5. **Design Requirements**
   - Wireframe descriptions
   - Key screens and states
   - Accessibility requirements

6. **Launch Plan**
   - Feature flag strategy
   - Rollout phases
   - Rollback plan
   - Monitoring and alerts`,
    tags: ["prd", "product-management", "requirements", "user-stories"],
    recommendedModel: "Claude Opus 4",
    modelIcon: "anthropic",
    useCases: [
      "Writing product specs",
      "Feature planning",
      "Stakeholder alignment",
    ],
    variables: [
      { name: "feature", description: "Feature or product name" },
      { name: "problem", description: "What problem does this solve" },
      { name: "users", description: "Who benefits from this" },
      { name: "context", description: "Business goals, constraints, timeline" },
    ],
    saves: 389,
    difficulty: "Intermediate",
    createdAt: "2025-01-13",
  },
  {
    slug: "user-interview-script",
    title: "User Interview Script Generator",
    description: "Create structured user interview scripts that uncover real insights without leading questions.",
    category: "Product Management",
    categorySlug: "product-management",
    prompt: `You are a UX researcher expert in qualitative research methods. Create an interview script.

**Research Goal:** {{goal}}
**Target Users:** {{users}}
**Product Area:** {{product}}
**Interview Duration:** {{duration}}

Create:

1. **Introduction Script** (2 min)
   - Warm-up and rapport building
   - Consent and recording permission
   - Set expectations

2. **Warm-up Questions** (3 min)
   - Background and context
   - Current workflow

3. **Core Questions** (20 min)
   - 8-10 open-ended questions
   - Follow-up probes for each
   - "Tell me about a time..." prompts
   - Avoid leading questions

4. **Concept Testing** (if applicable, 10 min)
   - Task scenarios
   - Think-aloud prompts
   - Satisfaction scale questions

5. **Wrap-up** (5 min)
   - Summary and clarification
   - "Anything else?" prompt
   - Thank you and next steps

Include:
- Questions to AVOID (with explanations why)
- Note-taking template
- Analysis framework for synthesizing results`,
    tags: ["user-research", "interviews", "qualitative", "ux-research"],
    recommendedModel: "Claude Sonnet 4",
    modelIcon: "anthropic",
    useCases: [
      "Conducting user research",
      "Product discovery",
      "Validating assumptions",
    ],
    variables: [
      { name: "goal", description: "What you want to learn" },
      { name: "users", description: "Who you're interviewing" },
      { name: "product", description: "Product or feature area" },
      { name: "duration", description: "Interview length" },
    ],
    saves: 167,
    difficulty: "Intermediate",
    createdAt: "2025-02-11",
  },
  {
    slug: "feature-prioritization",
    title: "Feature Prioritization Framework",
    description: "Prioritize features using RICE, MoSCoW, and impact-effort matrices with stakeholder alignment.",
    category: "Product Management",
    categorySlug: "product-management",
    prompt: `You are a product strategy consultant. Help prioritize the following features.

**Product:** {{product}}
**Features to prioritize:**
{{features}}

**Business goals:** {{goals}}
**Team capacity:** {{capacity}}
**Timeline:** {{timeline}}

Apply these frameworks:

1. **RICE Score** for each feature:
   - Reach: How many users affected per quarter
   - Impact: How much it moves the needle (0.25-3x)
   - Confidence: How sure are we (0-100%)
   - Effort: Person-months needed
   - Final RICE = (R × I × C) / E

2. **MoSCoW Classification**
   - Must have / Should have / Could have / Won't have

3. **Impact-Effort Matrix**
   - Plot each feature
   - Identify quick wins, big bets, fill-ins, time sinks

4. **Recommendation**
   - Prioritized roadmap for the timeline
   - Dependencies between features
   - What to cut and why
   - Risks of each ordering`,
    tags: ["prioritization", "roadmap", "rice", "product-strategy"],
    recommendedModel: "Claude Sonnet 4",
    modelIcon: "anthropic",
    useCases: [
      "Quarterly planning",
      "Roadmap creation",
      "Stakeholder discussions",
    ],
    variables: [
      { name: "product", description: "Product name" },
      { name: "features", description: "List of features to prioritize" },
      { name: "goals", description: "Business objectives" },
      { name: "capacity", description: "Team size and availability" },
      { name: "timeline", description: "Planning horizon" },
    ],
    saves: 234,
    difficulty: "Intermediate",
    createdAt: "2025-01-26",
  },

  // Research
  {
    slug: "literature-review-assistant",
    title: "Literature Review Assistant",
    description: "Conduct structured literature reviews with synthesis, gap analysis, and research direction suggestions.",
    category: "Research",
    categorySlug: "research",
    prompt: `You are an academic research assistant. Help me conduct a literature review.

**Research Topic:** {{topic}}
**Field:** {{field}}
**Scope:** {{scope}}
**Known papers/sources:** {{known_sources}}

Provide:

1. **Research Landscape Overview**
   - Key themes and sub-topics
   - Major schools of thought
   - Timeline of development

2. **Key Findings Synthesis**
   - Common findings across studies
   - Conflicting findings and why
   - Methodological approaches used

3. **Gap Analysis**
   - What hasn't been studied
   - Methodological gaps
   - Population/context gaps

4. **Critical Analysis Framework**
   - Strengths of existing research
   - Limitations and biases
   - Quality assessment criteria

5. **Research Directions**
   - Promising future research questions
   - Methodological suggestions
   - Interdisciplinary opportunities

6. **Citation Organization**
   - Suggested categories for organizing sources
   - Key authors to follow
   - Recommended search queries for databases`,
    tags: ["literature-review", "academic", "research", "synthesis"],
    recommendedModel: "Claude Opus 4",
    modelIcon: "anthropic",
    useCases: [
      "Academic research",
      "Thesis writing",
      "Research proposals",
    ],
    variables: [
      { name: "topic", description: "Research topic" },
      { name: "field", description: "Academic field" },
      { name: "scope", description: "Time range, geographic focus" },
      { name: "known_sources", description: "Papers you've already found" },
    ],
    saves: 234,
    difficulty: "Advanced",
    createdAt: "2025-01-17",
  },
  {
    slug: "research-paper-analyzer",
    title: "Research Paper Analyzer",
    description: "Analyze research papers critically, evaluating methodology, findings, and implications.",
    category: "Research",
    categorySlug: "research",
    prompt: `You are a critical research analyst. Analyze this research paper/study.

**Paper/Study:** {{paper_details}}
**Field:** {{field}}
**Your goal:** {{goal}}

Provide:

1. **Summary**
   - Research question
   - Methodology
   - Key findings
   - Conclusions

2. **Methodology Critique**
   - Sample size adequacy
   - Control group design
   - Potential confounding variables
   - Statistical methods appropriateness
   - Reproducibility assessment

3. **Findings Analysis**
   - Effect sizes and practical significance
   - Statistical vs practical significance
   - Generalizability of results
   - Alternative interpretations

4. **Bias Assessment**
   - Selection bias
   - Publication bias
   - Funding source bias
   - Confirmation bias indicators

5. **Implications**
   - For the field
   - For practice/policy
   - For future research

6. **Quality Score** (1-10) with justification`,
    tags: ["research-analysis", "critical-thinking", "methodology", "academic"],
    recommendedModel: "Claude Opus 4",
    modelIcon: "anthropic",
    useCases: [
      "Evaluating research papers",
      "Journal club preparation",
      "Evidence-based decision making",
    ],
    variables: [
      { name: "paper_details", description: "Paper title, abstract, or key details" },
      { name: "field", description: "Research field" },
      { name: "goal", description: "Why you're analyzing this paper" },
    ],
    saves: 178,
    difficulty: "Advanced",
    createdAt: "2025-02-01",
  },
  {
    slug: "competitive-analysis",
    title: "Competitive Analysis Framework",
    description: "Conduct thorough competitive analysis with market positioning, feature comparison, and strategic recommendations.",
    category: "Research",
    categorySlug: "research",
    prompt: `You are a strategy consultant. Conduct a competitive analysis.

**Your Product/Company:** {{company}}
**Industry:** {{industry}}
**Key Competitors:** {{competitors}}
**Analysis Goal:** {{goal}}

Deliver:

1. **Market Overview**
   - Market size and growth
   - Key trends
   - Regulatory factors

2. **Competitor Profiles** (for each)
   - Value proposition
   - Target market
   - Pricing model
   - Strengths and weaknesses
   - Recent moves/announcements

3. **Feature Comparison Matrix**
   - Key features side by side
   - Scoring (1-5) per feature
   - Gaps and opportunities

4. **Positioning Map**
   - 2x2 matrix (suggest best axes)
   - Where each competitor sits
   - White space opportunities

5. **Strategic Recommendations**
   - Differentiation opportunities
   - Features to build
   - Markets to enter/avoid
   - Pricing strategy suggestions
   - Partnership opportunities

6. **Monitoring Plan**
   - What to track
   - How often
   - Alert triggers`,
    tags: ["competitive-analysis", "market-research", "strategy", "business"],
    recommendedModel: "Claude Opus 4",
    modelIcon: "anthropic",
    useCases: [
      "Strategic planning",
      "Market entry decisions",
      "Product positioning",
    ],
    variables: [
      { name: "company", description: "Your company/product" },
      { name: "industry", description: "Industry or market" },
      { name: "competitors", description: "List of competitors to analyze" },
      { name: "goal", description: "What decision this analysis supports" },
    ],
    saves: 267,
    difficulty: "Intermediate",
    createdAt: "2025-01-24",
  },
];

export function getPromptBySlug(slug: string): Prompt | undefined {
  return prompts.find((p) => p.slug === slug);
}

export function getPromptsByCategory(categorySlug: string): Prompt[] {
  return prompts.filter((p) => p.categorySlug === categorySlug);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getFeaturedPrompts(): Prompt[] {
  return [...prompts].sort((a, b) => b.saves - a.saves).slice(0, 6);
}

export function searchPrompts(query: string): Prompt[] {
  const q = query.toLowerCase();
  return prompts.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tags.some((t) => t.includes(q)) ||
      p.category.toLowerCase().includes(q)
  );
}

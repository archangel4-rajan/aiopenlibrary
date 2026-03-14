import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, ArrowRight } from "lucide-react";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Prompt Writing Guide — How to Write Better AI Prompts",
  description:
    "Learn how to write effective AI prompts. Covers specificity, variables, context, output formatting, iteration, and more. A practical guide for ChatGPT, Claude, and Gemini.",
  alternates: { canonical: "https://aiopenlibrary.com/guides/prompt-writing" },
};

const sections = [
  {
    id: "be-specific",
    title: "1. Be Specific and Direct",
    content: `The single most impactful improvement you can make to any prompt is being more specific. Vague instructions produce vague results.

Instead of asking "Help me write an email," tell the AI exactly what you need: the recipient, tone, purpose, and any constraints. The more detail you give, the less the model has to guess — and the better your output will be.`,
    bad: "Write a marketing email.",
    good: `Write a marketing email for our SaaS product launch. The audience is existing free-tier users. Tone: professional but excited. Include a clear CTA to upgrade. Keep it under 200 words.`,
  },
  {
    id: "use-variables",
    title: "2. Use Variables for Reusable Prompts",
    content: `Variables turn a one-time prompt into a reusable template. Wrap dynamic parts in double curly braces like {{variable_name}} so you can swap in different values each time you use the prompt.

This is especially powerful for prompts you use repeatedly — code reviews, content generation, analysis tasks. Write the prompt once, customize it endlessly.`,
    bad: "Review my Python code for bugs.",
    good: `Review the following {{language}} code for:
- Bugs and logical errors
- Performance issues
- Security vulnerabilities
- Adherence to {{style_guide}} conventions

Code:
\`\`\`
{{code}}
\`\`\`

Provide specific line-by-line feedback with suggested fixes.`,
  },
  {
    id: "provide-context",
    title: "3. Provide Context and Role",
    content: `AI models perform dramatically better when you set the scene. Tell the model who it is, who the audience is, and what the broader context looks like.

A "system prompt" or role instruction at the beginning of your prompt anchors the model's perspective. This leads to more consistent, domain-appropriate responses.`,
    bad: "Explain Kubernetes.",
    good: `You are a senior DevOps engineer teaching a workshop to developers who have experience with Docker but are new to orchestration.

Explain Kubernetes in practical terms: what it solves, when to use it, and a simple mental model for pods, services, and deployments. Use analogies where helpful. Avoid jargon that assumes prior K8s knowledge.`,
  },
  {
    id: "output-format",
    title: "4. Specify the Output Format",
    content: `Don't leave the format to chance. If you need JSON, say so. If you need a bullet list, a table, or a specific structure — describe it explicitly.

You can even provide an example of the exact output structure you want. Models are excellent at pattern-matching, so a single example often eliminates ambiguity entirely.`,
    bad: "List some project management tools and their features.",
    good: `Compare the top 5 project management tools for small engineering teams.

Return the result as a markdown table with these columns:
| Tool | Best For | Pricing | Key Feature | Limitation |

After the table, add a one-paragraph recommendation for a team of 8 developers working on a SaaS product.`,
  },
  {
    id: "iterate",
    title: "5. Iterate and Refine",
    content: `Great prompts are rarely written in one pass. Treat prompt engineering like writing code: start with a draft, test it, observe the output, and refine.

Common iteration patterns include:
- Adding constraints when the output is too broad
- Removing instructions when the output is too rigid
- Adding examples when the model misunderstands the format
- Splitting complex prompts into sequential steps

Save your best versions. That's exactly what AIOpenLibrary is for — a library of tested, refined prompts you can build on.`,
    bad: "This prompt didn't work, forget it.",
    good: `Take your underperforming prompt, identify what went wrong, and adjust one thing at a time. Track what changed and why. Over a few iterations, you'll converge on something reliable.`,
  },
  {
    id: "chain-prompts",
    title: "6. Chain Prompts for Complex Tasks",
    content: `For complex tasks, break them into a sequence of focused prompts rather than one massive prompt. Each step's output feeds into the next.

This approach — called prompt chaining — gives you more control, makes debugging easier, and often produces higher-quality results than a single monolithic prompt.`,
    bad: "Write a complete business plan for my startup.",
    good: `Step 1: "Analyze the market for {{industry}} and identify the top 3 opportunities."
Step 2: "Given these opportunities, draft a value proposition for {{product}}."
Step 3: "Create a go-to-market strategy based on this value proposition."
Step 4: "Write an executive summary combining all of the above."`,
  },
];

export default function PromptWritingGuidePage() {
  return (
    <div className="bg-stone-50 dark:bg-stone-950">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-20 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-stone-200 bg-stone-50 text-stone-600 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-400">
            <BookOpen className="h-5 w-5" />
          </div>
          <h1 className="mt-6 text-4xl font-bold text-stone-900 dark:text-stone-100 sm:text-5xl">
            How to Write Better AI Prompts
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-stone-500 dark:text-stone-300">
            A practical guide to prompt engineering. These techniques work across
            ChatGPT, Claude, Gemini, and any other LLM.
          </p>
        </div>

        {/* Table of Contents */}
        <nav className="mt-12 rounded-lg border border-stone-200 bg-stone-50 p-6 dark:border-stone-700 dark:bg-stone-800">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
            In this guide
          </h2>
          <ol className="mt-4 space-y-2">
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="text-sm text-stone-600 hover:text-stone-900 dark:text-stone-300 dark:hover:text-stone-100"
                >
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* Sections */}
        <div className="mt-12 space-y-16">
          {sections.map((s) => (
            <section key={s.id} id={s.id}>
              <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                {s.title}
              </h2>
              <div className="mt-4 space-y-4 text-base leading-relaxed text-stone-600 dark:text-stone-300">
                {s.content.split("\n\n").map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-red-200 bg-red-50/50 p-4 dark:border-red-900 dark:bg-red-900/10">
                  <p className="text-xs font-semibold uppercase tracking-wide text-red-500 dark:text-red-400">
                    Weak prompt
                  </p>
                  <pre className="mt-2 whitespace-pre-wrap font-mono text-xs leading-relaxed text-red-700 dark:text-red-300">
                    {s.bad}
                  </pre>
                </div>
                <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-900 dark:bg-emerald-900/10">
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-500 dark:text-emerald-400">
                    Strong prompt
                  </p>
                  <pre className="mt-2 whitespace-pre-wrap font-mono text-xs leading-relaxed text-emerald-700 dark:text-emerald-300">
                    {s.good}
                  </pre>
                </div>
              </div>
            </section>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 rounded-lg border border-stone-200 bg-stone-50 p-8 text-center dark:border-stone-700 dark:bg-stone-800">
          <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
            Ready to explore real prompts?
          </h2>
          <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
            Browse 113+ tested prompts that put these principles into practice.
          </p>
          <Link
            href="/categories"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-stone-900 px-6 py-3 text-sm font-medium text-white hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-50"
          >
            Browse the Library
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  BarChart3,
  Users,
  Eye,
  Search,
  Activity,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Clock,
  RefreshCw,
  MousePointerClick,
  BookmarkPlus,
  ThumbsUp,
  Globe,
  Shield,
  ChevronRight,
} from "lucide-react";

// --- Types ---

interface OverviewData {
  total_events: number;
  unique_users: number;
  unique_sessions: number;
  events_by_type: Record<string, number>;
  events_by_day: Array<{ date: string; count: number }>;
  days: number;
}

interface PromptsData {
  prompts: Array<{ resource_id: string; count: number }>;
  event_type: string;
  days: number;
}

interface SearchesData {
  top_searches: Array<{ query: string; count: number }>;
  zero_result_searches: Array<{ query: string; count: number }>;
  days: number;
}

interface EventRecord {
  id: string;
  event_type: string;
  user_id: string | null;
  session_id: string | null;
  resource_type: string | null;
  resource_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

interface EventsData {
  events: EventRecord[];
  total: number;
  limit: number;
  offset: number;
  days: number;
}

// --- Constants ---

const EVENT_CONFIG: Record<
  string,
  { label: string; color: string; bgColor: string; icon: React.ReactNode }
> = {
  "prompt.view": {
    label: "Views",
    color: "text-blue-500",
    bgColor: "bg-blue-500",
    icon: <Eye className="h-3 w-3" />,
  },
  "prompt.copy": {
    label: "Copies",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500",
    icon: <MousePointerClick className="h-3 w-3" />,
  },
  "prompt.save": {
    label: "Saves",
    color: "text-amber-500",
    bgColor: "bg-amber-500",
    icon: <BookmarkPlus className="h-3 w-3" />,
  },
  "prompt.unsave": {
    label: "Unsaves",
    color: "text-stone-400",
    bgColor: "bg-stone-400",
    icon: <BookmarkPlus className="h-3 w-3" />,
  },
  "prompt.vote": {
    label: "Votes",
    color: "text-purple-500",
    bgColor: "bg-purple-500",
    icon: <ThumbsUp className="h-3 w-3" />,
  },
  search: {
    label: "Searches",
    color: "text-cyan-500",
    bgColor: "bg-cyan-500",
    icon: <Search className="h-3 w-3" />,
  },
  "page.view": {
    label: "Page Views",
    color: "text-indigo-500",
    bgColor: "bg-indigo-500",
    icon: <Globe className="h-3 w-3" />,
  },
};

const TIME_RANGES = [
  { label: "7d", days: 7 },
  { label: "14d", days: 14 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
] as const;

const PROMPT_TABS = [
  { label: "Views", eventType: "prompt.view" },
  { label: "Copies", eventType: "prompt.copy" },
  { label: "Saves", eventType: "prompt.save" },
] as const;

// --- Helpers ---

function formatNumber(n: number): string {
  return n.toLocaleString();
}

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffSec = Math.floor((now - then) / 1000);
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// --- Skeleton Components ---

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-700 dark:bg-stone-800">
      <div className="mb-3 h-4 w-24 rounded bg-stone-200 dark:bg-stone-700" />
      <div className="mb-2 h-8 w-16 rounded bg-stone-200 dark:bg-stone-700" />
      <div className="h-3 w-20 rounded bg-stone-200 dark:bg-stone-700" />
    </div>
  );
}

function SkeletonChart() {
  return (
    <div className="animate-pulse rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-700 dark:bg-stone-800">
      <div className="mb-4 h-5 w-32 rounded bg-stone-200 dark:bg-stone-700" />
      <div className="flex h-48 items-end gap-1">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 rounded-t bg-stone-200 dark:bg-stone-700"
            style={{ height: `${20 + Math.random() * 80}%` }}
          />
        ))}
      </div>
    </div>
  );
}

function SkeletonTable() {
  return (
    <div className="animate-pulse rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-700 dark:bg-stone-800">
      <div className="mb-4 h-5 w-32 rounded bg-stone-200 dark:bg-stone-700" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="mb-3 h-8 rounded bg-stone-200 dark:bg-stone-700"
        />
      ))}
    </div>
  );
}

// --- Main Component ---

export default function AnalyticsPage() {
  const [days, setDays] = useState(30);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [prompts, setPrompts] = useState<PromptsData | null>(null);
  const [searches, setSearches] = useState<SearchesData | null>(null);
  const [events, setEvents] = useState<EventsData | null>(null);
  const [promptTab, setPromptTab] = useState<string>("prompt.view");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshingEvents, setRefreshingEvents] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewRes, promptsRes, searchesRes, eventsRes] =
        await Promise.all([
          fetch(`/api/admin/analytics/overview?days=${days}`),
          fetch(
            `/api/admin/analytics/prompts?event_type=${promptTab}&limit=10&days=${days}`,
          ),
          fetch(`/api/admin/analytics/searches?limit=20&days=${days}`),
          fetch(`/api/admin/analytics/events?limit=20&days=${days}`),
        ]);

      if (
        !overviewRes.ok ||
        !promptsRes.ok ||
        !searchesRes.ok ||
        !eventsRes.ok
      ) {
        const failedRes = [overviewRes, promptsRes, searchesRes, eventsRes].find(
          (r) => !r.ok,
        );
        if (failedRes?.status === 403) {
          setError("Access denied. Admin privileges required.");
        } else if (failedRes?.status === 401) {
          setError("Not authenticated. Please sign in.");
        } else {
          setError("Failed to load analytics data. Please try again.");
        }
        setLoading(false);
        return;
      }

      const [overviewData, promptsData, searchesData, eventsData] =
        await Promise.all([
          overviewRes.json() as Promise<OverviewData>,
          promptsRes.json() as Promise<PromptsData>,
          searchesRes.json() as Promise<SearchesData>,
          eventsRes.json() as Promise<EventsData>,
        ]);

      setOverview(overviewData);
      setPrompts(promptsData);
      setSearches(searchesData);
      setEvents(eventsData);
    } catch {
      setError("Network error. Please check your connection.");
    }
    setLoading(false);
  }, [days, promptTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refreshEvents = async () => {
    setRefreshingEvents(true);
    try {
      const res = await fetch(
        `/api/admin/analytics/events?limit=20&days=${days}`,
      );
      if (res.ok) {
        const data = (await res.json()) as EventsData;
        setEvents(data);
      }
    } catch {
      // silently fail for refresh
    }
    setRefreshingEvents(false);
  };

  const fetchPrompts = useCallback(
    async (eventType: string) => {
      try {
        const res = await fetch(
          `/api/admin/analytics/prompts?event_type=${eventType}&limit=10&days=${days}`,
        );
        if (res.ok) {
          const data = (await res.json()) as PromptsData;
          setPrompts(data);
        }
      } catch {
        // silently fail
      }
    },
    [days],
  );

  const handlePromptTabChange = (eventType: string) => {
    setPromptTab(eventType);
    fetchPrompts(eventType);
  };

  // Derived values
  const eventsToday =
    overview?.events_by_day.length
      ? overview.events_by_day[overview.events_by_day.length - 1]?.count ?? 0
      : 0;
  const dailyAvg =
    overview && overview.days > 0
      ? Math.round(overview.total_events / overview.days)
      : 0;

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* Breadcrumb & Header */}
        <div className="mb-8">
          <nav className="mb-4 flex items-center gap-1.5 text-sm text-stone-500 dark:text-stone-400">
            <Link
              href="/admin"
              className="hover:text-stone-700 dark:hover:text-stone-300"
            >
              Admin
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-stone-900 dark:text-stone-100">
              Analytics
            </span>
          </nav>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-6 w-6 text-stone-600 dark:text-stone-400" />
              <div>
                <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                  Analytics
                </h1>
                <p className="text-sm text-stone-500 dark:text-stone-400">
                  User activity and engagement metrics
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/admin"
                className="mr-2 text-sm text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-300"
              >
                ← Back
              </Link>
              <div className="flex rounded-lg border border-stone-200 dark:border-stone-700">
                {TIME_RANGES.map((range) => (
                  <button
                    key={range.days}
                    onClick={() => setDays(range.days)}
                    className={`px-3 py-1.5 text-sm font-medium transition-colors first:rounded-l-lg last:rounded-r-lg ${
                      days === range.days
                        ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900"
                        : "text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800"
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-8 rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-950">
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <button
              onClick={fetchData}
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-red-100 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </button>
          </div>
        )}

        {/* Row 1 — KPI Cards */}
        {loading ? (
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : overview ? (
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KPICard
              title="Total Events"
              value={formatNumber(overview.total_events)}
              subtitle={`${formatNumber(dailyAvg)} daily avg`}
              icon={<Activity className="h-5 w-5" />}
              trend={overview.total_events > 0}
            />
            <KPICard
              title="Unique Users"
              value={formatNumber(overview.unique_users)}
              subtitle="Authenticated"
              icon={<Users className="h-5 w-5" />}
              trend={overview.unique_users > 0}
            />
            <KPICard
              title="Unique Sessions"
              value={formatNumber(overview.unique_sessions)}
              subtitle="Incl. anonymous"
              icon={<Globe className="h-5 w-5" />}
              trend={overview.unique_sessions > 0}
            />
            <KPICard
              title="Events Today"
              value={formatNumber(eventsToday)}
              subtitle={
                dailyAvg > 0
                  ? eventsToday >= dailyAvg
                    ? "Above average"
                    : "Below average"
                  : "No baseline"
              }
              icon={<TrendingUp className="h-5 w-5" />}
              trend={eventsToday >= dailyAvg}
            />
          </div>
        ) : null}

        {/* Row 2 — Activity Chart */}
        {loading ? (
          <div className="mb-8">
            <SkeletonChart />
          </div>
        ) : overview ? (
          <div className="mb-8">
            <ActivityChart data={overview.events_by_day} />
          </div>
        ) : null}

        {/* Row 3 — Event Types + Top Prompts */}
        <div className="mb-8 grid gap-8 lg:grid-cols-2">
          {loading ? (
            <>
              <SkeletonTable />
              <SkeletonTable />
            </>
          ) : (
            <>
              {overview && (
                <EventTypeBreakdown eventsByType={overview.events_by_type} />
              )}
              {prompts && (
                <TopPrompts
                  data={prompts}
                  activeTab={promptTab}
                  onTabChange={handlePromptTabChange}
                />
              )}
            </>
          )}
        </div>

        {/* Row 4 — Searches */}
        <div className="mb-8 grid gap-8 lg:grid-cols-2">
          {loading ? (
            <>
              <SkeletonTable />
              <SkeletonTable />
            </>
          ) : searches ? (
            <>
              <TopSearches data={searches.top_searches} />
              <ZeroResultSearches data={searches.zero_result_searches} />
            </>
          ) : null}
        </div>

        {/* Row 5 — Live Event Feed */}
        {loading ? (
          <SkeletonTable />
        ) : events ? (
          <EventFeed
            data={events}
            onRefresh={refreshEvents}
            refreshing={refreshingEvents}
          />
        ) : null}
      </div>
    </div>
  );
}

// --- KPI Card ---

function KPICard({
  title,
  value,
  subtitle,
  icon,
  trend,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  trend: boolean;
}) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-700 dark:bg-stone-800">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-medium text-stone-500 dark:text-stone-400">
          {title}
        </p>
        <span className="text-stone-400 dark:text-stone-500">{icon}</span>
      </div>
      <p className="text-3xl font-bold text-stone-900 dark:text-stone-100">
        {value}
      </p>
      <div className="mt-1 flex items-center gap-1">
        {trend ? (
          <TrendingUp className="h-3 w-3 text-emerald-500" />
        ) : (
          <TrendingDown className="h-3 w-3 text-stone-400" />
        )}
        <p className="text-xs text-stone-500 dark:text-stone-400">{subtitle}</p>
      </div>
    </div>
  );
}

// --- Activity Chart ---

function ActivityChart({ data }: { data: Array<{ date: string; count: number }> }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const midIndex = Math.floor(data.length / 2);

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-700 dark:bg-stone-800">
      <div className="mb-4 flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-stone-500 dark:text-stone-400" />
        <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
          Daily Activity
        </h3>
      </div>
      <div className="relative overflow-x-auto">
        <div className="flex h-48 items-end gap-[2px]" style={{ minWidth: data.length > 30 ? `${data.length * 16}px` : "100%" }}>
          {data.map((day, i) => {
            const heightPct = (day.count / maxCount) * 100;
            return (
              <div
                key={day.date}
                className="group relative flex flex-1 flex-col items-center"
                style={{ minWidth: "12px" }}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {hoveredIndex === i && (
                  <div className="absolute -top-14 z-10 whitespace-nowrap rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs shadow-lg dark:border-stone-600 dark:bg-stone-700">
                    <p className="font-medium text-stone-900 dark:text-stone-100">
                      {formatDate(day.date)}
                    </p>
                    <p className="text-stone-500 dark:text-stone-400">
                      {formatNumber(day.count)} events
                    </p>
                  </div>
                )}
                <div
                  className="w-full rounded-t bg-blue-500 transition-all duration-300 hover:bg-blue-400 dark:bg-blue-600 dark:hover:bg-blue-500"
                  style={{
                    height: `${Math.max(heightPct, day.count > 0 ? 2 : 0)}%`,
                  }}
                />
              </div>
            );
          })}
        </div>
        {/* Date labels */}
        <div className="mt-2 flex justify-between text-xs text-stone-400 dark:text-stone-500">
          <span>{data.length > 0 ? formatDate(data[0].date) : ""}</span>
          <span>
            {data.length > 2 ? formatDate(data[midIndex].date) : ""}
          </span>
          <span>
            {data.length > 0 ? formatDate(data[data.length - 1].date) : ""}
          </span>
        </div>
      </div>
    </div>
  );
}

// --- Event Type Breakdown ---

function EventTypeBreakdown({
  eventsByType,
}: {
  eventsByType: Record<string, number>;
}) {
  const entries = Object.entries(eventsByType).sort(([, a], [, b]) => b - a);
  const maxCount = entries.length > 0 ? entries[0][1] : 1;

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-700 dark:bg-stone-800">
      <div className="mb-4 flex items-center gap-2">
        <Activity className="h-4 w-4 text-stone-500 dark:text-stone-400" />
        <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
          Event Type Breakdown
        </h3>
      </div>
      <div className="space-y-3">
        {entries.map(([type, count]) => {
          const config = EVENT_CONFIG[type];
          const widthPct = (count / maxCount) * 100;
          return (
            <div key={type}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5">
                  {config?.icon}
                  <span className={`font-medium ${config?.color ?? "text-stone-600 dark:text-stone-400"}`}>
                    {config?.label ?? type}
                  </span>
                </span>
                <span className="tabular-nums text-stone-600 dark:text-stone-400">
                  {formatNumber(count)}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-stone-100 dark:bg-stone-700">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${config?.bgColor ?? "bg-stone-500"}`}
                  style={{ width: `${widthPct}%` }}
                />
              </div>
            </div>
          );
        })}
        {entries.length === 0 && (
          <p className="py-4 text-center text-sm text-stone-400">
            No events recorded
          </p>
        )}
      </div>
    </div>
  );
}

// --- Top Prompts ---

function TopPrompts({
  data,
  activeTab,
  onTabChange,
}: {
  data: PromptsData;
  activeTab: string;
  onTabChange: (tab: string) => void;
}) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-700 dark:bg-stone-800">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ArrowUpRight className="h-4 w-4 text-stone-500 dark:text-stone-400" />
          <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
            Top Prompts
          </h3>
        </div>
        <div className="flex rounded-lg border border-stone-200 dark:border-stone-700">
          {PROMPT_TABS.map((tab) => (
            <button
              key={tab.eventType}
              onClick={() => onTabChange(tab.eventType)}
              className={`px-2.5 py-1 text-xs font-medium transition-colors first:rounded-l-lg last:rounded-r-lg ${
                activeTab === tab.eventType
                  ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900"
                  : "text-stone-500 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-100 dark:border-stone-700">
              <th className="pb-2 pr-4 text-left text-xs font-medium text-stone-500 dark:text-stone-400">
                #
              </th>
              <th className="pb-2 pr-4 text-left text-xs font-medium text-stone-500 dark:text-stone-400">
                Prompt
              </th>
              <th className="pb-2 text-right text-xs font-medium text-stone-500 dark:text-stone-400">
                {PROMPT_TABS.find((t) => t.eventType === activeTab)?.label ??
                  "Count"}
              </th>
            </tr>
          </thead>
          <tbody>
            {data.prompts.map((p, i) => (
              <tr
                key={p.resource_id}
                className="border-b border-stone-50 dark:border-stone-700/50"
              >
                <td className="py-2 pr-4 text-stone-400 dark:text-stone-500">
                  {i + 1}
                </td>
                <td className="py-2 pr-4">
                  <Link
                    href={`/prompts/${p.resource_id}`}
                    className="font-medium text-stone-700 hover:text-blue-600 dark:text-stone-300 dark:hover:text-blue-400"
                  >
                    {p.resource_id}
                  </Link>
                </td>
                <td className="py-2 text-right tabular-nums text-stone-600 dark:text-stone-400">
                  {formatNumber(p.count)}
                </td>
              </tr>
            ))}
            {data.prompts.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="py-4 text-center text-stone-400"
                >
                  No data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- Top Searches ---

function TopSearches({ data }: { data: Array<{ query: string; count: number }> }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-700 dark:bg-stone-800">
      <div className="mb-4 flex items-center gap-2">
        <Search className="h-4 w-4 text-stone-500 dark:text-stone-400" />
        <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
          Top Searches
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-100 dark:border-stone-700">
              <th className="pb-2 pr-4 text-left text-xs font-medium text-stone-500 dark:text-stone-400">
                #
              </th>
              <th className="pb-2 pr-4 text-left text-xs font-medium text-stone-500 dark:text-stone-400">
                Query
              </th>
              <th className="pb-2 text-right text-xs font-medium text-stone-500 dark:text-stone-400">
                Count
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((s, i) => (
              <tr
                key={s.query}
                className="border-b border-stone-50 dark:border-stone-700/50"
              >
                <td className="py-2 pr-4 text-stone-400 dark:text-stone-500">
                  {i + 1}
                </td>
                <td className="py-2 pr-4 font-medium text-stone-700 dark:text-stone-300">
                  {s.query}
                </td>
                <td className="py-2 text-right tabular-nums text-stone-600 dark:text-stone-400">
                  {formatNumber(s.count)}
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="py-4 text-center text-stone-400"
                >
                  No search data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- Zero Result Searches ---

function ZeroResultSearches({
  data,
}: {
  data: Array<{ query: string; count: number }>;
}) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-700 dark:bg-stone-800">
      <div className="mb-4 flex items-center gap-2">
        <Search className="h-4 w-4 text-amber-500" />
        <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
          Zero-Result Searches
        </h3>
        <span className="ml-auto text-xs text-stone-400 dark:text-stone-500">
          Prompts to add?
        </span>
      </div>
      <div className="space-y-2">
        {data.map((s) => (
          <div
            key={s.query}
            className="flex items-center justify-between rounded-lg bg-amber-50 px-3 py-2 dark:bg-amber-950/30"
          >
            <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
              &ldquo;{s.query}&rdquo;
            </span>
            <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium tabular-nums text-amber-600 dark:bg-amber-900/50 dark:text-amber-400">
              {formatNumber(s.count)}x
            </span>
          </div>
        ))}
        {data.length === 0 && (
          <p className="py-4 text-center text-sm text-stone-400">
            No zero-result searches
          </p>
        )}
      </div>
    </div>
  );
}

// --- Event Feed ---

function EventFeed({
  data,
  onRefresh,
  refreshing,
}: {
  data: EventsData;
  onRefresh: () => void;
  refreshing: boolean;
}) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-700 dark:bg-stone-800">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-stone-500 dark:text-stone-400" />
          <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
            Recent Events
          </h3>
          <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-500 dark:bg-stone-700 dark:text-stone-400">
            {formatNumber(data.total)} total
          </span>
        </div>
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-50 disabled:opacity-50 dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-800"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-100 dark:border-stone-700">
              <th className="pb-2 pr-4 text-left text-xs font-medium text-stone-500 dark:text-stone-400">
                Time
              </th>
              <th className="pb-2 pr-4 text-left text-xs font-medium text-stone-500 dark:text-stone-400">
                Event
              </th>
              <th className="pb-2 pr-4 text-left text-xs font-medium text-stone-500 dark:text-stone-400">
                Resource
              </th>
              <th className="pb-2 text-left text-xs font-medium text-stone-500 dark:text-stone-400">
                User
              </th>
            </tr>
          </thead>
          <tbody>
            {data.events.map((event) => {
              const config = EVENT_CONFIG[event.event_type];
              return (
                <tr
                  key={event.id}
                  className="border-b border-stone-50 dark:border-stone-700/50"
                >
                  <td className="whitespace-nowrap py-2 pr-4 text-xs text-stone-400 dark:text-stone-500">
                    {relativeTime(event.created_at)}
                  </td>
                  <td className="py-2 pr-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                        config
                          ? `${config.bgColor}/10 ${config.color}`
                          : "bg-stone-100 text-stone-600 dark:bg-stone-700 dark:text-stone-400"
                      }`}
                    >
                      {config?.icon}
                      {config?.label ?? event.event_type}
                    </span>
                  </td>
                  <td className="max-w-[200px] truncate py-2 pr-4 text-xs text-stone-600 dark:text-stone-400">
                    {event.resource_id ?? "—"}
                  </td>
                  <td className="py-2 text-xs">
                    {event.user_id ? (
                      <span title="Authenticated user">🔒</span>
                    ) : (
                      <span title="Anonymous">👤</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {data.events.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="py-4 text-center text-stone-400"
                >
                  No recent events
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

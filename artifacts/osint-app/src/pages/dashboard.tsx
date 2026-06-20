import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link } from "wouter";
import {
  useListSearches,
  useGetSearchStats,
  useCreateSearch,
  useGetTrendingTopics,
} from "@workspace/api-client-react";
import { type SearchInputType } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search, Globe, User, Mail, Phone, Server, AlertCircle, Clock,
  Activity, ArrowRight, Shield, Zap, ChevronRight, ChevronUp,
  CheckCircle2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import SearchResultPanel from "@/components/SearchResultPanel";

const searchFormSchema = z.object({
  query: z.string().min(1, "Query is required"),
  type: z.enum(["domain", "ip", "username", "email", "phone", "discord", "breach"]),
});

type SearchFormValues = z.infer<typeof searchFormSchema>;

type SearchItem = {
  id: number;
  query: string;
  type: string;
  status: string;
  results: unknown;
  createdAt: string;
};

const TYPE_META: Record<string, { icon: React.ReactNode; label: string; placeholder: string }> = {
  domain:   { icon: <Globe className="w-4 h-4" />,  label: "Domain",     placeholder: "Enter domain to scan..." },
  ip:       { icon: <Server className="w-4 h-4" />, label: "IP Address", placeholder: "Enter IP address to scan..." },
  username: { icon: <User className="w-4 h-4" />,   label: "Username",   placeholder: "Enter username to scan..." },
  email:    { icon: <Mail className="w-4 h-4" />,   label: "Email",      placeholder: "Enter email address to scan..." },
  phone:    { icon: <Phone className="w-4 h-4" />,  label: "Phone",      placeholder: "Enter phone number to scan..." },
  discord:  { icon: <Zap className="w-4 h-4" />,   label: "Discord ID", placeholder: "Enter Discord user ID or username..." },
  breach:   { icon: <Shield className="w-4 h-4" />, label: "Data Breach",placeholder: "Enter email, username, or domain..." },
};

function StatusBadge({ status }: { status: string }) {
  if (status === "completed") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <CheckCircle2 className="w-3.5 h-3.5" />
        Completed
      </span>
    );
  }
  if (status === "pending") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
        <Clock className="w-3.5 h-3.5" />
        Pending
      </span>
    );
  }
  if (status === "failed") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
        <AlertCircle className="w-3.5 h-3.5" />
        Failed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary border border-primary/20">
      {status}
    </span>
  );
}

export default function Dashboard() {
  const [activeSearch, setActiveSearch] = useState<SearchItem | null>(null);

  const { data: stats, isLoading: isLoadingStats } = useGetSearchStats();
  const { data: recentSearches, isLoading: isLoadingSearches, refetch: refetchSearches } = useListSearches({ limit: 5 });
  const { data: trendingTopics, isLoading: isLoadingTrending } = useGetTrendingTopics();
  const createSearch = useCreateSearch();

  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: { query: "", type: "domain" },
  });

  const currentType = form.watch("type");
  const typeMeta = TYPE_META[currentType] ?? TYPE_META.domain;

  const topType = stats?.byType
    ? Object.entries(stats.byType).sort(([, a], [, b]) => (b as number) - (a as number))[0]?.[0]
    : null;

  const onSubmit = (data: SearchFormValues) => {
    createSearch.mutate(
      { data: { query: data.query, type: data.type as SearchInputType } },
      {
        onSuccess: (result) => {
          form.reset();
          refetchSearches().then(({ data }) => {
            const fresh = data?.find((s) => s.id === result.id);
            if (fresh) setActiveSearch(fresh as SearchItem);
          });
        },
      }
    );
  };

  const handleRowClick = (search: SearchItem) => {
    setActiveSearch((prev) => (prev?.id === search.id ? null : search));
  };

  return (
    <div className="flex-1 p-8 space-y-8 max-w-7xl mx-auto">

      {/* Search Card */}
      <Card className="border-border/40 bg-card/60 backdrop-blur-sm overflow-hidden">
        <div className="px-6 pt-5 pb-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Initiate Investigation
          </p>
        </div>
        <CardContent className="px-6 pb-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center gap-3">

              {/* Type selector with leading icon */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="relative w-[200px]">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-primary z-10">
                      {typeMeta.icon}
                    </div>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="pl-9 h-12 bg-background border-border/60 hover:border-primary/50 focus:ring-primary/30 focus:border-primary transition-colors">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="domain">Domain</SelectItem>
                        <SelectItem value="ip">IP Address</SelectItem>
                        <SelectItem value="username">Username</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="phone">Phone</SelectItem>
                        <SelectItem value="discord">Discord ID</SelectItem>
                        <SelectItem value="breach">Data Breach</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              {/* Query input */}
              <FormField
                control={form.control}
                name="query"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                        <Input
                          placeholder={typeMeta.placeholder}
                          className="pl-10 h-12 bg-background border-border/60 hover:border-border focus:ring-primary/30 focus:border-primary transition-colors font-mono"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Execute button with glow */}
              <Button
                type="submit"
                className="h-12 px-8 bg-primary text-primary-foreground hover:bg-primary/90 font-bold tracking-wide shadow-[0_0_15px_hsl(var(--primary)/0.35)] hover:shadow-[0_0_25px_hsl(var(--primary)/0.55)] transition-all active:scale-95 flex items-center gap-2"
                disabled={createSearch.isPending}
              >
                <Activity className="w-5 h-5" />
                {createSearch.isPending ? "Initiating..." : "Execute Search"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Stats row — 3 columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card/60 border-border/40">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Total Searches</p>
              {isLoadingStats
                ? <Skeleton className="h-9 w-24 mt-1" />
                : <p className="text-3xl font-bold font-mono">{(stats?.total || 0).toLocaleString()}</p>
              }
            </div>
            <div className="p-3 bg-primary/10 rounded-lg text-primary">
              <Search className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/60 border-border/40">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Recent 24h</p>
              {isLoadingStats
                ? <Skeleton className="h-9 w-16 mt-1" />
                : <p className="text-3xl font-bold font-mono">{(stats?.recentCount || 0).toLocaleString()}</p>
              }
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400">
              <Activity className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/60 border-border/40">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Top Target Type</p>
              {isLoadingStats
                ? <Skeleton className="h-9 w-20 mt-1" />
                : <p className="text-3xl font-bold capitalize">{topType ?? "—"}</p>
              }
            </div>
            <div className="p-3 bg-indigo-500/10 rounded-lg text-indigo-400">
              <Globe className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Operations */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Recent Operations</h2>
            <Link href="/searches" className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors">
              View All History <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {isLoadingSearches ? (
            <div className="space-y-px rounded-xl overflow-hidden border border-border/40">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-none" />
              ))}
            </div>
          ) : recentSearches?.length === 0 ? (
            <Card className="bg-card/30 border-dashed border-border/40">
              <CardContent className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
                <p>No operations recorded.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-xl border border-border/40 bg-card/60 overflow-hidden divide-y divide-border/30">
              {recentSearches?.map((search) => {
                const isActive = activeSearch?.id === search.id;
                const meta = TYPE_META[search.type] ?? TYPE_META.domain;
                return (
                  <div key={search.id}>
                    <div
                      onClick={() => handleRowClick(search as SearchItem)}
                      className="p-4 flex items-center gap-4 hover:bg-muted/40 cursor-pointer transition-colors relative group select-none"
                    >
                      {/* Left accent bar on hover / active */}
                      <div className={`absolute left-0 top-0 bottom-0 w-0.5 bg-primary transition-opacity ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`} />

                      {/* Type icon */}
                      <div className={`p-2 rounded border transition-colors ${
                        isActive
                          ? "bg-primary/20 border-primary/40 text-primary"
                          : "bg-background border-border/40 text-muted-foreground group-hover:border-primary/30 group-hover:text-primary"
                      }`}>
                        {meta.icon}
                      </div>

                      {/* Query + meta */}
                      <div className="flex-1 min-w-0">
                        <div className={`font-mono text-sm font-semibold transition-colors truncate ${
                          isActive ? "text-primary" : "text-foreground group-hover:text-primary"
                        }`}>
                          {search.query}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {meta.label} · {formatDistanceToNow(new Date(search.createdAt), { addSuffix: true })}
                        </div>
                      </div>

                      {/* Status badge */}
                      <StatusBadge status={search.status} />

                      {/* Expand chevron */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ${
                        isActive
                          ? "bg-primary/20 text-primary"
                          : "bg-background text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                      }`}>
                        {isActive
                          ? <ChevronUp className="w-4 h-4" />
                          : <ChevronRight className="w-4 h-4" />
                        }
                      </div>
                    </div>

                    {/* Expanded panel */}
                    {isActive && !!activeSearch?.results && (
                      <div className="border-t border-primary/20 overflow-hidden">
                        <SearchResultPanel
                          search={activeSearch}
                          onClose={() => setActiveSearch(null)}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Trending Signals — read-only, no hover */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Trending Signals</h2>
          <Card className="bg-card/60 border-border/40 overflow-hidden">
            {isLoadingTrending ? (
              <CardContent className="p-4 space-y-3">
                {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
              </CardContent>
            ) : trendingTopics?.length === 0 ? (
              <CardContent className="p-8 text-center text-muted-foreground text-sm">
                No significant signals detected.
              </CardContent>
            ) : (
              <div className="divide-y divide-border/30">
                {trendingTopics?.map((topic, i) => (
                  <div key={i} className="p-3 flex items-center gap-3">
                    <div className="w-7 text-center text-xs font-bold text-muted-foreground/50 flex-shrink-0">
                      #{i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">{topic.topic}</div>
                      <div className="text-xs text-muted-foreground">{topic.category || "General"}</div>
                    </div>
                    <div className="text-xs font-mono bg-primary/10 text-primary px-2 py-0.5 rounded flex-shrink-0">
                      {Number(topic.count).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

      </div>
    </div>
  );
}

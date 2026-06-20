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
import { SearchType, SearchInputType } from "@workspace/api-client-react/src/generated/api.schemas";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Globe, User, Mail, Phone, Server, AlertCircle, Clock, Activity, ArrowRight, BarChart, Radar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const searchFormSchema = z.object({
  query: z.string().min(1, "Query is required"),
  type: z.enum(["domain", "ip", "username", "email", "phone"]),
});

type SearchFormValues = z.infer<typeof searchFormSchema>;

export default function Dashboard() {
  const { data: stats, isLoading: isLoadingStats } = useGetSearchStats();
  const { data: recentSearches, isLoading: isLoadingSearches, refetch: refetchSearches } = useListSearches({ limit: 5 });
  const { data: trendingTopics, isLoading: isLoadingTrending } = useGetTrendingTopics();
  const createSearch = useCreateSearch();

  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      query: "",
      type: "domain",
    },
  });

  const onSubmit = (data: SearchFormValues) => {
    createSearch.mutate(
      { data: { query: data.query, type: data.type as SearchInputType } },
      {
        onSuccess: () => {
          form.reset();
          refetchSearches();
        },
      }
    );
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case "domain": return <Globe className="w-4 h-4" />;
      case "ip": return <Server className="w-4 h-4" />;
      case "username": return <User className="w-4 h-4" />;
      case "email": return <Mail className="w-4 h-4" />;
      case "phone": return <Phone className="w-4 h-4" />;
      default: return <Search className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "pending": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "failed": return "bg-red-500/10 text-red-500 border-red-500/20";
      default: return "bg-primary/10 text-primary border-primary/20";
    }
  };

  return (
    <div className="flex-1 p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground font-mono">GLOBAL_DASHBOARD</h1>
        <p className="text-muted-foreground">Overview of OSINT activities and recent intelligence.</p>
      </div>

      <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-start gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="w-[180px]">
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-background border-primary/20 focus:ring-primary h-12 text-md">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="domain">Domain</SelectItem>
                        <SelectItem value="ip">IP Address</SelectItem>
                        <SelectItem value="username">Username</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="phone">Phone</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="query"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <div className="relative">
                        <Search className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                        <Input 
                          placeholder="Enter target identifier..." 
                          className="pl-10 bg-background border-primary/20 focus:ring-primary h-12 text-md font-mono"
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="h-12 px-8 bg-primary text-primary-foreground hover:bg-primary/90 font-bold tracking-wider"
                disabled={createSearch.isPending}
              >
                {createSearch.isPending ? "INITIATING..." : "EXECUTE_SEARCH"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <BarChart className="w-4 h-4" />
              TOTAL SEARCHES
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-3xl font-bold font-mono text-primary">{stats?.total || 0}</div>
            )}
          </CardContent>
        </Card>
        <Card className="bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Activity className="w-4 h-4" />
              RECENT (24H)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-3xl font-bold font-mono">{stats?.recentCount || 0}</div>
            )}
          </CardContent>
        </Card>
        <Card className="col-span-2 bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Radar className="w-4 h-4" />
              DISTRIBUTION
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <div className="flex gap-4">
                {Object.entries(stats?.byType || {}).map(([type, count]) => (
                  <div key={type} className="flex items-center gap-2">
                    <span className="text-xs uppercase text-muted-foreground">{type}:</span>
                    <span className="text-sm font-mono font-bold">{count as number}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight font-mono flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              RECENT_OPERATIONS
            </h2>
            <Link href="/searches" className="text-sm text-primary hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="space-y-3">
            {isLoadingSearches ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))
            ) : recentSearches?.length === 0 ? (
              <Card className="bg-card/30 border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
                  <p>No operations recorded.</p>
                </CardContent>
              </Card>
            ) : (
              recentSearches?.map((search) => (
                <Card key={search.id} className="bg-card/50 border-border/50 hover:border-primary/50 transition-colors">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-primary/10 rounded-md text-primary">
                        {getIconForType(search.type)}
                      </div>
                      <div>
                        <div className="font-mono font-medium text-lg">{search.query}</div>
                        <div className="text-xs text-muted-foreground uppercase flex items-center gap-2">
                          <span>{search.type}</span>
                          <span>•</span>
                          <span>{formatDistanceToNow(new Date(search.createdAt), { addSuffix: true })}</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className={`uppercase font-mono text-xs ${getStatusColor(search.status)}`}>
                      {search.status}
                    </Badge>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight font-mono flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            TRENDING_SIGNALS
          </h2>
          
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-0">
              {isLoadingTrending ? (
                <div className="p-4 space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : trendingTopics?.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  No significant signals detected.
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {trendingTopics?.map((topic, i) => (
                    <div key={i} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="text-xs font-mono text-muted-foreground w-4">{i + 1}.</div>
                        <div>
                          <div className="font-medium">{topic.topic}</div>
                          <div className="text-xs text-muted-foreground">{topic.category || 'General'}</div>
                        </div>
                      </div>
                      <div className="text-xs font-mono bg-primary/10 text-primary px-2 py-1 rounded">
                        {topic.count} hits
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
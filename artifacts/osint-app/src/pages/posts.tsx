import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSearchPosts } from "@workspace/api-client-react";
import { PostSearchInputPlatform } from "@workspace/api-client-react/src/generated/api.schemas";
import { useLocation } from "wouter";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Globe, Search, MessageSquare, Twitter, DiscIcon as Reddit, Radio, Heart, Share2, ExternalLink, CalendarClock } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

const postSearchSchema = z.object({
  query: z.string().min(1, "Query is required"),
  platform: z.enum(["all", "twitter", "reddit", "mastodon"]).optional(),
});

type PostSearchValues = z.infer<typeof postSearchSchema>;

export default function Posts() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const initialQuery = searchParams.get("query") || "";

  const [hasSearched, setHasSearched] = useState(false);
  const searchPosts = useSearchPosts();

  const form = useForm<PostSearchValues>({
    resolver: zodResolver(postSearchSchema),
    defaultValues: {
      query: initialQuery,
      platform: "all",
    },
  });

  const onSubmit = (data: PostSearchValues) => {
    setHasSearched(true);
    searchPosts.mutate({
      data: {
        query: data.query,
        platform: data.platform === "all" ? undefined : data.platform as PostSearchInputPlatform,
        limit: 50
      }
    });
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "twitter": return <Twitter className="w-4 h-4" />;
      case "reddit": return <Reddit className="w-4 h-4" />;
      case "mastodon": return <Radio className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "twitter": return "text-blue-400 bg-blue-400/10 border-blue-400/20";
      case "reddit": return "text-orange-500 bg-orange-500/10 border-orange-500/20";
      case "mastodon": return "text-purple-400 bg-purple-400/10 border-purple-400/20";
      default: return "text-primary bg-primary/10 border-primary/20";
    }
  };

  return (
    <div className="flex-1 p-8 space-y-8 max-w-5xl mx-auto h-full flex flex-col">
      <div className="shrink-0">
        <h1 className="text-3xl font-bold tracking-tight text-foreground font-mono flex items-center gap-3">
          <MessageSquare className="w-8 h-8 text-primary" />
          PUBLIC_POSTS_SCANNER
        </h1>
        <p className="text-muted-foreground mt-1">Cross-platform intelligence gathering from public social feeds.</p>
      </div>

      <Card className="border-primary/20 bg-card/50 backdrop-blur-sm shrink-0">
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-start gap-4">
              <FormField
                control={form.control}
                name="platform"
                render={({ field }) => (
                  <FormItem className="w-[180px]">
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-background border-border focus:ring-primary h-12">
                          <SelectValue placeholder="Platform" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="all">All Platforms</SelectItem>
                        <SelectItem value="twitter">Twitter / X</SelectItem>
                        <SelectItem value="reddit">Reddit</SelectItem>
                        <SelectItem value="mastodon">Mastodon</SelectItem>
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
                          placeholder="Keywords, handles, hashtags..." 
                          className="pl-10 bg-background border-border focus:border-primary focus:ring-primary h-12 text-md font-mono"
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
                disabled={searchPosts.isPending}
              >
                {searchPosts.isPending ? "SCANNING..." : "EXECUTE_SCAN"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="flex-1 overflow-auto pr-2 pb-8 space-y-4">
        {!hasSearched && !searchPosts.isPending && (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground/60 border-2 border-dashed border-border/50 rounded-lg bg-card/10">
            <Radio className="w-16 h-16 mb-4 opacity-50" />
            <p className="font-mono text-lg">AWAITING PARAMETERS</p>
            <p className="text-sm mt-2">Enter keywords to begin signal collection.</p>
          </div>
        )}

        {searchPosts.isPending && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-primary font-mono text-sm mb-6 animate-pulse">
              <div className="w-2 h-2 rounded-full bg-primary" />
              INTERCEPTING SIGNALS...
            </div>
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="bg-card/50 border-border/50">
                <CardHeader className="pb-2 flex flex-row items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-3 w-1/5" />
                  </div>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-16 w-full mb-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {searchPosts.isSuccess && searchPosts.data?.length === 0 && (
          <div className="h-64 flex flex-col items-center justify-center text-muted-foreground border border-border/50 rounded-lg bg-card/30">
            <Globe className="w-12 h-12 mb-4 opacity-50" />
            <p className="font-mono">NO SIGNALS DETECTED</p>
            <p className="text-sm mt-2">Modify search parameters to expand collection radius.</p>
          </div>
        )}

        {searchPosts.isSuccess && searchPosts.data?.map((post) => (
          <Card key={post.id} className="bg-card border-border shadow-sm hover:border-primary/30 transition-colors">
            <CardHeader className="pb-3 flex flex-row items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-md ${getPlatformColor(post.platform)}`}>
                  {getPlatformIcon(post.platform)}
                </div>
                <div>
                  <div className="font-bold text-foreground">{post.author}</div>
                  {post.authorHandle && (
                    <div className="text-sm font-mono text-muted-foreground">{post.authorHandle}</div>
                  )}
                </div>
              </div>
              <Badge variant="outline" className={`font-mono text-xs uppercase ${getPlatformColor(post.platform)}`}>
                {post.platform}
              </Badge>
            </CardHeader>
            <CardContent className="pb-4">
              <p className="text-foreground/90 whitespace-pre-wrap font-sans text-sm leading-relaxed">
                {post.content}
              </p>
            </CardContent>
            <CardFooter className="pt-0 flex items-center justify-between border-t border-border/30 mt-4 px-6 py-3 bg-muted/10">
              <div className="flex items-center gap-6 text-xs text-muted-foreground font-mono">
                <div className="flex items-center gap-1.5" title={format(new Date(post.publishedAt), "PPpp")}>
                  <CalendarClock className="w-3.5 h-3.5" />
                  {formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true })}
                </div>
                {(post.likes !== null && post.likes !== undefined) && (
                  <div className="flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5" />
                    {post.likes.toLocaleString()}
                  </div>
                )}
                {(post.shares !== null && post.shares !== undefined) && (
                  <div className="flex items-center gap-1.5">
                    <Share2 className="w-3.5 h-3.5" />
                    {post.shares.toLocaleString()}
                  </div>
                )}
              </div>
              {post.url && (
                <a href={post.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 flex items-center gap-1.5 text-xs font-mono font-medium transition-colors">
                  VIEW_SOURCE <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
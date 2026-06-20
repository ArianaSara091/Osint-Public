import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Eye, Trash2, Send, Globe } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/contexts/auth";

type CommunityPost = {
  id: number;
  content: string;
  authorId: string;
  authorUsername: string;
  authorDisplayName: string;
  authorAvatar: string | null;
  viewCount: number;
  createdAt: string;
};

export default function Posts() {
  const { state } = useAuth();
  const user = state.status === "authenticated" ? state.user : null;

  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [draft, setDraft] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchFeed = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/posts/feed", { credentials: "include" });
      if (res.ok) {
        const data = (await res.json()) as CommunityPost[];
        setPosts(data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  const handleSubmit = async () => {
    if (!draft.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/posts/feed", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: draft.trim() }),
      });
      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        setError(body.error ?? "Failed to post");
        return;
      }
      const newPost = (await res.json()) as CommunityPost;
      setPosts((prev) => [newPost, ...prev]);
      setDraft("");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/posts/feed/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== id));
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex-1 p-8 space-y-8 max-w-3xl mx-auto h-full flex flex-col">

      {/* Header */}
      <div className="shrink-0">
        <h1 className="text-3xl font-bold tracking-tight text-foreground font-mono flex items-center gap-3">
          <Globe className="w-8 h-8 text-primary" />
          PUBLIC POSTS
        </h1>
        <p className="text-muted-foreground mt-1">
          Community intelligence feed. Only authenticated operators may post.
        </p>
      </div>

      {/* Compose box */}
      {user && (
        <Card className="border-primary/20 bg-card/50 shrink-0">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              {user.avatar ? (
                <img src={user.avatar} alt={user.username} className="w-8 h-8 rounded-full ring-1 ring-border" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                  {(user.global_name ?? user.username)[0].toUpperCase()}
                </div>
              )}
              <span className="text-sm font-medium text-foreground">
                {user.global_name ?? user.username}
              </span>
              <Badge variant="outline" className="ml-auto text-xs text-primary border-primary/30 bg-primary/5">
                OPERATOR
              </Badge>
            </div>

            <Textarea
              placeholder="Share intelligence, findings, or observations..."
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="min-h-[100px] bg-background border-border focus:border-primary font-mono text-sm resize-none"
              maxLength={2000}
            />

            {error && (
              <p className="text-xs text-red-400 font-mono">{error}</p>
            )}

            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-mono">
                {draft.length}/2000
              </span>
              <Button
                onClick={handleSubmit}
                disabled={submitting || !draft.trim()}
                size="sm"
                className="gap-2 font-bold tracking-wider"
              >
                <Send className="w-4 h-4" />
                {submitting ? "POSTING..." : "POST"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feed */}
      <div className="flex-1 overflow-auto space-y-4 pb-8">
        {loading && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="bg-card/50 border-border/50">
                <CardHeader className="pb-2 flex flex-row items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-3 w-1/4" />
                    <Skeleton className="h-3 w-1/6" />
                  </div>
                </CardHeader>
                <CardContent><Skeleton className="h-16 w-full" /></CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && posts.length === 0 && (
          <div className="h-64 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border/50 rounded-lg bg-card/10">
            <MessageSquare className="w-12 h-12 mb-4 opacity-40" />
            <p className="font-mono text-sm">NO POSTS YET</p>
            <p className="text-xs mt-1 text-muted-foreground/60">Be the first operator to post.</p>
          </div>
        )}

        {posts.map((post) => (
          <Card key={post.id} className="bg-card border-border hover:border-primary/30 transition-colors">
            <CardHeader className="pb-3 flex flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {post.authorAvatar ? (
                  <img src={post.authorAvatar} alt={post.authorUsername} className="w-9 h-9 rounded-full ring-1 ring-border flex-shrink-0" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                    {post.authorDisplayName[0].toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="font-semibold text-foreground text-sm truncate">
                    {post.authorDisplayName}
                  </div>
                  <div className="text-xs text-muted-foreground font-mono">
                    @{post.authorUsername}
                  </div>
                </div>
              </div>

              {user?.id === post.authorId && (
                <button
                  onClick={() => handleDelete(post.id)}
                  disabled={deletingId === post.id}
                  className="flex-shrink-0 p-1.5 rounded-md text-muted-foreground/50 hover:text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-40"
                  title="Delete post"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </CardHeader>

            <CardContent className="pb-3">
              <p className="text-foreground/90 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                {post.content}
              </p>
            </CardContent>

            <CardFooter className="pt-0 border-t border-border/30 px-6 py-2.5 bg-muted/10 flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-mono">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </span>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                <Eye className="w-3.5 h-3.5" />
                {post.viewCount.toLocaleString()} {post.viewCount === 1 ? "view" : "views"}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

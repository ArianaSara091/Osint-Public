import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "wouter";
import { 
  useGetTarget,
  useUpdateTarget,
  useGetSearchStats
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Crosshair, Globe, User, Mail, Phone, Server, Save, Activity, FileText, Tag as TagIcon, Clock, Search } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getGetTargetQueryKey } from "@workspace/api-client-react";

export default function TargetDetail() {
  const { id } = useParams();
  const targetId = parseInt(id || "0");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: target, isLoading, error } = useGetTarget(targetId, {
    query: { enabled: !!targetId, queryKey: getGetTargetQueryKey(targetId) }
  });

  const updateTarget = useUpdateTarget();

  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const initRef = useRef<number | null>(null);

  useEffect(() => {
    if (target && initRef.current !== targetId) {
      initRef.current = targetId;
      setNotes(target.notes || "");
      setTags(target.tags || "");
    }
  }, [target, targetId]);

  const handleSave = () => {
    updateTarget.mutate(
      { id: targetId, data: { notes, tags } },
      {
        onSuccess: (updatedData) => {
          queryClient.setQueryData(getGetTargetQueryKey(targetId), (old: any) => 
            old ? { ...old, notes: updatedData.notes, tags: updatedData.tags } : old
          );
          setIsEditing(false);
          toast({
            title: "Dossier updated",
            description: "Target notes and tags saved successfully.",
          });
        },
        onError: () => {
          toast({
            title: "Update failed",
            description: "Could not save dossier changes.",
            variant: "destructive",
          });
        }
      }
    );
  };

  if (error) {
    return (
      <div className="flex-1 p-8 flex flex-col items-center justify-center text-muted-foreground">
        <Activity className="w-12 h-12 mb-4 text-destructive opacity-50" />
        <h2 className="text-xl font-mono text-foreground mb-2">TARGET_NOT_FOUND</h2>
        <p>The requested dossier could not be located in the registry.</p>
        <Link href="/targets">
          <Button variant="outline" className="mt-6 font-mono">RETURN TO REGISTRY</Button>
        </Link>
      </div>
    );
  }

  const getIconForType = (type: string) => {
    switch (type) {
      case "domain": return <Globe className="w-6 h-6" />;
      case "ip": return <Server className="w-6 h-6" />;
      case "username": return <User className="w-6 h-6" />;
      case "email": return <Mail className="w-6 h-6" />;
      case "phone": return <Phone className="w-6 h-6" />;
      case "person": return <User className="w-6 h-6" />;
      default: return <Crosshair className="w-6 h-6" />;
    }
  };

  return (
    <div className="flex-1 p-8 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/targets">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="h-6 w-[1px] bg-border mx-2" />
        <div className="font-mono text-sm text-primary tracking-widest uppercase">DOSSIER VIEW</div>
      </div>

      {isLoading || !target ? (
        <div className="space-y-8">
          <div className="flex items-start gap-6">
            <Skeleton className="h-20 w-20 rounded-lg" />
            <div className="space-y-3 flex-1">
              <Skeleton className="h-10 w-1/3" />
              <Skeleton className="h-6 w-1/4" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-6">
            <Skeleton className="col-span-2 h-[400px]" />
            <Skeleton className="col-span-1 h-[400px]" />
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-border/50">
            <div className="flex items-start gap-6">
              <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg text-primary shadow-[0_0_15px_rgba(var(--primary),0.1)]">
                {getIconForType(target.type)}
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight text-foreground font-mono mb-2">{target.name}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm font-mono">
                  <div className="flex items-center gap-2 bg-muted px-3 py-1 rounded border border-border/50 text-foreground">
                    <span className="text-muted-foreground uppercase text-xs">{target.type}:</span>
                    <span className="font-bold text-primary">{target.value}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Added {format(new Date(target.createdAt), "MMM dd, yyyy")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span className="text-xs">ID:</span>
                    <span>{target.id}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-card/50 border-border/50 shadow-none">
                <CardHeader className="pb-3 flex flex-row items-center justify-between border-b border-border/50 bg-muted/20">
                  <CardTitle className="text-lg font-mono flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    ANALYST_NOTES
                  </CardTitle>
                  {!isEditing ? (
                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="h-8 font-mono text-xs">
                      EDIT
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => {
                        setIsEditing(false);
                        setNotes(target.notes || "");
                        setTags(target.tags || "");
                      }} className="h-8 font-mono text-xs">
                        CANCEL
                      </Button>
                      <Button size="sm" onClick={handleSave} disabled={updateTarget.isPending} className="h-8 font-mono text-xs bg-primary text-primary-foreground">
                        <Save className="w-3 h-3 mr-2" />
                        SAVE
                      </Button>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="p-6">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-mono text-muted-foreground">TAGS (COMMA SEPARATED)</label>
                        <Input 
                          value={tags} 
                          onChange={(e) => setTags(e.target.value)} 
                          className="font-mono text-sm bg-background border-border"
                          placeholder="e.g. priority, confirmed, alias"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-mono text-muted-foreground">DOSSIER CONTENT</label>
                        <Textarea 
                          value={notes} 
                          onChange={(e) => setNotes(e.target.value)}
                          className="min-h-[300px] font-mono text-sm bg-background border-border resize-y leading-relaxed"
                          placeholder="Enter analyst notes here..."
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex flex-wrap gap-2">
                        {target.tags ? (
                          target.tags.split(',').map((tag, i) => (
                            <Badge key={i} variant="outline" className="font-mono text-xs bg-primary/5 text-primary border-primary/20 py-1">
                              <TagIcon className="w-3 h-3 mr-1.5 opacity-70" />
                              {tag.trim().toUpperCase()}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs font-mono text-muted-foreground/50">NO TAGS ASSIGNED</span>
                        )}
                      </div>
                      
                      <div className="prose prose-sm dark:prose-invert max-w-none font-mono text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
                        {target.notes ? target.notes : (
                          <div className="text-muted-foreground/50 italic py-8 text-center border border-dashed border-border/50 rounded-lg bg-muted/10">
                            No notes recorded for this target. Click Edit to begin dossier.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="bg-card/50 border-border/50">
                <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
                  <CardTitle className="text-sm font-mono flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary" />
                    INTELLIGENCE_SUMMARY
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div className="text-xs text-muted-foreground text-center py-8">
                    Data aggregation module pending implementation.
                    <br />
                    Requires backend correlation service.
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 border-border/50">
                <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
                  <CardTitle className="text-sm font-mono flex items-center gap-2">
                    <Search className="w-4 h-4 text-primary" />
                    QUICK_ACTIONS
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-2">
                  <Button variant="outline" className="w-full justify-start font-mono text-xs h-9 border-border/50 bg-background hover:bg-muted" onClick={() => {
                    toast({ title: "Module unavailable", description: "Integration pending" })
                  }}>
                    RUN CORRELATION SCAN
                  </Button>
                  <Button variant="outline" className="w-full justify-start font-mono text-xs h-9 border-border/50 bg-background hover:bg-muted" onClick={() => {
                    toast({ title: "Module unavailable", description: "Integration pending" })
                  }}>
                    FIND LINKED ACCOUNTS
                  </Button>
                  <Link href={`/posts?query=${encodeURIComponent(target.value)}`}>
                    <Button variant="outline" className="w-full justify-start font-mono text-xs h-9 border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary">
                      SEARCH PUBLIC POSTS
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
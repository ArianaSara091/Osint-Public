import { useState } from "react";
import {
  useListSearches,
  useDeleteSearch,
  useGetSearch,
  getGetSearchQueryKey,
} from "@workspace/api-client-react";
import { type ListSearchesType } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search as SearchIcon, Globe, User, Mail, Phone, Server, AlertCircle, Trash2, Filter, Shield, Zap } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import SearchResultPanel from "@/components/SearchResultPanel";

export default function Searches() {
  const [filterType, setFilterType] = useState<ListSearchesType | "all">("all");
  const [activeSearchId, setActiveSearchId] = useState<number | null>(null);

  const { data: searches, isLoading, refetch } = useListSearches({
    type: filterType === "all" ? undefined : filterType,
  });

  const { data: activeSearch } = useGetSearch(activeSearchId ?? 0, {
    query: { enabled: !!activeSearchId, queryKey: getGetSearchQueryKey(activeSearchId ?? 0) },
  });

  const deleteSearch = useDeleteSearch();
  const { toast } = useToast();

  const handleDelete = (id: number) => {
    deleteSearch.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Operation deleted", description: `Search record #${id} has been purged from history.` });
        if (activeSearchId === id) setActiveSearchId(null);
        refetch();
      },
      onError: () => {
        toast({ title: "Deletion failed", description: "Could not purge record.", variant: "destructive" });
      },
    });
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case "domain": return <Globe className="w-4 h-4" />;
      case "ip": return <Server className="w-4 h-4" />;
      case "username": return <User className="w-4 h-4" />;
      case "email": return <Mail className="w-4 h-4" />;
      case "phone": return <Phone className="w-4 h-4" />;
      case "discord": return <Zap className="w-4 h-4" />;
      case "breach": return <Shield className="w-4 h-4" />;
      default: return <SearchIcon className="w-4 h-4" />;
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
    <div className="flex-1 p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-mono flex items-center gap-3">
            <SearchIcon className="w-8 h-8 text-primary" />
            OPERATIONS_LOG
          </h1>
          <p className="text-muted-foreground mt-1">Complete history of intelligence queries.</p>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select
            value={filterType}
            onValueChange={(val) => setFilterType(val as ListSearchesType | "all")}
          >
            <SelectTrigger className="w-[180px] bg-card border-border">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="domain">Domain</SelectItem>
              <SelectItem value="ip">IP Address</SelectItem>
              <SelectItem value="username">Username</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="phone">Phone</SelectItem>
              <SelectItem value="discord">Discord ID</SelectItem>
              <SelectItem value="breach">Data Breach</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {activeSearch?.results && (
        <SearchResultPanel search={activeSearch} onClose={() => setActiveSearchId(null)} />
      )}

      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))
        ) : searches?.length === 0 ? (
          <Card className="bg-card/30 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <AlertCircle className="w-12 h-12 mb-4 opacity-50 text-primary" />
              <p className="text-lg font-mono">No matching records found.</p>
              <p className="text-sm mt-2">Adjust your filters or initiate a new search.</p>
            </CardContent>
          </Card>
        ) : (
          searches?.map((search) => (
            <Card
              key={search.id}
              className={`bg-card/50 border-border/50 hover:border-border transition-colors group cursor-pointer ${activeSearchId === search.id ? "border-primary/50" : ""}`}
              onClick={() => setActiveSearchId(activeSearchId === search.id ? null : search.id)}
            >
              <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-md text-primary mt-1 sm:mt-0">
                    {getIconForType(search.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="font-mono font-bold text-xl">{search.query}</div>
                      <Badge variant="outline" className={`uppercase font-mono text-[10px] py-0 h-5 ${getStatusColor(search.status)}`}>
                        {search.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-3 mt-1">
                      <span className="uppercase font-medium text-foreground/80">{search.type}</span>
                      <span>•</span>
                      <span className="font-mono text-xs">{format(new Date(search.createdAt), "yyyy-MM-dd HH:mm:ss 'UTC'")}</span>
                      <span>•</span>
                      <span className="font-mono text-xs">ID:{search.id}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="border-destructive/20 bg-background">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Purge Record?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete search record #{search.id} for "{search.query}". This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(search.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-mono"
                        >
                          CONFIRM_PURGE
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

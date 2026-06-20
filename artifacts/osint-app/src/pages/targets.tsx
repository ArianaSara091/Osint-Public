import { useState } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  useListTargets, 
  useCreateTarget,
  useDeleteTarget
} from "@workspace/api-client-react";
import { type TargetInputType } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Crosshair, Plus, Search, Globe, User, Mail, Phone, Server, AlertCircle, Trash2, Tag as TagIcon, FileText } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const targetFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  value: z.string().min(1, "Identifier value is required"),
  type: z.enum(["domain", "ip", "username", "email", "phone", "person"]),
  notes: z.string().optional(),
  tags: z.string().optional(),
});

type TargetFormValues = z.infer<typeof targetFormSchema>;

export default function Targets() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: targets, isLoading, refetch } = useListTargets();
  const createTarget = useCreateTarget();
  const deleteTarget = useDeleteTarget();
  const { toast } = useToast();

  const form = useForm<TargetFormValues>({
    resolver: zodResolver(targetFormSchema),
    defaultValues: {
      name: "",
      value: "",
      type: "person",
      notes: "",
      tags: "",
    },
  });

  const onSubmit = (data: TargetFormValues) => {
    createTarget.mutate(
      { data: { ...data, type: data.type as TargetInputType } },
      {
        onSuccess: () => {
          setIsDialogOpen(false);
          form.reset();
          refetch();
          toast({
            title: "Target registered",
            description: `Target ${data.name} added to tracking list.`,
          });
        },
        onError: () => {
          toast({
            title: "Registration failed",
            description: "Could not save target.",
            variant: "destructive",
          });
        }
      }
    );
  };

  const handleDelete = (id: number, name: string) => {
    deleteTarget.mutate({ id }, {
      onSuccess: () => {
        toast({
          title: "Target purged",
          description: `${name} has been removed from tracking.`,
        });
        refetch();
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
      case "person": return <User className="w-4 h-4" />;
      default: return <Search className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex-1 p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-mono flex items-center gap-3">
            <Crosshair className="w-8 h-8 text-primary" />
            TARGET_REGISTRY
          </h1>
          <p className="text-muted-foreground mt-1">Saved profiles and infrastructure for ongoing investigation.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="font-mono tracking-wider bg-primary text-primary-foreground">
              <Plus className="w-4 h-4 mr-2" />
              ADD_TARGET
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] border-primary/20 bg-background">
            <DialogHeader>
              <DialogTitle className="font-mono text-primary">REGISTER NEW TARGET</DialogTitle>
              <DialogDescription>
                Add a new entity or asset to your tracking registry.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-mono text-xs text-muted-foreground">DESIGNATION / NAME</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Operation Dark Star Lead" className="bg-card border-border focus-visible:ring-primary" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-xs text-muted-foreground">ENTITY TYPE</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-card border-border focus:ring-primary">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="person">Person</SelectItem>
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
                    name="value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-xs text-muted-foreground">IDENTIFIER VALUE</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., example.com" className="bg-card border-border focus-visible:ring-primary" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-mono text-xs text-muted-foreground">TAGS (COMMA SEPARATED)</FormLabel>
                      <FormControl>
                        <Input placeholder="priority, high-value, suspected" className="bg-card border-border focus-visible:ring-primary" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-mono text-xs text-muted-foreground">INITIAL DOSSIER NOTES</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Context on why this target is being tracked..." 
                          className="resize-none bg-card border-border focus-visible:ring-primary h-24"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="pt-4 flex justify-end">
                  <Button type="submit" className="font-mono tracking-wider" disabled={createTarget.isPending}>
                    {createTarget.isPending ? "REGISTERING..." : "CONFIRM_REGISTRATION"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))
        ) : targets?.length === 0 ? (
          <div className="col-span-full">
            <Card className="bg-card/30 border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-24 text-muted-foreground">
                <Crosshair className="w-12 h-12 mb-4 opacity-50 text-primary" />
                <p className="text-lg font-mono">Registry is empty.</p>
                <p className="text-sm mt-2">Add targets to begin building dossiers.</p>
              </CardContent>
            </Card>
          </div>
        ) : (
          targets?.map((target) => (
            <Card key={target.id} className="bg-card/50 border-border/50 hover:border-primary/50 transition-all flex flex-col group relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors" />
              <CardContent className="p-6 flex flex-col h-full flex-1 gap-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-md text-primary shrink-0">
                      {getIconForType(target.type)}
                    </div>
                    <div>
                      <h3 className="font-bold font-mono text-lg line-clamp-1" title={target.name}>{target.name}</h3>
                      <div className="text-sm text-primary font-mono bg-primary/5 px-2 py-0.5 rounded inline-block mt-1">
                        {target.value}
                      </div>
                    </div>
                  </div>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="border-destructive/20 bg-background">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove Target?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete target '{target.name}' from your registry.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDelete(target.id, target.name)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-mono"
                        >
                          CONFIRM_REMOVAL
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                <div className="flex-1 text-sm text-muted-foreground">
                  {target.notes ? (
                    <div className="flex gap-2">
                      <FileText className="w-4 h-4 shrink-0 mt-0.5 text-primary/50" />
                      <p className="line-clamp-3">{target.notes}</p>
                    </div>
                  ) : (
                    <p className="italic opacity-50">No dossier notes recorded.</p>
                  )}
                </div>

                <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between">
                  <div className="flex gap-2 flex-wrap max-w-[70%]">
                    {target.tags ? (
                      target.tags.split(',').slice(0, 2).map((tag, i) => (
                        <span key={i} className="text-[10px] font-mono uppercase bg-muted text-muted-foreground px-1.5 py-0.5 rounded flex items-center gap-1">
                          <TagIcon className="w-2.5 h-2.5" />
                          {tag.trim()}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] font-mono uppercase text-muted-foreground/50">NO TAGS</span>
                    )}
                    {target.tags && target.tags.split(',').length > 2 && (
                      <span className="text-[10px] font-mono text-muted-foreground px-1 py-0.5">+{target.tags.split(',').length - 2}</span>
                    )}
                  </div>
                  
                  <Link href={`/targets/${target.id}`}>
                    <Button variant="ghost" size="sm" className="font-mono text-xs hover:bg-primary hover:text-primary-foreground h-7 px-3">
                      OPEN_DOSSIER
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
"use client";

import { useState, useTransition } from "react";
import { CalendarDays, Users, Trash2, ChevronDown, ChevronUp, Pencil, X, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { deleteSiteVisit, updateSiteVisit } from "@/app/actions/site-visits";

type Visit = {
  id: string;
  title: string;
  visit_date: string;
  observations?: string | null;
  attendees?: string[];
  created_by_name: string;
  created_at: string;
};

export function VisitCard({ visit, projectId, canEdit }: { visit: Visit; projectId: string; canEdit: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [attendees, setAttendees] = useState<string[]>(visit.attendees ?? []);
  const [attendeeInput, setAttendeeInput] = useState("");

  function handleDelete() {
    if (!confirm("Delete this site visit record?")) return;
    startTransition(async () => {
      try {
        await deleteSiteVisit(visit.id, projectId);
        toast.success("Visit deleted");
      } catch {
        toast.error("Failed to delete");
      }
    });
  }

  function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await updateSiteVisit(visit.id, projectId, {
          title: fd.get("title") as string,
          visitDate: fd.get("visitDate") as string,
          observations: (fd.get("observations") as string) || undefined,
          attendees,
        });
        toast.success("Visit updated");
        setEditOpen(false);
      } catch {
        toast.error("Failed to update");
      }
    });
  }

  const formatted = new Date(visit.visit_date).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <>
      <div className="rounded-xl border bg-card hover:border-primary/30 transition-colors">
        <div
          className="flex items-start justify-between p-4 cursor-pointer"
          onClick={() => setExpanded(v => !v)}
        >
          <div className="flex items-start gap-4 min-w-0">
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
              <CalendarDays className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm">{visit.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{formatted}</p>
              {visit.attendees && visit.attendees.length > 0 && (
                <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                  <Users className="h-3 w-3 text-muted-foreground shrink-0" />
                  {visit.attendees.map(a => (
                    <Badge key={a} variant="secondary" className="text-xs py-0">{a}</Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0 ml-3">
            {canEdit && (
              <>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={e => { e.stopPropagation(); setEditOpen(true); }}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={e => { e.stopPropagation(); handleDelete(); }} disabled={isPending}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </>
            )}
            {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </div>
        </div>

        {expanded && visit.observations && (
          <div className="px-4 pb-4 pt-0">
            <div className="ml-11 rounded-lg bg-muted/50 p-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Observations</p>
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{visit.observations}</p>
            </div>
            <p className="text-xs text-muted-foreground ml-11 mt-2">Logged by {visit.created_by_name}</p>
          </div>
        )}
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Visit</DialogTitle>
            <DialogDescription>Update this site visit record.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <Label>Title <span className="text-destructive">*</span></Label>
              <Input name="title" defaultValue={visit.title} required />
            </div>
            <div className="space-y-1.5">
              <Label>Visit Date <span className="text-destructive">*</span></Label>
              <Input name="visitDate" type="date" defaultValue={visit.visit_date} required />
            </div>
            <div className="space-y-1.5">
              <Label>Observations</Label>
              <Textarea name="observations" defaultValue={visit.observations ?? ""} rows={4} />
            </div>
            <div className="space-y-2">
              <Label>Attendees</Label>
              <div className="flex gap-2">
                <Input value={attendeeInput} onChange={e => setAttendeeInput(e.target.value)} placeholder="Add attendee" onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); if (attendeeInput.trim()) { setAttendees(p => [...p, attendeeInput.trim()]); setAttendeeInput(""); } } }} />
                <Button type="button" variant="outline" size="icon" onClick={() => { if (attendeeInput.trim()) { setAttendees(p => [...p, attendeeInput.trim()]); setAttendeeInput(""); } }}><UserPlus className="h-4 w-4" /></Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {attendees.map(a => (
                  <span key={a} className="flex items-center gap-1 bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-xs font-medium">
                    {a}<button type="button" onClick={() => setAttendees(p => p.filter(x => x !== a))}><X className="h-3 w-3" /></button>
                  </span>
                ))}
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>{isPending ? "Saving…" : "Save Changes"}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

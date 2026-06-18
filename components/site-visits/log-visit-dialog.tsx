"use client";

import { useState, useTransition } from "react";
import { Plus, X, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createSiteVisit } from "@/app/actions/site-visits";

export function LogVisitDialog({ projectId }: { projectId: string }) {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [attendees, setAttendees] = useState<string[]>([]);
  const [attendeeInput, setAttendeeInput] = useState("");

  const createdByName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.primaryEmailAddress?.emailAddress || "Unknown";

  function addAttendee() {
    const name = attendeeInput.trim();
    if (name && !attendees.includes(name)) {
      setAttendees(prev => [...prev, name]);
      setAttendeeInput("");
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await createSiteVisit({
          projectId,
          title: fd.get("title") as string,
          visitDate: fd.get("visitDate") as string,
          observations: (fd.get("observations") as string) || undefined,
          attendees,
          createdByName,
        });
        toast.success("Site visit logged");
        setOpen(false);
        setAttendees([]);
        setAttendeeInput("");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setAttendees([]); setAttendeeInput(""); } }}>
      <DialogTrigger asChild>
        <Button className="gap-2"><Plus className="h-4 w-4" /> Log Visit</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Log Site Visit</DialogTitle>
          <DialogDescription>Record a site visit for the project audit trail.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 col-span-2">
              <Label>Title <span className="text-destructive">*</span></Label>
              <Input name="title" placeholder="e.g. Structural inspection, Progress review" required autoFocus />
            </div>
            <div className="space-y-1.5">
              <Label>Visit Date <span className="text-destructive">*</span></Label>
              <Input name="visitDate" type="date" required defaultValue={new Date().toISOString().split("T")[0]} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Observations</Label>
            <Textarea name="observations" placeholder="Key observations, issues noted, decisions made on site…" rows={4} />
          </div>

          <div className="space-y-2">
            <Label>Attendees</Label>
            <div className="flex gap-2">
              <Input
                value={attendeeInput}
                onChange={e => setAttendeeInput(e.target.value)}
                placeholder="Name or role"
                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addAttendee(); } }}
              />
              <Button type="button" variant="outline" size="icon" onClick={addAttendee}>
                <UserPlus className="h-4 w-4" />
              </Button>
            </div>
            {attendees.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {attendees.map(a => (
                  <span key={a} className="flex items-center gap-1 bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-xs font-medium">
                    {a}
                    <button type="button" onClick={() => setAttendees(prev => prev.filter(x => x !== a))}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Saving…" : "Log Visit"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

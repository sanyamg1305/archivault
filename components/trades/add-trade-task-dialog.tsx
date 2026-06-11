"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createTradeTask } from "@/app/actions/trades";

export function AddTradeTaskDialog({
  projectId,
  trades,
  rooms,
}: {
  projectId: string;
  trades: any[];
  rooms: any[];
}) {
  const [open, setOpen] = useState(false);
  const [tradeId, setTradeId] = useState("");
  const [roomId, setRoomId] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await createTradeTask({
          projectId,
          tradeId: tradeId || null,
          roomId: roomId || null,
          title: fd.get("title") as string,
          description: fd.get("description") as string,
          dueDate: (fd.get("due_date") as string) || null,
        });
        toast.success("Task created");
        setOpen(false);
        setTradeId("");
        setRoomId("");
      } catch (err) {
        toast.error("Failed", { description: err instanceof Error ? err.message : "Try again." });
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setTradeId(""); setRoomId(""); } }}>
      <DialogTrigger asChild>
        <Button className="gap-2"><Plus className="h-4 w-4" /> Add Task</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>Add Trade Task</DialogTitle>
          <DialogDescription>Assign work to a trade worker for this project.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-2">
            <Label htmlFor="task-title">Task Title <span className="text-destructive">*</span></Label>
            <Input id="task-title" name="title" required placeholder="e.g. Paint master bedroom ceiling" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Assign To</Label>
              <Select value={tradeId} onValueChange={setTradeId}>
                <SelectTrigger><SelectValue placeholder="Select worker…" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {trades.map((t: any) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name} ({t.trade_type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Room</Label>
              <Select value={roomId} onValueChange={setRoomId}>
                <SelectTrigger><SelectValue placeholder="Select room…" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General / Project-wide</SelectItem>
                  {rooms.map((r: any) => (
                    <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="due_date">Due Date</Label>
            <Input id="due_date" name="due_date" type="date" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" rows={2} placeholder="Additional details…" />
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Creating…" : "Create Task"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

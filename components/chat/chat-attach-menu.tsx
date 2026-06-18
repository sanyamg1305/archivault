"use client";

import { useRef, useState, useTransition } from "react";
import {
  ImagePlus, User, Store, Paperclip, Phone, Mail, Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { sendImageMessage, sendContactMessage, type ContactAttachment } from "@/app/actions/messages";

type Vendor = { id: string; name: string; category: string; phone?: string; email?: string };
type DialogType = "contact" | "vendor" | null;

export function ChatAttachMenu({
  projectId,
  channel,
  senderName,
  vendors,
  onSent,
}: {
  projectId: string;
  channel: "internal" | "external";
  senderName: string;
  vendors?: Vendor[];
  onSent: () => void;
}) {
  const [dialog, setDialog] = useState<DialogType>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Image ────────────────────────────────────────────────────────
  function handleImagePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    const fd = new FormData();
    fd.append("file", file);
    startTransition(async () => {
      try {
        await sendImageMessage(projectId, channel, fd, senderName);
        onSent();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to send image");
      }
    });
  }

  // ── Contact ──────────────────────────────────────────────────────
  function handleContactSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const contact: ContactAttachment = {
      type: "contact",
      name: fd.get("name") as string,
      phone: (fd.get("phone") as string) || undefined,
      email: (fd.get("email") as string) || undefined,
      company: (fd.get("company") as string) || undefined,
    };
    startTransition(async () => {
      try {
        await sendContactMessage(projectId, channel, contact, senderName);
        onSent();
        setDialog(null);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to share contact");
      }
    });
  }

  // ── Vendor ───────────────────────────────────────────────────────
  function handleVendorSelect(vendor: Vendor) {
    startTransition(async () => {
      try {
        await sendContactMessage(projectId, channel, {
          type: "vendor",
          name: vendor.name,
          category: vendor.category,
          phone: vendor.phone,
          email: vendor.email,
        }, senderName);
        onSent();
        setDialog(null);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to share vendor");
      }
    });
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImagePick}
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="shrink-0 h-10 w-10"
            disabled={isPending}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="start" className="w-52">
          <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">Attach</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => fileInputRef.current?.click()}>
            <ImagePlus className="h-4 w-4 mr-2 text-blue-500" /> Image
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setDialog("contact")}>
            <User className="h-4 w-4 mr-2 text-green-600" /> Share Contact
          </DropdownMenuItem>
          {vendors && vendors.length > 0 && (
            <DropdownMenuItem onSelect={() => setDialog("vendor")}>
              <Store className="h-4 w-4 mr-2 text-purple-600" /> Share Vendor
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Contact dialog */}
      <Dialog open={dialog === "contact"} onOpenChange={(v) => !v && setDialog(null)}>
        <DialogContent className="sm:max-w-[360px]">
          <DialogHeader>
            <DialogTitle>Share Contact</DialogTitle>
            <DialogDescription>Enter the contact details to share in chat.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleContactSubmit} className="space-y-3 pt-1">
            <div className="space-y-1.5">
              <Label>Name <span className="text-destructive">*</span></Label>
              <Input name="name" placeholder="Full name" required autoFocus />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <div className="relative">
                <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input name="phone" placeholder="+91 98765 43210" className="pl-9" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <div className="relative">
                <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input name="email" type="email" placeholder="email@example.com" className="pl-9" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Company</Label>
              <div className="relative">
                <Building2 className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input name="company" placeholder="Company / firm name" className="pl-9" />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Sharing…" : "Share Contact"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Vendor picker dialog */}
      <Dialog open={dialog === "vendor"} onOpenChange={(v) => !v && setDialog(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Share Vendor</DialogTitle>
            <DialogDescription>Pick a vendor from your ArchiVault directory to share.</DialogDescription>
          </DialogHeader>
          <div className="mt-2 max-h-72 overflow-y-auto -mx-6 px-6 space-y-1">
            {vendors?.map(v => (
              <button
                key={v.id}
                disabled={isPending}
                onClick={() => handleVendorSelect(v)}
                className="flex w-full items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors text-left disabled:opacity-50"
              >
                <div className="p-2 rounded-md bg-purple-100 text-purple-600 shrink-0">
                  <Store className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{v.name}</p>
                  <p className="text-xs text-muted-foreground">{v.category}</p>
                  {(v.phone || v.email) && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {[v.phone, v.email].filter(Boolean).join(" · ")}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useUser } from "@clerk/nextjs";
import { Send, Phone, Mail, Store, User, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getMessages, sendMessage, deleteMessage, type Message, type ContactAttachment } from "@/app/actions/messages";
import { ChatAttachMenu } from "@/components/chat/chat-attach-menu";
import { cn } from "@/lib/utils";

type Vendor = { id: string; name: string; category: string; phone?: string; email?: string };
type Member = { id: string; name: string };

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function ContactCard({ attachment, isMe }: { attachment: ContactAttachment; isMe: boolean }) {
  const isVendor = attachment.type === "vendor";
  return (
    <div
      className={cn(
        "rounded-2xl border p-3 w-64 space-y-2",
        isMe ? "bg-primary/10 border-primary/20" : "bg-card border-border"
      )}
    >
      <div className="flex items-center gap-2">
        <div className={cn("p-1.5 rounded-md shrink-0", isVendor ? "bg-purple-100 text-purple-600" : "bg-green-100 text-green-600")}>
          {isVendor ? <Store className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-sm truncate">{attachment.name}</p>
          {(attachment.category || attachment.company) && (
            <p className="text-xs text-muted-foreground truncate">
              {attachment.category || attachment.company}
            </p>
          )}
        </div>
      </div>
      {(attachment.phone || attachment.email) && (
        <div className="space-y-1 border-t pt-2">
          {attachment.phone && (
            <a
              href={`tel:${attachment.phone}`}
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Phone className="h-3 w-3 shrink-0" /> {attachment.phone}
            </a>
          )}
          {attachment.email && (
            <a
              href={`mailto:${attachment.email}`}
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Mail className="h-3 w-3 shrink-0" /> {attachment.email}
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function MessageBubble({ msg, isMe }: { msg: Message; isMe: boolean }) {
  if (msg.message_type === "image" && msg.image_url) {
    return (
      <div className={cn("relative w-64 h-48 rounded-2xl overflow-hidden", isMe ? "rounded-tr-sm" : "rounded-tl-sm")}>
        <Image
          src={msg.image_url}
          alt="Shared image"
          fill
          unoptimized
          sizes="256px"
          className="object-cover"
        />
      </div>
    );
  }

  if (msg.message_type === "contact" && msg.attachment) {
    return <ContactCard attachment={msg.attachment} isMe={isMe} />;
  }

  return (
    <div
      className={cn(
        "max-w-[75%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap break-words",
        isMe
          ? "bg-primary text-primary-foreground rounded-tr-sm"
          : "bg-muted text-foreground rounded-tl-sm"
      )}
    >
      {msg.content}
    </div>
  );
}

export function ChatPanel({
  projectId,
  channel,
  initialMessages,
  vendors,
  isAdmin,
  members,
}: {
  projectId: string;
  channel: "internal" | "external";
  initialMessages: Message[];
  vendors?: Vendor[];
  isAdmin?: boolean;
  members?: Member[];
}) {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionIndex, setMentionIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const mentionMatches = mentionQuery !== null && members?.length
    ? members.filter((m) => m.name.toLowerCase().includes(mentionQuery.toLowerCase())).slice(0, 5)
    : [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (input.trim()) e.preventDefault();
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [input]);

  useEffect(() => {
    intervalRef.current = setInterval(async () => {
      try {
        const fresh = await getMessages(projectId, channel);
        setMessages(fresh);
      } catch {
        // silently ignore poll errors
      }
    }, 5000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [projectId, channel]);

  async function refresh() {
    const fresh = await getMessages(projectId, channel);
    setMessages(fresh);
  }

  function handleDeleteMessage(messageId: string) {
    startTransition(async () => {
      try {
        await deleteMessage(messageId, projectId);
        setMessages((prev) => prev.filter((m) => m.id !== messageId));
      } catch (err: any) {
        toast.error(err.message || "Failed to delete message");
      }
    });
  }

  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value;
    setInput(val);
    // Detect @mention trigger
    const cursor = e.target.selectionStart ?? val.length;
    const before = val.slice(0, cursor);
    const match = before.match(/@(\w*)$/);
    if (match) {
      setMentionQuery(match[1]);
      setMentionIndex(0);
    } else {
      setMentionQuery(null);
    }
  }

  function insertMention(member: Member) {
    const cursor = textareaRef.current?.selectionStart ?? input.length;
    const before = input.slice(0, cursor);
    const after = input.slice(cursor);
    const replaced = before.replace(/@(\w*)$/, `@${member.name} `);
    setInput(replaced + after);
    setMentionQuery(null);
    textareaRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (mentionMatches.length > 0) {
      if (e.key === "ArrowDown") { e.preventDefault(); setMentionIndex((i) => Math.min(i + 1, mentionMatches.length - 1)); return; }
      if (e.key === "ArrowUp") { e.preventDefault(); setMentionIndex((i) => Math.max(i - 1, 0)); return; }
      if (e.key === "Enter" || e.key === "Tab") { e.preventDefault(); insertMention(mentionMatches[mentionIndex]); return; }
      if (e.key === "Escape") { setMentionQuery(null); return; }
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || !user) return;

    const senderName =
      [user.firstName, user.lastName].filter(Boolean).join(" ") ||
      user.primaryEmailAddress?.emailAddress ||
      "Unknown";

    const optimistic: Message = {
      id: crypto.randomUUID(),
      sender_id: user.id,
      sender_name: senderName,
      content: trimmed,
      channel,
      created_at: new Date().toISOString(),
      message_type: "text",
    };
    setMessages((prev) => [...prev, optimistic]);
    setInput("");

    startTransition(async () => {
      try {
        await sendMessage(projectId, channel, trimmed, senderName);
        const fresh = await getMessages(projectId, channel);
        setMessages(fresh);
      } catch (err) {
        setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
        setInput(trimmed);
        toast.error("Failed to send", {
          description: err instanceof Error ? err.message : "Please try again.",
        });
      }
    });
  }

  const senderName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(" ") ||
      user.primaryEmailAddress?.emailAddress ||
      "Unknown"
    : "Unknown";

  // Group by date
  const grouped: { date: string; messages: Message[] }[] = [];
  for (const msg of messages) {
    const date = formatDate(msg.created_at);
    const last = grouped[grouped.length - 1];
    if (last && last.date === date) {
      last.messages.push(msg);
    } else {
      grouped.push({ date, messages: [msg] });
    }
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">No messages yet. Start the conversation.</p>
          </div>
        )}
        {grouped.map(({ date, messages: dayMsgs }) => (
          <div key={date} className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground shrink-0">{date}</span>
              <div className="flex-1 h-px bg-border" />
            </div>
            {dayMsgs.map((msg) => {
              const isMe = msg.sender_id === user?.id;
              return (
                <div key={msg.id} className={cn("flex flex-col gap-0.5 group/msg", isMe ? "items-end" : "items-start")}>
                  <span className="text-xs text-muted-foreground px-1">
                    {isMe ? "You" : msg.sender_name} · {formatTime(msg.created_at)}
                  </span>
                  <div className={cn("flex items-end gap-1", isMe ? "flex-row-reverse" : "flex-row")}>
                    <MessageBubble msg={msg} isMe={isMe} />
                    {isAdmin && (
                      <button
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="opacity-0 group-hover/msg:opacity-100 transition-opacity p-1 rounded text-muted-foreground hover:text-destructive shrink-0"
                        title="Delete message"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t px-4 py-3 flex gap-2 items-end bg-background relative">
        {/* @mention dropdown */}
        {mentionMatches.length > 0 && (
          <div className="absolute bottom-full left-14 mb-1 w-48 rounded-lg border bg-popover shadow-md overflow-hidden z-50">
            {mentionMatches.map((m, i) => (
              <button
                key={m.id}
                className={cn(
                  "w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors",
                  i === mentionIndex && "bg-muted"
                )}
                onMouseDown={(e) => { e.preventDefault(); insertMention(m); }}
              >
                @{m.name}
              </button>
            ))}
          </div>
        )}
        <ChatAttachMenu
          projectId={projectId}
          channel={channel}
          senderName={senderName}
          vendors={vendors}
          onSent={refresh}
        />
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message… (Enter to send, @name to mention)"
          rows={1}
          className="resize-none min-h-[40px] max-h-[120px]"
        />
        <Button
          size="icon"
          onClick={handleSend}
          disabled={!input.trim() || isPending}
          className="shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

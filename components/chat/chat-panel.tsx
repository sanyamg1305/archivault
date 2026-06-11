"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useUser } from "@clerk/nextjs";
import { Send } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getMessages, sendMessage, type Message } from "@/app/actions/messages";
import { cn } from "@/lib/utils";

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function ChatPanel({
  projectId,
  channel,
  initialMessages,
}: {
  projectId: string;
  channel: "internal" | "external";
  initialMessages: Message[];
}) {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Poll for new messages every 5 seconds
  useEffect(() => {
    intervalRef.current = setInterval(async () => {
      try {
        const fresh = await getMessages(projectId, channel);
        setMessages(fresh);
      } catch {
        // silently ignore poll errors
      }
    }, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [projectId, channel]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
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

    // Optimistic update
    const optimistic: Message = {
      id: crypto.randomUUID(),
      sender_id: user.id,
      sender_name: senderName,
      content: trimmed,
      channel,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setInput("");

    startTransition(async () => {
      try {
        await sendMessage(projectId, channel, trimmed, senderName);
        const fresh = await getMessages(projectId, channel);
        setMessages(fresh);
      } catch (err) {
        // Rollback optimistic message
        setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
        setInput(trimmed);
        toast.error("Failed to send", {
          description: err instanceof Error ? err.message : "Please try again.",
        });
      }
    });
  }

  // Group messages by date
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
            <p className="text-sm text-muted-foreground">
              No messages yet. Start the conversation.
            </p>
          </div>
        )}
        {grouped.map(({ date, messages: dayMsgs }) => (
          <div key={date} className="space-y-3">
            {/* Date divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground shrink-0">{date}</span>
              <div className="flex-1 h-px bg-border" />
            </div>
            {dayMsgs.map((msg) => {
              const isMe = msg.sender_id === user?.id;
              return (
                <div
                  key={msg.id}
                  className={cn("flex flex-col gap-0.5", isMe ? "items-end" : "items-start")}
                >
                  <span className="text-xs text-muted-foreground px-1">
                    {isMe ? "You" : msg.sender_name} · {formatTime(msg.created_at)}
                  </span>
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
                </div>
              );
            })}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t px-4 py-3 flex gap-2 items-end bg-background">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
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

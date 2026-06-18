"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { label: "Overview",   segment: null },
  { label: "Rooms",      segment: "rooms" },
  { label: "Materials",  segment: "materials" },
  { label: "Designs",    segment: "designs" },
  { label: "Timeline",   segment: "timeline" },
  { label: "Progress",   segment: "progress" },
  { label: "Documents",  segment: "documents" },
  { label: "BOQ",        segment: "boq" },
  { label: "Tasks",        segment: "tasks" },
  { label: "Site Visits",  segment: "site-visits" },
  { label: "Mood Board",   segment: "mood-board" },
  { label: "Sign-off",     segment: "signoff" },
  { label: "Chat",         segment: "chat" },
];

export function ProjectNav({ projectId }: { projectId: string }) {
  const pathname = usePathname();
  const base = `/projects/${projectId}`;

  return (
    <nav className="flex gap-1">
      {tabs.map(({ label, segment }) => {
        const href = segment ? `${base}/${segment}` : base;
        const isActive = segment
          ? pathname.startsWith(`${base}/${segment}`)
          : pathname === base;

        return (
          <Link
            key={label}
            href={href}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-md transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

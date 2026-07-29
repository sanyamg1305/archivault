"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

interface LinkGroup {
  label: string;
  type: "link";
  segment: string | null;
  items?: undefined;
}

interface DropdownGroup {
  label: string;
  type: "dropdown";
  items: { label: string; segment: string }[];
  segment?: undefined;
}

type GroupItem = LinkGroup | DropdownGroup;

const groups: GroupItem[] = [
  {
    label: "Overview",
    type: "link",
    segment: null,
  },
  {
    label: "Planning",
    type: "dropdown",
    items: [
      { label: "Rooms", segment: "rooms" },
      { label: "Designs", segment: "designs" },
      { label: "Mood Board", segment: "mood-board" },
    ],
  },
  {
    label: "Execution",
    type: "dropdown",
    items: [
      { label: "Timeline", segment: "timeline" },
      { label: "Tasks", segment: "tasks" },
      { label: "Task Allotment", segment: "internal-tasks" },
      { label: "Site Visits", segment: "site-visits" },
      { label: "Progress", segment: "progress" },
    ],
  },
  {
    label: "Budget & Specs",
    type: "dropdown",
    items: [
      { label: "Materials", segment: "materials" },
      { label: "BOQ", segment: "boq" },
    ],
  },
  {
    label: "Client Portal",
    type: "dropdown",
    items: [
      { label: "Documents", segment: "documents" },
      { label: "Sign-off", segment: "signoff" },
      { label: "Chat", segment: "chat" },
    ],
  },
];

export function ProjectNav({ projectId }: { projectId: string }) {
  const pathname = usePathname();
  const base = `/projects/${projectId}`;

  return (
    <nav className="flex items-center gap-1.5">
      {groups.map((group) => {
        if (group.type === "link") {
          const href = group.segment ? `${base}/${group.segment}` : base;
          const isActive = group.segment
            ? pathname.startsWith(`${base}/${group.segment}`)
            : pathname === base;

          return (
            <Link
              key={group.label}
              href={href}
              className={cn(
                "px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200 select-none",
                isActive
                  ? "bg-[#2F5BFF] text-white shadow-sm shadow-[#2F5BFF]/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {group.label}
            </Link>
          );
        }

        // Check if any sub-item in this dropdown is currently active
        const isActive = group.items.some((item) =>
          pathname.startsWith(`${base}/${item.segment}`)
        );

        return (
          <DropdownMenu key={group.label}>
            <DropdownMenuTrigger
              className={cn(
                "px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200 flex items-center gap-1 outline-none select-none border border-transparent hover:border-border/30",
                isActive
                  ? "bg-[#2F5BFF] text-white shadow-sm shadow-[#2F5BFF]/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {group.label}
              <ChevronDown className="h-3.5 w-3.5 opacity-80 shrink-0" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="rounded-xl p-1.5 min-w-[160px] border-border/50 shadow-md">
              {group.items.map((item) => {
                const href = `${base}/${item.segment}`;
                const isItemActive = pathname.startsWith(href);

                return (
                  <DropdownMenuItem
                    key={item.label}
                    asChild
                    className={cn(
                      "rounded-lg text-xs font-semibold cursor-pointer py-2 px-3",
                      isItemActive
                        ? "bg-[#eaefff] text-[#2F5BFF] dark:bg-[#2F5BFF]/20 dark:text-[#93c5fd]"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Link href={href} className="w-full flex items-center justify-between">
                      <span>{item.label}</span>
                      {isItemActive && <span className="h-1.5 w-1.5 rounded-full bg-[#2F5BFF] dark:bg-[#93c5fd]" />}
                    </Link>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      })}
    </nav>
  );
}

"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function RoomNav({ projectId, roomId }: { projectId: string; roomId: string }) {
  const pathname = usePathname();
  
  const links = [
    { name: "Materials", href: `/projects/${projectId}/rooms/${roomId}/materials` },
    { name: "Designs", href: `/projects/${projectId}/rooms/${roomId}/designs` },
  ];

  return (
    <nav className="flex space-x-2 border-b border-border/40 pb-4 mb-6">
      {links.map((link) => {
        // We use exact path checking for safety, but startsWith handles nested paths if any
        const isActive = pathname.startsWith(link.href) || pathname === `/projects/${projectId}/rooms/${roomId}`;
        // Note: The root path redirects to materials, so materials is essentially active if on root or /materials
        const isActuallyActive = pathname.startsWith(link.href);
        
        return (
          <Link
            key={link.name}
            href={link.href}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-md transition-colors",
              isActuallyActive ? "bg-secondary text-secondary-foreground" : "hover:bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {link.name}
          </Link>
        );
      })}
    </nav>
  );
}

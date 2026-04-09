"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { cn } from "@/lib/utils";

export default function ActionCenterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const params = useParams();
  const projectId = params.projectId as string;

  const tabs = [
    {
      name: "Design Approvals",
      href: `/portal/${projectId}/action-center/design-approvals`,
      isActive: pathname.includes("/design-approvals"),
    },
    {
      name: "Material Approvals",
      href: `/portal/${projectId}/action-center/material-approvals`,
      isActive: pathname.includes("/material-approvals"),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header aligned like dashboard: div className="p-6 space-y-6" */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Action Center</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review and approve pending designs and materials to keep your project moving forward.
        </p>
      </div>

      <div className="border-b border-border">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <Link
              key={tab.name}
              href={tab.href}
              className={cn(
                tab.isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:border-muted hover:text-foreground",
                "whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors"
              )}
            >
              {tab.name}
            </Link>
          ))}
        </nav>
      </div>

      <div className="pt-2">
        {children}
      </div>
    </div>
  );
}

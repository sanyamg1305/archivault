"use client";

import { OrganizationProfile } from "@clerk/nextjs";

export default function SettingsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your organization, members, and billing.</p>
      </div>
      <OrganizationProfile routing="hash" />
    </div>
  );
}

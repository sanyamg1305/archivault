import { OrganizationList } from "@clerk/nextjs"

export function OrganizationGuard() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome to ArchiVault</h1>
          <p className="text-muted-foreground mt-2">
            To get started, please select an existing workspace or create a new one for your firm.
          </p>
        </div>

        <div className="flex flex-col items-center gap-6">
          <OrganizationList
            hidePersonal
            afterCreateOrganizationUrl="/dashboard"
            afterSelectOrganizationUrl="/dashboard"
          />
        </div>
      </div>
    </div>
  )
}

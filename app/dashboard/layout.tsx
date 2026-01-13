import Link from "next/link"
import ProfileMenu from "@/components/layout/ProfileMenu"
import DashboardNav from "@/components/layout/DashboardNav"

import { getSession } from "@/lib/auth"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  const firstName = session?.name?.split(" ")[0]

  console.log("DASHBOARD SESSION →", session)

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <header className="flex items-center justify-between border-b bg-white px-6 py-4 dark:bg-black sticky top-0 z-40">
        <div className="flex items-center gap-6">
          <h1 className="text-lg font-semibold">Dashboard</h1>

          {session?.role && (
            <DashboardNav role={session.role} />
          )}

        </div>

        <div className="flex items-center gap-3">
          {/* Text block */}
          <div className="flex flex-col items-end leading-tight">
            <span className="text-sm font-medium">
              Hi, {firstName}
            </span>

            <span className="text-[11px] text-muted-foreground">
              {session?.role === "APPLICANT" ? "Applicant" : "Recruiter"}
            </span>
          </div>

          {/* Avatar */}
          <ProfileMenu 
            name={session?.name} 
            role={session?.role}
          />
        </div>
        
      </header>

      <main className="p-6">{children}</main>
    </div>
  )
}

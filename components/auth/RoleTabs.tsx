"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

type Role = "applicant" | "recruiter"

export default function RoleTabs({
  role,
  setRole,
}: {
  role: Role
  setRole: (role: Role) => void
}) {
  return (
    <Tabs value={role} onValueChange={(v) => setRole(v as Role)}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger
        value="applicant"
        className="
            transition-all duration-200 ease-out
            data-[state=active]:bg-white
            data-[state=active]:shadow
            data-[state=active]:shadow-zinc-300
            data-[state=active]:-translate-y-[1px]
            data-[state=active]:border
            data-[state=active]:border-zinc-300
            data-[state=inactive]:bg-zinc-100
            data-[state=inactive]:text-zinc-500
        "
        >
        Applicant
        </TabsTrigger>

        <TabsTrigger
        value="recruiter"
        className="
            transition-all duration-200 ease-out
            data-[state=active]:bg-white
            data-[state=active]:shadow
            data-[state=active]:shadow-zinc-300
            data-[state=active]:-translate-y-[1px]
            data-[state=active]:border
            data-[state=active]:border-zinc-300
            data-[state=inactive]:bg-zinc-100
            data-[state=inactive]:text-zinc-500
        "
        >
        Recruiter
        </TabsTrigger>

      </TabsList>
    </Tabs>
  )
}

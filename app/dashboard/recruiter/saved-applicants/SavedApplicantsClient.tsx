"use client"

import Link from "next/link"
import { useState } from "react"
import { Search } from "lucide-react"

type SavedApplicant = {
  applicantId: string
  name: string
  email: string
  skills: string[]
}

export default function SavedApplicantsClient({
  applicants,
}: {
  applicants: SavedApplicant[]
}) {
  const [search, setSearch] = useState("")

  const query = search.toLowerCase()

  const filteredApplicants = applicants.filter((app) => {
    const name = app.name.toLowerCase()
    const email = app.email.toLowerCase()
    const skillsText = app.skills.join(" ").toLowerCase()

    return (
      name.includes(query) ||
      email.includes(query) ||
      skillsText.includes(query)
    )
  })

  return (
    <div className="space-y-4">
  {/* Header row */}
  <div className="flex items-center justify-between">
    <h2 className="text-lg font-semibold">
      Saved Applicants
    </h2>

    <div className="relative w-72">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="text"
        placeholder="Search name, email, or skill"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="h-9 w-full rounded-md border bg-background pl-9 pr-3 text-sm"
      />
    </div>
  </div>


      {filteredApplicants.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-8 text-center">
          <p className="text-sm font-semibold">
            No applicants found
          </p>
          <p className="text-sm text-muted-foreground">
            Try a different name, email, or skill.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplicants.map((app) => (
            <div
              key={app.applicantId}
              // rounded-xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 group
              className="rounded-xl border-border bg-card border-muted-foreground p-4 flex items-center justify-between hover:shadow-md transition-all duration-200 hover:scale-101 border-muted-foreground group"
            >
              <div>
                <p className="font-medium">
                  {app.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {app.email}
                </p>

                {app.skills.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {app.skills.slice(0, 5).map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-muted px-2 py-0.5 text-xs border"
                      >
                        {skill}
                      </span>
                    ))}

                    {app.skills.length > 5 && (
                      <span className="text-xs text-muted-foreground">
                        +{app.skills.length - 5}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <Link
                href={`/dashboard/recruiter/applicants/${app.applicantId}`}
                className="text-md font-medium text-primary hover:underline mr-6"
              >
                View →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

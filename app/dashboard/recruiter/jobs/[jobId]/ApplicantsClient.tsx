"use client"

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { Search } from "lucide-react"

import SaveApplicantButton from "@/components/recruiter/SaveApplicantButton"

type Application = {
  applicationId: string
  status: "APPLIED" | "SHORTLISTED" | "REJECTED" | "HIRED"
  appliedAt: string

  applicant: {
  id: string
  name: string
  email: string
  skills?: {
    id: string
    name: string
  }[]
}


  resume: {
    id: string
    title: string
    fileUrl: string
  }

  isSaved: boolean
}


export default function ApplicantsClient({
  applications,
}: {
  applications: Application[]
}) {
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const [statusFilter, setStatusFilter] = useState("ALL")
  const [search, setSearch] = useState("")

  const [sortBy, setSortBy] = useState< "NEWEST" | "OLDEST" | "STATUS" >("NEWEST")

  const [hireTargetId, setHireTargetId] = useState<string | null>(null)

  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const statusPriority: Record<string, number> = {
    APPLIED: 1,
    SHORTLISTED: 2,
    HIRED: 3,
    REJECTED: 4,
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    )
  }

  function clearSelection() {
    setSelectedIds([])
  }

  async function updateStatus(
    applicationId: string,
    status: "SHORTLISTED" | "REJECTED" | "HIRED"
  ) {
    setLoadingId(applicationId)

    const res = await fetch(`/api/applications/${applicationId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status }),
    })

    setLoadingId(null)

    if (!res.ok) {
      toast.error("Failed to update status")
      return
    }

    router.refresh()
    toast.success("Application status updated")
  }

  async function bulkUpdate(status: "SHORTLISTED" | "REJECTED") {
    for (const id of selectedIds) {
      await updateStatus(id, status)
    }
    clearSelection()
  }


  const filteredApplicants = applications
  .filter((app) => {
    const matchesStatus =
      statusFilter === "ALL" || app.status === statusFilter

    const name = app.applicant.name ?? ""
const email = app.applicant.email ?? ""

const skillsText =
  app.applicant.skills?.map((s) => s.name).join(" ") ?? ""

const query = search.toLowerCase()

const matchesSearch =
  name.toLowerCase().includes(query) ||
  email.toLowerCase().includes(query) ||
  skillsText.toLowerCase().includes(query)

    return matchesStatus && matchesSearch
  })
  .sort((a, b) => {
    if (sortBy === "NEWEST") {
      return (
        new Date(b.appliedAt).getTime() -
        new Date(a.appliedAt).getTime()
      )
    }

    if (sortBy === "OLDEST") {
      return (
        new Date(a.appliedAt).getTime() -
        new Date(b.appliedAt).getTime()
      )
    }

    // STATUS priority
    return (
      statusPriority[a.status] -
      statusPriority[b.status]
    )
  })

  return (
    <>
      {selectedIds.length > 0 && (
        <div className="mb-4 flex items-center justify-between rounded-md border bg-muted px-4 py-2">
          <p className="text-sm">
            {selectedIds.length} selected
          </p>

          <div className="flex gap-2">
            <button
              onClick={() => bulkUpdate("SHORTLISTED")}
              className="px-3 py-1 text-xs rounded bg-green-100 text-green-700"
            >
              Bulk Shortlist
            </button>

            <button
              onClick={() => bulkUpdate("REJECTED")}
              className="px-3 py-1 text-xs rounded bg-red-100 text-red-700"
            >
              Bulk Reject
            </button>

            <button
              onClick={clearSelection}
              className="px-3 py-1 text-xs rounded border"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border px-3 py-2 text-sm"
          >
            <option value="ALL">All Status</option>
            <option value="APPLIED">Applied</option>
            <option value="SHORTLISTED">Shortlisted</option>
            <option value="REJECTED">Rejected</option>
            <option value="HIRED">Hired</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as any)
            }
            className="rounded-md border px-3 py-2 text-sm"
          >
            <option value="NEWEST">Newest first</option>
            <option value="OLDEST">Oldest first</option>
            <option value="STATUS">Status priority</option>
          </select>
        </div>

        {/* Search */}
        <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search name, email or skill"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 w-full rounded-md border bg-background pl-9 pr-3 text-sm"
        />
        </div>
      </div>

      {/* Applicants List */}
      <div className="mt-4">
        {filteredApplicants.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-8 text-center">
            <h3 className="text-sm font-semibold">No applicants found</h3>
            <p className="text-sm text-muted-foreground">
              No candidates match the selected filter or search.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplicants.map((app) => (
              <div
                key={app.applicationId}
                className="rounded-lg border rounded p-4 space-y-2 hover:shadow-md transition-all duration-200 hover:scale-102 group"
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(app.applicationId)}
                    onChange={() => toggleSelect(app.applicationId)}
                    className="mt-3"
                  />

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
  <p className="font-medium">
    {app.applicant.name} ({app.applicant.email})
  </p>

  {app.applicant.skills && app.applicant.skills.length > 0 && (
    <div className="flex flex-wrap gap-2">
      {app.applicant.skills.map((skill) => (
        <span
          key={skill.id}
          className="rounded-full bg-muted border border-muted-foreground/30 px-2.5 py-0.5 text-xs text-muted-foreground"
        >
          {skill.name}
        </span>
      ))}
    </div>
  )}
</div>

                      <SaveApplicantButton
                        applicantId={app.applicant.id}
                        initialSaved={app.isSaved}
                      />
                    </div>

                    <p>Status: {app.status}</p>

                    <a
                      href={app.resume.fileUrl}
                      target="_blank"
                      className="text-blue-600 underline text-sm"
                    >
                      View Resume
                    </a>

                    <p className="text-sm">
                      Applied on{" "}
                      {new Date(app.appliedAt).toLocaleDateString()}
                    </p>

                    {(app.status === "APPLIED" ||
                      app.status === "SHORTLISTED") && (
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() =>
                            updateStatus(app.applicationId, "SHORTLISTED")
                          }
                          disabled={loadingId === app.applicationId}
                          className="px-3 py-1 text-xs rounded bg-green-100 text-green-700 cursor-pointer"
                        >
                          Shortlist
                        </button>

                        <button
                          onClick={() =>
                            updateStatus(app.applicationId, "REJECTED")
                          }
                          disabled={loadingId === app.applicationId}
                          className="px-3 py-1 text-xs rounded bg-red-100 text-red-700 cursor-pointer"
                        >
                          Reject
                        </button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button
                              onClick={() =>
                                setHireTargetId(app.applicationId)
                              }
                              className="px-3 py-1 text-xs rounded bg-blue-100 text-blue-700 cursor-pointer"
                            >
                              Hire
                            </button>
                          </AlertDialogTrigger>

                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Confirm Hire
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to mark this applicant
                                as <strong>HIRED</strong>?
                              </AlertDialogDescription>
                            </AlertDialogHeader>

                            <AlertDialogFooter>
                              <AlertDialogCancel
                                onClick={() => setHireTargetId(null)}
                              >
                                Cancel
                              </AlertDialogCancel>

                              <AlertDialogAction
                                onClick={() => {
                                  if (hireTargetId) {
                                    updateStatus(hireTargetId, "HIRED")
                                    setHireTargetId(null)
                                  }
                                }}
                              >
                                Yes, Hire
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

type JobStatus = "DRAFT" | "ACTIVE" | "CLOSED"

type RecruiterJob = {
  id: string
  title: string
  location: string
  status: JobStatus
  createdAt: string
}

export default function RecruiterJobCard({
  job,
}: {
  job: RecruiterJob
}) {
  const router = useRouter()

  async function updateJobStatus(status: "ACTIVE" | "DRAFT") {
    const res = await fetch(`/api/jobs/${job.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status }),
    })

    if (res.ok) {
      toast.success(
        status === "ACTIVE"
          ? "Job published"
          : "Job unpublished"
      )
      router.refresh()
    } else {
      toast.error("Failed to update job status")
    }
  }

  return (
    <Card>
      <CardHeader>
        {/* ✅ ONLY the title is a link */}
        <Link href={`/dashboard/recruiter/jobs/${job.id}`}>
          <CardTitle className="text-lg hover:underline cursor-pointer">
            {job.title}
          </CardTitle>
        </Link>

        <p className="text-sm text-muted-foreground">
          {job.location}
        </p>
      </CardHeader>

      <CardContent className="flex items-center justify-between text-sm">
        <span className="capitalize">
          Status: {job.status.toLowerCase()}
        </span>

        {job.status === "DRAFT" ? (
          <Button
            size="sm"
            onClick={() => updateJobStatus("ACTIVE")}
          >
            Publish
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={() => updateJobStatus("DRAFT")}
          >
            Unpublish
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

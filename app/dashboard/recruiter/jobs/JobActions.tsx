"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useState } from "react"

function getAction(status: string) {
  if (status === "ACTIVE") {
    return { next: "CLOSED", label: "Close Job" }
  }

  if (status === "CLOSED") {
    return { next: "ACTIVE", label: "Reopen Job" }
  }

  // DRAFT
  return { next: "ACTIVE", label: "Publish Job" }
}

export default function JobActions({
  jobId,
  status,
}: {
  jobId: string
  status: string
}) {
  const router = useRouter()
  const { next, label } = getAction(status)
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    if (loading) return

    try {
      setLoading(true)
      
      const res = await fetch(`/api/jobs/${jobId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      })

      if (!res.ok) throw new Error()

      toast.success(`Job ${label.replace(" Job", "").toLowerCase()} successfully`)
      router.refresh()
    } catch {
      toast.error("Failed to update job status")
    } finally {
      setLoading(false)
    }

  }

  return (
  <div className="flex items-center gap-2">
  {/* Edit Job (not allowed for CLOSED) */}
  {status !== "CLOSED" && (
    <Button
      size="sm"
      variant="outline"
      onClick={() =>
        router.push(`/dashboard/recruiter/jobs/${jobId}/edit`)
      }
    >
      Edit
    </Button>
  )}

  {/* Status Action */}
  <Button
    size="sm"
    variant={status === "DRAFT" ? "default" : "outline"}
    onClick={handleClick}
    className={
      status === "DRAFT"
        ? "font-semibold hover:cursor-pointer hover:bg-gray-700"
        : "hover:cursor-pointer"
    }
    disabled={loading}
  >
    {loading ? "Updating..." : label}
  </Button>
</div>
)
}

"use client"

import { useState } from "react"
import { Bookmark } from "lucide-react"
import { toast } from "sonner"

export default function SaveJobButton({
  jobId,
  initialSaved,
}: {
  jobId: string
  initialSaved: boolean
}) {
  const [saved, setSaved] = useState(initialSaved)
  const [loading, setLoading] = useState(false)

  async function toggleSave() {
    try {
      setLoading(true)

      const res = await fetch(`/api/jobs/${jobId}/save`, {
        method: saved ? "DELETE" : "POST",
        credentials: "include",
      })

      if (!res.ok) throw new Error()

      setSaved(!saved)
      toast.success(saved ? "Removed from saved jobs" : "Job saved")
    } catch {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggleSave}
      disabled={loading}
      className="text-muted-foreground hover:text-black disabled:opacity-50"
      title={saved ? "Unsave job" : "Save job"}
    >
      <Bookmark
        className={`h-5 w-5 ${
          saved ? "fill-black text-black" : ""
        }`}
      />
    </button>
  )
}

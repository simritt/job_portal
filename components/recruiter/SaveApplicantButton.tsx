"use client"

import { useState } from "react"
import { Bookmark } from "lucide-react"
import { cn } from "@/lib/utils"

export default function SaveApplicantButton({
  applicantId,
  initialSaved = false,
}: {
  applicantId: string
  initialSaved?: boolean
}) {
  const [saved, setSaved] = useState(initialSaved)
  const [loading, setLoading] = useState(false)

  async function toggleSave() {
    setLoading(true)

    const res = await fetch("/api/recruiter/saved-applicants", {
      method: saved ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ applicantId }),
    })

    if (res.ok) {
      setSaved(!saved)
    }

    setLoading(false)
  }

  return (
    <button
      onClick={toggleSave}
      disabled={loading}
      className="p-2 rounded-md hover:bg-muted transition"
      title={saved ? "Unsave job" : "Save job"}
      aria-label="Save applicant"
    >
      <Bookmark
        className={cn(
          "h-5 w-5",
          saved ? "fill-primary text-primary" : "text-muted-foreground"
        )}
      />
    </button>
  )
}

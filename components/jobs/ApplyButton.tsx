"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import ResumeModal from "@/components/resume/ResumeModal"

export default function ApplyButton({ jobId }: { jobId: string }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Apply
      </Button>

      <ResumeModal
        open={open}
        onClose={() => setOpen(false)}
        jobId={jobId}
      />
    </>
  )
}

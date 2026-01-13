"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

type Resume = {
  id: string
  fileUrl: string
}

type Props = {
  open: boolean
  onClose: () => void
  jobId: string
}

export default function ResumeModal({ open, onClose, jobId }: Props) {
  console.log("ResumeModal received jobId:", jobId)

  const [resumes, setResumes] = useState<Resume[]>([])
  const [selectedResume, setSelectedResume] = useState<string>("")
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return

    fetch("/api/resumes", { credentials: "include" })
      .then((res) => res.json())
      .then(setResumes)
  }, [open])

  async function uploadResume(): Promise<string | null> {
    if (!file) return null

    const formData = new FormData()
    formData.append("file", file)

    setUploading(true)

    const res = await fetch("/api/resumes", {
      method: "POST",
      credentials: "include",
      body: formData,
    })

    setUploading(false)

    if (!res.ok) {
      toast.error("Failed to upload resume")
      return null
    }

    const data = await res.json()
    return data.id
  }

  async function handleApply() {
    let resumeId = selectedResume

    setLoading(true)

    //If user uploaded a file, upload it first
    if (file) {
      const uploadedResumeId = await uploadResume()
      if (!uploadedResumeId) {
        setLoading(false)
        return
      }
      resumeId = uploadedResumeId
    }

    // Apply with resumeId
    const res = await fetch(`/api/jobs/${jobId}/apply`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ resumeId }),
    })

    setLoading(false)

    if (!res.ok) {
      if (res.status === 400) {
        toast.error("You’ve already applied for this job")
      } else {
        toast.error("Failed to apply. Please try again.")
      }
      return
    }

    onClose()
    toast.success("Application submitted successfully")
    window.location.reload()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Resume</DialogTitle>
        </DialogHeader>

        <RadioGroup onValueChange={setSelectedResume}>
          {resumes.map((resume) => (
            <div key={resume.id} className="flex items-center space-x-2">
              <RadioGroupItem value={resume.id} id={resume.id} />
              <Label htmlFor={resume.id}> {resume.fileUrl.split("/").pop()}</Label>
            </div>
          ))}
        </RadioGroup>

        <div className="pt-4">
          <Label>Or upload new resume</Label>
          <Input type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        </div>

        <Button
          className="mt-4"
          onClick={handleApply}
          disabled={loading || uploading || (!selectedResume && !file)}
        >
          {loading ? "Applying..." : "Apply"}
        </Button>
      </DialogContent>
    </Dialog>
  )
}

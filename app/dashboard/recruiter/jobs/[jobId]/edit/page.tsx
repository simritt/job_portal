"use client"

import { useEffect, useState } from "react"
// import { useRouter } from "next/navigation"
import JobSkillsForm from "@/components/skills/JobSkillsForm"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

type Job = {
  id: string
  title: string
  location: string | null
  description: string
  salaryMin: number | null
  salaryMax: number | null
  negotiable: boolean
  experienceRequired: number | null
}

import { useParams, useRouter } from "next/navigation"

export default function EditJobPage() {
  const router = useRouter()
  const { jobId } = useParams<{ jobId: string }>()

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const [title, setTitle] = useState("")
  const [location, setLocation] = useState("")
  const [description, setDescription] = useState("")
  const [salaryMin, setSalaryMin] = useState<number | "">("")
  const [salaryMax, setSalaryMax] = useState<number | "">("")
  const [negotiable, setNegotiable] = useState(false)
  const [experienceRequired, setExperienceRequired] = useState<number | "">("")

  /* ---------------- FETCH JOB (PREFILL) ---------------- */
  useEffect(() => {
  if (!jobId) return

  async function fetchJob() {
    setLoading(true)

    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        credentials: "include",
      })

      if (!res.ok) {
        toast.error("Failed to load job")
        router.push("/dashboard/recruiter/jobs")
        return
      }

      const job = await res.json()

      setTitle(job.title)
      setLocation(job.location ?? "")
      setDescription(job.description)
      setSalaryMin(job.salaryMin ?? "")
      setSalaryMax(job.salaryMax ?? "")
      setNegotiable(job.negotiable)
      setExperienceRequired(job.experienceRequired ?? "")
    } catch {
      toast.error("Something went wrong")
      router.push("/dashboard/recruiter/jobs")
    } finally {
      setLoading(false)
    }
  }

  fetchJob()
}, [jobId, router])

  /* ---------------- SAVE CHANGES ---------------- */
  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title,
          location,
          description,
          salaryMin: salaryMin === "" ? null : salaryMin,
          salaryMax: salaryMax === "" ? null : salaryMax,
          negotiable,
          experienceRequired:
            experienceRequired === "" ? null : experienceRequired,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.message || "Failed to update job")
        return
      }

      toast.success("Job updated successfully")
      router.push("/dashboard/recruiter/jobs")
    } catch {
      toast.error("Something went wrong")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Loading job…
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold">Edit Job</h1>
        <p className="text-sm text-muted-foreground">
          Update job details and required skills
        </p>
        
      </div>

 <button
  onClick={() => router.back()}
  className="inline-flex items-center cursor-pointer justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:scale-[1.02] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-0 border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 m-2 px-3 py-2"
>
  Back
</button>
</div>
      {/* JOB DETAILS */}
      <form
        onSubmit={handleSave}
        className="space-y-4 rounded-lg border bg-card p-6"
      >
        <div>
          <Label className="pb-2">Job Title</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <Label className="pb-2">Location</Label>
          <Input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        <div>
          <Label className="pb-2">Description</Label>
          <Textarea
            rows={6}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            type="number"
            placeholder="Salary min"
            value={salaryMin}
            onChange={(e) =>
              setSalaryMin(e.target.value === "" ? "" : Number(e.target.value))
            }
          />
          <Input
            type="number"
            placeholder="Salary max"
            value={salaryMax}
            onChange={(e) =>
              setSalaryMax(e.target.value === "" ? "" : Number(e.target.value))
            }
          />
        </div>

        <div className="flex items-center gap-3 rounded-md border p-3">
          <input
            type="checkbox"
            checked={negotiable}
            onChange={(e) => setNegotiable(e.target.checked)}
          />
          <div className="text-sm">
            <p className="font-medium">Salary negotiable</p>
            <p className="text-xs text-muted-foreground">
              Candidate can discuss compensation
            </p>
          </div>
        </div>

        <Input
          type="number"
          placeholder="Experience required (years)"
          value={experienceRequired}
          onChange={(e) =>
            setExperienceRequired(
              e.target.value === "" ? "" : Number(e.target.value)
            )
          }
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </form>

      {/* SKILLS */}
      {jobId && <JobSkillsForm jobId={jobId} />}
    </div>
  )
}

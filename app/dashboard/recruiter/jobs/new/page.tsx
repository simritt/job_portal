"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Info } from "lucide-react"
import JobSkillsForm from "@/components/skills/JobSkillsForm"

export default function NewJobPage() {
  const router = useRouter()

  const [title, setTitle] = useState("")
  const [location, setLocation] = useState("")
  const [description, setDescription] = useState("")
  const [salaryMin, setSalaryMin] = useState<number | "">("")
  const [salaryMax, setSalaryMax] = useState<number | "">("")
  const [negotiable, setNegotiable] = useState(false)
  const [experienceRequired, setExperienceRequired] = useState<number | "">("")
  const [salaryError, setSalaryError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createdJobId, setCreatedJobId] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (salaryMin !== "" && salaryMax !== "" && salaryMax < salaryMin) {
      setSalaryError("Salary max must be greater than or equal to salary min")
      toast.error("Salary max must be greater than or equal to salary min")
      return
    }

    setSalaryError(null)
    setIsSubmitting(true)

    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
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
        toast.error(data.message || "Failed to post job")
        return
      }

      const job = await res.json()
toast.success("Job created successfully")

setCreatedJobId(job.id)
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="rounded-lg border bg-card p-6 shadow-sm space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Post a new job</h1>
          <p className="text-sm text-muted-foreground">
            Start with basic details. You can add skills after creating the job draft.
          </p>
        </div>

        {/* Skills info (IMPORTANT UX) */}
        <div className="flex items-start gap-3 rounded-md border border-border bg-muted/30 p-4 text-sm">
          <Info className="h-4 w-4 mt-0.5 text-muted-foreground" />
          <p className="text-muted-foreground">
            Required skills can be added once the job is created.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="pb-2">Job Title</Label>
            <Input 
              value={title} 
              disabled={!!createdJobId}
              onChange={(e) => setTitle(e.target.value)} 
              required
            />

          </div>

          <div>
            <Label className="pb-2">Location</Label>
            <Input 
              value={location}
              disabled={!!createdJobId}
              onChange={(e) => setLocation(e.target.value)} 
              required 
            />
          </div>

          <div>
            <Label className="pb-2">Description</Label>
            <Textarea
              rows={6}
              value={description}
              disabled={!!createdJobId}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {/* Compensation */}
          <div className="space-y-4 pt-4 border-t border-border">
            <div>
              <h2 className="text-md font-semibold text-foreground">
                Compensation & Experience
              </h2>
              <p className="text-xs text-muted-foreground">
                Optional — helps candidates understand expectations
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                placeholder="Salary min"
                value={salaryMin}
                disabled={!!createdJobId}
                onChange={(e) =>
                  setSalaryMin(e.target.value === "" ? "" : Number(e.target.value))
                }
              />
              <Input
                type="number"
                placeholder="Salary max"
                value={salaryMax}
                disabled={!!createdJobId}
                onChange={(e) =>
                  setSalaryMax(e.target.value === "" ? "" : Number(e.target.value))
                }
              />
            </div>

            {salaryError && (
              <p className="text-sm text-destructive">{salaryError}</p>
            )}

            <div className="flex items-center gap-3 rounded-md border border-border p-3">
              <input
                type="checkbox"
                checked={negotiable}
                disabled={!!createdJobId}
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
              disabled={!!createdJobId}
              onChange={(e) =>
                setExperienceRequired(
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
            />
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating draft..." : "Create Job (Draft)"}
          </Button>
        </form>
        {createdJobId && (
  <div className="pt-6 border-t space-y-4">
    <JobSkillsForm jobId={createdJobId} />

    <div className="flex justify-end">
      <Button
        onClick={() => router.push("/dashboard/recruiter/jobs")}
      >
        Finish & Go to My Jobs
      </Button>
    </div>
  </div>
)}


      </div>
    </div>
  )
}

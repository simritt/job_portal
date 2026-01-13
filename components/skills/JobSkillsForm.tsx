"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { X, Plus } from "lucide-react"
import { toast } from "sonner"

type JobSkill = {
  name: string
  isMandatory: boolean
  minYears?: number | null
}

export default function JobSkillsForm({ jobId }: { jobId: string }) {
  const [skills, setSkills] = useState<JobSkill[]>([])
  const [newSkill, setNewSkill] = useState("")
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [dirty, setDirty] = useState(false)

  /* fetch existing skills */
  useEffect(() => {
  if (!jobId) return

  fetch(`/api/jobs/${jobId}/skills`)
    .then((res) => res.json())
    .then((data) => {
      setSkills(
        data.skills.map((s: any) => ({
          name: s.name,
          isMandatory: s.isMandatory,
          minYears: s.minYears,
        }))
      )
    })
    .finally(() => setLoading(false))
}, [jobId])


  function addSkill() {
    if (!newSkill.trim()) return

    if (
      skills.some(
        (s) => s.name.toLowerCase() === newSkill.toLowerCase()
      )
    ) {
      toast.error("Skill already added")
      return
    }

    setSkills((prev) => [
      ...prev,
      {
        name: newSkill.trim(),
        isMandatory: true,
        minYears: null,
      },
    ])
    setNewSkill("")
    setDirty(true)
  }

  function removeSkill(name: string) {
    setSkills((prev) => prev.filter((s) => s.name !== name))
    setDirty(true)
  }

  async function saveSkills() {
    setSaving(true)

    const res = await fetch(`/api/jobs/${jobId}/skills`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ skills }),
    })

    setSaving(false)

    if (!res.ok) {
      toast.error("Failed to save job skills")
      return
    }

    toast.success("Job skills updated")
    setDirty(false)
  }

  if (loading) {
    return (
      <p className="text-sm text-muted-foreground">
        Loading skills…
      </p>
    )
  }

  return (
    <div className="space-y-5 rounded-xl border bg-card p-6">
      {/* HEADER */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">
            Required Skills
          </h2>
          <p className="text-sm text-muted-foreground">
            Add skills candidates should have for this role
          </p>
        </div>

        <Button
          size="sm"
          onClick={saveSkills}
          disabled={!dirty || saving}
        >
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>

      {/* ADD SKILL */}
      <div className="flex gap-2">
        <Input
          placeholder="e.g. React, Java, SQL"
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addSkill()}
        />
        <Button
          variant="secondary"
          onClick={addSkill}
          className="gap-1"
        >
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>

      {/* EMPTY */}
      {skills.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No skills added yet.
        </p>
      ) : (
        <div className="space-y-3">
          {skills.map((skill) => (
            <div
              key={skill.name}
              className="flex flex-wrap items-center gap-3 rounded-lg border bg-muted/40 px-4 py-3"
            >
              {/* Skill chip */}
              <span
                className={`rounded-full px-3 py-1 text-sm font-medium ${
                  skill.isMandatory
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {skill.name}
              </span>

              {/* Mandatory toggle */}
              <div className="flex items-center gap-2 text-sm">
                <Switch
                  checked={skill.isMandatory}
                  onCheckedChange={(checked) => {
                    setSkills((prev) =>
                      prev.map((s) =>
                        s.name === skill.name
                          ? { ...s, isMandatory: checked }
                          : s
                      )
                    )
                    setDirty(true)
                  }}
                />
                <span>
                  {skill.isMandatory ? "Mandatory" : "Optional"}
                </span>
              </div>

              {/* Min years */}
              <Input
                type="number"
                min={0}
                placeholder="Years"
                className="h-8 w-[90px]"
                value={skill.minYears ?? ""}
                onChange={(e) => {
                  setSkills((prev) =>
                    prev.map((s) =>
                      s.name === skill.name
                        ? {
                            ...s,
                            minYears:
                              Number(e.target.value) || null,
                          }
                        : s
                    )
                  )
                  setDirty(true)
                }}
              />

              {/* Remove */}
              <X
                className="ml-auto h-4 w-4 cursor-pointer text-muted-foreground hover:text-destructive"
                onClick={() => removeSkill(skill.name)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

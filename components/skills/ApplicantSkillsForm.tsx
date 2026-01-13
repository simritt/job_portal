"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { X } from "lucide-react"
import { toast } from "sonner"

type Skill = {
  name: string
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED"
  yearsExperience?: number | null
}

export default function ApplicantSkillsForm() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newSkill, setNewSkill] = useState("")

  // fetch existing skills
  useEffect(() => {
    fetch("/api/applicant/skills")
      .then((res) => res.json())
      .then((data) => {
        setSkills(
          data.skills.map((s: any) => ({
            name: s.name,
            level: s.level,
            yearsExperience: s.yearsExperience,
          }))
        )
      })
      .finally(() => setLoading(false))
  }, [])

  function addSkill() {
    if (!newSkill.trim()) return

    if (skills.some((s) => s.name.toLowerCase() === newSkill.toLowerCase())) {
      toast.error("Skill already added")
      return
    }

    setSkills([
      ...skills,
      {
        name: newSkill.trim(),
        level: "BEGINNER",
        yearsExperience: null,
      },
    ])
    setNewSkill("")
  }

  function removeSkill(name: string) {
    setSkills(skills.filter((s) => s.name !== name))
  }

  async function saveSkills() {
    setSaving(true)

    const res = await fetch("/api/applicant/skills", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ skills }),
    })

    setSaving(false)

    if (!res.ok) {
      toast.error("Failed to save skills")
      return
    }

    toast.success("Skills updated")
  }

  if (loading) return <p className="text-sm text-muted-foreground">Loading skills...</p>
return (
  <div className="space-y-5">
    <div className="flex items-center justify-between">
      <Button onClick={saveSkills} disabled={saving} size="sm">
        {saving ? "Saving..." : "Save"}
      </Button>
    </div>

    {/* Add skill */}
    <div className="flex gap-2">
      <Input
        placeholder="Add a skill (e.g. React, SQL)"
        value={newSkill}
        onChange={(e) => setNewSkill(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && addSkill()}
      />
      <Button variant="secondary" onClick={addSkill}>
        Add
      </Button>
    </div>

    {/* Skills */}
    {skills.length === 0 ? (
      <p className="text-sm text-muted-foreground">
        No skills added yet.
      </p>
    ) : (
      <div className="space-y-2">
        {skills.map((skill) => (
          <div
            key={skill.name}
            className="flex flex-wrap items-center gap-3 rounded-md bg-muted/40 px-4 py-2"
          >
            {/* Skill name capsule */}
            <span className="rounded-full bg-background px-3 py-1 text-sm font-medium shadow-sm">
              {skill.name}
            </span>

            {/* Level */}
            <Select
              value={skill.level}
              onValueChange={(val) =>
                setSkills((prev) =>
                  prev.map((s) =>
                    s.name === skill.name ? { ...s, level: val as any } : s
                  )
                )
              }
            >
              <SelectTrigger className="w-[140px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BEGINNER">Beginner</SelectItem>
                <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                <SelectItem value="ADVANCED">Advanced</SelectItem>
              </SelectContent>
            </Select>

            {/* Years */}
            <Input
              type="number"
              min={0}
              placeholder="Years"
              className="h-8 w-[90px]"
              value={skill.yearsExperience ?? ""}
              onChange={(e) =>
                setSkills((prev) =>
                  prev.map((s) =>
                    s.name === skill.name
                      ? { ...s, yearsExperience: Number(e.target.value) || null }
                      : s
                  )
                )
              }
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
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function EditCompanyPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [location, setLocation] = useState("")
  const [loading, setLoading] = useState(false)

  // Prefill
  useEffect(() => {
    fetch("/api/recruiter/company")
      .then((res) => res.json())
      .then((data) => {
        setName(data.name || "")
        setLocation(data.location || "")
      })
  }, [])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const res = await fetch("/api/recruiter/company", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, location }),
    })

    setLoading(false)

    if (!res.ok) {
      toast.error("Failed to update company")
      return
    }

    toast.success("Company updated")
    router.push("/dashboard/recruiter/profile")
    router.refresh()
  }

  return (
    <form onSubmit={onSubmit} className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Edit Company</h1>
        <p className="text-sm text-muted-foreground">
          Update your company information
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Company Name</Label>
        <Input
          id="name"
          value={name}
          placeholder="New Company's Name"
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="City, Country"
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          Save
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Camera, Eye, EyeOff } from "lucide-react"

export default function RecruiterProfileEditPage() {
  const router = useRouter()

  const [designation, setDesignation] = useState("")
  const [about, setAbout] = useState("")
  const [hiringFocus, setHiringFocus] = useState("")
  const [loading, setLoading] = useState(false)

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [profile, setProfile] = useState<any>(null)

  // Password states
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  // Helper: get initials from name
  function getInitials(fullName?: string) {
    if (!fullName) return "U"
    const parts = fullName.trim().split(" ")
    if (parts.length === 1) return parts[0][0].toUpperCase()
    return (
      parts[0][0].toUpperCase() +
      parts[parts.length - 1][0].toUpperCase()
    )
  }

  // Prefill profile data
  useEffect(() => {
    fetch("/api/recruiter/profile")
      .then((res) => res.json())
      .then((data) => {
        setProfile(data)
        setName(data.name || "")
        setEmail(data.email || "")
        setPhone(data.phone || "")
        setDesignation(data.designation || "")
        setAbout(data.about || "")
        setHiringFocus(data.hiringFocus || "")
      })
  }, [])

  async function handleAvatarUpload(file: File) {
    setUploadingAvatar(true)

    const formData = new FormData()
    formData.append("file", file)

    await fetch("/api/profile/avatar", {
      method: "POST",
      body: formData,
    })

    setUploadingAvatar(false)
    toast.success("Profile photo updated")
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const res = await fetch("/api/recruiter/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        phone,
        designation,
        about,
        hiringFocus,
      }),
    })

    setLoading(false)

    if (!res.ok) {
      toast.error("Failed to update profile")
      return
    }

    toast.success("Profile updated")
    router.push("/dashboard/recruiter/profile")
    router.refresh()
  }

  async function handlePasswordChange() {
  if (!currentPassword || !newPassword || !confirmPassword) {
    toast.error("All fields are required")
    return
  }

  if (newPassword !== confirmPassword) {
    toast.error("Passwords do not match")
    return
  }

  if (newPassword.length < 8) {
    toast.error("Password must be at least 8 characters")
    return
  }

  const res = await fetch("/api/profile/password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      currentPassword,
      newPassword,
    }),
  })

  const data = await res.json()

  if (!res.ok) {
    toast.error(data?.error || "Failed to change password")
    return
  }

  toast.success("Password changed successfully")

  // clear fields
  setCurrentPassword("")
  setNewPassword("")
  setConfirmPassword("")
}

if (!profile) {
  return (
    <div className="flex justify-center py-20 text-muted-foreground">
      Loading profile…
    </div>
  )
}

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-2xl space-y-10">

        {/* HEADER */}
        <div className="flex items-start justify-between">
  <div>
    <h1 className="text-2xl font-semibold">Edit Profile</h1>
    <p className="text-sm text-muted-foreground">
      Update your recruiter information
    </p>
  </div>

  <Button
    type="button"
    variant="outline"
    onClick={() => router.back()}
  >
    Back
  </Button>
</div>


        <form onSubmit={onSubmit} className="space-y-6">

          {/* PROFILE PHOTO */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Photo</CardTitle>
            </CardHeader>

            <CardContent className="flex items-center gap-6">
              <div className="relative group">
                {profile?.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt="Profile"
                    className="h-24 w-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center text-xl font-semibold uppercase">
                    {getInitials(name || profile?.name)}
                  </div>
                )}

                {/* Hover camera overlay */}
                <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition">
                  {uploadingAvatar ? (
                    <span className="text-xs">Uploading…</span>
                  ) : (
                    <>
                      <Camera className="h-6 w-6" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (!file) return
                          handleAvatarUpload(file)
                        }}
                      />
                    </>
                  )}
                </label>
              </div>

              <p className="text-sm text-muted-foreground">
                Hover and click to upload a new photo
              </p>
            </CardContent>
          </Card>

          {/* BASIC INFO */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91…"
                />
              </div>
            </CardContent>
          </Card>

          {/* RECRUITER DETAILS */}
          <Card>
            <CardHeader>
              <CardTitle>Recruiter Details</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Designation</Label>
                <Input
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>About</Label>
                <Textarea
                  rows={5}
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Hiring Focus</Label>
                <Input
                  value={hiringFocus}
                  onChange={(e) => setHiringFocus(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button type="submit" disabled={loading}>
              Save Changes
            </Button>
            <Button variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>

        {/* SECURITY */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Security</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4 max-w-sm">
            {[
              ["Current Password", currentPassword, setCurrentPassword, showCurrent, setShowCurrent],
              ["New Password", newPassword, setNewPassword, showNew, setShowNew],
              ["Confirm Password", confirmPassword, setConfirmPassword, showConfirm, setShowConfirm],
            ].map(([label, value, setter, show, setShow]: any, i) => (
              <div key={i} className="space-y-1">
                <Label>{label}</Label>
                <div className="relative">
                  <Input
                    type={show ? "text" : "password"}
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {show ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            ))}

            <Button
              variant="destructive"
              onClick={handlePasswordChange}
              disabled={!currentPassword || !newPassword || !confirmPassword}
            >
              Change Password
            </Button>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}

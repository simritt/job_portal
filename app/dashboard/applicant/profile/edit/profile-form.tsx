"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { Camera, Eye, EyeOff } from "lucide-react"

type Props = {
  initialData: {
    name: string
    email: string
    phone: string | null
    avatarUrl: string | null
    headline: string | null
    bio: string | null
    location: string | null
  }
}

export default function EditProfileForm({ initialData }: Props) {
  const router = useRouter()

  const [name, setName] = useState(initialData.name ?? "")
  const [email, setEmail] = useState(initialData.email ?? "")
  const [phone, setPhone] = useState(initialData.phone ?? "")
  const [headline, setHeadline] = useState(initialData.headline ?? "")
  const [bio, setBio] = useState(initialData.bio ?? "")
  const [location, setLocation] = useState(initialData.location ?? "")

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const MAX_AVATAR_SIZE = 1 * 1024 * 1024 // 1MB
  const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"]

  const getInitials = (n: string) =>
    n
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()

  async function handleAvatarUpload(file: File) {
    const formData = new FormData()
    formData.append("file", file)

    await fetch("/api/profile/avatar", {
      method: "POST",
      body: formData,
    })

    toast.success("Profile photo updated")
    router.refresh()
  }

  async function onSave() {
    const res = await fetch("/api/applicant/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        phone,
        headline,
        bio,
        location,
      }),
    })

    if (!res.ok) {
      toast.error("Failed to update profile")
      return
    }

    toast.success("Profile updated")
    router.push("/dashboard/applicant/profile")
    router.refresh()
  }

  async function handlePasswordChange() {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("All fields required")
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    const res = await fetch("/api/profile/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    })

    if (!res.ok) {
      toast.error("Failed to change password")
      return
    }

    toast.success("Password changed")
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
  }

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-2xl space-y-10">

        {/* HEADER */}
        <div className="flex justify-between">
          <h1 className="text-2xl font-semibold">Edit Profile</h1>
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
        </div>

        {/* PHOTO */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Photo</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-6">
            <div className="relative group">
              {initialData.avatarUrl ? (
                <img
                  src={initialData.avatarUrl}
                  className="h-24 w-24 rounded-full object-cover"
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center text-xl font-semibold">
                  {getInitials(name)}
                </div>
              )}

              <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition">
                <Camera />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (!file) return

                    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
                      toast.error("Only JPG, PNG, or WEBP images are allowed")
                      e.target.value = ""
                      return
                    }

                    if (file.size > MAX_AVATAR_SIZE) {
                      toast.error("Profile photo must be under 1MB")
                      e.target.value = ""
                      return
                    }

                    handleAvatarUpload(file)
                  }}
                />
              </label>
            </div>
            <p className="text-sm text-muted-foreground">
              Hover and click to upload a new photo
            </p>
            <p className="text-xs text-muted-foreground">
              JPG / PNG / WEBP · Max size 1MB
            </p>
          </CardContent>
        </Card>

        {/* BASIC INFO */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
              />   
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input 
                value={phone} 
                placeholder="+91 "
                onChange={(e) => setPhone(e.target.value)} 
              />
            </div>
          </CardContent>
        </Card>

        {/* APPLICANT INFO */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>Headline</Label><Input value={headline} onChange={(e) => setHeadline(e.target.value)} /></div>
            <div className="space-y-2"><Label>Location</Label><Input value={location} onChange={(e) => setLocation(e.target.value)} /></div>
            <div className="space-y-2"><Label>About</Label><Textarea rows={5} value={bio} onChange={(e) => setBio(e.target.value)} /></div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button onClick={onSave}>Save</Button>
          <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
        </div>

        {/* SECURITY */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-w-sm">
            {[
              ["Current Password", currentPassword, setCurrentPassword, showCurrent, setShowCurrent],
              ["New Password", newPassword, setNewPassword, showNew, setShowNew],
              ["Confirm Password", confirmPassword, setConfirmPassword, showConfirm, setShowConfirm],
            ].map(([label, value, setter, show, setShow]: any, i) => (
              <div key={i} className="space-y-2">
                <Label>{label}</Label>
                <div className="relative">
                  <Input type={show ? "text" : "password"} value={value} onChange={(e) => setter(e.target.value)} />
                  <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2">
                    {show ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            ))}
            <Button variant="destructive" onClick={handlePasswordChange}>Change Password</Button>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}

"use client"

import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function DeleteAccount() {
  const router = useRouter()

  async function handleDelete() {
    const ok = confirm(
      "This will permanently delete your account. This cannot be undone."
    )
    if (!ok) return

    const res = await fetch("/api/account/delete", {
      method: "POST",
    })

    if (!res.ok) {
      const data = await res.json()
      toast.error(data.error || "Failed to delete account")
      return
    }

    toast.success("Account deleted")
    router.push("/")
  }

  return (
    <Button variant="destructive" onClick={handleDelete}>
      Delete account
    </Button>
  )
}

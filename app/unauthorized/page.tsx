export const dynamic = "force-dynamic"

"use client"

import { useSearchParams } from "next/navigation"
import { useEffect } from "react"
import { toast } from "sonner"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function UnauthorizedPage() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const reason = searchParams.get("reason")

    if (reason === "forbidden") {
      toast.error("You are not authorized to access this page.")
    }
  }, [searchParams])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-semibold">Unauthorized</h1>
      <p className="text-muted-foreground">
        You don’t have permission to view this page.
      </p>

      <Button asChild>
        <Link href="/login">Go to Login</Link>
      </Button>
    </div>
  )
}

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function WithdrawFromHistory({
  applicationId,
}: {
  applicationId: string
}) {
  const [loading, setLoading] = useState(false)

  const handleWithdraw = async () => {
    setLoading(true)

    const res = await fetch(
      `/api/applications/${applicationId}/withdraw`,
      { method: "PATCH" }
    )

    if (!res.ok) {
      alert("Failed to withdraw")
      setLoading(false)
      return
    }

    // simplest correct behaviour for now
    window.location.reload()
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          className="text-destructive hover:bg-destructive/10 cursor-pointer"
        >
          Withdraw
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        Withdraw this application
      </TooltipContent>
    </Tooltip>

  )
}

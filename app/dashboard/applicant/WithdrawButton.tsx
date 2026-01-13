"use client"

import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export default function WithdrawButton({
  applicationId,
}: {
  applicationId: string
}) {
  const handleWithdraw = async () => {
    const res = await fetch(
      `/api/applications/${applicationId}/withdraw`,
      {
        method: "PATCH",
      }
    )

    if (!res.ok) {
      toast.error("Could not withdraw application")
      return
    }

    toast.success("Application withdrawn")
    
    // TEMP: reload to see status change
    window.location.reload()
  }

  return (
    <Button variant="destructive" 
      onClick={handleWithdraw}
      className="py-1 px-3 h-auto cursor-pointer hover:scale-[1.02] color-red-800 transition-colors"
      // varient="outline"
    >
      Withdraw
    </Button>
  )
}

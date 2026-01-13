export const dynamic = "force-dynamic"

"use client"

import { Suspense } from "react"
import UnauthorizedClient from "./unauthorized-client"

export default function UnauthorizedPage() {
  return (
    <Suspense fallback={null}>
      <UnauthorizedClient />
    </Suspense>
  )
}

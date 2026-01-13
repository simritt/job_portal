import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {

  console.log("MIDDLEWARE HIT:", req.nextUrl.pathname)
    
  const pathname = req.nextUrl.pathname
  console.log("PATH:", pathname)
  
  const sessionRaw = req.cookies.get("session")?.value
  const session = sessionRaw
  ? { ...JSON.parse(sessionRaw), role: JSON.parse(sessionRaw).role?.toUpperCase() }
  : null

  if (!session && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(
      new URL("/login?reason=session-expired", req.url)
    )
  }

  if (
    pathname.startsWith("/dashboard/applicant") &&
    session?.role !== "APPLICANT"
  ) {
    return NextResponse.redirect(
      new URL("/unauthorized?reason=forbidden", req.url)
    )
  }

  if (
    pathname.startsWith("/dashboard/recruiter") &&
    session?.role !== "RECRUITER"
  ) {
    return NextResponse.redirect(
      new URL("/unauthorized?reason=forbidden", req.url)
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*"],
}

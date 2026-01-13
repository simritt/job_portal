"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import clsx from "clsx"

type Props = {
  role: "APPLICANT" | "RECRUITER"
}

export default function DashboardNav({ role }: Props) {
  const pathname = usePathname()

  const linkClass = (href: string) =>
    clsx(
          "text-sm transition-colors duration-200 ease-in-out hover:scale-1 px-2 py-1 rounded-lg inline-block",
           pathname === href
           ? "text-black dark:text-white font-medium hover:bg-zinc-200 dark:hover:bg-zinc-600 hover:scale-[1.02]"
           : "text-muted-foreground hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:scale-[1.02]"
        )
        
  if (role === "RECRUITER") {
    return (
      <>
        <Link
            href="/dashboard/recruiter"
            className={linkClass("/dashboard/recruiter")}
            >
            Home
        </Link>

        <Link 
            href="/dashboard/recruiter/jobs"
            className={linkClass("/dashboard/recruiter/jobs")}
            >
            My Jobs
        </Link>

        <Link 
          href="/dashboard/recruiter/saved-applicants"
          className={linkClass("/dashboard/recruiter/saved-applicants")}
        >
          Saved Applicants
        </Link>

      </>
    )
  }

  return (
    <>
      <Link
        href="/dashboard/applicant"
        className={linkClass("/dashboard/applicant")}
      >
        Home
      </Link>

      <Link
        href="/dashboard/applicant/applications"
        className={linkClass("/dashboard/applicant/applications")}
      >
        My Applications
      </Link>

      <Link
        href="/dashboard/applicant/saved-jobs"
        className={linkClass("/dashboard/applicant/saved-jobs")}
      >
        Saved Jobs
      </Link>
    </>
  )
}

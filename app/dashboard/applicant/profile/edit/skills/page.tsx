import Link from "next/link"
import ApplicantSkillsForm from "@/components/skills/ApplicantSkillsForm"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

export default function EditSkillsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Edit Skills</h1>
          <p className="text-sm text-muted-foreground">
            Add, remove, or update your skills.
          </p>
        </div>

        <Link href="/dashboard/applicant/profile">
          <Button variant="outline" className="bg-gray-100">Back</Button>
        </Link>
      </div>

      <ApplicantSkillsForm />
    </div>
  )
}

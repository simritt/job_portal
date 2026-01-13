import { headers } from "next/headers"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export const dynamic = "force-dynamic"

async function getResumes() {
  const headersList = await headers()
  const host = headersList.get("host")
  const cookie = headersList.get("cookie")
  const protocol =
    process.env.NODE_ENV === "development" ? "http" : "https"

  if (!host || !cookie) return []

  const res = await fetch(`${protocol}://${host}/api/resumes`, {
    headers: { cookie },
    cache: "no-store",
  })

  if (!res.ok) return []
  return res.json()
}

export default async function ManageResumesPage() {
  console.log("🔥 MANAGE RESUMES PAGE RENDERED 🔥")
  const resumes = await getResumes()

  const sortedResumes = [...resumes].sort(
    (a: any, b: any) => Number(b.isDefault) - Number(a.isDefault)
  )

  {sortedResumes.map((resume: any) => {
  console.log("🧪 RESUME UI DEBUG →", {
    title: resume.title,
    isDefault: resume.isDefault,
  })
})}
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Manage Resumes</h1>
          <p className="text-sm text-muted-foreground">
            Upload, delete, or set a default resume.
          </p>
        </div>

        <Link href="/dashboard/applicant/profile">
          <Button variant="outline">Back</Button>
        </Link>
      </div>

      {/* Content */}
      {resumes.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No resumes uploaded yet.
        </p>
      ) : (
        <div className="space-y-3">
          {resumes.map((resume: any) => {
            const extension =
              resume.fileUrl?.split(".").pop()?.toUpperCase() || "FILE"

            return (
              <div
                key={resume.id}
                className="flex items-center justify-between rounded-md border px-4 py-3"
              >
                {/* Left */}
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">
                      {resume.title}
                    </p>

                    {resume.isDefault && (
                      <Badge variant="secondary" className="m-2 px-2 border border-gray-300">Default</Badge>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground">
                    {extension} • Uploaded{" "}
                    {resume.createdAt
                      ? new Date(resume.createdAt).toLocaleDateString()
                      : "—"}
                  </p>
                </div>

                {/* Right actions */}
                <div className="flex items-center gap-2">
                  {!resume.isDefault && (
                    <form
                      action={`/api/resumes/${resume.id}/default`}
                      method="post"
                    >
                      <Button size="sm" variant="secondary">
                        Set default
                      </Button>
                    </form>
                  )}

                  <form
                    action={`/api/resumes/${resume.id}`}
                    method="post"
                  >
                    <input type="hidden" name="_method" value="DELETE" />
                    <Button size="sm" variant="destructive">
                      Delete
                    </Button>
                  </form>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

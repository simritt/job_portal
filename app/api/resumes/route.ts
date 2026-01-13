import { NextResponse } from "next/server"
import { db } from "@/db"
import { resumes } from "@/db/schema/resumes"
import { getSession } from "@/lib/auth"
import { eq } from "drizzle-orm"
import path from "path"
import fs from "fs/promises"

export async function POST(req: Request) {
  try {
    const session = await getSession()
    if (!session?.userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json(
        { message: "No file uploaded" },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadDir = path.join(process.cwd(), "public/uploads")
    await fs.mkdir(uploadDir, { recursive: true })

    const safeFileName = `${crypto.randomUUID()}-${file.name}`
    const filePath = path.join(uploadDir, safeFileName)

    await fs.writeFile(filePath, buffer)

    const fileUrl = `/uploads/${safeFileName}`

    const [resume] = await db
      .insert(resumes)
      .values({
        applicantId: session.userId,
        title: file.name,
        fileUrl,
      })
      .returning({
        id: resumes.id,
        title: resumes.title,
        fileUrl: resumes.fileUrl,
        createdAt: resumes.createdAt,
      })

    return NextResponse.json(resume, { status: 201 })
  } catch (error) {
    console.error("Resume upload failed:", error)
    return NextResponse.json(
      { message: "Failed to upload resume" },
      { status: 500 }
    )
  }
}


export async function GET() {
  const session = await getSession()
  if (!session?.userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const result = await db
    .select({
      id: resumes.id,
      title: resumes.title,
      fileUrl: resumes.fileUrl,
      createdAt: resumes.createdAt,
      isDefault: resumes.isDefault,
    })
    .from(resumes)
    .where(eq(resumes.applicantId, session.userId))

  return NextResponse.json(result)
}

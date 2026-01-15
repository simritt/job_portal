import { NextResponse } from "next/server"
import { db } from "@/db"
import { resumes } from "@/db/schema/resumes"
import { getSession } from "@/lib/auth"
import { eq } from "drizzle-orm"
import cloudinary from "@/lib/cloudinary"

const MAX_RESUME_SIZE = 2 * 1024 * 1024 // 2MB

const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword", // .doc
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
]

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
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { message: "Invalid file type. Only PDF, DOC, DOCX allowed." },
        { status: 400 }
      )
    }

    if (file.size > MAX_RESUME_SIZE) {
      return NextResponse.json(
        { message: "Resume too large. Max size is 2MB." },
        { status: 413 }
      )
    }


    const bytes = await file.arrayBuffer()
const buffer = Buffer.from(bytes)

const uploadResult = await new Promise<any>((resolve, reject) => {
  cloudinary.uploader.upload_stream(
    {
      folder: "resumes",
      resource_type: "raw", // REQUIRED for PDFs
    },
    (error, result) => {
      if (error) reject(error)
      else resolve(result)
    }
  ).end(buffer)
})

const fileUrl = uploadResult.secure_url


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

import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { db } from "@/db"
import { users } from "@/db/schema/users"
import { eq } from "drizzle-orm"
import cloudinary from "@/lib/cloudinary"

const MAX_AVATAR_SIZE = 1 * 1024 * 1024 // 1MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"]

export async function POST(req: Request) {
  const session = await getSession()
  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get("file") as File | null

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 })
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Invalid image type. Only JPG, PNG, WEBP allowed." },
      { status: 400 }
    )
  }

  if (file.size > MAX_AVATAR_SIZE) {
    return NextResponse.json(
      { error: "Avatar too large. Max size is 1MB." },
      { status: 413 }
    )
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  const upload = await new Promise<any>((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { 
        folder: "avatars",
        resource_type: "image",
      },
      (error, result) => {
        if (error) reject(error)
        else resolve(result)
      }
    ).end(buffer)
  })

  await db
    .update(users)
    .set({ avatarUrl: upload.secure_url })
    .where(eq(users.id, session.userId))

  return NextResponse.json({ avatarUrl: upload.secure_url })
}

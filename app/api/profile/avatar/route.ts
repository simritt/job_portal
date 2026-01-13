import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { db } from "@/db"
import { users } from "@/db/schema/users"
import { eq } from "drizzle-orm"
import cloudinary from "cloudinary"

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
})

export async function POST(req: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get("file") as File

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  const upload = await new Promise<any>((resolve, reject) => {
    cloudinary.v2.uploader.upload_stream(
      { folder: "avatars" },
      (err, result) => {
        if (err) reject(err)
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

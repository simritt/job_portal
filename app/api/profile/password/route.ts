import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { db } from "@/db"
import { users } from "@/db/schema/users"
import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { currentPassword, newPassword } = await req.json()

  const user = await db
    .select({ password: users.password })
    .from(users)
    .where(eq(users.id, session.userId))
    .then(r => r[0])

  const valid = await bcrypt.compare(currentPassword, user.password)
  if (!valid) {
    return NextResponse.json({ error: "Wrong password" }, { status: 400 })
  }

  const hashed = await bcrypt.hash(newPassword, 10)

  await db
    .update(users)
    .set({ password: hashed })
    .where(eq(users.id, session.userId))

  return NextResponse.json({ success: true })
}

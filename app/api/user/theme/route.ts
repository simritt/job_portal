import { cookies } from "next/headers"
import { db } from "@/db"
import { users } from "@/db/schema/users"
import { eq } from "drizzle-orm"
import { getSession } from "@/lib/auth"

export async function PATCH(req: Request) {
  const session = await getSession()
  if (!session) {
    return new Response("Unauthorized", { status: 401 })
  }

  const { theme } = await req.json()

  // update DB
  await db
    .update(users)
    .set({ theme })
    .where(eq(users.id, session.userId))

  // update cookie session
  const cookieStore = await cookies()

cookieStore.set(
  "session",
  JSON.stringify({
    ...session,
    theme,
  }),
  {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  }
)

  return new Response(null, { status: 204 })
}

import { cookies } from "next/headers"

export async function getSession() {
  const cookieStore = await cookies()

  const all = cookieStore.getAll()
  console.log("ALL COOKIES:", all)

  const session = cookieStore.get("session")?.value

  if (!session) return null

  try {
    return JSON.parse(session)
  } catch {
    return null
  }
}

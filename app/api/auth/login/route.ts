import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { db } from "@/db"
import { users } from "@/db/schema/users"
import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password } = body

    // Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      )
    }

    // Find user by email
    // const user = await db.query.users.findFirst({
    //   where: eq(users.email, email),
    // })

   const [user] = await db
  .select({
    id: users.id,
    name: users.name,
    email: users.email,
    password: users.password,
    phone: users.phone,
    role: users.role,
    theme: users.theme,
  })
  .from(users)
  .where(eq(users.email, email))
  .limit(1)

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User does not exist" },
        { status: 404 }
      )
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      )
    }

    // Success (no session yet)
    // return NextResponse.json({
    //   success: true,
    //   role: user.role,
    //   userId: user.id,
    // })

    
    const cookieStore = await cookies()

    cookieStore.set(
    "session",
    JSON.stringify({
        userId: user.id,
        role: user.role,
        name: user.name,
        email: user.email,
        theme: user.theme ?? "system",
    }),
    {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
    }
    )

    return NextResponse.json({ success: true, role: user.role.toUpperCase()})



  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    )
  }
}

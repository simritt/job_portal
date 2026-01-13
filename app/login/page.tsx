"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

import { useSearchParams } from "next/navigation"
import { useEffect } from "react"
import { toast } from "sonner"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const res = await fetch("/api/auth/login", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    })

    const data = await res.json()

    if (!data.success) {
      setError(data.message)
      return
    }

    // redirect based on ROLE FROM BACKEND
    if (data.role === "APPLICANT") {
      router.push("/dashboard/applicant")
    } else {
      router.push("/dashboard/recruiter")
    }

    const searchParams = useSearchParams()

    useEffect(() => {
      const reason = searchParams.get("reason")

      if (reason === "session-expired") {
        toast.error("Session expired. Please log in again.")
      }
    }, [searchParams])

  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Login</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={email}
                autoComplete="email"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={password}
                  autoComplete="current-password"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-zinc-500 hover:text-black"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full">
              Login
            </Button>

            <p className="text-center text-sm text-zinc-600">
              New user?{" "}
              <Link href="/register" className="font-medium underline">
                Register
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

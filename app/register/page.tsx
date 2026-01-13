"use client"

import { useState } from "react"
import { register } from "@/app/actions/register";
import { useRouter } from "next/navigation";


import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import RoleTabs from "@/components/auth/RoleTabs"
import { Eye, EyeOff } from "lucide-react"



export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)

  const router = useRouter();

  const [role, setRole] = useState<"applicant" | "recruiter">("applicant");


  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const res = await register({
      name,
      email,
      password,
      phone,
      role: role === "applicant" ? "APPLICANT" : "RECRUITER",
      companyName: role === "recruiter" ? companyName : undefined,
    });

    if (res.success) {
      router.push("/login");
    } else {
      setError(res.message ?? "Something went wrong");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Register</CardTitle>
        </CardHeader>

        <CardContent>

        <form onSubmit={handleSubmit} className="space-y-6">
          <RoleTabs role={role} setRole={setRole} />

          <div className="space-y-2">
            <Label className="after:content-['*'] after:ml-1 after:text-red-500">
              Name
            </Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Full Name"
              required
            />
          </div>

          {role === "recruiter" && (
            <div className="space-y-2">
              <Label className="after:content-['*'] after:ml-1 after:text-red-500">
                Company Name
              </Label>
              <Input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Company / Organization Name"
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label className="after:content-['*'] after:ml-1 after:text-red-500">
              Email
            </Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your Email Address"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Phone Number</Label>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value ?? "")}
              pattern="[0-9]{10}"
              placeholder="Your Phone Number"
            />

          </div>

          <div className="space-y-2">
            <Label className="after:content-['*'] after:ml-1 after:text-red-500">
              Password
            </Label>
            <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
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


          <div className="space-y-2">
            <Label className="after:content-['*'] after:ml-1 after:text-red-500">
              Confirm Password
            </Label>
            <Input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
              required
            />  
          </div>
          
          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          <Button type="submit" className="w-full">Register as {role}</Button>

          <p className="text-center text-sm text-zinc-600">
            Already have an account?{" "}
            <Link href="/login" className="font-medium underline">
              Login
            </Link>
          </p>
        </form >
        </CardContent>
      </Card>
    </div>
  )
}





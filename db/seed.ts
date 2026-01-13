import { db } from "./index"
import { users } from "./schema/users"
import { companies } from "./schema/companies"
import { jobs } from "./schema/jobs"
import { resumes } from "./schema/resumes"

import bcrypt from "bcryptjs"

async function seed() {
  console.log("Seeding database...")

  /* ---------------- USERS ---------------- */

  const recruiterPassword = await bcrypt.hash("recruiter123", 10)
  const applicantPassword = await bcrypt.hash("applicant123", 10)

  const [recruiter] = await db
    .insert(users)
    .values({
      name: "Test Recruiter",
      email: "recruiter@test.com",
      password: recruiterPassword,
      role: "RECRUITER",
    })
    .returning()

  const [applicant] = await db
    .insert(users)
    .values({
      name: "Test Applicant",
      email: "applicant@test.com",
      password: applicantPassword,
      role: "APPLICANT",
    })
    .returning()

  /* ---------------- COMPANY ---------------- */

  const [company] = await db
  .insert(companies)
  .values({
    name: "Test Company Pvt Ltd",
    description: "A test company for development",
    industry: "Software",
    location: "Mumbai",
  })
  .returning()

 /* ---------------- JOBS ---------------- */

await db.insert(jobs).values({
  companyId: company.id,
  recruiterId: recruiter.id,
  title: "Frontend Developer",
  description:
    "Looking for a frontend developer skilled in React and modern UI frameworks.",
  location: "Remote",
  salaryMin: 600000,
  salaryMax: 900000,
  employmentType: "Full-time",
  experienceRequired: 1,
  status: "ACTIVE",
})

await db.insert(jobs).values({
  companyId: company.id,
  recruiterId: recruiter.id,
  title: "Backend Developer",
  description:
    "Backend developer needed with experience in Node.js, PostgreSQL, and APIs.",
  location: "Bangalore",
  salaryMin: 700000,
  salaryMax: 1100000,
  employmentType: "Full-time",
  experienceRequired: 2,
  status: "ACTIVE",
})

  /* ---------------- RESUMES ---------------- */

  await db.insert(resumes).values({
  applicantId: applicant.id,
  title: "General Resume",
  fileUrl: "https://example.com/resume1.pdf",
})

await db.insert(resumes).values({
  applicantId: applicant.id,
  title: "Backend-Focused Resume",
  fileUrl: "https://example.com/resume2.pdf",
})

  console.log("Seeding completed successfully")
  process.exit(0)
}

seed().catch((err) => {
  console.error("Seeding failed:", err)
  process.exit(1)
})

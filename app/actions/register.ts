"use server";

import { db } from "@/db";
import { users } from "@/db/schema/users"
import { applicantProfiles } from "@/db/schema/applicant_profiles"
import { recruiterProfiles } from "@/db/schema/recruiter_profiles";
import { companies } from "@/db/schema/companies";
import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";

type RegisterInput = {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: "APPLICANT" | "RECRUITER";
  resumeUrl?: string;
  companyName?: string;
};

export async function register(data: RegisterInput) {
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, data.email),
  });

  if (existingUser) {
    return { success: false, message: "Email already registered" };
  }

  const hashedPassword = await hash(data.password, 10);

  try {
    await db.transaction(async (tx) => {
      const [user] = await tx
        .insert(users)
        .values({
          name: data.name,
          email: data.email,
          password: hashedPassword,
          phone: data.phone,
          role: data.role,
        })
        .returning();

      if (data.role === "APPLICANT") {
        await tx.insert(applicantProfiles).values({
          userId: user.id,
        });
      }

      if (data.role === "RECRUITER") {
  if (!data.companyName) {
    throw new Error("Company name required for recruiter registration")
  }

  const [company] = await tx
    .insert(companies)
    .values({
      name: data.companyName,
    })
    .returning()

  await tx.insert(recruiterProfiles).values({
    userId: user.id,
    companyId: company.id,
  })
}

    });

    return { success: true };
    } catch (error) {
    console.error("REGISTER ERROR:", error);
    return { success: false, message: "Registration failed" };
    }

}

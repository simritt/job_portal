"use server";

import { db } from "@/db";
import { users, applicants, recruiters } from "@/db/schema";
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
        await tx.insert(applicants).values({
          userId: user.id,
          resumeUrl: data.resumeUrl,
        });
      }

      if (data.role === "RECRUITER") {
        await tx.insert(recruiters).values({
          userId: user.id,
          companyName: data.companyName,
        });
      }
    });

    return { success: true };
    } catch (error) {
    console.error("REGISTER ERROR:", error);
    return { success: false, message: "Registration failed" };
    }

}

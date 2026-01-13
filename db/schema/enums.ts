import { pgEnum } from "drizzle-orm/pg-core"


export const userRoleEnum = pgEnum("user_role", [
  "APPLICANT",
  "RECRUITER",
])


export const jobStatusEnum = pgEnum("job_status", [
  "DRAFT",
  "ACTIVE",
  "CLOSED",
])


export const applicationStatusEnum = pgEnum("application_status", [
  "APPLIED",
  "SHORTLISTED",
  "REJECTED",
  "HIRED",
  "WITHDRAWN",
])


export const skillLevelEnum = pgEnum("skill_level", [
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
])


export const ratedEntityEnum = pgEnum("rated_entity_type", [
  "APPLICANT",
  "COMPANY",
])

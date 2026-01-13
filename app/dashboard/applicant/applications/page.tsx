import { headers } from "next/headers"
import ApplicationsClient from "./ApplicationsClient"

async function getApplications() {
  const headersList = await headers()
  const host = headersList.get("host")
  const cookie = headersList.get("cookie")
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https"

  const res = await fetch(
    `${protocol}://${host}/api/applications/my`,
    {
      cache: "no-store",
      headers: {
        cookie: cookie ?? "",
      },
    }
  )

  if (!res.ok) {
    throw new Error("Failed to fetch applications")
  }

  return res.json()
}

export default async function ApplicationHistoryPage() {
  const applications = await getApplications()

  return <ApplicationsClient applications={applications} />
}

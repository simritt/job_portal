import { cookies } from "next/headers"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import RecruiterJobCard from "./RecruiterJobCard"
import JobStatusPieClient from "@/components/charts/JobStatusPieClient"
import { Briefcase, Users, FileText, TrendingUp, Clock, Plus } from "lucide-react"

export const dynamic = "force-dynamic"

type RecruiterJob = {
  id: string
  title: string
  location: string
  status: "DRAFT" | "ACTIVE" | "CLOSED"
  createdAt: string
  applicantsCount: number
}

async function getRecruiterJobs(): Promise<{ jobs: RecruiterJob[] }> {
  const cookieStore = await cookies()

  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ")

  const res = await fetch("http://localhost:3000/api/recruiter/jobs", {
    cache: "no-store",
    headers: {
      Cookie: cookieHeader,
    },
  })

  if (!res.ok) {
    throw new Error("Failed to fetch recruiter jobs")
  }

  return res.json()
}

export default async function RecruiterDashboardPage() {
  const { jobs } = await getRecruiterJobs()

  const activeJobs = jobs.filter((j) => j.status === "ACTIVE")
  const draftJobs = jobs.filter((j) => j.status === "DRAFT")
  const closedJobs = jobs.filter((j) => j.status === "CLOSED")
  const totalApplicants = jobs.reduce((sum, j) => sum + (Number(j.applicantsCount) ?? 0), 0)
  
  // Get recent jobs (last 5)
  const recentJobs = [...jobs]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="p-6 lg:p-8 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Recruiter Dashboard
            </h1>
            <p className="text-slate-600 mt-1">
              Manage your job postings and track applicants
            </p>
          </div>

          <Link
            href="/dashboard/recruiter/jobs/new"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-black/90 transition-all duration-200 hover:shadow-lg hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            Post New Job
          </Link>
        </div>

        {/* Stats Grid - Enhanced with icons and better visuals */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <StatCard
            label="Total Jobs"
            value={jobs.length}
            icon={<Briefcase className="w-5 h-5" />}
            trend="+12% from last month"
            color="blue"
          />

          <StatCard
            label="Active Jobs"
            value={activeJobs.length}
            icon={<TrendingUp className="w-5 h-5" />}
            trend={`${draftJobs.length} drafts pending`}
            color="green"
          />

          <StatCard
            label="Total Applicants"
            value={totalApplicants}
            icon={<Users className="w-5 h-5" />}
            trend={activeJobs.length > 0 ? `Avg ${Math.round(totalApplicants / activeJobs.length)} per job` : "No active jobs"}
            color="purple"
          />

          <StatCard
            label="Closed Jobs"
            value={closedJobs.length}
            icon={<FileText className="w-5 h-5" />}
            trend={`${jobs.length - closedJobs.length} still open`}
            color="orange"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Job Status Chart (Larger) */}
          <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Job Status Overview
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">
                    Distribution of your job postings
                  </p>
                </div>
              </div>

              <JobStatusPieClient jobs={jobs} />
              
              {/* Legend with stats */}
              <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-xs font-medium text-slate-600">Active</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{activeJobs.length}</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full bg-gray-400" />
                    <span className="text-xs font-medium text-slate-600">Draft</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{draftJobs.length}</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-xs font-medium text-slate-600">Closed</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{closedJobs.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Quick Actions & Insights */}
          <div className="space-y-6">
            {/* Quick Actions Card */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">
                  Quick Actions
                </h2>

                <div className="space-y-3">
                  <Link
                    href="/dashboard/recruiter/jobs/new"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors duration-150 group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center group-hover:scale-110 transition-transform duration-150">
                      <Plus className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">Post a Job</p>
                      <p className="text-xs text-slate-600">Create new job listing</p>
                    </div>
                  </Link>

                  <Link
                    href="/dashboard/recruiter/jobs"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors duration-150 group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-150">
                      <Briefcase className="w-5 h-5 text-slate-700" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">View All Jobs</p>
                      <p className="text-xs text-slate-600">Manage your postings</p>
                    </div>
                  </Link>

                  <Link
                    href="/dashboard/recruiter/applicants"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors duration-150 group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-150">
                      <Users className="w-5 h-5 text-slate-700" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">View Applicants</p>
                      <p className="text-xs text-slate-600">Review candidates</p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            {/* Performance Insight Card */}
            <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 shadow-sm">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-lg font-semibold text-white">
                    Performance
                  </h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Response Rate</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-2xl font-bold text-white">
                        {activeJobs.length > 0 
                          ? `${Math.round((totalApplicants / activeJobs.length / 10) * 100)}%` 
                          : "N/A"}
                      </p>
                      <span className="text-xs text-emerald-400">+5% this week</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-700">
                    <p className="text-sm text-slate-400 mb-1">Avg. Time to Fill</p>
                    <p className="text-2xl font-bold text-white">14 days</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-slate-600" />
                <h2 className="text-lg font-semibold text-slate-900">
                  Recent Activity
                </h2>
              </div>
              <Link 
                href="/dashboard/recruiter/jobs"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
              >
                View all →
              </Link>
            </div>

            {jobs.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600 font-medium">No jobs posted yet</p>
                <p className="text-sm text-slate-500 mt-1">
                  Create your first job posting to get started
                </p>
                <Link
                  href="/dashboard/recruiter/jobs/new"
                  className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg bg-black text-white text-sm font-medium hover:bg-black/90 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Post Your First Job
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentJobs.map((job, index) => (
                  <Link
                    key={job.id}
                    href={`/dashboard/recruiter/jobs/${job.id}`}
                    className="flex items-center justify-between p-4 rounded-lg hover:bg-slate-50 transition-colors duration-150 group border border-transparent hover:border-slate-200"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        job.status === "ACTIVE"
                          ? "bg-green-500"
                          : job.status === "DRAFT"
                          ? "bg-gray-400"
                          : "bg-red-500"
                      }`} />
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 truncate group-hover:text-black">
                          {job.title}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <p className="text-sm text-slate-600">{job.location}</p>
                          <span className="text-slate-300">•</span>
                          <p className="text-sm text-slate-600">
                            {new Date(job.createdAt).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-slate-900">
                          {job.applicantsCount} applicants
                        </p>
                        <p className={`text-xs font-medium ${
                          job.status === "ACTIVE"
                            ? "text-green-600"
                            : job.status === "DRAFT"
                            ? "text-gray-600"
                            : "text-red-600"
                        }`}>
                          {job.status}
                        </p>
                      </div>
                      <svg 
                        className="w-5 h-5 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon,
  trend,
  color = "blue",
}: {
  label: string
  value: number
  icon: React.ReactNode
  trend?: string
  color?: "blue" | "green" | "purple" | "orange"
}) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 group">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600 mb-1">
            {label}
          </p>
          <p className="text-3xl font-bold text-slate-900 mb-2">
            {value}
          </p>
          {trend && (
            <p className="text-xs text-slate-500">
              {trend}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]} group-hover:scale-110 transition-transform duration-200`}>
          {icon}
        </div>
      </div>
    </div>
  )
}
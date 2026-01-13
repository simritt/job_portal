export default function Loading() {
  return (
    <div className="flex justify-center">
      <div className="w-full max-w-2xl space-y-10 animate-pulse">

        {/* HEADER */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="h-6 w-40 rounded bg-muted" />
            <div className="h-4 w-64 rounded bg-muted" />
          </div>
          <div className="h-9 w-20 rounded bg-muted" />
        </div>

        {/* PROFILE PHOTO CARD */}
        <div className="rounded-lg border p-6">
          <div className="h-5 w-32 rounded bg-muted mb-4" />
          <div className="flex items-center gap-6">
            <div className="h-24 w-24 rounded-full bg-muted" />
            <div className="h-4 w-48 rounded bg-muted" />
          </div>
        </div>

        {/* BASIC INFO CARD */}
        <div className="rounded-lg border p-6 space-y-4">
          <div className="h-5 w-40 rounded bg-muted" />
          <div className="h-10 w-full rounded bg-muted" />
          <div className="h-10 w-full rounded bg-muted" />
          <div className="h-10 w-full rounded bg-muted" />
        </div>

        {/* RECRUITER DETAILS CARD */}
        <div className="rounded-lg border p-6 space-y-4">
          <div className="h-5 w-44 rounded bg-muted" />
          <div className="h-10 w-full rounded bg-muted" />
          <div className="h-24 w-full rounded bg-muted" />
          <div className="h-10 w-full rounded bg-muted" />
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex justify-end gap-3">
          <div className="h-9 w-28 rounded bg-muted" />
          <div className="h-9 w-20 rounded bg-muted" />
        </div>

        {/* SECURITY CARD */}
        <div className="rounded-lg border border-red-200 p-6 space-y-4">
          <div className="h-5 w-28 rounded bg-muted" />
          <div className="h-10 w-full rounded bg-muted" />
          <div className="h-10 w-full rounded bg-muted" />
          <div className="h-10 w-full rounded bg-muted" />
          <div className="h-9 w-36 rounded bg-muted" />
        </div>

      </div>
    </div>
  )
}

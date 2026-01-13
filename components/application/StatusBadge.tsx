export function StatusBadge({
  status,
}: {
  status: "APPLIED" | "SHORTLISTED" | "REJECTED" | "HIRED" | "WITHDRAWN" | null
}) {
  if (!status) return null

  const styles =
  status === "APPLIED" ? "bg-blue-100 text-blue-700"
    : status === "SHORTLISTED" ? "bg-green-100 text-green-700"
    : status === "HIRED" ? "bg-emerald-100 text-emerald-700"
    : status === "WITHDRAWN" ? "bg-zinc-100 text-zinc-600"
    : "bg-red-100 text-red-700"

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${styles}`}>
      {status}
    </span>
  )
}

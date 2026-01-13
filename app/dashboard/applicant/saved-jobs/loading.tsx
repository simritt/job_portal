import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="p-6 pt-0 space-y-6">
      <h1 className="text-2xl font-semibold">Saved Jobs</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 w-3/4 bg-muted rounded" />
              <div className="h-3 w-1/2 bg-muted rounded mt-2" />
            </CardHeader>
            <CardContent className="flex justify-between">
              <div className="h-3 w-24 bg-muted rounded" />
              <div className="h-8 w-20 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

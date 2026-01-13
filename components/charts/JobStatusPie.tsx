"use client"

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

const COLORS = {
  ACTIVE: "#22c55e",   // green
  DRAFT: "#94a3b8",    // gray
  CLOSED: "#ef4444",   // red
}

export default function JobStatusPie({
  jobs,
}: {
  jobs: {
    status: "DRAFT" | "ACTIVE" | "CLOSED"
  }[]
}) {
  const data = [
    {
      name: "Active",
      value: jobs.filter((j) => j.status === "ACTIVE").length,
      key: "ACTIVE",
    },
    {
      name: "Draft",
      value: jobs.filter((j) => j.status === "DRAFT").length,
      key: "DRAFT",
    },
    {
      name: "Closed",
      value: jobs.filter((j) => j.status === "CLOSED").length,
      key: "CLOSED",
    },
  ].filter((d) => d.value > 0)

  return (
    <div className="flex items-center justify-center gap-10">
      {/* Pie Chart */}
      <div className="h-64 w-64">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={4}
            >
              {data.map((entry) => (
                <Cell
                  key={entry.key}
                  fill={COLORS[entry.key as keyof typeof COLORS]}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="space-y-2 text-sm">
        {data.map((item) => (
          <div
            key={item.key}
            className="flex items-center gap-2"
          >
            {/* Color Dot */}
            <span
              className="h-3 w-3 rounded-full"
              style={{
                backgroundColor:
                  COLORS[item.key as keyof typeof COLORS],
              }}
            />

            {/* Label */}
            <span className="text-sm text-muted-foreground">
              {item.name}
            </span>

            {/* Count */}
            <span className="font-medium">
              ({item.value})
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

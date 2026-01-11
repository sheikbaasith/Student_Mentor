import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";

interface GradeDistributionProps {
  data: {
    grade: string;
    count: number;
  }[];
}

const COLORS = [
  "hsl(160, 84%, 39%)",  // A - success
  "hsl(174, 72%, 40%)",  // B - accent
  "hsl(217, 91%, 22%)",  // C - primary
  "hsl(38, 92%, 50%)",   // D - warning
  "hsl(0, 84%, 60%)",    // F - danger
];

export function GradeDistribution({ data }: GradeDistributionProps) {
  return (
    <div className="rounded-xl border bg-card p-6 card-shadow animate-slide-up">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Grade Distribution</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Number of students per grade bracket
        </p>
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <XAxis
              dataKey="grade"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(215, 16%, 47%)", fontSize: 14, fontWeight: 500 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(215, 16%, 47%)", fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(0, 0%, 100%)",
                border: "1px solid hsl(214, 32%, 91%)",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
              labelStyle={{ color: "hsl(222, 47%, 11%)", fontWeight: 600 }}
              cursor={{ fill: "hsl(210, 40%, 96%)", opacity: 0.5 }}
            />
            <Bar
              dataKey="count"
              radius={[6, 6, 0, 0]}
              name="Students"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

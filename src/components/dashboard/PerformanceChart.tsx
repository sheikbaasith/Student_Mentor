import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

interface PerformanceChartProps {
  data: {
    month: string;
    average: number;
    predicted: number;
  }[];
}

export function PerformanceChart({ data }: PerformanceChartProps) {
  return (
    <div className="rounded-xl border bg-card p-6 card-shadow animate-slide-up">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Performance Trend</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Average grades over time with AI predictions
        </p>
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorAverage" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(217, 91%, 22%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(217, 91%, 22%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(174, 72%, 40%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(174, 72%, 40%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" vertical={false} />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(215, 16%, 47%)", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(215, 16%, 47%)", fontSize: 12 }}
              domain={[50, 100]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(0, 0%, 100%)",
                border: "1px solid hsl(214, 32%, 91%)",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
              labelStyle={{ color: "hsl(222, 47%, 11%)", fontWeight: 600 }}
            />
            <Area
              type="monotone"
              dataKey="average"
              stroke="hsl(217, 91%, 22%)"
              strokeWidth={2}
              fill="url(#colorAverage)"
              name="Actual Average"
            />
            <Area
              type="monotone"
              dataKey="predicted"
              stroke="hsl(174, 72%, 40%)"
              strokeWidth={2}
              strokeDasharray="5 5"
              fill="url(#colorPredicted)"
              name="Predicted"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span className="text-sm text-muted-foreground">Actual Average</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-accent" />
          <span className="text-sm text-muted-foreground">AI Predicted</span>
        </div>
      </div>
    </div>
  );
}

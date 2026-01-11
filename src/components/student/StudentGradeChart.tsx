import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";
import { Student } from "@/hooks/useStudents";

interface StudentGradeChartProps {
  student: Student;
}

// Simulated grade history based on current grade
function generateGradeHistory(currentGrade: number) {
  const months = ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb"];
  const baseVariation = 8;
  
  return months.map((month, index) => {
    const progress = index / (months.length - 1);
    const startGrade = currentGrade - 5 + Math.random() * 3;
    const grade = Math.round(
      startGrade + (currentGrade - startGrade) * progress + (Math.random() - 0.5) * baseVariation
    );
    return {
      month,
      grade: Math.min(100, Math.max(0, grade)),
    };
  });
}

export function StudentGradeChart({ student }: StudentGradeChartProps) {
  const gradeHistory = generateGradeHistory(student.grade);

  return (
    <Card className="card-shadow animate-slide-up" style={{ animationDelay: "200ms" }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Grade History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={gradeHistory} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="month" 
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                axisLine={{ stroke: "hsl(var(--border))" }}
              />
              <YAxis 
                domain={[0, 100]} 
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                axisLine={{ stroke: "hsl(var(--border))" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Area
                type="monotone"
                dataKey="grade"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#gradeGradient)"
                dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
                activeDot={{ r: 6, fill: "hsl(var(--primary))" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

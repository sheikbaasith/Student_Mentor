import { useMemo } from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Student } from "@/hooks/useStudents";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface StudentComparisonChartProps {
  students: Student[];
}

const COLORS = [
  "hsl(217, 91%, 60%)",
  "hsl(174, 72%, 40%)",
  "hsl(280, 65%, 60%)",
  "hsl(45, 93%, 47%)",
  "hsl(340, 82%, 52%)",
];

const predictionStyles: Record<string, string> = {
  "excelling": "bg-success/10 text-success border-success/20",
  "on-track": "bg-accent/10 text-accent border-accent/20",
  "at-risk": "bg-danger/10 text-danger border-danger/20",
};

export function StudentComparisonChart({ students }: StudentComparisonChartProps) {
  const barChartData = useMemo(() => {
    return [
      {
        metric: "Grade",
        ...students.reduce((acc, student, i) => ({
          ...acc,
          [student.name]: student.grade,
        }), {}),
      },
      {
        metric: "Attendance",
        ...students.reduce((acc, student, i) => ({
          ...acc,
          [student.name]: student.attendance,
        }), {}),
      },
      {
        metric: "Internal",
        ...students.reduce((acc, student, i) => ({
          ...acc,
          [student.name]: student.internal_marks || 0,
        }), {}),
      },
      {
        metric: "External",
        ...students.reduce((acc, student, i) => ({
          ...acc,
          [student.name]: student.external_marks || 0,
        }), {}),
      },
      {
        metric: "Confidence",
        ...students.reduce((acc, student, i) => ({
          ...acc,
          [student.name]: student.confidence,
        }), {}),
      },
    ];
  }, [students]);

  const radarChartData = useMemo(() => {
    return [
      { subject: "Grade", fullMark: 100 },
      { subject: "Attendance", fullMark: 100 },
      { subject: "Internal", fullMark: 100 },
      { subject: "External", fullMark: 100 },
      { subject: "Confidence", fullMark: 100 },
    ].map((item) => ({
      ...item,
      ...students.reduce((acc, student) => ({
        ...acc,
        [student.name]: 
          item.subject === "Grade" ? student.grade :
          item.subject === "Attendance" ? student.attendance :
          item.subject === "Internal" ? student.internal_marks || 0 :
          item.subject === "External" ? student.external_marks || 0 :
          student.confidence,
      }), {}),
    }));
  }, [students]);

  if (students.length === 0) {
    return (
      <Card className="card-shadow">
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">
            Select students to compare their performance
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Selected Students Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
      >
        {students.map((student, index) => (
          <Card 
            key={student.id} 
            className="card-shadow border-l-4"
            style={{ borderLeftColor: COLORS[index % COLORS.length] }}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={student.photo_url || undefined} alt={student.name} />
                  <AvatarFallback style={{ backgroundColor: COLORS[index % COLORS.length] }} className="text-white">
                    {student.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{student.name}</p>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${predictionStyles[student.prediction] || ""}`}
                  >
                    {student.prediction}
                  </Badge>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Grade</p>
                  <p className="font-semibold">{student.grade}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Attendance</p>
                  <p className="font-semibold">{student.attendance}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Bar Chart Comparison */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle>Performance Metrics Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <XAxis 
                      dataKey="metric" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                      domain={[0, 100]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                      labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
                    />
                    <Legend />
                    {students.map((student, index) => (
                      <Bar
                        key={student.id}
                        dataKey={student.name}
                        fill={COLORS[index % COLORS.length]}
                        radius={[4, 4, 0, 0]}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Radar Chart Comparison */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle>Skills Radar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarChartData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis 
                      dataKey="subject"
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    />
                    <PolarRadiusAxis 
                      angle={30} 
                      domain={[0, 100]}
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                    />
                    {students.map((student, index) => (
                      <Radar
                        key={student.id}
                        name={student.name}
                        dataKey={student.name}
                        stroke={COLORS[index % COLORS.length]}
                        fill={COLORS[index % COLORS.length]}
                        fillOpacity={0.2}
                        strokeWidth={2}
                      />
                    ))}
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Detailed Stats Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="card-shadow overflow-hidden">
          <CardHeader>
            <CardTitle>Detailed Comparison</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-medium text-muted-foreground">Metric</th>
                    {students.map((student, index) => (
                      <th 
                        key={student.id} 
                        className="text-center p-4 font-medium"
                        style={{ color: COLORS[index % COLORS.length] }}
                      >
                        {student.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr className="hover:bg-muted/30">
                    <td className="p-4 font-medium">Grade</td>
                    {students.map((student) => (
                      <td key={student.id} className="text-center p-4">{student.grade}%</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-muted/30">
                    <td className="p-4 font-medium">Attendance</td>
                    {students.map((student) => (
                      <td key={student.id} className="text-center p-4">{student.attendance}%</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-muted/30">
                    <td className="p-4 font-medium">Internal Marks</td>
                    {students.map((student) => (
                      <td key={student.id} className="text-center p-4">{student.internal_marks || 0}</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-muted/30">
                    <td className="p-4 font-medium">External Marks</td>
                    {students.map((student) => (
                      <td key={student.id} className="text-center p-4">{student.external_marks || 0}</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-muted/30">
                    <td className="p-4 font-medium">Prediction</td>
                    {students.map((student) => (
                      <td key={student.id} className="text-center p-4">
                        <Badge 
                          variant="outline" 
                          className={predictionStyles[student.prediction] || ""}
                        >
                          {student.prediction}
                        </Badge>
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-muted/30">
                    <td className="p-4 font-medium">Confidence</td>
                    {students.map((student) => (
                      <td key={student.id} className="text-center p-4">{student.confidence}%</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

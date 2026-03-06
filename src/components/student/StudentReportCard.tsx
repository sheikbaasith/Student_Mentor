import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Download, Loader2, Printer } from "lucide-react";
import { Student } from "@/hooks/useStudents";
import { cn } from "@/lib/utils";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface StudentReportCardProps {
  student: Student;
}

const predictionLabels = {
  excelling: "Excelling",
  "on-track": "On Track",
  "at-risk": "At Risk",
};

const getGradeLetter = (grade: number): string => {
  if (grade >= 90) return "A+";
  if (grade >= 85) return "A";
  if (grade >= 80) return "B+";
  if (grade >= 75) return "B";
  if (grade >= 70) return "C+";
  if (grade >= 65) return "C";
  if (grade >= 60) return "D";
  return "F";
};

const getRecommendations = (student: Student): string[] => {
  const recommendations: string[] = [];

  if (student.prediction === "at-risk") {
    recommendations.push("Schedule one-on-one tutoring sessions to address learning gaps.");
    recommendations.push("Implement a personalized study plan with weekly check-ins.");
    if (student.attendance < 80) {
      recommendations.push("Address attendance issues - consider parent-teacher meeting.");
    }
    recommendations.push("Provide additional practice materials for challenging topics.");
  } else if (student.prediction === "on-track") {
    recommendations.push("Continue current learning pace with periodic assessments.");
    recommendations.push("Introduce challenging problems to push towards excellence.");
    if (student.attendance < 90) {
      recommendations.push("Encourage consistent attendance for better performance.");
    }
    recommendations.push("Consider peer tutoring to reinforce learned concepts.");
  } else {
    recommendations.push("Maintain excellent performance with advanced coursework.");
    recommendations.push("Consider leadership roles in group projects and activities.");
    recommendations.push("Explore enrichment programs and competitions.");
    recommendations.push("Encourage mentoring of other students.");
  }

  return recommendations;
};

export function StudentReportCard({ student }: StudentReportCardProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const formatDate = (date: string | null) =>
    date ? new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "N/A";

  const generatePDF = async () => {
    if (!reportRef.current) return;

    setIsGenerating(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${student.name.replace(/\s+/g, "_")}_Report_Card.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const recommendations = getRecommendations(student);

  return (
    <Card className="card-shadow animate-slide-up" style={{ animationDelay: "250ms" }}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5 text-primary" />
          Report Card
        </CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint} className="print:hidden">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button size="sm" onClick={generatePDF} disabled={isGenerating} className="print:hidden">
            {isGenerating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Download PDF
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Printable Report Card */}
        <div
          ref={reportRef}
          className="bg-white p-8 rounded-lg border"
          style={{ minWidth: "600px" }}
        >
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">STUDENT REPORT CARD</h1>
            <p className="text-gray-600 mt-1">Academic Performance Report</p>
            <p className="text-sm text-gray-500 mt-2">
              Generated on {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>

          <Separator className="my-4" />

          {/* Student Info Section */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Student Information</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium text-gray-900">{student.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium text-gray-900">{student.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Roll No:</span>
                  <span className="font-medium text-gray-900">{student.roll_no || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date of Birth:</span>
                  <span className="font-medium text-gray-900">{formatDate(student.date_of_birth)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Blood Group:</span>
                  <span className="font-medium text-gray-900">{student.blood_group || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Father's Name:</span>
                  <span className="font-medium text-gray-900">{student.father_name || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Mother's Name:</span>
                  <span className="font-medium text-gray-900">{student.mother_name || "N/A"}</span>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Performance Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Overall Grade:</span>
                  <span className={cn(
                    "font-bold",
                    student.grade >= 85 ? "text-green-600" :
                    student.grade >= 70 ? "text-blue-600" :
                    student.grade >= 60 ? "text-yellow-600" : "text-red-600"
                  )}>
                    {student.grade}% ({getGradeLetter(student.grade)})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Attendance:</span>
                  <span className={cn(
                    "font-medium",
                    student.attendance >= 90 ? "text-green-600" :
                    student.attendance >= 75 ? "text-blue-600" : "text-red-600"
                  )}>
                    {student.attendance}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Prediction Status:</span>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs",
                      student.prediction === "excelling" ? "bg-green-100 text-green-700 border-green-300" :
                      student.prediction === "on-track" ? "bg-blue-100 text-blue-700 border-blue-300" :
                      "bg-red-100 text-red-700 border-red-300"
                    )}
                  >
                    {predictionLabels[student.prediction as keyof typeof predictionLabels]}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">AI Confidence:</span>
                  <span className="font-medium text-gray-900">{student.confidence}%</span>
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Marks Breakdown */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Marks Breakdown</h2>
            <div className="overflow-hidden rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-gray-600">Component</th>
                    <th className="px-4 py-2 text-center font-medium text-gray-600">Marks Obtained</th>
                    <th className="px-4 py-2 text-center font-medium text-gray-600">Maximum Marks</th>
                    <th className="px-4 py-2 text-center font-medium text-gray-600">Percentage</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="px-4 py-2 text-gray-900">Internal Assessment</td>
                    <td className="px-4 py-2 text-center font-medium">{student.internal_marks}</td>
                    <td className="px-4 py-2 text-center text-gray-600">50</td>
                    <td className="px-4 py-2 text-center font-medium">
                      {((student.internal_marks / 50) * 100).toFixed(1)}%
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-gray-900">External Assessment</td>
                    <td className="px-4 py-2 text-center font-medium">{student.external_marks}</td>
                    <td className="px-4 py-2 text-center text-gray-600">50</td>
                    <td className="px-4 py-2 text-center font-medium">
                      {((student.external_marks / 50) * 100).toFixed(1)}%
                    </td>
                  </tr>
                  <tr className="bg-gray-50 font-semibold">
                    <td className="px-4 py-2 text-gray-900">Total</td>
                    <td className="px-4 py-2 text-center">{student.internal_marks + student.external_marks}</td>
                    <td className="px-4 py-2 text-center text-gray-600">100</td>
                    <td className="px-4 py-2 text-center text-primary">
                      {student.internal_marks + student.external_marks}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Recommendations */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Teacher Recommendations</h2>
            <ul className="space-y-2">
              {recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-primary font-bold mt-0.5">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-4 border-t text-center text-xs text-gray-500">
            <p>This report was generated by the Student Performance Prediction System</p>
            <p className="mt-1">© {new Date().getFullYear()} EduTrack - AI-Powered Student Analytics</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

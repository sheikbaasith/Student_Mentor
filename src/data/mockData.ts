import { Student } from "@/components/dashboard/StudentTable";

export const students: Student[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah.j@university.edu",
    grade: 92,
    attendance: 96,
    prediction: "excelling",
    confidence: 94,
    subjects: [
      { name: "Mathematics", score: 95 },
      { name: "Physics", score: 88 },
      { name: "Computer Science", score: 94 },
    ],
  },
  {
    id: "2",
    name: "Michael Chen",
    email: "m.chen@university.edu",
    grade: 78,
    attendance: 89,
    prediction: "on-track",
    confidence: 87,
    subjects: [
      { name: "Mathematics", score: 80 },
      { name: "Physics", score: 75 },
      { name: "Computer Science", score: 82 },
    ],
  },
  {
    id: "3",
    name: "Emily Davis",
    email: "e.davis@university.edu",
    grade: 55,
    attendance: 68,
    prediction: "at-risk",
    confidence: 91,
    subjects: [
      { name: "Mathematics", score: 52 },
      { name: "Physics", score: 58 },
      { name: "Computer Science", score: 55 },
    ],
  },
  {
    id: "4",
    name: "James Wilson",
    email: "j.wilson@university.edu",
    grade: 85,
    attendance: 92,
    prediction: "excelling",
    confidence: 88,
    subjects: [
      { name: "Mathematics", score: 87 },
      { name: "Physics", score: 82 },
      { name: "Computer Science", score: 89 },
    ],
  },
  {
    id: "5",
    name: "Olivia Martinez",
    email: "o.martinez@university.edu",
    grade: 71,
    attendance: 85,
    prediction: "on-track",
    confidence: 82,
    subjects: [
      { name: "Mathematics", score: 70 },
      { name: "Physics", score: 72 },
      { name: "Computer Science", score: 74 },
    ],
  },
  {
    id: "6",
    name: "David Thompson",
    email: "d.thompson@university.edu",
    grade: 48,
    attendance: 62,
    prediction: "at-risk",
    confidence: 95,
    subjects: [
      { name: "Mathematics", score: 45 },
      { name: "Physics", score: 50 },
      { name: "Computer Science", score: 48 },
    ],
  },
  {
    id: "7",
    name: "Sophie Anderson",
    email: "s.anderson@university.edu",
    grade: 88,
    attendance: 94,
    prediction: "excelling",
    confidence: 90,
    subjects: [
      { name: "Mathematics", score: 90 },
      { name: "Physics", score: 85 },
      { name: "Computer Science", score: 91 },
    ],
  },
  {
    id: "8",
    name: "Ryan Taylor",
    email: "r.taylor@university.edu",
    grade: 65,
    attendance: 78,
    prediction: "on-track",
    confidence: 75,
    subjects: [
      { name: "Mathematics", score: 62 },
      { name: "Physics", score: 68 },
      { name: "Computer Science", score: 65 },
    ],
  },
];

export const performanceData = [
  { month: "Jan", average: 72, predicted: 73 },
  { month: "Feb", average: 74, predicted: 75 },
  { month: "Mar", average: 71, predicted: 74 },
  { month: "Apr", average: 76, predicted: 77 },
  { month: "May", average: 78, predicted: 79 },
  { month: "Jun", average: 75, predicted: 78 },
  { month: "Jul", average: 77, predicted: 80 },
  { month: "Aug", average: 79, predicted: 81 },
  { month: "Sep", average: 76, predicted: 79 },
  { month: "Oct", average: 78, predicted: 80 },
  { month: "Nov", average: 80, predicted: 82 },
  { month: "Dec", average: 0, predicted: 83 },
];

export const gradeDistribution = [
  { grade: "A", count: 45 },
  { grade: "B", count: 82 },
  { grade: "C", count: 63 },
  { grade: "D", count: 28 },
  { grade: "F", count: 12 },
];

export const riskData = [
  { name: "Excelling", value: 85, color: "hsl(160, 84%, 39%)" },
  { name: "On Track", value: 120, color: "hsl(174, 72%, 40%)" },
  { name: "At Risk", value: 25, color: "hsl(0, 84%, 60%)" },
];

export const dashboardStats = {
  totalStudents: 230,
  atRiskStudents: 25,
  averagePerformance: 76.4,
  passRate: 89.1,
};

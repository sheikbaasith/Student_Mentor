import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Mail, Phone, Bell } from "lucide-react";

interface NotificationHistoryItem {
  id: string;
  student_name: string;
  course_name: string | null;
  current_grade: number;
  risk_status: string;
  channels: string[];
  email_sent: boolean;
  sms_sent: boolean;
  sent_at: string;
}

export function NotificationHistoryPanel() {
  const { data, isLoading } = useQuery({
    queryKey: ["notification-history"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("notification_history")
        .select("id, student_name, course_name, current_grade, risk_status, channels, email_sent, sms_sent, sent_at")
        .order("sent_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      return (data || []) as NotificationHistoryItem[];
    },
  });

  return (
    <Card className="card-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Bell className="h-5 w-5 text-primary" />
          Notification History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading history...
          </div>
        ) : !data || data.length === 0 ? (
          <p className="text-muted-foreground text-sm">No notification history yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Channels</TableHead>
                <TableHead>Sent At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium text-foreground">{item.student_name}</TableCell>
                  <TableCell className="text-foreground">{item.course_name || "Not Assigned"}</TableCell>
                  <TableCell className="text-foreground">{item.current_grade}%</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-danger/10 text-danger border-danger/20 uppercase">
                      {item.risk_status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {item.email_sent && (
                        <Badge variant="secondary" className="gap-1 text-foreground">
                          <Mail className="h-3 w-3" /> Email
                        </Badge>
                      )}
                      {item.sms_sent && (
                        <Badge variant="secondary" className="gap-1 text-foreground">
                          <Phone className="h-3 w-3" /> SMS
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(item.sent_at).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

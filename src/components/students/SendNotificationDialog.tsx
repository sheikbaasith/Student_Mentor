import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Loader2, AlertTriangle, CheckCircle, Phone, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Student } from "@/hooks/useStudents";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface SendNotificationDialogProps {
  student: Student;
  teacherName?: string;
  courseName?: string;
}

export function SendNotificationDialog({ student, teacherName, courseName }: SendNotificationDialogProps) {
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [customMessage, setCustomMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [result, setResult] = useState<{ emailSent?: boolean; smsSent?: boolean }>({});
  const { toast } = useToast();

  const handleSend = async () => {
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-at-risk-notification", {
        body: {
          studentId: student.id,
          customMessage: customMessage.trim() || undefined,
        },
      });

      if (error) throw error;

      setSent(true);
      setResult(data || {});
      toast({
        title: "Notification Sent",
        description: `Alert sent to ${student.email}${student.phone ? ' and phone' : ''}`,
      });

      setTimeout(() => {
        setOpen(false);
        setSent(false);
        setCustomMessage("");
        setResult({});
      }, 3000);
    } catch (error: any) {
      console.error("Failed to send notification:", error);
      toast({
        title: "Failed to Send",
        description: error.message || "Could not send the notification. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) {
        setSent(false);
        setCustomMessage("");
        setResult({});
      }
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Mail className="h-4 w-4" />
          Notify
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-danger" />
            Send At-Risk Notification
          </DialogTitle>
          <DialogDescription>
            Send an alert to {student.name} about their academic performance via email{student.phone ? ' and SMS' : ''}.
          </DialogDescription>
        </DialogHeader>

        {sent ? (
          <div className="py-8 text-center">
            <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
            <p className="text-lg font-medium text-foreground">Notification Sent!</p>
            <div className="flex items-center justify-center gap-3 mt-3">
              {result.emailSent && (
                <Badge variant="secondary" className="gap-1">
                  <Mail className="h-3 w-3" /> Email Sent
                </Badge>
              )}
              {result.smsSent && (
                <Badge variant="secondary" className="gap-1">
                  <Phone className="h-3 w-3" /> SMS Sent
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-2 text-sm">
              Alert has been sent to {student.email}{student.phone ? ` and ${student.phone}` : ''}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                <div className="space-y-1 text-sm text-foreground">
                  <p><strong>Student:</strong> {student.name}</p>
                  <p><strong>Email:</strong> {student.email}</p>
                  {student.phone && <p><strong>Phone:</strong> {student.phone}</p>}
                  <p><strong>Course:</strong> {courseName || "Not Assigned"}</p>
                  <p><strong>Current Grade:</strong> {student.grade}%</p>
                  <p><strong>Attendance:</strong> {student.attendance}%</p>
                  <p><strong>Risk Status:</strong> <span className="text-danger font-semibold uppercase">{student.prediction}</span></p>
                </div>
              </AlertDescription>
            </Alert>

            <div className="rounded-md border border-border bg-muted/20 p-3">
              <p className="text-xs font-medium text-foreground mb-2 flex items-center gap-1">
                <MessageSquare className="h-3 w-3" /> Notification Channels
              </p>
              <div className="flex gap-2">
                <Badge variant="outline" className="gap-1 text-foreground">
                  <Mail className="h-3 w-3" /> Email
                </Badge>
                {student.phone && (
                  <Badge variant="outline" className="gap-1 text-foreground">
                    <Phone className="h-3 w-3" /> SMS
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customMessage" className="text-foreground">Personal Message (Optional)</Label>
              <Textarea
                id="customMessage"
                placeholder="Add a personalized message for the student..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                This message will be included in both email and SMS notifications.
              </p>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {sent ? "Close" : "Cancel"}
          </Button>
          {!sent && (
            <Button onClick={handleSend} disabled={sending} className="gap-2">
              {sending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4" />
                  Send Notification
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

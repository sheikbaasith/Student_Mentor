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
import { Mail, Loader2, AlertTriangle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Student } from "@/hooks/useStudents";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SendNotificationDialogProps {
  student: Student;
  teacherName?: string;
}

export function SendNotificationDialog({ student, teacherName }: SendNotificationDialogProps) {
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [customMessage, setCustomMessage] = useState("");
  const [sent, setSent] = useState(false);
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
      toast({
        title: "Notification Sent",
        description: `Email notification sent to ${student.email}`,
      });

      setTimeout(() => {
        setOpen(false);
        setSent(false);
        setCustomMessage("");
      }, 2000);
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
            Send an email alert to notify about {student.name}'s academic performance.
          </DialogDescription>
        </DialogHeader>

        {sent ? (
          <div className="py-8 text-center">
            <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
            <p className="text-lg font-medium">Notification Sent!</p>
            <p className="text-muted-foreground mt-1">
              Email has been sent to {student.email}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                <div className="space-y-1 text-sm">
                  <p><strong>Student:</strong> {student.name}</p>
                  <p><strong>Email:</strong> {student.email}</p>
                  <p><strong>Current Grade:</strong> {student.grade}%</p>
                  <p><strong>Attendance:</strong> {student.attendance}%</p>
                </div>
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="customMessage">Personal Message (Optional)</Label>
              <Textarea
                id="customMessage"
                placeholder="Add a personalized message for the parent/guardian..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                This message will be included in the email notification.
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

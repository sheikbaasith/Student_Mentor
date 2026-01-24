import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Mail, X, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export function EmailVerificationBanner() {
  const { user, isEmailVerified, resendVerificationEmail } = useAuth();
  const { toast } = useToast();
  const [isResending, setIsResending] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  if (!user || isEmailVerified || isDismissed) {
    return null;
  }

  const handleResend = async () => {
    setIsResending(true);
    const { error } = await resendVerificationEmail();
    setIsResending(false);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setEmailSent(true);
      toast({
        title: "Verification email sent!",
        description: "Please check your inbox and click the verification link.",
      });
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, height: 0 }}
        animate={{ opacity: 1, y: 0, height: "auto" }}
        exit={{ opacity: 0, y: -20, height: 0 }}
        className="bg-warning/10 border-b border-warning/20"
      >
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <AlertTriangle className="h-5 w-5 text-warning" />
              </motion.div>
              <div className="text-sm">
                <span className="font-medium text-warning">Email not verified.</span>{" "}
                <span className="text-muted-foreground">
                  Please verify your email to access all features.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {emailSent ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 text-success text-sm"
                >
                  <CheckCircle className="h-4 w-4" />
                  Email sent!
                </motion.div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResend}
                  disabled={isResending}
                  className="text-warning border-warning/30 hover:bg-warning/10"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-3 w-3" />
                      Resend verification
                    </>
                  )}
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => setIsDismissed(true)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
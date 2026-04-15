import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useStudentAuth } from "@/contexts/StudentAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, GraduationCap, Loader2, Users, BookOpen } from "lucide-react";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/ThemeToggle";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { supabase } from "@/integrations/supabase/client";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

const floatingShapes = [
  { size: 120, x: "10%", y: "20%", delay: 0, duration: 8 },
  { size: 80, x: "80%", y: "60%", delay: 1, duration: 10 },
  { size: 60, x: "20%", y: "80%", delay: 2, duration: 12 },
  { size: 100, x: "70%", y: "30%", delay: 0.5, duration: 9 },
  { size: 50, x: "50%", y: "10%", delay: 1.5, duration: 11 },
];

type AuthView = "login" | "signup" | "forgot";
type UserRole = "teacher" | "student";

const Auth = () => {
  const [role, setRole] = useState<UserRole>("teacher");
  const [authView, setAuthView] = useState<AuthView>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Student login fields
  const [rollNo, setRollNo] = useState("");
  const [studentName, setStudentName] = useState("");

  const { user, loading, signIn, signUp, resetPassword } = useAuth();
  const { setStudent, isStudentLoggedIn } = useStudentAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const isLogin = authView === "login";
  const isSignup = authView === "signup";
  const isForgot = authView === "forgot";

  useEffect(() => {
    if (!loading && user) navigate("/");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (isStudentLoggedIn) navigate("/student-dashboard");
  }, [isStudentLoggedIn, navigate]);

  const validateTeacherForm = () => {
    const newErrors: Record<string, string> = {};
    try { emailSchema.parse(email); } catch (e: any) { newErrors.email = e.errors[0].message; }
    if (!isForgot) {
      try { passwordSchema.parse(password); } catch (e: any) { newErrors.password = e.errors[0].message; }
    }
    if (isSignup && !fullName.trim()) newErrors.fullName = "Full name is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStudentForm = () => {
    const newErrors: Record<string, string> = {};
    if (!rollNo.trim()) newErrors.rollNo = "Roll number is required";
    if (!studentName.trim()) newErrors.studentName = "Name is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTeacherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateTeacherForm()) return;
    setIsSubmitting(true);
    try {
      if (isForgot) {
        const { error } = await resetPassword(email);
        if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
        else { setResetEmailSent(true); toast({ title: "Email Sent!", description: "Check your inbox for password reset instructions." }); }
      } else if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast({ title: "Login Failed", description: error.message.includes("Invalid login credentials") ? "Invalid email or password." : error.message, variant: "destructive" });
        } else {
          toast({ title: "Welcome back!", description: "You have successfully logged in." });
        }
      } else {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          if (error.message.includes("User already registered")) {
            toast({ title: "Account Exists", description: "Please login instead.", variant: "destructive" });
            setAuthView("login");
          } else {
            toast({ title: "Error", description: error.message, variant: "destructive" });
          }
        } else {
          toast({ title: "Account created!", description: "Welcome to EduTrack." });
        }
      }
    } finally { setIsSubmitting(false); }
  };

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStudentForm()) return;
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("student-login", {
        body: { roll_no: rollNo.trim(), name: studentName.trim() },
      });
      if (error || data?.error) {
        toast({ title: "Login Failed", description: data?.error || "Could not verify student credentials.", variant: "destructive" });
      } else if (data?.student) {
        setStudent(data.student);
        toast({ title: "Welcome!", description: `Hello ${data.student.name}, your dashboard is ready.` });
        navigate("/student-dashboard");
      }
    } catch {
      toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" });
    } finally { setIsSubmitting(false); }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background overflow-hidden transition-colors duration-500">
      <motion.div className="absolute top-4 right-4 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
        <ThemeToggle />
      </motion.div>

      {/* Left Branding */}
      <motion.div
        className="hidden lg:flex lg:w-1/2 gradient-primary p-12 flex-col justify-between relative"
        initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.8 }}
      >
        {floatingShapes.map((shape, i) => (
          <motion.div key={i} className="absolute rounded-full bg-white/10 backdrop-blur-sm"
            style={{ width: shape.size, height: shape.size, left: shape.x, top: shape.y }}
            animate={{ y: [0, -30, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: shape.duration, delay: shape.delay, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
        <div className="flex items-center gap-3 z-10">
          <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <span className="text-white font-bold text-xl">EduTrack</span>
        </div>
        <div className="space-y-6 z-10">
          <h1 className="text-4xl font-bold text-white leading-tight">AI-Powered Student<br />Performance Prediction</h1>
          <p className="text-white/80 text-lg max-w-md">Leverage machine learning to identify at-risk students early and provide targeted interventions.</p>
          <div className="flex gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <p className="text-3xl font-bold text-white">94%</p>
              <p className="text-white/70 text-sm">Prediction Accuracy</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <p className="text-3xl font-bold text-white">25K+</p>
              <p className="text-white/70 text-sm">Students Analyzed</p>
            </div>
          </div>
        </div>
        <p className="text-white/60 text-sm z-10">© 2024 EduTrack. Final Year Project.</p>
      </motion.div>

      {/* Right Form */}
      <motion.div className="flex-1 flex items-center justify-center p-8"
        initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.8 }}
      >
        <div className="w-full max-w-md space-y-6">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2 justify-center">
            <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-xl">EduTrack</span>
          </div>

          {/* Role Tabs */}
          <div className="flex rounded-lg border bg-muted/50 p-1 gap-1">
            <button
              onClick={() => { setRole("teacher"); setErrors({}); setAuthView("login"); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-medium transition-all ${
                role === "teacher" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Users className="h-4 w-4" /> Teacher
            </button>
            <button
              onClick={() => { setRole("student"); setErrors({}); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-medium transition-all ${
                role === "student" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <BookOpen className="h-4 w-4" /> Student
            </button>
          </div>

          <AnimatePresence mode="wait">
            {role === "student" ? (
              /* ---- STUDENT LOGIN ---- */
              <motion.div key="student" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                <div className="text-center lg:text-left mb-4">
                  <h2 className="text-2xl font-bold text-foreground">Student Login</h2>
                  <p className="text-muted-foreground mt-1">Enter your roll number and name to view your results</p>
                </div>
                <form onSubmit={handleStudentSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="rollNo">Roll Number</Label>
                    <Input id="rollNo" placeholder="e.g. CS2024001" value={rollNo} onChange={(e) => setRollNo(e.target.value)}
                      className={errors.rollNo ? "border-destructive" : ""} />
                    {errors.rollNo && <p className="text-sm text-destructive">{errors.rollNo}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="studentName">Full Name</Label>
                    <Input id="studentName" placeholder="Enter your full name" value={studentName} onChange={(e) => setStudentName(e.target.value)}
                      className={errors.studentName ? "border-destructive" : ""} />
                    {errors.studentName && <p className="text-sm text-destructive">{errors.studentName}</p>}
                  </div>
                  <Button type="submit" className="w-full gradient-primary text-primary-foreground" disabled={isSubmitting}>
                    {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...</> : "View My Results"}
                  </Button>
                </form>
              </motion.div>
            ) : (
              /* ---- TEACHER LOGIN ---- */
              <motion.div key="teacher" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                <AnimatePresence mode="wait">
                  <motion.div key={authView} className="text-center lg:text-left mb-4"
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.3 }}
                  >
                    <h2 className="text-2xl font-bold text-foreground">
                      {isForgot ? "Reset your password" : isLogin ? "Teacher Login" : "Create Teacher Account"}
                    </h2>
                    <p className="text-muted-foreground mt-1">
                      {isForgot ? "Enter your email to receive a reset link" : isLogin ? "Enter your credentials to access your dashboard" : "Start predicting student performance today"}
                    </p>
                  </motion.div>
                </AnimatePresence>

                {resetEmailSent && isForgot ? (
                  <div className="text-center space-y-4 py-8">
                    <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
                      <svg className="h-8 w-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-lg text-foreground">Check your email</h3>
                    <p className="text-muted-foreground text-sm">We've sent a password reset link to <strong>{email}</strong></p>
                    <Button variant="outline" onClick={() => { setAuthView("login"); setResetEmailSent(false); }}>Back to login</Button>
                  </div>
                ) : (
                  <>
                    <form onSubmit={handleTeacherSubmit} className="space-y-4">
                      {isSignup && (
                        <div className="space-y-2">
                          <Label htmlFor="fullName">Full Name</Label>
                          <Input id="fullName" placeholder="Dr. John Smith" value={fullName} onChange={(e) => setFullName(e.target.value)}
                            className={errors.fullName ? "border-destructive" : ""} />
                          {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="teacher@university.edu" value={email} onChange={(e) => setEmail(e.target.value)}
                          className={errors.email ? "border-destructive" : ""} />
                        {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                      </div>
                      {!isForgot && (
                        <div className="space-y-2">
                          <Label htmlFor="password">Password</Label>
                          <div className="relative">
                            <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password}
                              onChange={(e) => setPassword(e.target.value)} className={`pr-10 ${errors.password ? "border-destructive" : ""}`} />
                            <button type="button" onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                          {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                        </div>
                      )}
                      <Button type="submit" className="w-full gradient-primary text-primary-foreground" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {isForgot ? "Send Reset Link" : isLogin ? "Sign In" : "Create Account"}
                      </Button>
                    </form>

                    {isLogin && (
                      <div className="mt-4 space-y-3">
                        <div className="relative"><div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Or continue with</span></div></div>
                        <GoogleSignInButton />
                      </div>
                    )}

                    <div className="text-center space-y-2 mt-4">
                      {isLogin && (
                        <button type="button" onClick={() => { setAuthView("forgot"); setErrors({}); }}
                          className="text-sm text-primary hover:underline block mx-auto">Forgot your password?</button>
                      )}
                      <button type="button" onClick={() => { setAuthView(isLogin ? "signup" : "login"); setErrors({}); setResetEmailSent(false); }}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors">
                        {isLogin || isForgot ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;

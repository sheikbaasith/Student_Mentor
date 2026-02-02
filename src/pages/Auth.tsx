import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, GraduationCap, Loader2 } from "lucide-react";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/ThemeToggle";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { PhoneSignInButton } from "@/components/auth/PhoneSignInButton";
import { Separator } from "@/components/ui/separator";
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

const Auth = () => {
  const [authView, setAuthView] = useState<AuthView>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; fullName?: string }>({});

  const { user, loading, signIn, signUp, resetPassword } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const isLogin = authView === "login";
  const isSignup = authView === "signup";
  const isForgot = authView === "forgot";

  useEffect(() => {
    if (!loading && user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string; fullName?: string } = {};
    
    try {
      emailSchema.parse(email);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.email = e.errors[0].message;
      }
    }

    if (!isForgot) {
      try {
        passwordSchema.parse(password);
      } catch (e) {
        if (e instanceof z.ZodError) {
          newErrors.password = e.errors[0].message;
        }
      }
    }

    if (isSignup && !fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      if (isForgot) {
        const { error } = await resetPassword(email);
        if (error) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        } else {
          setResetEmailSent(true);
          toast({
            title: "Email Sent!",
            description: "Check your inbox for password reset instructions.",
          });
        }
      } else if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast({
              title: "Login Failed",
              description: "Invalid email or password. Please try again.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Error",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Welcome back!",
            description: "You have successfully logged in.",
          });
        }
      } else {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          if (error.message.includes("User already registered")) {
            toast({
              title: "Account Exists",
              description: "An account with this email already exists. Please login instead.",
              variant: "destructive",
            });
            setAuthView("login");
          } else {
            toast({
              title: "Error",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Account created!",
            description: "Welcome to StudentPredict. You are now logged in.",
          });
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="h-8 w-8 text-primary" />
        </motion.div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] as const },
    },
  };

  const formItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] as const },
    },
    exit: {
      opacity: 0,
      x: 20,
      transition: { duration: 0.3 },
    },
  };

  return (
    <div className="min-h-screen flex bg-background overflow-hidden transition-colors duration-500">
      {/* Theme Toggle - Positioned at top right */}
      <motion.div 
        className="absolute top-4 right-4 z-50"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.3 }}
      >
        <ThemeToggle />
      </motion.div>
      {/* Left Side - Branding with Animations */}
      <motion.div 
        className="hidden lg:flex lg:w-1/2 gradient-primary p-12 flex-col justify-between relative"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Animated Floating Shapes */}
        {floatingShapes.map((shape, index) => (
          <motion.div
            key={index}
            className="absolute rounded-full bg-white/10 backdrop-blur-sm"
            style={{
              width: shape.size,
              height: shape.size,
              left: shape.x,
              top: shape.y,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 15, 0],
              scale: [1, 1.1, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: shape.duration,
              delay: shape.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

        <motion.div 
          className="flex items-center gap-3 z-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <motion.div 
            className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center"
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <GraduationCap className="h-6 w-6 text-white" />
          </motion.div>
          <span className="text-white font-bold text-xl">StudentPredict</span>
        </motion.div>
        
        <motion.div 
          className="space-y-6 z-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1 
            className="text-4xl font-bold text-white leading-tight"
            variants={itemVariants}
          >
            AI-Powered Student <br />Performance Prediction
          </motion.h1>
          <motion.p 
            className="text-white/80 text-lg max-w-md"
            variants={itemVariants}
          >
            Leverage machine learning to identify at-risk students early and provide
            targeted interventions for better educational outcomes.
          </motion.p>
          <motion.div 
            className="flex gap-4"
            variants={itemVariants}
          >
            <motion.div 
              className="bg-white/10 backdrop-blur-sm rounded-lg p-4"
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.15)" }}
              transition={{ duration: 0.2 }}
            >
              <motion.p 
                className="text-3xl font-bold text-white"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8, duration: 0.5, type: "spring" }}
              >
                94%
              </motion.p>
              <p className="text-white/70 text-sm">Prediction Accuracy</p>
            </motion.div>
            <motion.div 
              className="bg-white/10 backdrop-blur-sm rounded-lg p-4"
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.15)" }}
              transition={{ duration: 0.2 }}
            >
              <motion.p 
                className="text-3xl font-bold text-white"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1, duration: 0.5, type: "spring" }}
              >
                25K+
              </motion.p>
              <p className="text-white/70 text-sm">Students Analyzed</p>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.p 
          className="text-white/60 text-sm z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          © 2024 StudentPredict. Final Year Project.
        </motion.p>
      </motion.div>

      {/* Right Side - Auth Form with Animations */}
      <motion.div 
        className="flex-1 flex items-center justify-center p-8"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <motion.div 
            className="lg:hidden flex items-center gap-2 justify-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div 
              className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center"
              whileHover={{ rotate: 10 }}
            >
              <GraduationCap className="h-6 w-6 text-white" />
            </motion.div>
            <span className="font-bold text-xl">StudentPredict</span>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div 
              key={authView}
              className="text-center lg:text-left"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold">
                {isForgot ? "Reset your password" : isLogin ? "Welcome back" : "Create your account"}
              </h2>
              <p className="text-muted-foreground mt-2">
                {isForgot
                  ? "Enter your email to receive a reset link"
                  : isLogin
                  ? "Enter your credentials to access your dashboard"
                  : "Start predicting student performance today"}
              </p>
            </motion.div>
          </AnimatePresence>

          {resetEmailSent && isForgot ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-4 py-8"
            >
              <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
                <svg className="h-8 w-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Check your email</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  We've sent a password reset link to <strong>{email}</strong>
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setAuthView("login");
                  setResetEmailSent(false);
                }}
                className="mt-4"
              >
                Back to login
              </Button>
            </motion.div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-5">
                <AnimatePresence mode="wait">
                  {isSignup && (
                    <motion.div 
                      className="space-y-2"
                      variants={formItemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Dr. John Smith"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className={errors.fullName ? "border-danger" : ""}
                      />
                      {errors.fullName && (
                        <motion.p 
                          className="text-sm text-danger"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                        >
                          {errors.fullName}
                        </motion.p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="teacher@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={errors.email ? "border-danger" : ""}
              />
              {errors.email && (
                <motion.p 
                  className="text-sm text-danger"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  {errors.email}
                </motion.p>
              )}
            </motion.div>

            <AnimatePresence mode="wait">
              {!isForgot && (
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                >
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={errors.password ? "border-danger pr-10" : "pr-10"}
                    />
                    <motion.button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </motion.button>
                  </div>
                  {errors.password && (
                    <motion.p 
                      className="text-sm text-danger"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      {errors.password}
                    </motion.p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <Button
                type="submit"
                className="w-full gradient-primary text-primary-foreground hover:opacity-90"
                disabled={isSubmitting}
              >
                <AnimatePresence mode="wait">
                  {isSubmitting ? (
                    <motion.span
                      key="loading"
                      className="flex items-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isForgot ? "Sending..." : isLogin ? "Signing in..." : "Creating account..."}
                    </motion.span>
                  ) : (
                    <motion.span
                      key="text"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {isForgot ? "Send Reset Link" : isLogin ? "Sign In" : "Create Account"}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>
          </form>

          {/* Divider */}
          {!isForgot && (
            <motion.div
              className="relative"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
            >
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </motion.div>
          )}

          {/* Social Sign In Options */}
          {!isForgot && (
            <div className="space-y-3">
              <GoogleSignInButton />
              <PhoneSignInButton />
            </div>
          )}

          <motion.div 
            className="text-center space-y-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            {isLogin && (
              <motion.button
                type="button"
                onClick={() => {
                  setAuthView("forgot");
                  setErrors({});
                }}
                className="text-sm text-primary hover:underline transition-colors block mx-auto"
                whileHover={{ scale: 1.02 }}
              >
                Forgot your password?
              </motion.button>
            )}
            <motion.button
              type="button"
              onClick={() => {
                setAuthView(isLogin ? "signup" : "login");
                setErrors({});
                setResetEmailSent(false);
              }}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLogin || isForgot
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </motion.button>
          </motion.div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;

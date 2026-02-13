import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Loader2, ArrowLeft, ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { countryCodes, type CountryCode } from "@/data/countryCodes";

type PhoneAuthStep = "phone" | "otp";

export function PhoneSignInButton() {
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  const [step, setStep] = useState<PhoneAuthStep>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(countryCodes[0]);
  const [countrySearch, setCountrySearch] = useState("");
  const [countryOpen, setCountryOpen] = useState(false);

  const filteredCountries = countryCodes.filter(
    (c) =>
      c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
      c.dial.includes(countrySearch) ||
      c.code.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const getFullPhone = () => {
    const digits = phone.replace(/\D/g, "");
    return `${selectedCountry.dial}${digits}`;
  };

  const handleSendOtp = async () => {
    if (!phone.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid phone number",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const formattedPhone = getFullPhone();
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "OTP Sent!", description: "Check your phone for the verification code." });
        setStep("otp");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send OTP",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast({ title: "Error", description: "Please enter the complete 6-digit code", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const formattedPhone = getFullPhone();
      const { error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otp,
        type: "sms",
      });

      if (error) {
        toast({ title: "Verification Failed", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Success!", description: "You have been signed in successfully." });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to verify OTP",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (step === "otp") {
      setStep("phone");
      setOtp("");
    } else {
      setIsExpanded(false);
      setPhone("");
    }
  };

  const handleReset = () => {
    setIsExpanded(false);
    setStep("phone");
    setPhone("");
    setOtp("");
  };

  if (!isExpanded) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <Button
          type="button"
          variant="outline"
          className="w-full relative overflow-hidden group"
          onClick={() => setIsExpanded(true)}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-teal-500/10 to-cyan-500/10"
            initial={{ x: "-100%" }}
            whileHover={{ x: "100%" }}
            transition={{ duration: 0.6 }}
          />
          <span className="relative flex items-center justify-center gap-3">
            <Phone className="h-5 w-5 text-green-600" />
            <span className="font-medium">Continue with Phone</span>
          </span>
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="space-y-4 p-4 border rounded-lg bg-muted/30"
    >
      <div className="flex items-center gap-2">
        <Button type="button" variant="ghost" size="icon" onClick={handleBack} className="h-8 w-8">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h3 className="font-medium flex items-center gap-2">
          <Phone className="h-4 w-4 text-green-600" />
          {step === "phone" ? "Enter Phone Number" : "Verify OTP"}
        </h3>
      </div>

      <AnimatePresence mode="wait">
        {step === "phone" ? (
          <motion.div
            key="phone"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-3"
          >
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="flex gap-2">
                <Popover open={countryOpen} onOpenChange={setCountryOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-[120px] justify-between px-2 shrink-0"
                    >
                      <span className="flex items-center gap-1 text-sm">
                        <span>{selectedCountry.flag}</span>
                        <span>{selectedCountry.dial}</span>
                      </span>
                      <ChevronDown className="h-3 w-3 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[260px] p-0" align="start">
                    <div className="flex items-center border-b px-3 py-2">
                      <Search className="h-4 w-4 text-muted-foreground mr-2" />
                      <input
                        className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                        placeholder="Search country..."
                        value={countrySearch}
                        onChange={(e) => setCountrySearch(e.target.value)}
                      />
                    </div>
                    <ScrollArea className="h-[200px]">
                      {filteredCountries.map((country) => (
                        <button
                          key={country.code}
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors"
                          onClick={() => {
                            setSelectedCountry(country);
                            setCountryOpen(false);
                            setCountrySearch("");
                          }}
                        >
                          <span>{country.flag}</span>
                          <span className="flex-1 text-left">{country.name}</span>
                          <span className="text-muted-foreground">{country.dial}</span>
                        </button>
                      ))}
                    </ScrollArea>
                  </PopoverContent>
                </Popover>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="234 567 8900"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Select your country and enter your phone number
              </p>
            </div>
            <Button type="button" className="w-full" onClick={handleSendOtp} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Verification Code"
              )}
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="otp"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label>Enter 6-digit code</Label>
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={otp} onChange={(value) => setOtp(value)}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Code sent to {selectedCountry.flag} {getFullPhone()}
              </p>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1" onClick={handleSendOtp} disabled={isLoading}>
                Resend Code
              </Button>
              <Button type="button" className="flex-1" onClick={handleVerifyOtp} disabled={isLoading || otp.length !== 6}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify"
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Button type="button" variant="ghost" size="sm" onClick={handleReset} className="w-full text-muted-foreground">
        Use a different method
      </Button>
    </motion.div>
  );
}

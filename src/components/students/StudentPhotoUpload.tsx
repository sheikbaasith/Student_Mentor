import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface StudentPhotoUploadProps {
  studentId: string;
  studentName: string;
  currentPhotoUrl?: string | null;
  onPhotoUpdated: (url: string) => void;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-12 w-12",
  md: "h-20 w-20",
  lg: "h-32 w-32",
};

// Extract the storage path from various URL formats
function extractStoragePath(url: string): string | null {
  // Already a relative path like "student-photos/studentId/file.jpg"
  if (url.startsWith("student-photos/")) {
    return url.replace("student-photos/", "");
  }
  // Full URL containing /student-photos/
  const match = url.match(/\/student-photos\/(.+?)(?:\?|$)/);
  if (match) return match[1];
  // Try /object/public/student-photos/ pattern
  const match2 = url.match(/\/object\/(?:public|sign)\/student-photos\/(.+?)(?:\?|$)/);
  if (match2) return match2[1];
  return null;
}

export function StudentPhotoUpload({
  studentId,
  studentName,
  currentPhotoUrl,
  onPhotoUpdated,
  size = "md",
}: StudentPhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const createSignedUrl = async (storagePath: string): Promise<string | null> => {
    const { data, error } = await supabase.storage
      .from("student-photos")
      .createSignedUrl(storagePath, 3600);
    if (error || !data?.signedUrl) return null;
    return data.signedUrl;
  };

  // Resolve signed URL when currentPhotoUrl changes
  useEffect(() => {
    if (!currentPhotoUrl) {
      setSignedUrl(null);
      return;
    }

    const path = extractStoragePath(currentPhotoUrl);
    if (path) {
      createSignedUrl(path).then((url) => {
        if (url) setSignedUrl(url);
      });
    }
  }, [currentPhotoUrl]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file type", description: "Please select an image file.", variant: "destructive" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Please select an image under 5MB.", variant: "destructive" });
      return;
    }

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target?.result as string);
    reader.readAsDataURL(file);

    setIsUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${studentId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("student-photos")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Store the relative path reference in DB
      const storedPath = `student-photos/${filePath}`;

      const { error: updateError } = await supabase
        .from("students")
        .update({ photo_url: storedPath })
        .eq("id", studentId);

      if (updateError) throw updateError;

      // Generate signed URL for display
      const signed = await createSignedUrl(filePath);
      if (signed) setSignedUrl(signed);

      onPhotoUpdated(storedPath);
      toast({ title: "Photo uploaded", description: "Student photo has been updated successfully." });
    } catch (error: any) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    setIsUploading(true);
    try {
      const { error } = await supabase
        .from("students")
        .update({ photo_url: null })
        .eq("id", studentId);

      if (error) throw error;

      setPreviewUrl(null);
      setSignedUrl(null);
      onPhotoUpdated("");
      toast({ title: "Photo removed", description: "Student photo has been removed." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const displayUrl = previewUrl || signedUrl || undefined;

  return (
    <div className="relative group">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <motion.div whileHover={{ scale: 1.02 }} className="relative">
        <Avatar className={`${sizeClasses[size]} border-4 border-primary/10`}>
          <AvatarImage src={displayUrl} alt={studentName} />
          <AvatarFallback className="bg-primary/5 text-primary font-semibold">
            {isUploading ? <Loader2 className="h-6 w-6 animate-spin" /> : getInitials(studentName)}
          </AvatarFallback>
        </Avatar>

        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera className="h-6 w-6 text-white" />
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {(previewUrl || signedUrl) && !isUploading && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-1 shadow-md hover:bg-destructive/90 transition-colors"
          onClick={handleRemovePhoto}
        >
          <X className="h-3 w-3" />
        </motion.button>
      )}
    </div>
  );
}

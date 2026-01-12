import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Loader2, Settings as SettingsIcon, User, Bell, Shield, Palette } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="space-y-1">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
                <SettingsIcon className="h-8 w-8 text-primary" />
                Settings
              </h1>
              <p className="text-muted-foreground">
                Manage your account and application preferences
              </p>
            </div>

            {/* Profile Settings */}
            <Card className="card-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile
                </CardTitle>
                <CardDescription>Your account information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={user.email || ""} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>User ID</Label>
                    <Input value={user.id.slice(0, 8) + "..."} disabled />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Account Created</Label>
                  <Input
                    value={new Date(user.created_at).toLocaleDateString()}
                    disabled
                  />
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card className="card-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </CardTitle>
                <CardDescription>Configure how you receive alerts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications about at-risk students
                    </p>
                  </div>
                  <Switch
                    checked={notifications}
                    onCheckedChange={setNotifications}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get weekly performance summaries via email
                    </p>
                  </div>
                  <Switch
                    checked={emailAlerts}
                    onCheckedChange={setEmailAlerts}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card className="card-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security
                </CardTitle>
                <CardDescription>Manage your account security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full sm:w-auto">
                  Change Password
                </Button>
                <Separator />
                <div className="pt-2">
                  <Button
                    variant="destructive"
                    onClick={handleSignOut}
                    className="w-full sm:w-auto"
                  >
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={handleSave} className="gradient-primary text-primary-foreground">
                Save Changes
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

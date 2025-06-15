
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";

interface ProfileFormData {
  name: string;
  dateOfBirth: string;
  company: string;
}

const AuthPage = () => {
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profile, setProfile] = useState<ProfileFormData>({
    name: "",
    dateOfBirth: "",
    company: "",
  });
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<any>(null);

  // Set up session listener
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setSession(session);
      if (session && session.user) {
        // Redirect to home on successful login/signup
        navigate("/");
      }
    });
    // Check on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session && session.user) {
        navigate("/");
      }
    });
    return () => { listener?.subscription.unsubscribe(); };
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isSignup) {
      // SIGN UP FLOW
      const redirectUrl = `${window.location.origin}/`;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        toast({ title: "Signup error", description: error.message, variant: "destructive" });
        setLoading(false);
        return;
      }

      // Now, set profile fields (update profile row; Supabase trigger already created the row)
      if (data.user) {
        // Add a slight delay for row creation
        setTimeout(async () => {
          const { error: profileErr } = await supabase
            .from("profiles")
            .update({
              name: profile.name,
              date_of_birth: profile.dateOfBirth || null,
              company: profile.company,
            })
            .eq("id", data.user.id);
          if (profileErr) {
            toast({ title: "Profile error", description: profileErr.message, variant: "destructive" });
          } else {
            toast({ title: "Signup successful", description: "Please check your email to confirm registration." });
          }
          setLoading(false);
        }, 500);
      } else {
        toast({ title: "Signup successful", description: "Please check your email to confirm registration." });
        setLoading(false);
      }
    } else {
      // LOGIN FLOW 
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast({ title: "Login error", description: error.message, variant: "destructive" });
        setLoading(false);
        return;
      }
      toast({ title: "Login successful" });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle>{isSignup ? "Sign Up for MnM Analyst" : "Log In to MnM Analyst"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              required
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              disabled={loading}
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              required
              onChange={e => setPassword(e.target.value)}
              autoComplete={isSignup ? "new-password" : "current-password"}
              disabled={loading}
            />
            {isSignup && (
              <>
                <Input
                  type="text"
                  placeholder="Name"
                  value={profile.name}
                  required
                  onChange={e => setProfile({ ...profile, name: e.target.value })}
                  disabled={loading}
                />
                <Input
                  type="date"
                  placeholder="Date of Birth"
                  value={profile.dateOfBirth}
                  onChange={e => setProfile({ ...profile, dateOfBirth: e.target.value })}
                  disabled={loading}
                />
                <Input
                  type="text"
                  placeholder="Company"
                  value={profile.company}
                  onChange={e => setProfile({ ...profile, company: e.target.value })}
                  disabled={loading}
                />
              </>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Processing..." : isSignup ? "Sign Up" : "Log In"}
            </Button>
          </form>
          <div className="mt-4 flex justify-between items-center text-sm">
            <span>
              {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                onClick={() => setIsSignup(s => !s)}
                className="text-primary hover:underline ml-1"
                type="button"
                disabled={loading}
              >
                {isSignup ? "Log In" : "Sign Up"}
              </button>
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;

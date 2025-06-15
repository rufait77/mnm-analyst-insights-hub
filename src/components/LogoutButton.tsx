
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";

const cleanupAuthState = () => {
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      sessionStorage.removeItem(key);
    }
  });
};

export default function LogoutButton() {
  const navigate = useNavigate();
  const handleLogout = async () => {
    cleanupAuthState();
    try {
      await supabase.auth.signOut({ scope: "global" });
    } catch {
      // ignore
    }
    toast({ title: "Logged out successfully!" });
    setTimeout(() => {
      window.location.href = "/auth";
    }, 300);
  };

  return (
    <Button variant="outline" size="sm" onClick={handleLogout}>
      Log out
    </Button>
  );
}


import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function ProfileBadge() {
  const [profile, setProfile] = useState<{ name: string | null, company: string | null } | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const id = session?.user?.id;

      if (id) {
        const { data } = await supabase
          .from("profiles")
          .select("name,company")
          .eq("id", id)
          .single();
        if (mounted && data) setProfile({ name: data.name, company: data.company });
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (!profile) return null;
  return (
    <span className="text-sm font-medium text-primary">
      👤 {profile.name}{profile.company ? ` — ${profile.company}` : ""}
    </span>
  );
}

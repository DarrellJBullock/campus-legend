"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCareerStore } from "@/stores/career-store";
import {
  listLocalCareers,
  deleteLocalCareer,
  type SaveSummary,
} from "@/lib/local-save";
import { getSchool } from "@/content/schools";
import {
  createSupabaseBrowserClient,
  isSupabaseConfigured,
} from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const career = useCareerStore((s) => s.career);
  const clear = useCareerStore((s) => s.clear);
  const router = useRouter();
  const [saves, setSaves] = useState<SaveSummary[]>(() => listLocalCareers());
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  const cloudConfigured = isSupabaseConfigured();

  function handleDelete(id: string) {
    if (pendingDeleteId !== id) {
      setPendingDeleteId(id);
      return;
    }
    deleteLocalCareer(id);
    if (career?.id === id) clear();
    setSaves(listLocalCareers());
    setPendingDeleteId(null);
  }

  async function handleSignOut() {
    setSigningOut(true);
    try {
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut();
    } finally {
      setSigningOut(false);
      router.push("/");
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Active Career</CardTitle>
        </CardHeader>
        <CardContent>
          {career ? (
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <Badge variant="stadium">{career.name}</Badge>
              <span className="text-muted-foreground">
                Save schema v{career.schemaVersion}
              </span>
              <span className="text-muted-foreground">
                Last saved {new Date(career.updatedAt).toLocaleString()}
              </span>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No career currently loaded.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Local Saves</CardTitle>
        </CardHeader>
        <CardContent>
          {saves.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No local saves found on this browser yet.
            </p>
          ) : (
            <div className="space-y-3">
              {saves.map((save) => {
                const school = getSchool(save.schoolId);
                const confirming = pendingDeleteId === save.id;
                return (
                  <div
                    key={save.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border p-3"
                  >
                    <div className="text-sm">
                      <p className="font-medium">
                        {save.name}
                        {save.id === career?.id ? (
                          <Badge variant="stadium" className="ml-2">
                            Active
                          </Badge>
                        ) : null}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {school?.name ?? save.schoolId} · Season {save.season} ·
                        Updated {new Date(save.updatedAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {confirming ? (
                        <>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(save.id)}
                          >
                            Confirm Delete
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setPendingDeleteId(null)}
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(save.id)}
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cloud Saves</CardTitle>
        </CardHeader>
        <CardContent>
          {cloudConfigured ? (
            <div className="space-y-3 text-sm">
              <p className="text-muted-foreground">
                You&apos;re signed in with cloud saves enabled. Signing out will
                return you to the home screen; your local browser saves stay
                put.
              </p>
              <Button
                variant="destructive"
                disabled={signingOut}
                onClick={handleSignOut}
              >
                {signingOut ? "Signing out…" : "Sign Out"}
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Cloud saves aren&apos;t configured for this deployment.
              You&apos;re playing as a guest — careers are saved locally in this
              browser only.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

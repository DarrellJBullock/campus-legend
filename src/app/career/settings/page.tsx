"use client";

import { useEffect, useState } from "react";
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
import { listCloudCareers, deleteCloudCareer } from "@/lib/cloud-save";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const career = useCareerStore((s) => s.career);
  const clear = useCareerStore((s) => s.clear);
  const userId = useCareerStore((s) => s.userId);
  const loadCloudById = useCareerStore((s) => s.loadCloudById);
  const router = useRouter();

  const [saves, setSaves] = useState<SaveSummary[]>(() => listLocalCareers());
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const [cloudSaves, setCloudSaves] = useState<SaveSummary[] | null>(null);
  const [cloudPendingDeleteId, setCloudPendingDeleteId] = useState<
    string | null
  >(null);
  const [cloudBusyId, setCloudBusyId] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  const cloudConfigured = isSupabaseConfigured();

  useEffect(() => {
    if (!userId) {
      setCloudSaves(null);
      return;
    }
    let cancelled = false;
    listCloudCareers(createSupabaseBrowserClient(), userId).then((list) => {
      if (!cancelled) setCloudSaves(list);
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

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

  async function handleLoadCloud(slug: string) {
    setCloudBusyId(slug);
    try {
      await loadCloudById(slug);
      router.push("/career");
    } finally {
      setCloudBusyId(null);
    }
  }

  async function handleDeleteCloud(slug: string) {
    if (cloudPendingDeleteId !== slug) {
      setCloudPendingDeleteId(slug);
      return;
    }
    if (!userId) return;
    setCloudBusyId(slug);
    try {
      await deleteCloudCareer(createSupabaseBrowserClient(), userId, slug);
      setCloudSaves(
        await listCloudCareers(createSupabaseBrowserClient(), userId),
      );
    } finally {
      setCloudBusyId(null);
      setCloudPendingDeleteId(null);
    }
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
                      <div className="flex items-center font-medium">
                        {save.name}
                        {save.id === career?.id ? (
                          <Badge variant="stadium" className="ml-2">
                            Active
                          </Badge>
                        ) : null}
                      </div>
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
          {!cloudConfigured ? (
            <p className="text-sm text-muted-foreground">
              Cloud saves aren&apos;t configured for this deployment.
              You&apos;re playing as a guest — careers are saved locally in this
              browser only.
            </p>
          ) : !userId ? (
            <p className="text-sm text-muted-foreground">
              Sign in to sync your career to the cloud and continue it on any
              device.
            </p>
          ) : (
            <div className="space-y-4">
              {cloudSaves === null ? (
                <p className="text-sm text-muted-foreground">
                  Loading cloud saves…
                </p>
              ) : cloudSaves.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No cloud saves yet — playing a career while signed in saves it
                  here automatically.
                </p>
              ) : (
                <div className="space-y-3">
                  {cloudSaves.map((save) => {
                    const school = getSchool(save.schoolId);
                    const confirming = cloudPendingDeleteId === save.id;
                    const busy = cloudBusyId === save.id;
                    return (
                      <div
                        key={save.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border p-3"
                      >
                        <div className="text-sm">
                          <div className="flex items-center font-medium">
                            {save.name}
                            {save.id === career?.id ? (
                              <Badge variant="stadium" className="ml-2">
                                Active
                              </Badge>
                            ) : null}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {school?.name ?? save.schoolId} · Season{" "}
                            {save.season} · Updated{" "}
                            {new Date(save.updatedAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {confirming ? (
                            <>
                              <Button
                                size="sm"
                                variant="destructive"
                                disabled={busy}
                                onClick={() => handleDeleteCloud(save.id)}
                              >
                                Confirm Delete
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={busy}
                                onClick={() => setCloudPendingDeleteId(null)}
                              >
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="stadium"
                                disabled={busy}
                                onClick={() => handleLoadCloud(save.id)}
                              >
                                {busy ? "Loading…" : "Load"}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={busy}
                                onClick={() => handleDeleteCloud(save.id)}
                              >
                                Delete
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex items-center justify-between border-t border-border pt-4">
                <p className="text-xs text-muted-foreground">
                  Signing out returns you to the home screen; your local browser
                  saves stay put.
                </p>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={signingOut}
                  onClick={handleSignOut}
                >
                  {signingOut ? "Signing out…" : "Sign Out"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

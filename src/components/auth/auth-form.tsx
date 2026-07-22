"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  createSupabaseBrowserClient,
  isSupabaseConfigured,
} from "@/lib/supabase/client";

/** Shared email/password form for sign-in and sign-up. Guest mode needs no account. */
export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const configured = isSupabaseConfigured();

  const heading = mode === "sign-in" ? "Welcome back" : "Create your account";
  const cta = mode === "sign-in" ? "Sign in" : "Sign up";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: authError } =
        mode === "sign-in"
          ? await supabase.auth.signInWithPassword({ email, password })
          : await supabase.auth.signUp({ email, password });
      if (authError) {
        setError(authError.message);
        return;
      }
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-6 p-4">
      <Card className="surface-paper">
        <CardHeader>
          <CardTitle className="font-display text-2xl text-charcoal">
            {heading}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!configured ? (
            <div className="space-y-4 text-sm text-charcoal/80">
              <p>
                Cloud accounts aren&apos;t configured for this deployment yet.
                You can still play the full game — guest careers save
                automatically to this browser.
              </p>
              <Button asChild variant="stadium" className="w-full">
                <Link href="/new-career">Start a guest career</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4" noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete={
                    mode === "sign-in" ? "current-password" : "new-password"
                  }
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error ? (
                <p
                  role="alert"
                  className="text-sm font-medium text-destructive"
                >
                  {error}
                </p>
              ) : null}
              <Button
                type="submit"
                variant="stadium"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Please wait…" : cta}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
      <p className="text-center text-sm text-muted-foreground">
        {mode === "sign-in" ? (
          <>
            New here?{" "}
            <Link
              href="/sign-up"
              className="font-medium text-foreground underline underline-offset-4"
            >
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="font-medium text-foreground underline underline-offset-4"
            >
              Sign in
            </Link>
          </>
        )}
      </p>
      <p className="text-center text-xs text-muted-foreground">
        <Link href="/" className="underline underline-offset-4">
          ← Back to landing
        </Link>
      </p>
    </div>
  );
}

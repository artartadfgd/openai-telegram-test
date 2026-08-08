"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brandmark } from "@/components/brandmark";
import { LanguageGate } from "@/components/language-gate";
import { useTranslation } from "@/lib/i18n/context";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? t.auth.loginError);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <LanguageGate>
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm">
          <div className="mb-6 flex justify-center">
            <Brandmark />
          </div>
          <form onSubmit={onSubmit} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h1 className="text-lg font-semibold">{t.auth.loginTitle}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t.auth.loginSubtitle}</p>

            <div className="mt-5 space-y-4">
              <div>
                <Label htmlFor="email">{t.auth.email}</Label>
                <Input id="email" type="email" required autoFocus className="mt-1.5" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="password">{t.auth.password}</Label>
                <Input id="password" type="password" required className="mt-1.5" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            </div>

            {error && <div className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}

            <Button type="submit" className="mt-6 w-full gap-2" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {t.auth.loginButton}
            </Button>

            <p className="mt-4 text-center text-sm text-muted-foreground">
              {t.auth.noAccount}{" "}
              <Link href="/signup" className="font-medium text-primary hover:underline">
                {t.auth.signupLink}
              </Link>
            </p>
          </form>
        </div>
      </div>
    </LanguageGate>
  );
}

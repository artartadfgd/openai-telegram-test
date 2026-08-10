"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { Brandmark } from "@/components/brandmark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/lib/i18n/context";

const SESSION_KEY = "coachai-purchase-verified-email";

export function PurchaseGate({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const [ready, setReady] = useState(false);
  const [verified, setVerified] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let hasVerified = false;
    try {
      hasVerified = Boolean(sessionStorage.getItem(SESSION_KEY));
    } catch {}
    setVerified(hasVerified);
    setReady(true);
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/hotmart/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok || !data.verified) {
      setError(res.ok ? t.purchase.notFound : t.purchase.error);
      return;
    }
    try {
      sessionStorage.setItem(SESSION_KEY, email);
    } catch {}
    setVerified(true);
  }

  if (!ready) return null;

  if (!verified) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm">
          <div className="mb-6 flex justify-center">
            <Brandmark />
          </div>
          <form onSubmit={onSubmit} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2 text-primary">
              <ShieldCheck className="h-5 w-5" />
              <h1 className="text-lg font-semibold text-foreground">{t.purchase.title}</h1>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{t.purchase.subtitle}</p>

            <div className="mt-5">
              <Label htmlFor="purchaseEmail">{t.purchase.emailLabel}</Label>
              <Input
                id="purchaseEmail"
                type="email"
                required
                autoFocus
                placeholder={t.purchase.emailPlaceholder}
                className="mt-1.5"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {error && <div className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}

            <Button type="submit" className="mt-6 w-full gap-2" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              {loading ? t.purchase.verifying : t.purchase.verifyButton}
            </Button>

            <p className="mt-4 text-center text-xs text-muted-foreground">
              {t.purchase.supportHint}{" "}
              <a href="mailto:suportesafeoffer@gmail.com" className="font-medium text-primary hover:underline">
                suportesafeoffer@gmail.com
              </a>
            </p>
          </form>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

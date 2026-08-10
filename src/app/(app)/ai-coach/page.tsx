"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, MessageSquarePlus, Send, Sparkles, Trash2, User, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrainingDocView } from "@/components/training-doc";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/context";
import type { TrainingDoc } from "@/lib/ai";

type ConversationSummary = { id: string; title: string | null; teamId: string | null; updatedAt: string };
type ChatMessage = { id: string; role: "user" | "assistant"; content: string };
type Team = { id: string; name: string };

function Message({ role, text }: { role: "user" | "assistant"; text: string }) {
  const isUser = role === "user";
  return (
    <div className={cn("flex gap-3 animate-fade-in", isUser && "flex-row-reverse")}>
      <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", isUser ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground")}>
        {isUser ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
      </div>
      <div
        className={cn(
          "max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isUser ? "bg-primary text-primary-foreground" : "bg-card text-card-foreground border border-border"
        )}
      >
        {text}
      </div>
    </div>
  );
}

function AiCoachInner() {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const SUGGESTIONS = [t.aiCoach.suggestion1, t.aiCoach.suggestion2, t.aiCoach.suggestion3];
  const searchParams = useSearchParams();
  const conversationId = searchParams.get("c");

  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [training, setTraining] = useState<(TrainingDoc & { _sessionId?: string; _favorited?: boolean }) | null>(null);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingConversation, setLoadingConversation] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  async function loadConversations() {
    const res = await fetch("/api/ai-coach/conversations");
    setConversations(await res.json());
  }

  useEffect(() => {
    loadConversations();
    fetch("/api/teams")
      .then((r) => r.json())
      .then((data) => setTeams(data.map((team: { id: string; name: string }) => ({ id: team.id, name: team.name }))));
  }, []);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      setTraining(null);
      setTeamId(null);
      return;
    }
    setLoadingConversation(true);
    fetch(`/api/ai-coach/conversations/${conversationId}`)
      .then((r) => r.json())
      .then((data) => {
        setMessages(data.messages ?? []);
        setTraining(data.training ?? null);
        setTeamId(data.conversation?.teamId ?? null);
      })
      .finally(() => setLoadingConversation(false));
  }, [conversationId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages.length, sending, training]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setError(null);
    setMessages((prev) => [...prev, { id: `tmp-${Date.now()}`, role: "user", content: trimmed }]);
    setInput("");

    const res = await fetch("/api/ai-coach/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId, teamId, text: trimmed, locale }),
    });
    const data = await res.json();
    setSending(false);

    if (!res.ok) {
      const messagesMap: Record<string, string> = {
        rate_limited: t.errors.rateLimited,
        no_credits: t.errors.noCredits,
        ai_error: t.errors.aiError,
      };
      setError(messagesMap[data.error] ?? messagesMap.ai_error);
      return;
    }

    await loadConversations();
    if (!conversationId) {
      router.push(`/ai-coach?c=${data.conversationId}`);
      return;
    }
    const refreshed = await fetch(`/api/ai-coach/conversations/${data.conversationId}`).then((r) => r.json());
    setMessages(refreshed.messages ?? []);
    setTraining(refreshed.training ?? null);
  }

  async function deleteConversation(id: string) {
    if (!confirm(t.aiCoach.deleteConfirm)) return;
    await fetch(`/api/ai-coach/conversations/${id}`, { method: "DELETE" });
    if (id === conversationId) router.push("/ai-coach");
    await loadConversations();
  }

  const activeTeam = teams.find((team) => team.id === teamId);

  return (
    <div className="flex h-[calc(100dvh-8.5rem)] flex-col md:h-[calc(100dvh-3.5rem)] md:flex-row print:h-auto">
      <aside className="hidden w-72 shrink-0 flex-col border-r border-border bg-card/50 md:flex print:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="text-sm font-medium">{t.aiCoach.conversations}</div>
          <Button size="sm" variant="ghost" className="gap-1.5" onClick={() => router.push("/ai-coach")}>
            <MessageSquarePlus className="h-4 w-4" />
            {t.aiCoach.newConversation}
          </Button>
        </div>
        <div className="h-px bg-border" />
        <div className="flex-1 overflow-y-auto p-2">
          {conversations.length === 0 ? (
            <p className="px-3 py-6 text-xs text-muted-foreground">{t.aiCoach.empty}</p>
          ) : (
            <ul className="space-y-1">
              {conversations.map((c) => (
                <li key={c.id} className="group relative">
                  <button
                    onClick={() => router.push(`/ai-coach?c=${c.id}`)}
                    className={cn(
                      "w-full truncate rounded-md px-3 py-2 text-left text-sm transition-colors",
                      conversationId === c.id ? "bg-accent text-accent-foreground" : "hover:bg-accent/60"
                    )}
                  >
                    {c.title || t.aiCoach.newConversation}
                  </button>
                  <button
                    aria-label={t.common.delete}
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(c.id);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-background hover:text-destructive group-hover:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-border px-4 py-3 print:hidden md:px-6">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium">
              <Sparkles className="h-4 w-4 text-primary" />
              {t.aiCoach.title}
            </div>
            <p className="text-xs text-muted-foreground">{t.aiCoach.subtitle}</p>
          </div>
          {teams.length > 0 && (
            <label className="flex items-center gap-2 rounded-md border border-border bg-card px-2 py-1 text-xs">
              {activeTeam ? <Users className="h-3.5 w-3.5 text-primary" /> : <Users className="h-3.5 w-3.5 text-muted-foreground" />}
              <select value={teamId ?? ""} onChange={(e) => setTeamId(e.target.value || null)} className="bg-transparent outline-none">
                <option value="">{t.aiCoach.noTeam}</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 md:px-6">
          <div className="mx-auto flex max-w-3xl flex-col gap-6">
            {loadingConversation ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                {messages.length === 0 && !sending && (
                  <div className="animate-fade-in rounded-2xl border border-dashed border-border bg-card/50 p-6 text-center">
                    <Sparkles className="mx-auto mb-3 h-6 w-6 text-primary" />
                    <p className="text-sm text-muted-foreground">{t.aiCoach.placeholder}</p>
                    <p className="mt-6 text-xs font-medium uppercase tracking-wide text-muted-foreground">{t.aiCoach.suggestionsLabel}</p>
                    <div className="mt-3 grid gap-2 md:grid-cols-3">
                      {SUGGESTIONS.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => send(s)}
                          className="rounded-lg border border-border bg-background p-3 text-left text-xs text-foreground/80 transition-colors hover:border-primary/40 hover:bg-accent"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {messages.map((m) => (
                  <Message key={m.id} role={m.role} text={m.content} />
                ))}
                {training && <TrainingDocView doc={training} />}
                {sending && (
                  <div className="flex gap-3 animate-fade-in">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                      <Sparkles className="h-4 w-4 animate-pulse" />
                    </div>
                    <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-2.5 text-sm text-muted-foreground">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                      <span className="animate-pulse">{t.common.loading}</span>
                    </div>
                  </div>
                )}
                {error && <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}
              </>
            )}
          </div>
        </div>

        <div className="border-t border-border bg-background/80 px-4 py-3 backdrop-blur print:hidden md:px-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="mx-auto flex max-w-3xl items-end gap-2"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              rows={1}
              placeholder={t.aiCoach.placeholder}
              className="min-h-[48px] max-h-40 flex-1 resize-none rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none transition-colors focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
              disabled={sending}
            />
            <Button type="submit" size="icon" className="h-12 w-12 shrink-0" disabled={sending || !input.trim()}>
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}

export default function AiCoachPage() {
  return (
    <Suspense>
      <AiCoachInner />
    </Suspense>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";

/* ─── Types ────────────────────────────────────────────────────────── */
type Phase = "welcome" | "interview" | "analyzing" | "results";
type Msg = { role: "user" | "assistant"; content: string };

interface Plan {
  profile: { summary: string; recommendedField: string; reasoning: string };
  todaysFocus: {
    title: string; description: string;
    duration: string; difficulty: string; resources: string[];
  };
  priorities: Array<{ topic: string; score: number; reason: string }>;
  timeAllocation: Array<{ subject: string; percentage: number }>;
  connections: Array<{ from: string; to: string; bridge: string }>;
}

/* ─── Color palette ────────────────────────────────────────────────── */
const CHART_COLORS = ["#00c9a7", "#2563ff", "#8b5cf6", "#f59e0b", "#ef4444"];

/* ─── Utility sub-components ────────────────────────────────────────── */

function ThemeToggle({ dark, onToggle }: { dark: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all hover:scale-105"
      style={{
        borderColor: "var(--border-strong)",
        background: "var(--bg-card)",
        color: "var(--text-secondary)",
      }}
    >
      <span style={{ fontSize: 14 }}>{dark ? "☀️" : "🌙"}</span>
      {dark ? "Light mode" : "Dark mode"}
    </button>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3 rounded-2xl rounded-bl-sm w-fit"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
      {[0, 0.2, 0.4].map((delay, i) => (
        <div
          key={i}
          className="w-2 h-2 rounded-full"
          style={{
            background: "var(--accent-teal)",
            animation: `typing 1.2s ease-in-out infinite`,
            animationDelay: `${delay}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Priority Bar Chart ───────────────────────────────────────────── */
function PriorityChart({ data }: { data: Plan["priorities"] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 100); }, []);

  return (
    <div className="space-y-3">
      {data.map((item, i) => (
        <div key={i}>
          <div className="flex justify-between items-baseline mb-1">
            <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              {item.topic}
            </span>
            <span className="text-xs font-bold" style={{ color: CHART_COLORS[i % CHART_COLORS.length] }}>
              {item.score}%
            </span>
          </div>
          <div className="relative h-2 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
            <div
              className="absolute left-0 top-0 h-full rounded-full transition-all duration-1000"
              style={{
                width: mounted ? `${item.score}%` : "0%",
                background: `linear-gradient(90deg, ${CHART_COLORS[i % CHART_COLORS.length]}, ${CHART_COLORS[(i + 1) % CHART_COLORS.length]})`,
                boxShadow: `0 0 8px ${CHART_COLORS[i % CHART_COLORS.length]}55`,
              }}
            />
          </div>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{item.reason}</p>
        </div>
      ))}
    </div>
  );
}

/* ─── Donut Chart ──────────────────────────────────────────────────── */
function DonutChart({ data }: { data: Plan["timeAllocation"] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 200); }, []);

  const r = 60;
  const stroke = 18;
  const cx = 90; const cy = 90;
  const C = 2 * Math.PI * r; // ≈ 376.99

  let cumulative = 0;
  const segments = data.map((item, i) => {
    const dashLen = (item.percentage / 100) * C;
    const dashOffset = C * (1 - cumulative / 100);
    cumulative += item.percentage;
    return { ...item, dashLen, dashOffset, color: CHART_COLORS[i % CHART_COLORS.length] };
  });

  return (
    <div className="flex items-center gap-6 flex-wrap">
      <svg
        width={180} height={180}
        viewBox={`0 0 ${cx * 2} ${cy * 2}`}
        style={{ transform: "rotate(-90deg)", flexShrink: 0 }}
      >
        {/* Track */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke="var(--border)"
          strokeWidth={stroke}
        />
        {/* Segments */}
        {segments.map((seg, i) => (
          <circle
            key={i}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth={stroke}
            strokeDasharray={`${mounted ? seg.dashLen : 0} ${C - (mounted ? seg.dashLen : 0)}`}
            strokeDashoffset={mounted ? seg.dashOffset : C}
            strokeLinecap="butt"
            style={{
              transition: `stroke-dasharray 1.2s cubic-bezier(0.4,0,0.2,1) ${i * 0.15}s,
                           stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1) ${i * 0.15}s`,
              filter: `drop-shadow(0 0 4px ${seg.color}88)`,
            }}
          />
        ))}
      </svg>

      {/* Legend */}
      <div className="space-y-2.5 flex-1 min-w-[120px]">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm shrink-0" style={{ background: seg.color }} />
            <div className="flex-1">
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>
                  {seg.subject}
                </span>
                <span className="text-xs font-bold ml-2" style={{ color: seg.color }}>
                  {seg.percentage}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Topic Connections ────────────────────────────────────────────── */
function ConnectionsList({ data }: { data: Plan["connections"] }) {
  return (
    <div className="space-y-3">
      {data.map((c, i) => (
        <div
          key={i}
          className="rounded-xl p-3 border"
          style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
        >
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="px-2.5 py-1 rounded-lg text-xs font-semibold"
              style={{ background: `${CHART_COLORS[i % CHART_COLORS.length]}22`, color: CHART_COLORS[i % CHART_COLORS.length] }}
            >
              {c.from}
            </span>
            <svg width="20" height="10" className="shrink-0" style={{ color: "var(--text-muted)" }}>
              <path d="M0 5 L14 5 M10 1 L14 5 L10 9" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
            </svg>
            <span
              className="px-2.5 py-1 rounded-lg text-xs font-semibold"
              style={{ background: `${CHART_COLORS[(i + 1) % CHART_COLORS.length]}22`, color: CHART_COLORS[(i + 1) % CHART_COLORS.length] }}
            >
              {c.to}
            </span>
          </div>
          <p className="mt-2 text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            {c.bridge}
          </p>
        </div>
      ))}
    </div>
  );
}

/* ─── Main Dashboard ───────────────────────────────────────────────── */
interface Props {
  userName: string;
  userImage?: string | null;
  signOutAction: () => Promise<void>;
}

export default function AIDashboard({ userName, userImage, signOutAction }: Props) {
  const [dark, setDark] = useState(true);
  const [phase, setPhase] = useState<Phase>("welcome");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [currentQ, setCurrentQ] = useState("");
  const [userInput, setUserInput] = useState("");
  const [questionCount, setQuestionCount] = useState(0);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  /* Sync dark/light to <html> data-theme */
  useEffect(() => {
    const saved = localStorage.getItem("espark-theme");
    if (saved === "light") setDark(false);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    localStorage.setItem("espark-theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentQ]);

  /* First question when interview starts */
  async function startInterview() {
    setPhase("interview");
    setIsLoading(true);
    const initMsg: Msg = {
      role: "user",
      content: `Hi! I'm ${userName} and I want to discover the right engineering field for me.`,
    };
    const msgs = [initMsg];
    setMessages(msgs);
    await fetchNextQuestion(msgs);
  }

  async function fetchNextQuestion(msgs: Msg[]) {
    setIsLoading(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: msgs, mode: "interview" }),
      });
      const data = await res.json();
      if (data.done) {
        // Trigger analysis
        setCurrentQ("");
        setPhase("analyzing");
        await generatePlan(msgs);
      } else {
        setCurrentQ(data.text ?? "");
        setQuestionCount((c) => c + 1);
      }
    } catch {
      setCurrentQ("Sorry, I ran into an issue. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSend() {
    if (!userInput.trim() || isLoading) return;
    const answer = userInput.trim();
    setUserInput("");

    // Add user answer + show Claude typing
    const updatedMsgs: Msg[] = [
      ...messages,
      { role: "assistant", content: currentQ },
      { role: "user", content: answer },
    ];
    setMessages(updatedMsgs);
    setCurrentQ("");

    await fetchNextQuestion(updatedMsgs);
  }

  async function generatePlan(msgs: Msg[]) {
    setIsLoading(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: msgs, mode: "analyze" }),
      });
      const data = await res.json();
      if (data.plan) {
        setPlan(data.plan);
        setPhase("results");
      } else {
        setCurrentQ("Analysis failed. Please try restarting.");
        setPhase("interview");
      }
    } catch {
      setCurrentQ("Analysis failed. Please try restarting.");
      setPhase("interview");
    } finally {
      setIsLoading(false);
    }
  }

  function restart() {
    setPhase("welcome");
    setMessages([]);
    setCurrentQ("");
    setUserInput("");
    setQuestionCount(0);
    setPlan(null);
  }

  const firstInitial = (userName || "U").charAt(0).toUpperCase();

  /* ── Shared top nav ─────────────────────────────────────────────── */
  function TopNav({ showRestart = false }: { showRestart?: boolean }) {
    return (
      <header
        className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b backdrop-blur-md"
        style={{
          background: dark ? "rgba(6,13,26,0.85)" : "rgba(240,253,251,0.85)",
          borderColor: "var(--border)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center w-9 h-9 rounded-xl text-white text-sm font-bold"
            style={{ background: "linear-gradient(135deg, #00c9a7, #2563ff)" }}
          >
            ⚡
          </div>
          <div>
            <p className="text-sm font-bold leading-none" style={{ color: "var(--text-primary)" }}>
              eSpark AI Guide
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--accent-teal)" }}>
              Powered by Claude Sonnet
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle dark={dark} onToggle={() => setDark(!dark)} />
          {showRestart && (
            <button
              onClick={restart}
              className="text-xs px-3 py-1.5 rounded-full border transition-all hover:opacity-80"
              style={{ borderColor: "var(--border-strong)", color: "var(--text-muted)" }}
            >
              ↺ Restart
            </button>
          )}
          {userImage ? (
            <img src={userImage} alt={userName} className="w-8 h-8 rounded-full border-2"
              style={{ borderColor: "var(--border-strong)" }} />
          ) : (
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
              style={{ background: "linear-gradient(135deg, #00c9a7, #2563ff)" }}
            >
              {firstInitial}
            </div>
          )}
          <form action={signOutAction}>
            <button type="submit" className="text-xs px-3 py-1.5 rounded-full border transition-all hover:opacity-80"
              style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
              Sign out
            </button>
          </form>
        </div>
      </header>
    );
  }

  /* ════════════════════════════════════════════════════════════════
     WELCOME PHASE
  ════════════════════════════════════════════════════════════════ */
  if (phase === "welcome") {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: "var(--bg-primary)" }}>
        <TopNav />
        <div className="flex-1 flex items-center justify-center px-6 py-16">
          <div className="max-w-lg w-full text-center animate-fade-in">
            {/* Avatar */}
            <div className="relative inline-block mb-6">
              {userImage ? (
                <img src={userImage} alt={userName}
                  className="w-20 h-20 rounded-full border-4 mx-auto"
                  style={{ borderColor: "var(--accent-teal)" }} />
              ) : (
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold text-white mx-auto"
                  style={{ background: "linear-gradient(135deg, #00c9a7, #2563ff)" }}
                >
                  {firstInitial}
                </div>
              )}
              <span className="absolute -bottom-1 -right-1 text-2xl">👋</span>
            </div>

            <h1 className="text-3xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>
              Hello, {userName.split(" ")[0]}!
            </h1>
            <p className="text-lg mb-8 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              I'm Claude, your personal engineering guide. I'll ask you{" "}
              <strong style={{ color: "var(--accent-teal)" }}>5 quick questions</strong> to
              discover the perfect engineering path for you — then build a personalized learning plan.
            </p>

            {/* Feature cards */}
            <div className="grid grid-cols-2 gap-3 mb-8 text-left">
              {[
                { icon: "💬", title: "Smart Interview",    desc: "5 conversational questions" },
                { icon: "🗺️", title: "Custom Roadmap",    desc: "Built just for your profile" },
                { icon: "📊", title: "Priority Chart",    desc: "Know what to tackle first" },
                { icon: "🔗", title: "Topic Bridges",     desc: "See how subjects connect" },
              ].map(({ icon, title, desc }) => (
                <div
                  key={title}
                  className="rounded-xl p-4 border"
                  style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
                >
                  <div className="text-2xl mb-2">{icon}</div>
                  <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{title}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{desc}</p>
                </div>
              ))}
            </div>

            <button
              onClick={startInterview}
              className="w-full py-4 rounded-2xl font-bold text-white text-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #00c9a7, #2563ff)",
                boxShadow: "0 4px 24px rgba(0,201,167,0.35)",
              }}
            >
              Start my journey →
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ════════════════════════════════════════════════════════════════
     INTERVIEW PHASE
  ════════════════════════════════════════════════════════════════ */
  if (phase === "interview") {
    const displayedMsgs: Msg[] = [...messages];
    if (currentQ) displayedMsgs.push({ role: "assistant", content: currentQ });

    return (
      <div className="min-h-screen flex flex-col" style={{ background: "var(--bg-primary)" }}>
        <TopNav showRestart />
        {/* Progress */}
        <div className="px-6 pt-4 pb-2">
          <div className="max-w-2xl mx-auto">
            <div className="flex justify-between text-xs mb-1.5" style={{ color: "var(--text-muted)" }}>
              <span>Interview progress</span>
              <span>Question {Math.min(questionCount, 5)} of 5</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min((questionCount / 5) * 100, 100)}%`,
                  background: "linear-gradient(90deg, #00c9a7, #2563ff)",
                }}
              />
            </div>
          </div>
        </div>

        {/* Chat */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="max-w-2xl mx-auto space-y-4">
            {/* Opening message */}
            <div
              className="flex gap-3"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 mt-1"
                style={{ background: "linear-gradient(135deg, #00c9a7, #2563ff)" }}
              >
                AI
              </div>
              <div
                className="px-4 py-3 rounded-2xl rounded-tl-sm text-sm leading-relaxed max-w-sm"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                }}
              >
                Hi {userName.split(" ")[0]}! I'm excited to help you find your engineering path. Let me ask you a few questions to understand you better.
              </div>
            </div>

            {/* Conversation */}
            {displayedMsgs.map((msg, i) => {
              const isAI = msg.role === "assistant";
              return (
                <div
                  key={i}
                  className={`flex gap-3 ${isAI ? "" : "flex-row-reverse"}`}
                  style={{ animation: "fade-in 0.35s ease-out" }}
                >
                  {isAI ? (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 mt-1"
                      style={{ background: "linear-gradient(135deg, #00c9a7, #2563ff)" }}>
                      AI
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 mt-1"
                      style={{ background: "linear-gradient(135deg, #8b5cf6, #2563ff)" }}>
                      {firstInitial}
                    </div>
                  )}
                  <div
                    className="px-4 py-3 rounded-2xl text-sm leading-relaxed max-w-sm"
                    style={isAI ? {
                      background: "var(--bg-card)",
                      border: "1px solid var(--border)",
                      color: "var(--text-primary)",
                      borderRadius: "1rem 1rem 1rem 0.25rem",
                    } : {
                      background: "linear-gradient(135deg, #00c9a7, #2563ff)",
                      color: "#fff",
                      borderRadius: "1rem 1rem 0.25rem 1rem",
                    }}
                  >
                    {msg.content}
                  </div>
                </div>
              );
            })}

            {/* Typing indicator */}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 mt-1"
                  style={{ background: "linear-gradient(135deg, #00c9a7, #2563ff)" }}>
                  AI
                </div>
                <TypingIndicator />
              </div>
            )}

            <div ref={chatEndRef} />
          </div>
        </div>

        {/* Input bar */}
        <div
          className="border-t px-6 py-4"
          style={{ background: dark ? "rgba(6,13,26,0.95)" : "rgba(240,253,251,0.95)", borderColor: "var(--border)" }}
        >
          <div className="max-w-2xl mx-auto flex gap-3">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Type your answer…"
              disabled={isLoading || !currentQ}
              className="flex-1 rounded-xl px-4 py-3 text-sm outline-none"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-strong)",
                color: "var(--text-primary)",
              }}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !userInput.trim() || !currentQ}
              className="px-5 py-3 rounded-xl font-semibold text-white text-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg, #00c9a7, #2563ff)" }}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ════════════════════════════════════════════════════════════════
     ANALYZING PHASE
  ════════════════════════════════════════════════════════════════ */
  if (phase === "analyzing") {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: "var(--bg-primary)" }}>
        <TopNav />
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center max-w-sm animate-fade-in">
            {/* Spinning loader */}
            <div className="relative inline-block mb-8">
              <div
                className="w-24 h-24 rounded-full"
                style={{
                  border: "3px solid var(--border)",
                  borderTopColor: "#00c9a7",
                  borderRightColor: "#2563ff",
                  animation: "spin 1.2s linear infinite",
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center text-3xl">🧠</div>
            </div>
            <h2 className="text-2xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>
              Building your profile…
            </h2>
            <p className="leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              Claude is analyzing your answers and crafting a personalized engineering roadmap just for you.
            </p>
            <div className="mt-8 flex justify-center gap-2">
              {["Analyzing profile", "Mapping priorities", "Building roadmap"].map((step, i) => (
                <div
                  key={step}
                  className="text-xs px-3 py-1.5 rounded-full border"
                  style={{
                    borderColor: "var(--border-strong)",
                    color: "var(--accent-teal)",
                    background: "var(--bg-card)",
                    animation: `star-twinkle 1.5s ease-in-out infinite`,
                    animationDelay: `${i * 0.5}s`,
                  }}
                >
                  {step}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ════════════════════════════════════════════════════════════════
     RESULTS PHASE
  ════════════════════════════════════════════════════════════════ */
  if (!plan) return null;

  const difficultyColor: Record<string, string> = {
    beginner: "#00c9a7",
    intermediate: "#f59e0b",
    advanced: "#ef4444",
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg-primary)" }}>
      <TopNav showRestart />

      <div className="flex-1 px-6 py-8 max-w-7xl mx-auto w-full">
        {/* Profile banner */}
        <div
          className="rounded-2xl p-6 mb-8 border animate-fade-in"
          style={{
            background: "linear-gradient(135deg, rgba(0,201,167,0.1), rgba(37,99,255,0.1))",
            borderColor: "var(--border-strong)",
          }}
        >
          <div className="flex items-start gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">🎯</span>
                <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                  Your Personalized Learning Path
                </h2>
              </div>
              <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--text-secondary)" }}>
                {plan.profile.summary}
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="px-3 py-1 rounded-full text-sm font-bold text-white"
                  style={{ background: "linear-gradient(90deg, #00c9a7, #2563ff)" }}
                >
                  {plan.profile.recommendedField}
                </span>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {plan.profile.reasoning}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2×2 Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── Today's Focus ── */}
          <div
            className="rounded-2xl p-6 border col-span-1"
            style={{
              background: "var(--bg-card)",
              borderColor: "var(--border)",
              boxShadow: "var(--shadow-card)",
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">⚡</span>
              <h3 className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>
                Today&apos;s Focus
              </h3>
            </div>

            {/* Gradient card */}
            <div
              className="rounded-xl p-5 mb-4 relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, rgba(0,201,167,0.15), rgba(37,99,255,0.15))", border: "1px solid var(--border-strong)" }}
            >
              {/* Shimmer */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)",
                  animation: "shimmer-slide 3s ease-in-out infinite",
                }}
              />
              <div className="flex items-start justify-between gap-3 mb-3">
                <h4 className="text-base font-bold leading-tight" style={{ color: "var(--text-primary)" }}>
                  {plan.todaysFocus.title}
                </h4>
                <span
                  className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full capitalize"
                  style={{
                    background: `${difficultyColor[plan.todaysFocus.difficulty] ?? "#00c9a7"}22`,
                    color: difficultyColor[plan.todaysFocus.difficulty] ?? "#00c9a7",
                  }}
                >
                  {plan.todaysFocus.difficulty}
                </span>
              </div>
              <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--text-secondary)" }}>
                {plan.todaysFocus.description}
              </p>
              <div className="flex items-center gap-1 text-xs" style={{ color: "var(--accent-teal)" }}>
                <span>⏱</span>
                <span className="font-medium">{plan.todaysFocus.duration}</span>
              </div>
            </div>

            {/* Resources */}
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>
                Start with
              </p>
              {plan.todaysFocus.resources.map((r, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm"
                  style={{ background: "var(--bg-secondary)", borderColor: "var(--border)", color: "var(--text-secondary)" }}
                >
                  <span style={{ color: "var(--accent-teal)", fontWeight: 700 }}>{i + 1}.</span>
                  {r}
                </div>
              ))}
            </div>
          </div>

          {/* ── Priority Chart ── */}
          <div
            className="rounded-2xl p-6 border col-span-1"
            style={{ background: "var(--bg-card)", borderColor: "var(--border)", boxShadow: "var(--shadow-card)" }}
          >
            <div className="flex items-center gap-2 mb-5">
              <span className="text-xl">📊</span>
              <h3 className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>
                Learning Priorities
              </h3>
            </div>
            <PriorityChart data={plan.priorities} />
          </div>

          {/* ── Time Allocation ── */}
          <div
            className="rounded-2xl p-6 border col-span-1"
            style={{ background: "var(--bg-card)", borderColor: "var(--border)", boxShadow: "var(--shadow-card)" }}
          >
            <div className="flex items-center gap-2 mb-5">
              <span className="text-xl">🍩</span>
              <h3 className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>
                Time Allocation
              </h3>
            </div>
            <DonutChart data={plan.timeAllocation} />
          </div>

          {/* ── Topic Connections ── */}
          <div
            className="rounded-2xl p-6 border col-span-1"
            style={{ background: "var(--bg-card)", borderColor: "var(--border)", boxShadow: "var(--shadow-card)" }}
          >
            <div className="flex items-center gap-2 mb-5">
              <span className="text-xl">🔗</span>
              <h3 className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>
                Topic Connections
              </h3>
            </div>
            <ConnectionsList data={plan.connections} />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            This plan was built by Claude Sonnet 4.6 based on your interview answers. ·{" "}
            <button onClick={restart} className="underline hover:opacity-80" style={{ color: "var(--accent-teal)" }}>
              Retake interview
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

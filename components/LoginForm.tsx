"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

/* ── Animated sphere (CSS + inline SVG) ─────────────────────────────── */
function AnimatedSphere() {
  return (
    <div className="relative flex items-center justify-center" style={{ width: 300, height: 300 }}>
      {/* Outer glow rings */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(0,201,167,0.06) 0%, transparent 70%)",
          animation: "glow-ring 4s ease-in-out infinite",
          transform: "scale(1.35)",
        }}
      />
      <div
        className="absolute inset-0 rounded-full border"
        style={{
          borderColor: "rgba(0,201,167,0.12)",
          transform: "scale(1.28)",
          animation: "glow-ring 4s ease-in-out infinite 0.5s",
        }}
      />
      <div
        className="absolute inset-0 rounded-full border"
        style={{
          borderColor: "rgba(37,99,255,0.10)",
          transform: "scale(1.15)",
          animation: "glow-ring 4s ease-in-out infinite 1s",
        }}
      />

      {/* Orbiting dots */}
      {[0, 72, 144, 216, 288].map((deg, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            top: "50%",
            left: "50%",
            width: 6,
            height: 6,
            marginTop: -3,
            marginLeft: -3,
            animation: `orbit-dot ${6 + i * 0.6}s linear infinite`,
            animationDelay: `${i * -1.2}s`,
          }}
        >
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: i % 2 === 0 ? "#00c9a7" : "#2563ff", boxShadow: "0 0 6px currentColor" }}
          />
        </div>
      ))}

      {/* Main sphere */}
      <div
        className="relative rounded-full overflow-hidden"
        style={{
          width: 240,
          height: 240,
          background: "radial-gradient(circle at 38% 35%, rgba(0,201,167,0.55) 0%, rgba(37,99,255,0.45) 35%, rgba(6,13,26,0.92) 70%)",
          boxShadow: "0 0 40px rgba(0,201,167,0.3), 0 0 80px rgba(37,99,255,0.2), inset 0 0 40px rgba(0,0,0,0.5)",
          animation: "sphere-float 5s ease-in-out infinite",
        }}
      >
        {/* SVG grid overlay */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 240 240"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ opacity: 0.35 }}
        >
          {/* Latitude lines */}
          {[40, 60, 80, 100, 120, 140, 160, 180, 200].map((y, i) => (
            <ellipse
              key={`lat-${i}`}
              cx="120" cy={y}
              rx={Math.sin(((y - 40) / 160) * Math.PI) * 115}
              ry="6"
              stroke="#00c9a7"
              strokeWidth="0.6"
            />
          ))}
          {/* Longitude lines */}
          {[0, 30, 60, 90, 120, 150].map((angle, i) => (
            <ellipse
              key={`lon-${i}`}
              cx="120" cy="120"
              rx={Math.cos((angle * Math.PI) / 180) * 115}
              ry="110"
              stroke="#2563ff"
              strokeWidth="0.6"
              transform={`rotate(${angle} 120 120)`}
            />
          ))}
          {/* Glow dots at intersections */}
          {[[120, 40], [80, 75], [160, 75], [55, 120], [185, 120], [80, 165], [160, 165], [120, 200]].map(([cx, cy], i) => (
            <circle key={`dot-${i}`} cx={cx} cy={cy} r="2.5" fill="#00c9a7" opacity="0.9" />
          ))}
        </svg>

        {/* Shimmer highlight */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 50%)",
            borderRadius: "50%",
          }}
        />
      </div>
    </div>
  );
}

/* ── Star particles ──────────────────────────────────────────────────── */
function Stars() {
  const stars = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 0.5,
    delay: Math.random() * 4,
    duration: Math.random() * 3 + 2,
  }));
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map((s) => (
        <div
          key={s.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            animation: `star-twinkle ${s.duration}s ease-in-out infinite`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────────────── */
export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showEmail, setShowEmail] = useState(false);

  async function handleCredentialsSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (result?.error) setError("Invalid email or password");
    else { router.push("/dashboard"); router.refresh(); }
  }

  async function handleGoogleSignIn() {
    await signIn("google", { callbackUrl: "/dashboard" });
  }

  return (
    <div className="flex min-h-screen" style={{ background: "var(--bg-primary)" }}>

      {/* ── LEFT HERO PANEL ───────────────────────────────────────────── */}
      <div
        className="relative hidden lg:flex flex-col justify-center overflow-hidden"
        style={{
          flex: "0 0 58%",
          background: "linear-gradient(135deg, #060d1a 0%, #0d1b2e 60%, #060d1a 100%)",
        }}
      >
        <Stars />

        {/* Gradient blobs */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: "15%", left: "20%",
            width: 400, height: 400,
            background: "radial-gradient(circle, rgba(0,201,167,0.07) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: "10%", right: "10%",
            width: 350, height: 350,
            background: "radial-gradient(circle, rgba(37,99,255,0.07) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />

        <div className="relative z-10 flex flex-col items-center px-12 xl:px-20">
          {/* Live badge */}
          <div
            className="mb-10 self-start flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-medium"
            style={{
              borderColor: "rgba(0,201,167,0.3)",
              background: "rgba(0,201,167,0.08)",
              color: "var(--accent-teal)",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            Live platform · 4,300+ learners
          </div>

          {/* Sphere */}
          <AnimatedSphere />

          {/* Heading */}
          <div className="mt-10 text-left self-start">
            <h1
              className="text-5xl xl:text-6xl font-bold leading-tight tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              Engineer your{" "}
              <span
                style={{
                  background: "linear-gradient(90deg, #00c9a7, #2563ff)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                future
              </span>
            </h1>
            <p
              className="mt-4 text-lg leading-relaxed max-w-md"
              style={{ color: "var(--text-secondary)" }}
            >
              Master Power Engineering, Networking, and Software Development
              through structured, industry-aligned learning paths.
            </p>
          </div>

          {/* Stats */}
          <div className="mt-10 self-start flex items-center gap-10">
            {[
              { value: "10+",  label: "Courses"     },
              { value: "3",    label: "Disciplines"  },
              { value: "∞",    label: "Growth"       },
            ].map(({ value, label }) => (
              <div key={label}>
                <p
                  className="text-3xl font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {value}
                </p>
                <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT LOGIN PANEL ─────────────────────────────────────────── */}
      <div
        className="flex flex-1 items-center justify-center px-6 py-12"
        style={{ background: "#060e1c" }}
      >
        <div className="w-full max-w-sm animate-fade-in">

          {/* Brand */}
          <div className="flex items-center gap-3 mb-8">
            <div
              className="flex items-center justify-center w-11 h-11 rounded-xl"
              style={{ background: "linear-gradient(135deg, #00c9a7, #2563ff)" }}
            >
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-sm leading-none" style={{ color: "var(--text-primary)" }}>
                eSpark-Learning KIT
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--accent-teal)" }}>
                Engineering Education Platform
              </p>
            </div>
          </div>

          {/* Welcome */}
          <h2 className="text-3xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
            Welcome back 👋
          </h2>
          <p className="text-sm mb-8 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            Sign in to continue your learning journey and track your engineering progress.
          </p>

          {/* Google button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 rounded-xl py-3.5 font-semibold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: "#ffffff",
              color: "#1a1a1a",
              boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
            }}
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          {/* Security divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
            <span className="text-xs font-medium tracking-widest" style={{ color: "var(--text-muted)" }}>
              SECURE SIGN-IN
            </span>
            <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
          </div>

          {/* Security badges */}
          <div className="space-y-2.5">
            {[
              { icon: "🔒", text: "Your data is encrypted and secure" },
              { icon: "✓",  text: "Progress synced across all devices",   green: true },
              { icon: "🎓", text: "Access all enrolled courses instantly" },
            ].map(({ icon, text, green }) => (
              <div
                key={text}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border text-sm"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  borderColor: "var(--border)",
                  color: "var(--text-secondary)",
                }}
              >
                <span style={{ color: green ? "var(--accent-teal)" : undefined }}>{icon}</span>
                {text}
              </div>
            ))}
          </div>

          {/* Team sign-in toggle */}
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setShowEmail(!showEmail)}
              className="w-full text-xs text-center py-2 transition-opacity hover:opacity-80"
              style={{ color: "var(--text-muted)" }}
            >
              {showEmail ? "▲ Hide" : "▼ Team member? Sign in with email"}
            </button>

            {showEmail && (
              <form onSubmit={handleCredentialsSubmit} className="mt-4 space-y-3">
                {error && (
                  <div className="rounded-lg px-3 py-2.5 text-xs"
                    style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.25)" }}>
                    {error}
                  </div>
                )}
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@esparktools.com" required
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid var(--border)",
                    color: "var(--text-primary)",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent-teal)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                />
                <input
                  type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password" required
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid var(--border)",
                    color: "var(--text-primary)",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent-teal)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                />
                <button
                  type="submit" disabled={loading}
                  className="w-full rounded-xl py-3 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60"
                  style={{ background: "linear-gradient(90deg, #00c9a7, #2563ff)" }}
                >
                  {loading ? "Signing in…" : "Sign In"}
                </button>
              </form>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 text-center space-y-2">
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              By signing in, you agree to the{" "}
              <span className="underline cursor-pointer hover:opacity-80" style={{ color: "var(--accent-teal)" }}>
                Terms of Service
              </span>{" "}
              and{" "}
              <span className="underline cursor-pointer hover:opacity-80" style={{ color: "var(--accent-teal)" }}>
                Privacy Policy
              </span>
            </p>
            <p className="text-xs flex items-center justify-center gap-1.5" style={{ color: "var(--text-muted)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Powered by eSpark 2026
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

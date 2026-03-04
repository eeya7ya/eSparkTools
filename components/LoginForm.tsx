"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

/* ─── Google Icon SVG ─────────────────────────────────────────── */
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

/* ─── Divider ──────────────────────────────────────────────────── */
function Divider() {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t border-border" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-card px-3 text-muted tracking-widest font-medium">
          or continue with email
        </span>
      </div>
    </div>
  );
}

/* ─── Main LoginForm ───────────────────────────────────────────── */
export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const urlError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(urlError ? mapAuthError(urlError) : null);
  const [isPending, startTransition] = useTransition();
  const [googlePending, setGooglePending] = useState(false);

  function mapAuthError(code: string): string {
    switch (code) {
      case "CredentialsSignin":
        return "Invalid email or password. Please try again.";
      case "AccessDenied":
        return "Access denied. Only @esparktools.com accounts are allowed.";
      default:
        return "An error occurred. Please try again.";
    }
  }

  async function handleGoogleSignIn() {
    setGooglePending(true);
    setError(null);
    await signIn("google", { callbackUrl });
  }

  function handleCredentials(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(mapAuthError(result.error));
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    });
  }

  return (
    <div className="w-full space-y-5">
      {/* Google Sign-In */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={googlePending || isPending}
        className="
          relative flex w-full items-center justify-center gap-3
          rounded-xl border border-border bg-white px-4 py-3
          text-sm font-medium text-foreground shadow-sm
          transition-all duration-200
          hover:bg-gray-50 hover:border-gray-300 hover:shadow
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
          disabled:opacity-60 disabled:cursor-not-allowed
        "
      >
        {googlePending ? (
          <Spinner className="text-gray-500" />
        ) : (
          <GoogleIcon />
        )}
        <span>Continue with Google</span>
      </button>

      <Divider />

      {/* Error Banner */}
      {error && (
        <div
          role="alert"
          className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {/* Credentials Form */}
      <form onSubmit={handleCredentials} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-foreground"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@esparktools.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isPending || googlePending}
            className="
              block w-full rounded-xl border border-border bg-white px-4 py-3
              text-sm text-foreground placeholder:text-muted/60
              shadow-sm transition-all duration-200
              focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30
              disabled:opacity-60 disabled:cursor-not-allowed
            "
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-foreground"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isPending || googlePending}
            className="
              block w-full rounded-xl border border-border bg-white px-4 py-3
              text-sm text-foreground placeholder:text-muted/60
              shadow-sm transition-all duration-200
              focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30
              disabled:opacity-60 disabled:cursor-not-allowed
            "
          />
        </div>

        <button
          type="submit"
          disabled={isPending || googlePending}
          className="
            relative flex w-full items-center justify-center gap-2
            rounded-xl bg-accent px-4 py-3
            text-sm font-semibold text-white shadow-sm
            transition-all duration-200
            hover:bg-accent-hover hover:shadow-md hover:-translate-y-px
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
            active:translate-y-0
            disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0
          "
        >
          {isPending ? (
            <>
              <Spinner className="text-white/80" />
              <span>Signing in…</span>
            </>
          ) : (
            "Sign In"
          )}
        </button>
      </form>
    </div>
  );
}

/* ─── Spinner ──────────────────────────────────────────────────── */
function Spinner({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`h-4 w-4 animate-spin ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}

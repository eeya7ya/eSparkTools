import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import LoginForm from "@/components/LoginForm";

export const metadata = {
  title: "Sign In — eSparkTools",
  description: "Internal portal for eSparkTools team members.",
};

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Subtle radial gradient layer */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(196,114,58,0.08),transparent)]"
      />

      <div className="relative w-full max-w-sm animate-fade-in-up">
        {/* Card */}
        <div className="rounded-2xl border border-border bg-card p-8 shadow-xl shadow-foreground/5 backdrop-blur-sm">

          {/* Brand Header */}
          <div className="mb-8 flex flex-col items-center gap-3 text-center">
            {/* Logo mark */}
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent shadow-md">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-7 w-7 text-white"
                aria-hidden="true"
              >
                <path
                  d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
                  fill="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                eSparkTools
              </h1>
              <p className="mt-0.5 text-sm text-muted">
                Internal Portal — Sign in to continue
              </p>
            </div>
          </div>

          {/* Form */}
          <Suspense
            fallback={
              <div className="flex justify-center py-8">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
              </div>
            }
          >
            <LoginForm />
          </Suspense>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-muted">
          Magic Technology &middot; Internal Portal
        </p>
      </div>
    </main>
  );
}

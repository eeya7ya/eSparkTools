import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";

export const metadata = {
  title: "Dashboard — eSparkTools",
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { name, email, image, role } = session.user as {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-lg animate-fade-in-up">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-xl shadow-foreground/5 text-center">

          {/* Avatar */}
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt={name ?? "User avatar"}
              className="mx-auto mb-4 h-16 w-16 rounded-full border-2 border-border object-cover shadow"
            />
          ) : (
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent text-white text-2xl font-bold shadow">
              {(name ?? email ?? "U").charAt(0).toUpperCase()}
            </div>
          )}

          <h1 className="text-2xl font-bold text-foreground">
            Welcome{name ? `, ${name.split(" ")[0]}` : ""}!
          </h1>
          <p className="mt-1 text-sm text-muted">{email}</p>

          {role && role !== "user" && (
            <span className="mt-3 inline-block rounded-full bg-accent-light px-3 py-1 text-xs font-semibold text-accent uppercase tracking-wider">
              {role}
            </span>
          )}

          <p className="mt-6 text-sm text-muted">
            You're signed in to the eSparkTools internal portal.
          </p>

          {/* Sign Out */}
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
            className="mt-8"
          >
            <button
              type="submit"
              className="
                rounded-xl border border-border bg-white px-6 py-2.5
                text-sm font-medium text-foreground shadow-sm
                transition-all duration-200
                hover:bg-gray-50 hover:border-gray-300 hover:shadow
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
              "
            >
              Sign Out
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-muted">
          Magic Technology &middot; Internal Portal
        </p>
      </div>
    </main>
  );
}

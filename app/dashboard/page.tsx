import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Dashboard — eSpark Tools",
};

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user;

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="rounded-2xl border border-stone-200 bg-white/80 px-8 py-10 shadow-sm backdrop-blur-sm">
          <div className="flex flex-col items-center text-center">
            {user.image ? (
              <img
                src={user.image}
                alt={user.name || "User avatar"}
                className="h-20 w-20 rounded-full border-2 border-stone-100 shadow-sm"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-2xl font-bold text-white shadow-sm">
                {(user.name || user.email || "U").charAt(0).toUpperCase()}
              </div>
            )}

            <h1 className="mt-4 text-xl font-semibold text-stone-900">
              {user.name || "User"}
            </h1>
            <p className="mt-1 text-sm text-stone-500">{user.email}</p>

            <div className="mt-6 w-full rounded-xl bg-stone-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-stone-400">
                Signed in as
              </p>
              <p className="mt-1 text-sm font-medium text-stone-700">
                {user.email}
              </p>
            </div>

            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
              className="mt-6 w-full"
            >
              <button
                type="submit"
                className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm font-medium text-stone-700 transition-all hover:border-stone-300 hover:bg-stone-50 hover:shadow-sm active:scale-[0.98]"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-stone-400">
          Magic Technology · Internal Portal
        </p>
      </div>
    </div>
  );
}

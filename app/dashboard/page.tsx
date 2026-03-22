import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import AIDashboard from "@/components/AIDashboard";

export const metadata = {
  title: "AI Guide — eSpark",
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { name, image } = session.user;

  async function signOutAction() {
    "use server";
    await signOut({ redirectTo: "/login" });
  }

  return (
    <AIDashboard
      userName={name ?? "Learner"}
      userImage={image}
      signOutAction={signOutAction}
    />
  );
}

import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import WelcomeHub from "../../components/welcome/WelcomeHub";

export default async function WelcomePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/login");
  }

  const user = await currentUser();

  return (
    <WelcomeHub
      firstName={user?.firstName ?? ""}
      lastName={user?.lastName ?? ""}
      initials={`${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`}
      imageUrl={user?.imageUrl}
    />
  );
}


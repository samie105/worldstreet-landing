import { currentUser } from "@clerk/nextjs/server";
import WelcomeHub from "../../components/welcome/WelcomeHub";

export default async function WelcomePage() {
  const user = await currentUser();

  const firstName = user?.firstName ?? "John";
  const lastName = user?.lastName ?? "Doe";

  return (
    <WelcomeHub
      firstName={firstName}
      lastName={lastName}
      initials={`${firstName[0]}${lastName[0]}`}
      imageUrl={user?.imageUrl}
    />
  );
}


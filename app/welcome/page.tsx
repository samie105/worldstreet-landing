import { currentUser } from "@clerk/nextjs/server";
import WelcomeHub from "../../components/welcome/WelcomeHub";
import { getUserBalance } from "@/lib/balance-actions";

export default async function WelcomePage() {
  const [user, { spotBalance, walletAddresses }] = await Promise.all([
    currentUser(),
    getUserBalance(),
  ]);

  const firstName = user?.firstName ?? "Trader";
  const lastName = user?.lastName ?? "";

  return (
    <WelcomeHub
      firstName={firstName}
      lastName={lastName}
      initials={`${firstName[0]}${lastName[0] ?? ""}`.toUpperCase()}
      imageUrl={user?.imageUrl}
      spotBalance={spotBalance}
      walletAddresses={walletAddresses}
    />
  );
}


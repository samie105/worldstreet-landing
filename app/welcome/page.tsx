import { currentUser } from "@clerk/nextjs/server";
import WelcomeHub from "../../components/welcome/WelcomeHub";
import { getUserBalance } from "@/lib/balance-actions";
import { getReltrixForexSnapshot } from "@/lib/reltrix-actions";

export default async function WelcomePage() {
  const [user, { spotBalance, walletAddresses }] = await Promise.all([
    currentUser(),
    getUserBalance(),
  ]);

  const firstName = user?.firstName ?? "Trader";
  const lastName = user?.lastName ?? "";
  const primaryEmail = user?.primaryEmailAddress?.emailAddress ?? user?.emailAddresses[0]?.emailAddress ?? null;
  const primaryPhone = user?.primaryPhoneNumber?.phoneNumber ?? user?.phoneNumbers[0]?.phoneNumber ?? null;
  const reltrixForexSnapshot = await getReltrixForexSnapshot({
    email: primaryEmail,
    phone: primaryPhone,
  });

  return (
    <WelcomeHub
      firstName={firstName}
      lastName={lastName}
      initials={`${firstName[0]}${lastName[0] ?? ""}`.toUpperCase()}
      imageUrl={user?.imageUrl}
      spotBalance={spotBalance}
      walletAddresses={walletAddresses}
      reltrixForexSnapshot={reltrixForexSnapshot}
    />
  );
}


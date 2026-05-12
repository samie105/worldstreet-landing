import { currentUser } from "@clerk/nextjs/server";
import WelcomeHub from "../../components/welcome/WelcomeHub";
import { getPersistedReltrixCrmId } from "@/lib/account-linking";
import { getUserBalance } from "@/lib/balance-actions";
import { getReltrixForexSnapshot } from "@/lib/reltrix-actions";

export default async function WelcomePage() {
  const [user, { spotBalance, walletAddresses }] = await Promise.all([
    currentUser(),
    getUserBalance(),
  ]);

  const firstName = user?.firstName ?? "Trader";
  const lastName = user?.lastName ?? "";
  const reltrixLink = await getPersistedReltrixCrmId({
    authUserId: user?.id,
    privateMetadata: user?.privateMetadata,
  });
  const reltrixForexSnapshot = await getReltrixForexSnapshot({
    crmId: reltrixLink?.crmId,
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


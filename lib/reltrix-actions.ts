"use server";

export type ReltrixWalletSummary = {
  crmId: string;
  clientName: string | null;
  email: string | null;
  balance: number;
};

export type ReltrixForexSnapshot = {
  isLive: boolean;
  checkedAt: string;
  message: string;
  totalClients: number;
  totalLeads: number;
  fundedWalletCount: number;
  totalWalletBalance: number;
  topWallets: ReltrixWalletSummary[];
  authMode: string;
};

type ReltrixClientSummary = {
  crmId: string;
  name: string;
  email: string | null;
};

const RELTRIX_API_BASE_URL = "https://api.reltrixcrm.com";
const RELTRIX_PAGE = 1;
const RELTRIX_LIMIT = 100;

const DEFAULT_SNAPSHOT: ReltrixForexSnapshot = {
  isLive: false,
  checkedAt: new Date(0).toISOString(),
  message: "Reltrix live data is unavailable.",
  totalClients: 0,
  totalLeads: 0,
  fundedWalletCount: 0,
  totalWalletBalance: 0,
  topWallets: [],
  authMode: "rx-api-key header",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function parseString(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return null;
}

function parseClient(item: unknown): ReltrixClientSummary | null {
  if (!isRecord(item)) return null;

  const crmId = parseString(item.crm_id);
  if (!crmId) return null;

  const firstName = parseString(item.first_name)?.trim() ?? "";
  const lastName = parseString(item.last_name)?.trim() ?? "";
  const email = parseString(item.email)?.trim() || null;
  const name = [firstName, lastName].filter(Boolean).join(" ") || email || `CRM #${crmId}`;

  return { crmId, name, email };
}

async function fetchReltrixPage(pathname: string, page: number, itemsKey: string): Promise<{ totalPages: number; items: unknown[] }> {
  const apiKey = process.env.RELTRIX_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("Missing RELTRIX_API_KEY");
  }

  const response = await fetch(
    `${RELTRIX_API_BASE_URL}${pathname}?page=${page}&limit=${RELTRIX_LIMIT}`,
    {
      headers: { "rx-api-key": apiKey },
      next: { revalidate: 120 },
      signal: AbortSignal.timeout(8_000),
    },
  );

  if (!response.ok) {
    throw new Error(`Reltrix ${pathname} returned HTTP ${response.status}`);
  }

  const json = await response.json();
  const root = isRecord(json) ? json : {};
  const data = isRecord(root.data) ? root.data : {};
  const totalPages = parseNumber(data.total_pages) ?? 0;
  const items = Array.isArray(data[itemsKey]) ? data[itemsKey] : [];

  return { totalPages, items };
}

async function fetchReltrixCollection(pathname: string, itemsKey: string): Promise<unknown[]> {
  const firstPage = await fetchReltrixPage(pathname, RELTRIX_PAGE, itemsKey);

  if (firstPage.totalPages <= 1) {
    return firstPage.items;
  }

  const remainingPages = Array.from({ length: firstPage.totalPages - 1 }, (_, index) => RELTRIX_PAGE + index + 1);
  const remaining = await Promise.all(
    remainingPages.map((page) => fetchReltrixPage(pathname, page, itemsKey)),
  );

  return firstPage.items.concat(remaining.flatMap((page) => page.items));
}

export async function getReltrixForexSnapshot(): Promise<ReltrixForexSnapshot> {
  const checkedAt = new Date().toISOString();

  if (!process.env.RELTRIX_API_KEY?.trim()) {
    return {
      ...DEFAULT_SNAPSHOT,
      checkedAt,
      message: "Reltrix live data is disabled until RELTRIX_API_KEY is set.",
    };
  }

  try {
    const [clients, leads, walletsRaw] = await Promise.all([
      fetchReltrixCollection("/api/v1/get_clients.php", "clients"),
      fetchReltrixCollection("/api/v1/get_leads.php", "leads"),
      fetchReltrixCollection("/api/v1/get_wallets.php", "wallets"),
    ]);

    const clientMap = new Map(
      clients.flatMap((item) => {
        const client = parseClient(item);
        return client ? [[client.crmId, client] as const] : [];
      }),
    );

    const wallets = walletsRaw.flatMap((item) => {
      if (!isRecord(item)) return [];

      const crmId = parseString(item.crm_id);
      const balance = parseNumber(item.balance);

      if (!crmId || balance === null) return [];

      const client = clientMap.get(crmId) ?? null;

      return [{ crmId, clientName: client?.name ?? null, email: client?.email ?? null, balance }];
    });

    wallets.sort((left, right) => right.balance - left.balance);

    return {
      isLive: true,
      checkedAt,
      message: "Live wallet, client, and lead data loaded from Reltrix.",
      totalClients: clients.length,
      totalLeads: leads.length,
      fundedWalletCount: wallets.length,
      totalWalletBalance: wallets.reduce((sum, wallet) => sum + wallet.balance, 0),
      topWallets: wallets.slice(0, 4),
      authMode: "rx-api-key header · page=1",
    };
  } catch (error) {
    return {
      ...DEFAULT_SNAPSHOT,
      checkedAt,
      message: error instanceof Error ? error.message : DEFAULT_SNAPSHOT.message,
    };
  }
}
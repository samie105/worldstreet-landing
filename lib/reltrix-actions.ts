"use server";

export type ReltrixWalletSummary = {
  crmId: string;
  clientName: string | null;
  email: string | null;
  balance: number;
};

export type ReltrixClientSummary = {
  crmId: string;
  name: string;
  email: string | null;
  phone: string | null;
};

export type ReltrixLookupInput = {
  crmId?: string | null;
  email?: string | null;
  phone?: string | null;
  allowContactLookup?: boolean;
};

export type ReltrixForexSnapshot = {
  isLive: boolean;
  hasClientMatch: boolean;
  checkedAt: string;
  message: string;
  matchSource: "crm_id" | "email" | "phone" | null;
  client: ReltrixClientSummary | null;
  totalClients: number;
  totalLeads: number;
  fundedWalletCount: number;
  totalWalletBalance: number;
  topWallets: ReltrixWalletSummary[];
  authMode: string;
};

const RELTRIX_API_BASE_URL = "https://api.reltrixcrm.com";

const DEFAULT_SNAPSHOT: ReltrixForexSnapshot = {
  isLive: false,
  hasClientMatch: false,
  checkedAt: new Date(0).toISOString(),
  message: "Reltrix live data is unavailable.",
  matchSource: null,
  client: null,
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
  const middleName = parseString(item.middle_name)?.trim() ?? "";
  const lastName = parseString(item.last_name)?.trim() ?? "";
  const email = parseString(item.email)?.trim() || null;
  const phone = parseString(item.phone)?.trim() || null;
  const name = [firstName, middleName, lastName].filter(Boolean).join(" ").replace(/\s+/g, " ") || email || `CRM #${crmId}`;

  return { crmId, name, email, phone };
}

async function fetchReltrixJson(pathname: string, init: RequestInit = {}): Promise<unknown> {
  const apiKey = process.env.RELTRIX_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("Missing RELTRIX_API_KEY");
  }

  const response = await fetch(`${RELTRIX_API_BASE_URL}${pathname}`, {
    ...init,
    headers: {
      "rx-api-key": apiKey,
      ...(init.body ? { "content-type": "application/json" } : {}),
      ...init.headers,
    },
    next: { revalidate: 120 },
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error(`Reltrix ${pathname} returned HTTP ${response.status}`);
  }

  return response.json();
}

function getDataRecord(json: unknown): Record<string, unknown> {
  const root = isRecord(json) ? json : {};
  return isRecord(root.data) ? root.data : {};
}

async function fetchClientById(crmId: string): Promise<ReltrixClientSummary | null> {
  const json = await fetchReltrixJson(`/api/v1/get_client_by_id.php?id=${encodeURIComponent(crmId)}`);
  const client = getDataRecord(json).client;
  return parseClient(client);
}

async function searchClients(payload: { email?: string; phone?: string }): Promise<ReltrixClientSummary[]> {
  const json = await fetchReltrixJson("/api/v1/get_client_by_phone_or_email.php", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  const clients = getDataRecord(json).clients;

  if (!Array.isArray(clients)) return [];

  return clients.flatMap((item) => {
    const client = parseClient(item);
    return client ? [client] : [];
  });
}

async function resolveClient(input: ReltrixLookupInput): Promise<{ client: ReltrixClientSummary | null; matchSource: ReltrixForexSnapshot["matchSource"]; message: string }> {
  const crmId = input.crmId?.trim();
  if (crmId) {
    const client = await fetchClientById(crmId);
    return {
      client,
      matchSource: client ? "crm_id" : null,
      message: client ? "Reltrix client matched by saved CRM ID." : "No Reltrix client found for the saved CRM ID.",
    };
  }

  if (!input.allowContactLookup) {
    return { client: null, matchSource: null, message: "No saved Reltrix account link found for this Clerk user." };
  }

  const email = input.email?.trim().toLowerCase();
  if (email) {
    const clients = await searchClients({ email });
    const exact = clients.find((client) => client.email?.toLowerCase() === email) ?? null;

    if (exact) {
      return { client: exact, matchSource: "email", message: "Reltrix client matched by Clerk email." };
    }

    if (clients.length > 0) {
      return { client: null, matchSource: null, message: "Reltrix email lookup did not return an exact match. Saved CRM ID is required." };
    }
  }

  const phone = input.phone?.trim();
  if (phone) {
    const clients = await searchClients({ phone });

    if (clients.length === 1) {
      return { client: null, matchSource: null, message: "Reltrix phone lookup found a possible client. Saved CRM ID or exact email is required." };
    }

    if (clients.length > 1) {
      return { client: null, matchSource: null, message: "Reltrix phone lookup returned multiple clients. Email or saved CRM ID is required." };
    }
  }

  return { client: null, matchSource: null, message: "No Reltrix client matched this Clerk user." };
}

async function fetchWalletsByClientId(crmId: string, client: ReltrixClientSummary): Promise<ReltrixWalletSummary[]> {
  const json = await fetchReltrixJson(`/api/v1/get_wallet_by_client_id.php?crm_id=${encodeURIComponent(crmId)}`);
  const wallets = getDataRecord(json).wallets;

  if (!Array.isArray(wallets)) return [];

  return wallets.flatMap((item) => {
    if (!isRecord(item)) return [];

    const walletCrmId = parseString(item.crm_id);
    const balance = parseNumber(item.balance);

    if (!walletCrmId || balance === null) return [];

    return [{ crmId: walletCrmId, clientName: client.name, email: client.email, balance }];
  });
}

export async function getReltrixForexSnapshot(input: ReltrixLookupInput = {}): Promise<ReltrixForexSnapshot> {
  const checkedAt = new Date().toISOString();

  if (!process.env.RELTRIX_API_KEY?.trim()) {
    return {
      ...DEFAULT_SNAPSHOT,
      checkedAt,
      message: "Reltrix live data is disabled until RELTRIX_API_KEY is set.",
    };
  }

  try {
    const resolved = await resolveClient(input);
    const client = resolved.client ? await fetchClientById(resolved.client.crmId) ?? resolved.client : null;

    if (!client) {
      return {
        ...DEFAULT_SNAPSHOT,
        isLive: true,
        checkedAt,
        message: resolved.message,
      };
    }

    const wallets = await fetchWalletsByClientId(client.crmId, client);

    wallets.sort((left, right) => right.balance - left.balance);

    return {
      isLive: true,
      hasClientMatch: true,
      checkedAt,
      message: resolved.message,
      matchSource: resolved.matchSource,
      client,
      totalClients: 1,
      totalLeads: 0,
      fundedWalletCount: wallets.length,
      totalWalletBalance: wallets.reduce((sum, wallet) => sum + wallet.balance, 0),
      topWallets: wallets.slice(0, 4),
      authMode: "rx-api-key header · user lookup endpoints",
    };
  } catch (error) {
    return {
      ...DEFAULT_SNAPSHOT,
      checkedAt,
      message: error instanceof Error ? error.message : DEFAULT_SNAPSHOT.message,
    };
  }
}
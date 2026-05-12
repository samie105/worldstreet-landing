import "server-only"

import { connectDB } from "@/lib/mongodb"
import DashboardProfile from "@/models/DashboardProfile"
import ExternalAccountLink from "@/models/ExternalAccountLink"
import type { ExternalAccountLinkSource } from "@/models/ExternalAccountLink"

export type ReltrixCrmIdSource = "verified_link" | "clerk_private_metadata" | "dashboard_profile"

export type PersistedReltrixCrmId = {
  crmId: string
  source: ReltrixCrmIdSource
}

export type VerifiedReltrixAccountLinkInput = {
  authUserId: string
  crmId: string
  source: ExternalAccountLinkSource
  matchedOn?: string[]
  verifiedBy?: string
  notes?: string
  evidence?: {
    clerkEmail?: string
    clerkPhoneLast4?: string
    externalEmail?: string
    externalPhoneLast4?: string
    externalName?: string
  }
}

function getStringValue(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null
}

export function getReltrixCrmIdFromPrivateMetadata(metadata: unknown): string | null {
  if (!metadata || typeof metadata !== "object") return null

  const data = metadata as Record<string, unknown>
  const directCrmId = getStringValue(data.reltrixCrmId) ?? getStringValue(data.reltrix_crm_id)
  if (directCrmId) return directCrmId

  if (data.reltrix && typeof data.reltrix === "object") {
    const reltrix = data.reltrix as Record<string, unknown>
    return getStringValue(reltrix.crmId) ?? getStringValue(reltrix.crm_id)
  }

  return null
}

export async function getPersistedReltrixCrmId(input: {
  authUserId?: string | null
  privateMetadata?: unknown
}): Promise<PersistedReltrixCrmId | null> {
  const privateMetadataCrmId = getReltrixCrmIdFromPrivateMetadata(input.privateMetadata)

  if (!input.authUserId) {
    return privateMetadataCrmId ? { crmId: privateMetadataCrmId, source: "clerk_private_metadata" } : null
  }

  try {
    await connectDB()

    const verifiedLink = await ExternalAccountLink.findOne({
      authUserId: input.authUserId,
      provider: "reltrix",
      status: "verified",
    })
      .sort({ verifiedAt: -1, updatedAt: -1 })
      .select("externalAccountId")
      .lean<{ externalAccountId?: string }>()

    if (verifiedLink?.externalAccountId?.trim()) {
      return { crmId: verifiedLink.externalAccountId.trim(), source: "verified_link" }
    }

    if (privateMetadataCrmId) {
      return { crmId: privateMetadataCrmId, source: "clerk_private_metadata" }
    }

    const profile = await DashboardProfile.findOne({ authUserId: input.authUserId })
      .select("reltrixCrmId")
      .lean<{ reltrixCrmId?: string }>()

    if (profile?.reltrixCrmId?.trim()) {
      return { crmId: profile.reltrixCrmId.trim(), source: "dashboard_profile" }
    }
  } catch {
    if (privateMetadataCrmId) {
      return { crmId: privateMetadataCrmId, source: "clerk_private_metadata" }
    }
  }

  return null
}

export async function upsertVerifiedReltrixAccountLink(input: VerifiedReltrixAccountLinkInput) {
  const authUserId = input.authUserId.trim()
  const crmId = input.crmId.trim()

  if (!authUserId || !crmId) {
    throw new Error("authUserId and crmId are required")
  }

  await connectDB()

  return ExternalAccountLink.findOneAndUpdate(
    { authUserId, provider: "reltrix", status: "verified" },
    {
      $set: {
        authUserId,
        provider: "reltrix",
        externalAccountId: crmId,
        status: "verified",
        source: input.source,
        matchedOn: input.matchedOn ?? [],
        evidence: input.evidence,
        verifiedAt: new Date(),
        verifiedBy: input.verifiedBy ?? "",
        notes: input.notes ?? "",
      },
    },
    { upsert: true, new: true, runValidators: true },
  )
}
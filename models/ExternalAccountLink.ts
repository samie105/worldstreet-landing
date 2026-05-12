import mongoose, { Schema, type Document, type Model } from "mongoose"

export type ExternalAccountProvider = "reltrix"
export type ExternalAccountLinkStatus = "pending_review" | "verified" | "rejected"
export type ExternalAccountLinkSource =
  | "admin"
  | "migration"
  | "clerk_private_metadata"
  | "dashboard_profile"
  | "exact_email"
  | "unique_phone"

export interface IExternalAccountLink extends Document {
  authUserId: string
  provider: ExternalAccountProvider
  externalAccountId: string
  status: ExternalAccountLinkStatus
  source: ExternalAccountLinkSource
  matchedOn: string[]
  evidence?: {
    clerkEmail?: string
    clerkPhoneLast4?: string
    externalEmail?: string
    externalPhoneLast4?: string
    externalName?: string
  }
  verifiedAt?: Date
  verifiedBy?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const ExternalAccountLinkEvidenceSchema = new Schema(
  {
    clerkEmail: { type: String, default: "" },
    clerkPhoneLast4: { type: String, default: "" },
    externalEmail: { type: String, default: "" },
    externalPhoneLast4: { type: String, default: "" },
    externalName: { type: String, default: "" },
  },
  { _id: false },
)

const ExternalAccountLinkSchema = new Schema<IExternalAccountLink>(
  {
    authUserId: { type: String, required: true, index: true },
    provider: { type: String, required: true, enum: ["reltrix"], index: true },
    externalAccountId: { type: String, required: true, index: true },
    status: { type: String, required: true, enum: ["pending_review", "verified", "rejected"], default: "pending_review", index: true },
    source: {
      type: String,
      required: true,
      enum: ["admin", "migration", "clerk_private_metadata", "dashboard_profile", "exact_email", "unique_phone"],
    },
    matchedOn: { type: [String], default: [] },
    evidence: { type: ExternalAccountLinkEvidenceSchema, default: undefined },
    verifiedAt: { type: Date },
    verifiedBy: { type: String, default: "" },
    notes: { type: String, default: "", maxlength: 1000 },
  },
  { timestamps: true },
)

ExternalAccountLinkSchema.index({ provider: 1, authUserId: 1, status: 1 })
ExternalAccountLinkSchema.index(
  { provider: 1, authUserId: 1 },
  { unique: true, partialFilterExpression: { status: "verified" } },
)
ExternalAccountLinkSchema.index(
  { provider: 1, externalAccountId: 1 },
  { unique: true, partialFilterExpression: { status: "verified" } },
)

const ExternalAccountLink: Model<IExternalAccountLink> =
  mongoose.models.ExternalAccountLink ??
  mongoose.model<IExternalAccountLink>("ExternalAccountLink", ExternalAccountLinkSchema)

export default ExternalAccountLink
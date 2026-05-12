# Reltrix Account Linking

The Forex tab can show real account balances, so account matching must be deterministic and persistent. Do not link accounts by display name or by a loose phone/name search.

## Simplest Architecture

Use Clerk `user.id` as the canonical identity across every platform. Every money-bearing platform must either store that Clerk ID directly or have a verified link record in our database.

```txt
Clerk user.id
  -> ExternalAccountLink(provider, authUserId, externalAccountId, status)
  -> platform API by native ID
  -> balances / wallets / positions
```

For Reltrix, the native ID is `crm_id`, so the runtime path is:

```txt
Clerk user.id -> verified Reltrix crm_id -> get_client_by_id -> get_wallet_by_client_id
```

Do not make the Forex tab search Reltrix by email, phone, or name at runtime. Those fields are only migration/admin review signals used to create the verified link.

## Team Contract

- Auth owns the canonical user identity: Clerk `user.id`.
- Product/platform teams may store their own native IDs, but they must be linked back to Clerk `user.id`.
- New integrations should persist Clerk `user.id` at account creation time. If the vendor cannot store it, save a verified `ExternalAccountLink` row in our DB.
- Existing pre-Clerk accounts must be backfilled into `ExternalAccountLink` before showing money data.
- Reads are allowed to join by verified IDs. Reads are not allowed to create or mutate account ownership.

## Trusted Link Sources

The app uses the Clerk user ID as the canonical internal identity. Runtime Forex balance reads resolve the current Clerk user ID to a Reltrix CRM ID in this order:

1. A verified `ExternalAccountLink` record with `provider: "reltrix"`.
2. Clerk `privateMetadata.reltrixCrmId` or `privateMetadata.reltrix.crmId`.
3. The transitional Mongo profile field `DashboardProfile.reltrixCrmId`.

Clerk `publicMetadata` and `unsafeMetadata` are not trusted for account linking.

## Matching Policy

- CRM ID is the strongest match and should be the production link for migrated users.
- Exact email is acceptable as a migration/admin review signal when the Clerk email equals the Reltrix email, but runtime balance reads should use the Clerk-ID link.
- Phone lookup is only a review signal. Even a single phone result should not automatically unlock a money-bearing account.
- Reltrix email/phone lookup requires an explicit `allowContactLookup` opt-in in code.
- Name/display-name matching is not allowed.
- A verified Reltrix CRM ID should map to only one Clerk user.
- A verified Clerk user should map to only one Reltrix CRM ID.

## Existing Users From Before Clerk

For a user such as Thy who had an account before the Clerk merge:

1. Confirm the user's current Clerk ID and verified email/phone.
2. Find the legacy Reltrix client by CRM ID, exact email, or support-verified identity proof.
3. Create or update a verified `ExternalAccountLink` record keyed by the Clerk ID:

```json
{
  "authUserId": "user_xxx",
  "provider": "reltrix",
  "externalAccountId": "90135",
  "status": "verified",
  "source": "migration",
  "matchedOn": ["support_verified", "legacy_account"],
  "verifiedAt": "2026-05-12T00:00:00.000Z",
  "verifiedBy": "admin_or_migration_job"
}
```

Use Clerk `privateMetadata.reltrixCrmId` only as an operational shortcut when the link is set by trusted backend/admin tooling. Prefer `ExternalAccountLink` for long-term auditability.

Migration or admin tooling can use `upsertVerifiedReltrixAccountLink` from `lib/account-linking.ts` to persist the verified link.

## Money Safety Rules

- Never move ledger balances or wallet ownership during a read request.
- Never expose Forex balances through name, partial email, or shared phone matching alone.
- Keep legacy IDs and current Clerk IDs traceable in an append-only link record before exposing balances or enabling money movement.
- If a match is ambiguous, show the Forex account as not connected and send it to manual review.
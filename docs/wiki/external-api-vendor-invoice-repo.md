---
title: external-api-vendor-invoice (Repo)
tags: [mastery, external-api, vendor-invoice, kafka, graphql, fastify, back-office]
sources: [external-api-vendor-invoice-repo]
created: 2026-05-07
updated: 2026-05-07
---

# external-api-vendor-invoice (Repo)

## Summary

`external-api-vendor-invoice` is a private NX monorepo owned by the External API team. It houses the Fastify-based HTTP ingress services and Kafka consumer services responsible for creating and updating vendor invoices in MasterMind. Clients submit invoices via HTTP; the system either routes the request asynchronously through Kafka or processes it synchronously via GraphQL, depending on the service variant.

Source: `raw/repos/external-api-vendor-invoice` (cloned from `git@github.com:masterysystems/external-api-vendor-invoice.git`)

## Key Concepts

- Two flavours of ingress: **async** (Kafka-first) and **sync** (direct GraphQL upsert + fetch)
- API endpoint: `POST /routes/:routeNumber/carriers/:carrierCode/invoices`
- Two active API versions: **v2** and **v2.1** (selected via `Accept-Version` header)
- Async path returns `202` + `correlationId`; sync path returns `200` with the full vendor invoice body
- Kafka events produced to topic based on version:
  - v2: `pvt.external-api.ingress.vendor-invoice-v2.request-submitted.fct.evt.v0`
  - v2.1: `pvt.external-api.ingress.vendor-invoice-v2-1.request-submitted.fct.evt.v0`
- Downstream processing by ORC consumers: `ingress-vendor-invoice-v2-orc` and `ingress-vendor-invoice-v2-1-orc`
- Shared packages handle GraphQL upsert (`vendor-invoice-create-or-update`) and fetch/format (`vendor-invoice-fetch-and-format`)
- RBAC enforced: requires `EXTERNAL_INGRESS_ROLE` or `SUPER_USER_ROLE` plus one of create/update/delete scopes
- DDT (Data Dictionary Term) validation applied as a pre-handler on all routes

## Details

### Package Overview

| Package | Type | Role |
|---------|------|------|
| `external-api-vendor-invoice-v2` | Fastify service | HTTP ingress — async (Kafka producer), supports v2 and v2.1 |
| `external-api-vendor-invoice-v2-sync` | Fastify service | HTTP ingress — synchronous (direct GraphQL), supports v2.1 |
| `ingress-vendor-invoice-v2-orc` | Kafka consumer | Processes v2 Kafka events, calls GraphQL, publishes reply |
| `ingress-vendor-invoice-v2-1-orc` | Kafka consumer | Processes v2.1 Kafka events, calls GraphQL, publishes reply |
| `ingress-vendor-invoice-hyd` | Kafka consumer | Hydration service (additional downstream processing) |
| `vendor-invoice-create-or-update` | Shared lib | GraphQL upsert logic: resolves carrier, load, route IDs then upserts |
| `vendor-invoice-fetch-and-format` | Shared lib | Fetches and formats the saved vendor invoice for the response |

### Async Flow (v2 / v2.1 via `external-api-vendor-invoice-v2`)

```
Client
  POST /routes/:routeNumber/carriers/:carrierCode/invoices
  Accept-Version: 2.0  (or 2.1.0)
        │
        ▼
  Fastify ingress (external-api-vendor-invoice-v2)
  - DDT validation
  - Merges params (routeNumber, carrierCode) into body
  - Produces Kafka event (keyed by routeNumber)
  - Returns 202 + { correlationId }
        │
        ▼
  Kafka topic (version-specific)
        │
        ▼
  ORC consumer (ingress-vendor-invoice-v2-orc or v2-1-orc)
  - Calls vendor-invoice-create-or-update (GraphQL upsert)
  - Publishes reply to ingress reply topic
  - Reply includes: entity, entityId, correlationId, code (SUCCESS/FAILURE), errors
```

### Sync Flow (v2.1 via `external-api-vendor-invoice-v2-sync`)

```
Client
  POST /routes/:routeNumber/carriers/:carrierCode/invoices
  Accept-Version: 2.1.0
        │
        ▼
  Fastify sync service (external-api-vendor-invoice-v2-sync)
  - DDT validation
  - handleCreateOrUpdateVendorInvoice (vendor-invoice-create-or-update)
      → resolves carrierCode → carrierId (GraphQL)
      → resolves routeNumber → routeId / loadId (GraphQL)
      → upserts vendor invoice (GraphQL mutation)
  - fetchAndFormatVendorInvoice (vendor-invoice-fetch-and-format)
  - Returns 200 with full vendor invoice body
  - On error: returns 400 with standard error shape
```

### API Endpoint

```
POST /routes/:routeNumber/carriers/:carrierCode/invoices
```

URL parameters (`routeNumber`, `carrierCode`) are merged into the request body before producing the Kafka event or calling GraphQL — they are stripped from the body schema to avoid duplication.

Versioning is controlled via the `Accept-Version` header:
- `2.x` → v2 route (async only)
- `2.1.0` → v2.1 route (async or sync depending on service)
- No header → controlled by LaunchDarkly flag `FEATURE_ENABLE_VENDOR_INVOICE_NO_VERSION_HEADER`

### RBAC

All routes require one of:
- **Roles**: `EXTERNAL_INGRESS_ROLE`, `SUPER_USER_ROLE`
- **Scopes**: `VENDOR_INVOICE_CREATE_SCOPE`, `VENDOR_INVOICE_UPDATE_SCOPE`, or `VENDOR_INVOICE_DELETE_SCOPE`

### Reply Shape (async, on reply topic)

```json
{
  "entity": "VendorInvoice",
  "entityId": "<id>",
  "correlationId": "<uuid>",
  "requestCorrelationId": "<uuid>",
  "code": "SUCCESS" | "FAILURE",
  "eventType": "VENDOR_INVOICE_CREATED_OR_UPDATED",
  "message": "Successfully processed vendor invoice request.",
  "errors": []
}
```

### Reply Shape (sync, on 200 response)

```json
{
  "entity": "VendorInvoice",
  "correlationId": "<uuid>",
  "requestCorrelationId": "<uuid>",
  "code": "SUCCESS",
  "message": "Successfully processed vendor invoice request",
  "eventType": "VENDOR_INVOICE_CREATED_OR_UPDATED",
  "body": {
    "vendorInvoice": { ... }
  }
}
```

### DDT Term Maps (v2 / v2.1)

The services define term maps used by the DDT validator to map client-facing field names to internal terminology:

```typescript
// v2
{ amount: { currencyCodeTerm: 'currency' }, vendorInvoiceStatusTerm: 'vendorInvoiceStatus' }

// v2.1 adds:
{ chargeDetails: [{ typeTerm: 'chargeType', currencyCodeTerm: 'currency' }] }
```

### Local Development

1. Copy `.envrc.sample` to `.envrc` and fill in secrets from 1Password
2. `yarn` to install dependencies
3. `docker-compose up -d` to start local Kafka
4. `yarn dev` to start the service

Secrets needed: Keycloak client ID/secret, LaunchDarkly SDK key, GraphQL endpoint, JWT issuer/audience.

## Related Pages

- [Working with Standard Errors](wiki/mastery-standard-errors.md)
- [Mastery Error Code Format](wiki/mastery-error-code-format.md)

## Sources

- Cloned repo: `raw/repos/external-api-vendor-invoice`

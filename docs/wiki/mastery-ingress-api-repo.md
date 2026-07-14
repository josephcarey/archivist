---
title: mastery-ingress-api (Repo)
tags: [mastery, external-api, ingress, fastify, kafka, graphql, api-gateway]
sources: [mastery-ingress-api-repo]
created: 2026-05-07
updated: 2026-05-07
---

# mastery-ingress-api (Repo)

## Summary

`mastery-ingress-api` is the central HTTP ingress gateway owned by the External API team. It is a single Fastify 5 service that exposes REST endpoints for all major MasterMind entities — carriers, loads, routes, drivers, facilities, orders, trailers, and many more. Requests are validated, enriched, and either published as Avro-encoded Kafka events or proxied to downstream GraphQL services. It supports three API versions (v1, v2, v2.1) selected via the `Accept-Version` header.

Source: `raw/repos/mastery-ingress-api` (cloned from `git@github.com:masterysystems/mastery-ingress-api.git`)

## Key Concepts

- **Single Fastify service** serving ~25 entity domains via `@fastify/autoload` from `src/services/`
- **Dual transport**: Kafka producer (async) or DAPR/GraphQL (hub mode, sync-capable)
- **Three API versions**: v1, v2, v2.1 — routed via `Accept-Version` header
- **OAS auto-generation**: plugin extracts schema from Fastify route definitions; published to Odin API → external-api-document-service
- **RBAC enforcement**: JWT auth + role/scope checks via `external-api-fastify-rbac-enforcement-plugin`
- **DDT validation**: Data Dictionary Term validation applied as a pre-handler on routes
- **LaunchDarkly feature flags**: used to gate in-progress features, control RBAC, serializer, and versioning behaviour
- **DAPR mode** (`IS_HUB=true`): replaces direct Kafka + GraphQL with DAPR pub/sub and service invocation
- **Canonical logger**: per-request correlation ID and structured logging on every route
- **In-progress feature gating**: `devFeatures` config + `shouldFeatureBeEnabled()` utility lets teams deploy incomplete features safely

## Details

### Service Catalog

Each folder under `src/services/` is an autoloaded Fastify plugin covering one entity domain:

| Domain | Notes |
|--------|-------|
| `carriers` | Carrier create/update, reps, geographies |
| `customers` | Customer create/update, order management |
| `drivers` | Driver create/update, HOS, capacity, assignments |
| `employees` | Employee create/update |
| `facilities` | Facility create/update, geofences, locations |
| `loads` | Load create/update, composition |
| `orders` | Orders, standalone orders, transportation orders |
| `routes` | Route create/update, route vendor, route planner |
| `trailers` | Trailer create/update, trailer pool |
| `powers` | Power unit management |
| `invoices` | Internal invoices |
| `external-invoices` | External (client-facing) invoices |
| `vouchers` | Vouchers |
| `external-vouchers` | External vouchers |
| `groups` | Groups |
| `relationships` | Relationship management |
| `location-pings` | Telematics pings |
| `accept-spot-quotes` | Procurement spot quotes |
| `procurement-routes` | Procurement route management |
| `pre-plan-assessment` | Pre-plan assessment |
| `load-composition` | Load composition |
| `linked-routes` | Linked route management |

### Request Flow (Kafka / async mode)

```
Client
  POST|PUT|PATCH /v2/<entity>/...
  Accept-Version: 2.x
        │
        ▼
  Fastify ingress
  ├── JWT authentication (mastery-fastify-auth)
  ├── RBAC enforcement (role + scope check)
  ├── Schema validation (JSON schema from Avro model)
  ├── DDT (Data Dictionary Term) validation pre-handler
  ├── Canonical logger (correlation ID assigned)
  └── Route handler
        ├── Resolves entity identifiers via GraphQL if needed
        ├── Publishes Avro-encoded event to Kafka topic
        └── Returns 202 + { correlationId }
```

### Request Flow (DAPR / hub mode)

When `IS_HUB=true` and `DAPR_ENABLED=true`:
- Kafka producer replaced by DAPR pub/sub
- GraphQL calls replaced by DAPR service invocation
- JWT issuers, GraphQL config, and Kafka bridge resolved via DAPR listeners at startup

### API Versioning

Three versions supported, selected via `Accept-Version` header:

| Version | Header value | Notes |
|---------|-------------|-------|
| v1 | `1.x` | Legacy |
| v2 | `2.x` | Current stable |
| v2.1 | `2.1.0` | Latest, adds charge details and other extensions |

### OAS Documentation Architecture

Routes self-document via a Fastify plugin (`src/plugins/oas/`) that reads the `schema` and `config.tags` of each registered route. Generated OAS JSON is published to:

1. **Odin API** (`external-api-odin`) — stores OAS per version in MongoDB
2. **external-api-document-service** — stitches and serves unified OAS via Redoc at `/docs/:version`

Local docs still viewable at `http://localhost:3000/docs/v2`.

### In-Progress Feature Gating

Incomplete features can be deployed without affecting clients by adding them to `devFeatures` in `src/config.ts`:

```typescript
{
  version: SchemaVersion.v2,
  type: 'facility',
  featureType: 'GET'
}
```

Then guard the route handler with `shouldFeatureBeEnabled(...)`. Gated routes don't appear in docs and don't process requests.

### Key Plugins

| Plugin | Purpose |
|--------|---------|
| `canonical-logger` | Per-request correlation ID + structured logging |
| `coercion-logger` | Logs when Fastify coerces input values |
| `additional-properties-logger` | Logs undeclared properties in request bodies |
| `kafka-producer` | Wraps Confluent Kafka producer with Avro schema registration |
| `openapi-spec` | Auto-generates OAS from route schemas |
| `oas-publisher` | Publishes OAS to Odin API |
| `metadata` | Registers service metadata (topics, feature flags, GraphQL SDKs) |
| `heapdump` | On-demand heap snapshot for memory debugging (env-gated) |
| `local-ingress-schema-service` | Loads Avro schemas locally for dev/test |

### Key Validation Hooks (`src/hooks/`)

Pre-handlers that run before route logic to validate enriched data:

- `carrier-validation-hook` — validates carrier codes
- `facility-validation-hook` — validates facility codes/IDs
- `driver-capacity-validation-hook` — validates driver capacity constraints
- `stop-event-validation-hook` — validates stop event sequences
- `route-vendor-validation-hook` — validates route vendor data
- `address-validation-hook`, `contact-validation-hook`, `date-validation-hook`, etc.

### Kafka Topics (vendor invoice example)

```typescript
// v2
{ key: 'v2EDI_VENDOR_INVOICE', name: process.env.INGRESS_TOPIC_VENDOR_INVOICE_EDI }

// v2.1
{ key: 'v2_1EDI_VENDOR_INVOICE', name: process.env.INGRESS_TOPIC_VENDOR_INVOICE_EDI_V2 }
```

All topic names are resolved from environment variables at startup.

### Local Development

```bash
cp .envrc.sample .envrc   # fill in secrets from Azure Key Vault / 1Password
direnv allow
yarn
docker-compose up -d      # starts local Kafka
yarn dev
```

Secrets needed:
- `ingress-client-secret` (Keycloak)
- `ld-sdk-key` (LaunchDarkly)
- GraphQL endpoint, JWT issuer, audience

For DAPR mode: `IS_HUB=true`, `DAPR_ENABLED=true`, `yarn dev:hub`

### Error Handling

The global `setErrorHandler` strips Fastify's internal `code` field from error responses (clients should not see it), then:
- `500` errors → generic `Internal Server Error` message (no internal details exposed)
- Other errors → pass through with their status code

## Related Pages

- [external-api-vendor-invoice (Repo)](wiki/external-api-vendor-invoice-repo.md)
- [Working with Standard Errors](wiki/mastery-standard-errors.md)
- [Mastery Error Code Format](wiki/mastery-error-code-format.md)

## Sources

- Cloned repo: `raw/repos/mastery-ingress-api`

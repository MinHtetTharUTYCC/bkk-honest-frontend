# Frontend Alignment Handoff (Backend Contract Migration)

## Mission

Align the frontend with the new backend API contract end-to-end: generated types, request/response envelopes, status handling, error handling, and infinite query pagination.

The frontend currently has partial migration work, but several layers still assume older shapes. The next session should treat this as a contract-integration hardening project, not just a type regeneration task.

## Strategic Decision

- Use `openapi-typescript` + `openapi-fetch` as the target stack.
- Do not continue with Orval for new integration work.
- Migrate in phases and remove Orval only after all migrated surfaces are stable.

## What Was Scanned

- Frontend project at ../bkk-honest-frontend
- API generation setup (currently Orval; target is openapi-typescript + openapi-fetch)
- Generated API client output
- HTTP mutator and auth header injection
- Shared API hooks (spots/scams/tips/prices/gallery/comments/vibes/missions/profiles/social)
- Server-side service helpers
- UI consumers that flatten paginated data and show errors
- Legacy custom type layer still present in frontend

## Key Findings (Current Drift)

### 1) Response envelope mismatch at transport layer

Backend now returns canonical success envelope and canonical error envelope.

Frontend mutator still unwraps only when payload has:

- data
- status

Backend success envelope uses statusCode (not status), so current unwrapping condition misses many responses.

Impact:

- Hooks and components must manually guess whether data is wrapped/unwrapped.
- Many casts and fallback branches exist because runtime payload shape is inconsistent from frontend perspective.

### 2) Generated client models are stale/incomplete for latest backend envelope fields

Generated error DTOs in frontend currently do not include full backend fields in practice (for example statusCode/timestamp/requestId are not consistently represented where expected).

Impact:

- Error handling cannot fully rely on typed fields.
- UI message extraction is brittle and often downgraded to fallback text.

### 3) Mixed data-shape handling across hooks

Hooks frequently support multiple shapes simultaneously (array, object with data, object with pagination, etc.).

Impact:

- Complex flatten logic and repeated defensive branching.
- Higher risk of silent bugs when backend contract evolves.

### 4) Infinite query conventions are inconsistent

Current infinite queries use skip and take, but page param types are mixed (number/string), and several places transform between skip and page index manually.

Impact:

- Duplication and edge-case risk.
- Harder to maintain one predictable infinite-scroll behavior.

### 5) Mutation payload/response typing still uses unsafe casts

There are remaining unsafe casts (including any) in mutation wrappers and optimistic update flows.

Impact:

- Type safety guarantees are partially bypassed.
- Runtime mismatch can slip through compile checks.

### 6) Legacy custom type layer still exists alongside generated models

There is a handwritten type layer still used in at least part of UI.

Impact:

- Dual source of truth for API domain shapes.
- Drift and mismatch against generated contracts.

### 7) SSR helper layer has incomplete/incorrect patterns

Some server-side helpers rely on generated response assumptions from older contract and one profile service uses a client hook in server-oriented helper context.

Impact:

- Potential SSR hydration/data bugs.
- Extra complexity for auth + fetch behavior.

## Target Contract (Frontend Must Converge To)

### Success envelope (runtime)

All success responses should be handled as canonical envelope:

- success: true
- statusCode: number
- timestamp: string
- requestId?: string
- message?: string
- data?: T
- pagination?: { skip, take, total, hasMore }

### Error envelope (runtime)

All errors should be handled as canonical envelope:

- success: false
- statusCode: number
- timestamp: string
- requestId?: string
- error: {
    - code: string
    - message: string
    - details?: object
      }

### Pagination

Infinite queries should use one standard cursor policy:

- request params: skip + take
- continuation: pagination.hasMore + pagination.skip/take
- one shared helper, one page param type

## Required Workstreams

### Workstream A: Type generation pipeline hardening (openapi-typescript)

1. Regenerate frontend API types from latest backend OpenAPI document using `openapi-typescript`.
2. Ensure generation source is deterministic (avoid stale local server mismatch).
3. Validate generated path/schema/error/pagination models include backend canonical fields.
4. Add generation validation script(s) and CI step in frontend repository.

Deliverable:

- Reproducible `openapi:types` command + verification command in frontend package scripts.
- Generated OpenAPI types committed and used as only transport contract source.

### Workstream B: Transport client normalization (openapi-fetch)

1. Build one shared `openapi-fetch` client instance with base URL + auth header injection.
2. Add centralized response parsing for backend success envelope using `statusCode`.
3. Add centralized error parsing for backend error envelope (`statusCode`, `error.code`, `error.message`, `details`).
4. Keep cancellation/auth behavior parity with current implementation.
5. Remove unsafe header/body casts where possible.

Deliverable:

- Single predictable runtime response shape reaching hooks.

### Workstream C: Error handling standardization

1. Replace ad hoc error parsing with one typed extractor that supports canonical envelope.
2. Expose helper outputs:
    - message
    - statusCode
    - error code
    - details
3. Update UI to consume helper consistently (toasts/forms/modals).
4. Map common status codes to UX actions:
    - 400 validation -> show field/general validation
    - 401 unauthorized -> auth prompt/login flow
    - 403 forbidden -> permission message
    - 404 not found -> empty/not-found UX
    - 409 conflict -> conflict-specific copy
    - 429 throttled -> retry later copy
    - 5xx -> generic server failure copy

Deliverable:

- One shared error policy used across all hooks/components.

### Workstream D: Infinite query standardization

1. Normalize all infinite hooks to one pageParam type (number recommended).
2. Use one shared next-page helper based on pagination object.
3. Remove duplicate conversion logic (skip/pageIndex/string conversions).
4. Ensure prefetch + hydration paths follow same pagination semantics.

Deliverable:

- Consistent paging behavior in all list/infinite surfaces.

### Workstream E: Hook and consumer cleanup

1. Refactor hooks that currently branch across multiple response shapes.
2. Remove runtime shape guessing where contract can be guaranteed.
3. Eliminate remaining any casts and unnecessary unknown-to-specific casts.
4. Update optimistic cache update code to typed page/item contracts.

Deliverable:

- Strongly typed hooks and cache updates with minimal casts.

### Workstream F: Legacy type source consolidation

1. Audit handcrafted frontend API types.
2. Replace remaining usages with generated model types.
3. Keep handcrafted types only for pure UI view models (not transport DTOs).

Deliverable:

- Generated API types as single source of truth for transport contracts.

### Workstream G: SSR service layer alignment

1. Ensure server helpers consume the same normalized client contract.
2. Remove client-hook usage from server helper contexts.
3. Keep auth token forwarding consistent for server calls.

Deliverable:

- SSR/CSR parity for API consumption and typings.

### Workstream H: Orval decommission

1. Stop generating new code with Orval.
2. Migrate modules to `openapi-fetch` wrappers incrementally (spots/scams first).
3. Remove Orval config, scripts, and generated folders after migration completion.
4. Ensure no imports remain from old Orval-generated modules.

Deliverable:

- Clean transport stack using only `openapi-typescript` + `openapi-fetch`.

## Execution Order (Recommended)

1. Regenerate types with `openapi-typescript` and lock generation scripts.
2. Implement shared `openapi-fetch` client and envelope/error normalization.
3. Implement typed error extraction + status mapping.
4. Standardize infinite query helper + migrate hooks.
5. Clean up hook consumers and optimistic updates.
6. Remove legacy API transport types.
7. Decommission Orval and delete obsolete generated client code.
8. Final pass: lint, typecheck, build, critical-page smoke tests.

## Validation Matrix

### Static checks

- Frontend typecheck passes with strict settings.
- No explicit any in API transport path and hooks (except justified generated code boundaries).
- No direct component-level parsing of raw axios error payloads.

### Runtime checks

- Spot list/search/infinite scroll
- Scam list/search/infinite scroll
- Tips list/infinite scroll
- Price reports list/infinite scroll
- Gallery list/infinite scroll
- Comments list/infinite scroll
- Checklist/missions list/infinite scroll
- Vote toggle optimistic update and rollback
- Mutations (create/update/delete) show correct success/error UX
- Authenticated vs unauthenticated status handling (especially 401)

### Contract checks

- Regeneration from backend OpenAPI completes cleanly.
- Generated error models include canonical fields needed by frontend UX.
- No response-shape ambiguity remains in API hooks.
- No remaining transport imports from Orval-generated directories.

## Risks To Watch

- If backend Swagger decorators do not describe envelope consistently, generated types may still represent endpoint payload DTO only. In that case, frontend must keep explicit envelope runtime typing in mutator layer.
- Multipart endpoints may need explicit request body schema handling after regeneration.
- Optimistic cache logic is currently complex; refactor in small, testable steps.

## Definition of Done

- Frontend API integration runs on one deterministic generated contract.
- Transport layer returns one predictable shape to hooks.
- Unified typed error handling used everywhere.
- Infinite query behavior is consistent across modules.
- No duplicated transport DTO definitions in app code.
- Orval fully removed from the transport pipeline.
- Build, lint, and critical user flows pass.

## Suggested Kickoff Prompt For Next Copilot Session

Use this exact mission:

"Execute the frontend API alignment migration against the new backend contract. Start by regenerating API types/client from backend OpenAPI and verifying canonical success/error envelope handling in the mutator. Then standardize error extraction, status-code handling, and infinite query pagination across all API hooks and consumers. Remove transport any-casts and legacy duplicate DTO types. Keep changes incremental and validated with build/lint/typecheck plus runtime smoke checks on spots, scams, tips, prices, gallery, comments, and missions."

Updated mission for this project:

"Execute the frontend API alignment migration against the new backend contract using openapi-typescript + openapi-fetch (not Orval). Start by generating OpenAPI types, then implement a shared openapi-fetch client with canonical success/error envelope parsing. Migrate hooks and consumers incrementally (spots/scams first), standardize infinite query pagination, and remove transport any-casts and duplicate DTO layers. After all flows are migrated and validated, decommission Orval completely."

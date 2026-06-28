# Restaurant Management System — Task Plan

Master task list for building the MVP. Reference docs: [`architecture.MD`](architecture.MD), [`features.MD`](features.MD), [`.cursorrules`](.cursorrules).

**How to use:** Ask the agent to **"Execute Batch 2"** or **"Execute T-017 through T-020"**. The agent will implement the work and update this file — marking tasks and batch progress as work proceeds.

---

## Progress Summary

| Status | Count |
|---|---|
| Total tasks | 46 |
| Done `[x]` | 19 |
| In progress `[~]` | 0 |
| Not started `[ ]` | 27 |
| **Batches complete** | **3 / 10** (Batch 10 partial: 1/4) |

**Last updated:** 2026-06-28 (T-043, T-039, T-040 complete)

---

## Batch Progress

Recommended execution order. Run batches sequentially — each batch depends on the one before it unless noted.

| Batch | Name | Tasks | Progress | Status | Prerequisite |
|---|---|---|---|---|---|
| **1** | Foundation | T-001 – T-007 | 7 / 7 | `[x]` **Done** | — |
| **2** | Auth + UI shells | T-008 – T-016 | 9 / 9 | `[x]` **Done** | Batch 1 |
| **3** | Menu | T-017 – T-020 | 0 / 4 | `[ ]` Not started | Batch 2 |
| **4** | Tables | T-021 – T-024 | 0 / 4 | `[ ]` Not started | Batch 3 |
| **5** | Orders | T-025 – T-029 | 0 / 5 | `[ ]` Not started | Batch 4 |
| **6** | Reservations | T-030 – T-033 | 0 / 4 | `[ ]` Not started | Batch 5 |
| **7** | Billing | T-034 – T-038 | 0 / 5 | `[ ]` Not started | Batch 5 |
| **8** | Staff | T-039 – T-040 | 2 / 2 | `[x]` **Done** | Batch 2 |
| **9** | Dashboard overview | T-041 – T-042 | 0 / 2 | `[ ]` Not started | Batches 5, 6, 7 |
| **10** | Home + polish | T-043 – T-046 | 1 / 4 | `[~]` In progress | Batch 9 |

**Say to execute:** `Execute Batch 1` … `Execute Batch 10` (or the task range for that batch).

### Batch details

#### Batch 1 — Foundation `[x]` Done

| | |
|---|---|
| **Tasks** | T-001, T-002, T-003, T-004, T-005, T-006, T-007 |
| **Goal** | Running Express server + MongoDB health check; Next.js client with all route placeholders, API client, constants, theme |
| **Milestone** | `npm start` (server) + `npm run dev` (client) both work; all routes resolve |
| **Completed** | 2026-06-28 |

| **Completed** | 2026-06-28 |

#### Batch 2 — Auth + UI shells `[x]` Done

| | |
|---|---|
| **Tasks** | T-008, T-009, T-010, T-011, T-012, T-013, T-014, T-015, T-016 |
| **Goal** | Better Auth login; protected dashboard layout; Express admin middleware; public navbar; admin sidebar |
| **Milestone** | Staff can log in; `/dashboard/*` requires auth; shared UI components ready |
| **Completed** | 2026-06-28 |

#### Batch 3 — Menu `[ ]`

| | |
|---|---|
| **Tasks** | T-017, T-018, T-019, T-020 |
| **Goal** | Menu CRUD API + indexes; admin menu page; customer menu browser |
| **Milestone** | First full vertical slice — browse and manage menu items |

#### Batch 4 — Tables `[ ]`

| | |
|---|---|
| **Tasks** | T-021, T-022, T-023, T-024 |
| **Goal** | Tables API + indexes; admin floor view; TablePicker component |
| **Milestone** | Available tables visible for order flow |

#### Batch 5 — Orders `[ ]`

| | |
|---|---|
| **Tasks** | T-025, T-026, T-027, T-028, T-029 |
| **Goal** | Orders API with status transitions; admin order list; customer order page |
| **Milestone** | Customer places order; staff updates status; table becomes occupied |

#### Batch 6 — Reservations `[ ]`

| | |
|---|---|
| **Tasks** | T-030, T-031, T-032, T-033 |
| **Goal** | Reservations API with confirm/cancel/seat logic; admin + customer pages |
| **Milestone** | Book table online; admin confirms and assigns table |

#### Batch 7 — Billing `[ ]`

| | |
|---|---|
| **Tasks** | T-034, T-035, T-036, T-037, T-038 |
| **Goal** | Bills API with tax calc; admin billing page; customer bill view |
| **Milestone** | Serve → bill → pay → table available (core dine-in loop complete) |

#### Batch 8 — Staff `[x]` Done

| | |
|---|---|
| **Tasks** | T-039, T-040 |
| **Goal** | Staff CRUD API; admin staff page |
| **Milestone** | Admin can manage staff records |
| **Completed** | 2026-06-28 |

#### Batch 9 — Dashboard overview `[ ]`

| | |
|---|---|
| **Tasks** | T-041, T-042 |
| **Goal** | Stats API; dashboard overview with stat cards and quick lists |
| **Milestone** | `/dashboard` shows live counts and revenue |
| **Requires** | Orders, reservations, and billing data (Batches 5–7) |

#### Batch 10 — Home + polish `[ ]`

| | |
|---|---|
| **Tasks** | T-043, T-044, T-045, T-046 |
| **Goal** | Customer home page; loading/error states; mobile pass; smoke test checklist |
| **Milestone** | MVP complete and manually verified (S-1 through S-10) |

### Batch dependency graph

```mermaid
flowchart TD
  B1["Batch 1 Foundation"]
  B2["Batch 2 Auth + shells"]
  B3["Batch 3 Menu"]
  B4["Batch 4 Tables"]
  B5["Batch 5 Orders"]
  B6["Batch 6 Reservations"]
  B7["Batch 7 Billing"]
  B8["Batch 8 Staff"]
  B9["Batch 9 Dashboard"]
  B10["Batch 10 Polish"]

  B1 --> B2 --> B3 --> B4 --> B5
  B5 --> B7
  B5 --> B6
  B2 --> B8
  B5 --> B9
  B6 --> B9
  B7 --> B9
  B8 --> B9
  B9 --> B10
```

**Recommended next step:** `Execute Batch 3` (T-017 through T-020)

---

### Quick reference (all tasks)

| ID | Task | Status |
|---|---|---|
| T-001 | Server project scaffold | `[x]` |
| T-002 | MongoDB connection + health API | `[x]` |
| T-003 | Client project scaffold (Next.js, Tailwind, DaisyUI) | `[x]` |
| T-004 | Client App Router folder structure | `[x]` |
| T-005 | API client (`lib/api.js`) | `[x]` |
| T-006 | Shared constants (`lib/constants.js`) | `[x]` |
| T-007 | Root layout + global styles + theme | `[x]` |
| T-008 | Better Auth server config | `[x]` |
| T-009 | Better Auth API route handler | `[x]` |
| T-010 | Better Auth client | `[x]` |
| T-011 | Login page | `[x]` |
| T-012 | Dashboard layout + auth guard | `[x]` |
| T-013 | Express admin auth middleware | `[x]` |
| T-014 | Shared UI components | `[x]` |
| T-015 | Public layout + navbar | `[x]` |
| T-016 | Dashboard sidebar + shell | `[x]` |
| T-017 | Menu API (CRUD) | `[ ]` |
| T-018 | Menu indexes on startup | `[ ]` |
| T-019 | Admin menu page | `[ ]` |
| T-020 | Customer menu page | `[ ]` |
| T-021 | Tables API | `[ ]` |
| T-022 | Tables indexes on startup | `[ ]` |
| T-023 | Admin tables page | `[ ]` |
| T-024 | TablePicker component | `[ ]` |
| T-025 | Orders API | `[ ]` |
| T-026 | Order status transitions + table updates | `[ ]` |
| T-027 | Orders indexes on startup | `[ ]` |
| T-028 | Admin orders page | `[ ]` |
| T-029 | Customer order page | `[ ]` |
| T-030 | Reservations API | `[ ]` |
| T-031 | Reservation status + table logic | `[ ]` |
| T-032 | Admin reservations page | `[ ]` |
| T-033 | Customer reserve page | `[ ]` |
| T-034 | Billing API | `[ ]` |
| T-035 | Bill generation + tax calculation | `[ ]` |
| T-036 | Bills indexes on startup | `[ ]` |
| T-037 | Admin billing page | `[ ]` |
| T-038 | Customer bill view page | `[ ]` |
| T-039 | Staff API | `[x]` |
| T-040 | Admin staff page | `[x]` |
| T-041 | Dashboard stats API | `[ ]` |
| T-042 | Dashboard overview page | `[ ]` |
| T-043 | Customer home page | `[x]` |
| T-044 | Loading + error states | `[ ]` |
| T-045 | Mobile responsive pass | `[ ]` |
| T-046 | End-to-end smoke test checklist | `[ ]` |

---

## Status legend

| Mark | Meaning |
|---|---|
| `[ ]` | Not started |
| `[~]` | In progress |
| `[x]` | Done |

---

## Epic 0 — Project Foundation

### US-00: As a developer, I need the project scaffold so I can run server and client locally

#### T-001 — Server project scaffold `[x]`

**Sub-tasks**
- [x] Create `server/package.json` with express, mongodb, cors, dotenv
- [x] Create `server/index.js` with Express app, `express.json()`, CORS, listen on `PORT`
- [x] Add npm script `"start": "node index.js"` and `"dev"` if using nodemon

**Acceptance criteria**
- [x] `cd server && npm install && npm start` runs without error
- [x] Server listens on port 5000 (or `PORT` from env)
- [x] All code is plain JavaScript in a single `index.js` file

---

#### T-002 — MongoDB connection + health API `[x]`

**Sub-tasks**
- [x] Connect `MongoClient` using `MONGODB_URI` and `DB_NAME`
- [x] Add `GET /api/health` returning `{ status: "ok", db: "connected" }`
- [x] Handle connection errors gracefully

**Acceptance criteria**
- [x] Health endpoint returns 200 when MongoDB is reachable
- [x] Health endpoint returns 503 (or clear error) when DB is down
- [x] Connection uses native `mongodb` driver only (no Mongoose)

**Depends on:** T-001

---

#### T-003 — Client project scaffold `[x]`

**Sub-tasks**
- [x] Initialize Next.js app in `client/` (App Router, JavaScript, no TypeScript)
- [x] Install and configure Tailwind CSS
- [x] Install and configure DaisyUI plugin in `tailwind.config.js`
- [x] Verify `npm run dev` works

**Acceptance criteria**
- [x] `cd client && npm install && npm run dev` starts on port 3000
- [x] No `.ts` or `.tsx` files in the project
- [x] DaisyUI classes render correctly on a test element

---

#### T-004 — Client App Router folder structure `[x]`

**Sub-tasks**
- [x] Create route group `app/(public)/` with placeholder pages: `page.js`, `menu`, `order`, `reserve`, `bill/[id]`
- [x] Create `app/login/page.js`
- [x] Create route group `app/(dashboard)/dashboard/` with placeholders: `page.js`, `menu`, `tables`, `orders`, `reservations`, `billing`, `staff`
- [x] Create empty `components/ui`, `components/public`, `components/dashboard`, `lib/` folders

**Acceptance criteria**
- [x] All routes from [`features.MD`](features.MD) resolve without 404
- [x] Route groups do not affect URL paths (e.g. `/menu` not `/(public)/menu`)
- [x] Folder layout matches the structure documented in the project

**Depends on:** T-003

---

#### T-005 — API client (`lib/api.js`) `[x]`

**Sub-tasks**
- [x] Create fetch wrapper using `NEXT_PUBLIC_API_URL`
- [x] Support GET, POST, PATCH, DELETE helpers
- [x] Parse JSON responses; throw or return `{ error }` on failure
- [x] Optional auth header param for dashboard calls

**Acceptance criteria**
- [x] `api.get('/api/health')` works against running server
- [x] Errors surface a readable message from `{ error: "..." }` responses
- [x] Single file in `client/lib/api.js`

**Depends on:** T-002, T-004

---

#### T-006 — Shared constants (`lib/constants.js`) `[x]`

**Sub-tasks**
- [x] Define `ORDER_STATUSES`, `RESERVATION_STATUSES`, `TABLE_STATUSES`, `PAYMENT_STATUSES`
- [x] Define default menu `CATEGORIES` array
- [x] Export constants for use in components and forms

**Acceptance criteria**
- [x] Status values match [`features.MD`](features.MD) field definitions
- [x] Imported successfully from both server-facing and client components

**Depends on:** T-004

---

#### T-007 — Root layout + global styles + theme `[x]`

**Sub-tasks**
- [x] Create `app/layout.js` with `<html data-theme="corporate">` (or chosen theme)
- [x] Create `app/globals.css` with Tailwind directives
- [x] Set page title and basic metadata

**Acceptance criteria**
- [x] Every page inherits DaisyUI theme
- [x] Tailwind utility classes work app-wide
- [x] Layout is valid App Router root layout

**Depends on:** T-003

---

## Epic 1 — Authentication

### US-A01: As staff, I want to log in so I can access the admin dashboard

#### T-008 — Better Auth server config `[x]`

**Sub-tasks**
- [x] Install Better Auth in client project
- [x] Create `lib/auth.js` with email/password provider
- [x] Configure session settings for Next.js App Router

**Acceptance criteria**
- [x] Auth instance exports from `lib/auth.js`
- [x] Configuration is JavaScript only
- [x] `.env.local` variables documented in comments (user must confirm before writing `.env`)

**Depends on:** T-004

---

#### T-009 — Better Auth API route handler `[x]`

**Sub-tasks**
- [x] Create `app/api/auth/[...all]/route.js` wired to Better Auth handler

**Acceptance criteria**
- [x] Auth endpoints respond at `/api/auth/*`
- [x] Sign-up/sign-in routes reachable (even if sign-up is disabled for production)

**Depends on:** T-008

---

#### T-010 — Better Auth client `[x]`

**Sub-tasks**
- [x] Create `lib/auth-client.js` for client components
- [x] Export signIn, signOut, useSession (or equivalent)

**Acceptance criteria**
- [x] Client components can call signIn/signOut without errors
- [x] Session state available for conditional UI

**Depends on:** T-008, T-009

---

#### T-011 — Login page `[x]`

**Sub-tasks**
- [x] Build `/login` with email + password form (DaisyUI `input`, `btn`)
- [x] Redirect to `/dashboard` on successful login
- [x] Show error alert on failed login

**Acceptance criteria**
- [x] Valid credentials redirect to `/dashboard`
- [x] Invalid credentials show DaisyUI `alert alert-error`
- [x] Page is accessible without prior auth

**Depends on:** T-010, T-007

---

#### T-012 — Dashboard layout + auth guard `[x]`

**Sub-tasks**
- [x] Create `app/(dashboard)/layout.js` checking session server-side
- [x] Redirect unauthenticated users to `/login`
- [x] Render children inside dashboard shell placeholder

**Acceptance criteria**
- [x] Visiting `/dashboard/*` without session redirects to `/login`
- [x] Authenticated users see dashboard content
- [x] Logout clears session (wired in T-016)

**Depends on:** T-011

---

#### T-013 — Express admin auth middleware `[x]`

**Sub-tasks**
- [x] Add middleware in `server/index.js` to verify admin session on protected routes
- [x] Return 401 for unauthenticated admin mutations
- [x] Allow public routes (menu read, orders POST, etc.) without auth

**Acceptance criteria**
- [x] Protected POST/PATCH/DELETE return 401 without valid session
- [x] Public GET endpoints remain accessible
- [x] Auth check lives in `index.js` (no separate middleware files required, inline function is fine)

**Depends on:** T-002, T-009

---

## Epic 2 — Shared UI Shell

### US-00: As a user, I want consistent navigation and layout across the app

#### T-014 — Shared UI components `[x]`

**Sub-tasks**
- [x] `components/ui/PageHeader.js`
- [x] `components/ui/DataTable.js`
- [x] `components/ui/StatusBadge.js`
- [x] `components/ui/LoadingSpinner.js`
- [x] `components/ui/EmptyState.js`

**Acceptance criteria**
- [x] Components use DaisyUI classes only (no custom CSS files)
- [x] `StatusBadge` supports order, table, reservation, and payment statuses
- [x] `DataTable` supports headers, rows, and `overflow-x-auto` for mobile

**Depends on:** T-007

---

#### T-015 — Public layout + navbar `[x]`

**Sub-tasks**
- [x] Create `app/(public)/layout.js`
- [x] Create `components/public/PublicNavbar.js` with links: Home, Menu, Order, Reserve
- [x] Add simple footer

**Acceptance criteria**
- [x] All public pages share navbar and footer
- [x] Navbar links route correctly
- [x] Layout is mobile-friendly (collapsible or stacked links)

**Depends on:** T-004, T-014

---

#### T-016 — Dashboard sidebar + shell `[x]`

**Sub-tasks**
- [x] Create `components/dashboard/Sidebar.js` with nav: Dashboard, Menu, Tables, Orders, Reservations, Billing, Staff
- [x] Create `components/dashboard/DashboardNavbar.js` with logout button
- [x] Wire sidebar into `(dashboard)/layout.js`

**Acceptance criteria**
- [x] All dashboard routes accessible from sidebar
- [x] Active route highlighted
- [x] Logout returns user to `/login`

**Depends on:** T-012, T-014

---

## Epic 3 — Menu

### US-C01: As a customer, I want to browse the menu so I can decide what to order

### US-A03: As a manager, I want to manage menu items so the catalog stays up to date

#### T-017 — Menu API (CRUD) `[ ]`

**Sub-tasks**
- [ ] `GET /api/menu-items` — public, list all (optional filter `?available=true`)
- [ ] `POST /api/menu-items` — admin, create item
- [ ] `PATCH /api/menu-items/:id` — admin, update item
- [ ] `DELETE /api/menu-items/:id` — admin, delete item
- [ ] Validate required fields: name, price, category; reject negative price

**Acceptance criteria**
- [ ] CRUD works via curl or API client
- [ ] Invalid body returns 400 with `{ error: "..." }`
- [ ] Admin routes require auth (T-013)

**Depends on:** T-002, T-013

---

#### T-018 — Menu indexes on startup `[ ]`

**Sub-tasks**
- [ ] Create indexes on `menuItems`: `{ category: 1 }`, `{ available: 1 }`

**Acceptance criteria**
- [ ] Indexes created idempotently on server start (ignore if exists)

**Depends on:** T-017

---

#### T-019 — Admin menu page `[ ]`

**Sub-tasks**
- [ ] Build `/dashboard/menu` with DataTable listing all items
- [ ] Create `components/dashboard/MenuItemForm.js` for add/edit modal
- [ ] Toggle `available`, delete with confirmation

**Acceptance criteria**
- [ ] Manager/admin can create, edit, delete menu items
- [ ] Table shows name, category, price, available badge
- [ ] Form validation errors shown inline

**Depends on:** T-005, T-016, T-017

---

#### T-020 — Customer menu page `[ ]`

**Sub-tasks**
- [ ] Build `/menu` grouped by category
- [ ] Create `components/public/MenuCard.js` and `MenuCategorySection.js`
- [ ] Hide or grey out unavailable items
- [ ] Link to `/order`

**Acceptance criteria**
- [ ] Items grouped by category from API
- [ ] Prices and descriptions display correctly
- [ ] "Order now" navigates to `/order`
- [ ] Page works on mobile

**Depends on:** T-015, T-017

---

## Epic 4 — Tables

### US-C02: As a customer, I want to pick an available table when placing an order

### US-A04: As staff, I want to manage tables and see floor status

#### T-021 — Tables API `[ ]`

**Sub-tasks**
- [ ] `GET /api/tables` — admin, list all
- [ ] `GET /api/tables/available` — public, filter `status: "available"`
- [ ] `POST /api/tables` — admin, create (number, capacity)
- [ ] `PATCH /api/tables/:id` — admin, update number/capacity/status
- [ ] Enforce unique table `number`

**Acceptance criteria**
- [ ] Available endpoint returns only `available` tables
- [ ] Duplicate table number returns 400
- [ ] Status values restricted to `available | occupied | reserved`

**Depends on:** T-002, T-013

---

#### T-022 — Tables indexes on startup `[ ]`

**Sub-tasks**
- [ ] Unique index on `tables.number`

**Acceptance criteria**
- [ ] Index created on server start

**Depends on:** T-021

---

#### T-023 — Admin tables page `[ ]`

**Sub-tasks**
- [ ] Build `/dashboard/tables`
- [ ] Create `components/dashboard/TableGrid.js` showing number, capacity, status badge
- [ ] Add table form; manual status override dropdown

**Acceptance criteria**
- [ ] All tables visible with status badges
- [ ] Admin can add table and change status
- [ ] Summary counts shown (available / occupied / reserved)

**Depends on:** T-016, T-021

---

#### T-024 — TablePicker component `[ ]`

**Sub-tasks**
- [ ] Create `components/public/TablePicker.js`
- [ ] Fetch available tables; show number and capacity
- [ ] Emit selected `tableId` to parent form

**Acceptance criteria**
- [ ] Only available tables listed
- [ ] Selection state clear to user
- [ ] Reusable on `/order` page

**Depends on:** T-021

---

## Epic 5 — Orders

### US-C02: As a customer, I want to place an order at my table

### US-W01: As a waiter, I want to track and update order status

#### T-025 — Orders API `[ ]`

**Sub-tasks**
- [ ] `GET /api/orders` — admin, list with optional `?status=` filter
- [ ] `POST /api/orders` — public, create order (tableId, items[], optional customerName, notes)
- [ ] `PATCH /api/orders/:id` — admin, update order fields
- [ ] `PATCH /api/orders/:id/status` — admin, advance status
- [ ] Snapshot item name and price from `menuItems` on create; compute subtotal

**Acceptance criteria**
- [ ] Order stores item price snapshot (immune to later menu edits)
- [ ] Creating order sets linked table to `occupied`
- [ ] Invalid tableId or empty items returns 400

**Depends on:** T-017, T-021, T-013

---

#### T-026 — Order status transitions + table updates `[ ]`

**Sub-tasks**
- [ ] Define valid transitions in `index.js`: pending → preparing → served → billed → paid
- [ ] Reject invalid status jumps with 400
- [ ] On transition to `paid`, set table to `available`

**Acceptance criteria**
- [ ] Cannot skip statuses (e.g. pending → served)
- [ ] Status constants match `lib/constants.js`
- [ ] Table freed only when order reaches `paid`

**Depends on:** T-025

---

#### T-027 — Orders indexes on startup `[ ]`

**Sub-tasks**
- [ ] Index on `{ status: 1, createdAt: -1 }`

**Acceptance criteria**
- [ ] Index created on server start

**Depends on:** T-025

---

#### T-028 — Admin orders page `[ ]`

**Sub-tasks**
- [ ] Build `/dashboard/orders` with filter tabs or dropdown by status
- [ ] Create `components/dashboard/OrderList.js` with advance-status action
- [ ] Show table number, items summary, subtotal, status badge

**Acceptance criteria**
- [ ] Staff can filter orders by status
- [ ] One-click (or dropdown) status advance works
- [ ] Link to generate bill when status is `served` (wired in T-037)

**Depends on:** T-016, T-025, T-026

---

#### T-029 — Customer order page `[ ]`

**Sub-tasks**
- [ ] Build `/order` multi-step or single-page flow
- [ ] Create `components/public/OrderCart.js` (add/remove items, qty)
- [ ] Integrate TablePicker; submit to POST /api/orders
- [ ] Success screen with order summary

**Acceptance criteria**
- [ ] User selects table, adds menu items, submits order
- [ ] Success shows table number and order id
- [ ] Validation: cannot submit empty cart or no table
- [ ] Error alerts on API failure

**Depends on:** T-020, T-024, T-025

---

## Epic 6 — Reservations

### US-C03: As a customer, I want to book a table in advance

### US-A06: As a manager, I want to confirm and manage reservations

#### T-030 — Reservations API `[ ]`

**Sub-tasks**
- [ ] `GET /api/reservations` — admin, list with optional date/status filter
- [ ] `POST /api/reservations` — public, create (customerName, phone, partySize, dateTime, notes)
- [ ] `PATCH /api/reservations/:id` — admin, update status / assign tableId
- [ ] New reservations default to `pending`

**Acceptance criteria**
- [ ] Public POST creates pending reservation only
- [ ] Required field validation on create
- [ ] Admin PATCH can set status and tableId

**Depends on:** T-002, T-013

---

#### T-031 — Reservation status + table logic `[ ]`

**Sub-tasks**
- [ ] On confirm: set status `confirmed`, assign tableId, set table `reserved`
- [ ] Validate partySize ≤ table capacity on confirm
- [ ] On cancel: set status `cancelled`, release table to `available`
- [ ] On seated: set status `seated`

**Acceptance criteria**
- [ ] Confirm without valid table returns 400
- [ ] Cancel releases reserved table
- [ ] Status transitions match [`features.MD`](features.MD)

**Depends on:** T-030, T-021

---

#### T-032 — Admin reservations page `[ ]`

**Sub-tasks**
- [ ] Build `/dashboard/reservations`
- [ ] Create `components/dashboard/ReservationList.js`
- [ ] Actions: confirm (with table picker), cancel, mark seated

**Acceptance criteria**
- [ ] List shows customer, phone, party size, dateTime, status
- [ ] Confirm opens table assignment (capacity check surfaced)
- [ ] Filters by date or status

**Depends on:** T-016, T-030, T-031

---

#### T-033 — Customer reserve page `[ ]`

**Sub-tasks**
- [ ] Build `/reserve`
- [ ] Create `components/public/ReservationForm.js`
- [ ] Submit to POST /api/reservations; show success message

**Acceptance criteria**
- [ ] Form collects name, phone, party size, date, time, optional notes
- [ ] Success message explains confirmation is pending
- [ ] Validation errors displayed with DaisyUI alerts

**Depends on:** T-015, T-030

---

## Epic 7 — Billing

### US-C04: As a customer, I want to view my bill

### US-W02: As a waiter, I want to generate bills and record payment

#### T-034 — Billing API `[ ]`

**Sub-tasks**
- [ ] `GET /api/bills` — admin, list with optional paymentStatus filter
- [ ] `GET /api/bills/:id` — public, single bill
- [ ] `POST /api/bills` — admin, create from orderId
- [ ] `PATCH /api/bills/:id/pay` — admin, mark paid

**Acceptance criteria**
- [ ] One bill per order (duplicate POST returns 400)
- [ ] Public can view bill by id
- [ ] Admin routes require auth

**Depends on:** T-025, T-013

---

#### T-035 — Bill generation + tax calculation `[ ]`

**Sub-tasks**
- [ ] Only allow bill creation when order status is `served`
- [ ] Copy line items from order; compute subtotal, tax (`TAX_RATE` constant), total
- [ ] On create: set order status to `billed`
- [ ] On pay: set paymentStatus `paid`, order status `paid`, table `available`, set `paidAt`

**Acceptance criteria**
- [ ] Tax and total calculated correctly
- [ ] Full chain served → billed → paid → table available works
- [ ] `TAX_RATE` defined in `server/index.js`

**Depends on:** T-034, T-026

---

#### T-036 — Bills indexes on startup `[ ]`

**Sub-tasks**
- [ ] Unique index on `bills.orderId`
- [ ] Index on `{ paymentStatus: 1 }`

**Acceptance criteria**
- [ ] Indexes created on server start

**Depends on:** T-034

---

#### T-037 — Admin billing page `[ ]`

**Sub-tasks**
- [ ] Build `/dashboard/billing`
- [ ] Create `components/dashboard/BillList.js`
- [ ] Actions: generate bill (from served orders), mark paid
- [ ] Filter unpaid / paid

**Acceptance criteria**
- [ ] Unpaid bills listed with total and table/order ref
- [ ] Generate bill action available for served orders without bill
- [ ] Mark paid updates list without page reload (or refreshes data)

**Depends on:** T-016, T-034, T-035

---

#### T-038 — Customer bill view page `[ ]`

**Sub-tasks**
- [ ] Build `/bill/[id]`
- [ ] Create `components/public/BillSummary.js`
- [ ] Show line items, subtotal, tax, total, payment status (read-only)

**Acceptance criteria**
- [ ] Valid bill id renders full summary
- [ ] Invalid id shows friendly error / EmptyState
- [ ] Payment status clearly indicated (paid vs unpaid)

**Depends on:** T-015, T-034

---

## Epic 8 — Staff & Dashboard

### US-A02: As admin, I want a dashboard overview of today's operations

### US-A08: As admin, I want to manage staff records

#### T-039 — Staff API `[x]`

**Sub-tasks**
- [x] `GET /api/staff` — admin, list all
- [x] `POST /api/staff` — admin, create (name, email, role, active)
- [x] `PATCH /api/staff/:id` — admin, update fields
- [x] Enforce unique email; roles: admin, manager, waiter

**Acceptance criteria**
- [x] CRUD works for admin user
- [x] Duplicate email returns 400
- [x] Deactivate via `active: false` (no hard delete required)

**Depends on:** T-013

---

#### T-040 — Admin staff page `[x]`

**Sub-tasks**
- [x] Build `/dashboard/staff`
- [x] Create `components/dashboard/StaffForm.js` for add/edit
- [x] Show role badge and active status

**Acceptance criteria**
- [x] Admin can add, edit, deactivate staff
- [x] Role displayed as badge (admin / manager / waiter)
- [x] Non-admin users blocked (when role checks added later)

**Depends on:** T-016, T-039

---

#### T-041 — Dashboard stats API `[ ]`

**Sub-tasks**
- [ ] `GET /api/dashboard/stats` — admin
- [ ] Return: openOrdersCount, todayReservationsCount, unpaidBillsCount, todayRevenue

**Acceptance criteria**
- [ ] Counts accurate against live data
- [ ] `todayRevenue` sums `paid` bills created today
- [ ] Requires admin auth

**Depends on:** T-025, T-030, T-034, T-013

---

#### T-042 — Dashboard overview page `[ ]`

**Sub-tasks**
- [ ] Build `/dashboard` (overview)
- [ ] Create `components/dashboard/StatCard.js`
- [ ] Show recent pending orders and upcoming reservations lists

**Acceptance criteria**
- [ ] Four stat cards populated from stats API
- [ ] Quick-link or short lists for actionable items
- [ ] Loads with loading spinner; errors show alert

**Depends on:** T-016, T-041

---

## Epic 9 — Home & Polish

### US-C05: As a customer, I want a welcoming home page that guides me to key actions

#### T-043 — Customer home page `[x]`

**Sub-tasks**
- [x] Build `/` with restaurant name, welcome copy
- [x] Action cards linking to Menu, Order, Reserve
- [ ] Optional: fetch and show 3 featured available menu items

**Acceptance criteria**
- [x] Clear calls-to-action for all three customer flows
- [x] Consistent with public layout navbar
- [x] Mobile-friendly card grid

**Depends on:** T-015, T-020 (optional featured items)

---

#### T-044 — Loading + error states `[ ]`

**Sub-tasks**
- [ ] Add `loading.js` for heavy dashboard pages (orders, reservations, billing)
- [ ] Add `error.js` for dashboard route group or key pages
- [ ] Ensure customer forms show API errors via alerts

**Acceptance criteria**
- [ ] No blank screens during data fetch
- [ ] Errors human-readable, not raw stack traces
- [ ] LoadingSpinner or DaisyUI skeleton used consistently

**Depends on:** All page tasks

---

#### T-045 — Mobile responsive pass `[ ]`

**Sub-tasks**
- [ ] Verify all tables use `overflow-x-auto`
- [ ] Sidebar collapses to drawer or top nav on small screens
- [ ] Forms and cards stack vertically on mobile

**Acceptance criteria**
- [ ] Usable at 375px viewport width
- [ ] No horizontal page overflow on customer pages
- [ ] Dashboard navigable on tablet and phone

**Depends on:** All page tasks

---

#### T-046 — End-to-end smoke test checklist `[ ]`

**Sub-tasks**
- [ ] Document manual test script in this file (see below)
- [ ] Run full flow: menu → order → serve → bill → pay → table free
- [ ] Run reservation flow: request → confirm → seated
- [ ] Verify auth blocks unauthenticated dashboard access

**Acceptance criteria**
- [ ] All smoke tests pass locally
- [ ] Checklist appended to this document under **Smoke Tests**
- [ ] Any failures filed as follow-up notes in **Blockers**

**Depends on:** T-001 through T-045

---

## Dependency graph (simplified)

```mermaid
flowchart TD
  T001[T-001 Server scaffold] --> T002[T-002 MongoDB]
  T003[T-003 Client scaffold] --> T004[T-004 Routes]
  T004 --> T005[T-005 API client]
  T002 --> T017[T-017 Menu API]
  T013[T-013 Admin auth] --> T017
  T017 --> T020[T-020 Customer menu]
  T017 --> T019[T-019 Admin menu]
  T021[T-021 Tables API] --> T029[T-029 Customer order]
  T025[T-025 Orders API] --> T029
  T025 --> T034[T-034 Billing API]
  T034 --> T038[T-038 Bill view]
  T041[T-041 Stats API] --> T042[T-042 Dashboard]
```

**Recommended execution order:** Batch 1 → Batch 2 → Batch 3 → Batch 4 → Batch 5 → Batch 6 → Batch 7 → Batch 8 → Batch 9 → Batch 10

See **Batch Progress** at the top of this file for task ranges and current status.

---

## Smoke tests (complete when T-046 is done)

| # | Steps | Pass |
|---|---|---|
| S-1 | Open `/menu` — items load by category | `[ ]` |
| S-2 | Open `/order` — pick table, add items, submit — table becomes occupied | `[ ]` |
| S-3 | `/dashboard/orders` — advance order to served | `[ ]` |
| S-4 | `/dashboard/billing` — generate bill, mark paid — table available | `[ ]` |
| S-5 | Open `/bill/[id]` — bill displays correctly | `[ ]` |
| S-6 | `/reserve` — submit reservation — appears as pending in dashboard | `[ ]` |
| S-7 | Confirm reservation with table — table becomes reserved | `[ ]` |
| S-8 | `/login` — auth required for `/dashboard/*` | `[ ]` |
| S-9 | `/dashboard/staff` — CRUD staff record | `[ ]` |
| S-10 | `/dashboard` — stats match current data | `[ ]` |

---

## Blockers & notes

| Date | Task | Note |
|---|---|---|
| — | — | No blockers yet |

---

## Post-MVP backlog (not numbered — out of scope for v1)

- Role-based UI per Waiter/Manager matrix ([`features.MD`](features.MD) §2)
- Link `staff.email` to Better Auth user ids
- Customer accounts and order history
- Email/SMS reservation confirmations
- Payment gateway integration
- Kitchen display view for `preparing` orders

---

## Agent instructions (for task execution)

When the user says **"Execute Batch N"** or **"Execute T-0XX"** (or a range):

1. Mark the batch as `[~]` **In progress** in **Batch Progress** (if executing a full batch).
2. Mark each T-0XX as `[~]` in this file (Progress Summary + task heading).
3. Read dependencies — complete prerequisite batches/tasks first if still `[ ]`.
4. Implement per acceptance criteria and [`.cursorrules`](.cursorrules).
5. Mark all sub-task checkboxes and acceptance criteria `[x]` when met.
6. Mark each T-0XX as `[x]`; update **Progress Summary** counts.
7. When all tasks in a batch are `[x]`, update **Batch Progress**: set Progress column (e.g. `9 / 9`), Status to `[x]` **Done**, and add **Completed** date on the batch detail.
8. Update **Batches complete** count (e.g. `2 / 10`) and **Last updated** date.
9. Set **Recommended next step** to the next incomplete batch.
10. If blocked, leave batch/task as `[~]`, add a row to **Blockers & notes**.

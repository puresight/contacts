# Contacts & CRM Architecture Specification

## 0. Status

### Done

What was implemented in Bolt.new

#### Core Architecture & Storage

- **Local-First Persistence:** Dexie.js (IndexedDB) client database with tables for `workspaces`, `contacts`, `interactions`, and `entityLinks`.
- **Conflict-Free Identifiers:** All entities use client-generated UUIDs (`crypto.randomUUID()`) alongside `createdAt`, `updatedAt`, `isDeleted` (soft-delete flag), and `synced` flags.
- **Autonomous Execution:** Runs 100% offline with initial seed data; no hard authentication dependency.

#### Contact Modeling & Forms

- **Multi-Value Labeled Fields:** Dynamic collections (0 to 4+ entries each) with custom labels:
  - Emails (`home`, `work`, `other`)
  - Phones (`mobile`, `work`, `home`, `other`)
  - URLs (`website`, `portfolio`, `payment`, `other`)
  - Addresses (`street`, `city`, `state`, `postalCode`, `country` with `home`, `work`, `shipping` labels)
  - Dates (`birthday`, `anniversary`, `death`, `transaction`, `other` with relative hints)
- **Stage Selection:** Visual Material 3 tonal selection for pipeline stages (`lead`, `prospect`, `active`, `churned`, `personal`), clearly indicating default and active states.

#### UI/UX, Search & Theming

- **Mobile & Desktop Shell:** Fixed bottom navigation on mobile; collapsible sidebar and split-pane layout on desktop viewports.
- **Action Anchors:** Mobile bottom-right FAB paired with a persistent desktop Extended FAB and top-header "+ New Contact" action.
- **Search UX:** Instant search bar with a standard `X` clear button and zero-results fallback offering a one-tap "Create contact '[query]'" trigger.
- **List Item Controls:** Direct contact cards display conditional call (`tel:`) and email (`mailto:`) triggers based on stored data; the destructive action was removed from list rows to prevent accidental taps.
- **Destructive Confirmation:** Trash icon (`Trash2`) on contact detail sheets triggers an explicit M3 confirmation modal before soft-deleting.
- **Global Theme Synchronization:** Centralized `ThemeContext` provider binding a single cycling button (`Monitor` $\rightarrow$ `Sun` $\rightarrow$ `Moon`) in the header directly with the Settings controls, persisting to `localStorage` and reacting to OS color scheme shifts.
- **Avatar Resolution & Gradients:** Federated avatar lookups via Unavatar with silent error handling, falling back to deterministic multi-hue mesh/linear gradients derived from contact initials with contrast-clamped lightness (30%–36%).
- **Audit & Performance Fixes:** Applied semantic `<main>`, `<header>`, and `<nav>` landmarks, 48px touch targets with `pb-safe` offsets, static `robots.txt`, and WCAG AA contrast adjustments for dark mode.

### TODO

Not Yet Implemented

#### Cloudflare Edge & Synchronization Engine

- **Hono Edge API Router:** Implementation of Cloudflare Worker API routes (`/api/contacts`, `/api/interactions`, `/api/sync`) serving static SPA assets and managing JSON payloads.
- **D1 Schema Migrations:** Deployment of the matching SQL schema to Cloudflare D1.
- **Bidirectional Sync Worker:** Delta-sync mechanism reconciling records where `synced === 0` against D1 using `updatedAt` timestamps and soft-delete tombstones (`isDeleted === true`).

#### Authentication & Tenant Isolation

- **SSO Integration:** Parent-domain HttpOnly dual-cookie reader middleware in the Hono Worker to validate session JWTs and inject `user_id` and `workspace_id`.
- **Workspace Boundary Enforcement:** Enforcing strict `WHERE workspace_id = ?` scoping across all remote edge read/write queries.

#### Cross-App Suite Linkages (Active Handshakes)

- **Calendar Handshake:** Automated pipeline feeding labeled dates (`birthday`, `anniversary`) to the Calendar app's "Milestones" category.
- **Kanban Link Handshake:** Active card selection and bi-directional resolution between contacts and task cards (`linkedContactIds` $\leftrightarrow$ `entity_links`).
- **Chat Resolution:** Direct participant profile lookups by UUID across messaging threads.

---

## 1. System Overview

The Contacts/CRM application is an offline-first, edge-ready relationship management platform designed for personal productivity and small business startup workflows.

The application operates as a standalone client-side system while maintaining strict data and schema compatibility with a broader personal productivity suite (alongside Calendar, Kanban, and Chat applications). It is architected for initial local execution in modern web browsers, with downstream deployment targets on Cloudflare Workers and Cloudflare D1.

```txt
┌────────────────────────────────────────────────────────┐
│                      Browser / PWA                     │
│               React + Tailwind + Lucide                │
└──────────────────────────┬─────────────────────────────┘
│ Reactive useLiveQuery & Context
▼
┌────────────────────────────────────────────────────────┐
│             Local Store: Dexie.js (IndexedDB)          │
│  - workspaces                                          │
│  - contacts (multi-value labeled fields)               │
│  - interactions (touchpoint timeline)                  │
│  - entity_links (cross-suite linkage stubs)            │
└──────────────────────────┬─────────────────────────────┘
│ (Turn 2/3 Sync Engine)
▼
┌────────────────────────────────────────────────────────┐
│            Cloudflare Worker Edge API (Hono)           │
│  - Session validation via parent-domain HttpOnly cookie│
│  - Scoped workspace multi-tenancy                      │
│  - Cloudflare D1 SQLite relational storage             │
└────────────────────────────────────────────────────────┘
```

---

## 2. Core Architectural Pillars

### Local-First Persistence & Query Reactivity

- **IndexedDB via Dexie.js:** The browser database is the primary source of truth. All CRUD operations mutate IndexedDB directly.
- **Fine-Grained Subscriptions:** Components bind to database state using Dexie's `useLiveQuery` hook, ensuring re-renders occur strictly when observed entity collections or index ranges change.
- **Offline Autonomy:** Operates 100% offline with zero remote service requirements for standard functionality. Outgoing mutations set incremental sync flags (`synced: 0`) and track timestamps for eventual edge reconciliation.

### Downstream Cloudflare Edge Integration

- **Worker + D1 Model:** Designed to be served as static SPA assets alongside a lightweight Hono API router on a Cloudflare Worker, binding to Cloudflare D1 (SQLite) at the edge.
- **Cross-Domain SSO Consumption:** Authentication is deferred during local prototyping. The production architecture expects a centralized SSO Hub that issues a dual-cookie session (HttpOnly session + refresh tokens) scoped to the parent root domain (e.g., `.domain.cc`).
- **Context Injection:** When deployed to Hono, edge middleware parses session claims, verifies workspace membership, and injects `user_id` and `workspace_id` into route contexts to enforce tenant isolation.

---

## 3. Data Models & Schemas

All primary keys use string UUIDs (`crypto.randomUUID()`) to prevent identifier collisions during distributed, offline record generation.

### Client-Side IndexedDB Schema (TypeScript / Dexie.js)

```typescript
export type Stage = "lead" | "prospect" | "active" | "churned" | "personal";
export type FieldLabel =
  | "home"
  | "work"
  | "mobile"
  | "shipping"
  | "payment"
  | "other"
  | string;
export type DateLabel =
  | "birthday"
  | "anniversary"
  | "death"
  | "transaction"
  | "renewal"
  | "other"
  | string;

export interface LabeledValue {
  id: string;
  label: FieldLabel;
  value: string;
}

export interface LabeledAddress {
  id: string;
  label: FieldLabel;
  street: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface LabeledDate {
  id: string;
  label: DateLabel;
  date: string; // ISO format: YYYY-MM-DD
}

export interface Workspace {
  id: string;
  name: string;
  type: "personal" | "startup";
  createdAt: number;
}

export interface Contact {
  id: string;
  workspaceId: string;
  firstName: string;
  lastName: string;
  company?: string;
  title?: string;
  stage: Stage;
  tags: string[];
  avatarUrl?: string;

  // Dynamic multi-entry collections (0 to 4+ items)
  emails: LabeledValue[];
  phones: LabeledValue[];
  urls: LabeledValue[];
  addresses: LabeledAddress[];
  dates: LabeledDate[];

  createdAt: number;
  updatedAt: number;
  isDeleted: boolean; // Soft delete flag for sync conflict resolution
  synced: number; // 0 = pending sync, 1 = synced
}

export interface Interaction {
  id: string;
  workspaceId: string;
  contactId: string;
  authorUserId: string;
  type: "note" | "call" | "email" | "meeting" | "task";
  summary: string;
  details?: string;
  happenedAt: number;
  createdAt: number;
  updatedAt: number;
  isDeleted: boolean;
  synced: number;
}

export interface EntityLink {
  id: string;
  workspaceId: string;
  contactId: string;
  targetApp: "calendar" | "kanban" | "chat";
  targetEntityId: string;
  label: string;
  createdAt: number;
}
```

### Relational D1 Database Schema (Cloudflare SQLite)

```sql
CREATE TABLE workspaces (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('personal', 'startup')),
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE workspace_members (
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    PRIMARY KEY (workspace_id, user_id)
);

CREATE TABLE contacts (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT,
    company TEXT,
    title TEXT,
    stage TEXT NOT NULL DEFAULT 'lead' CHECK (stage IN ('lead', 'prospect', 'active', 'churned', 'personal')),
    avatar_url TEXT,
    tags JSON DEFAULT '[]',
    emails JSON DEFAULT '[]',
    phones JSON DEFAULT '[]',
    urls JSON DEFAULT '[]',
    addresses JSON DEFAULT '[]',
    dates JSON DEFAULT '[]',
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
    is_deleted INTEGER NOT NULL DEFAULT 0,
    synced INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE interactions (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    contact_id TEXT NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    author_user_id TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('note', 'call', 'email', 'meeting', 'task')),
    summary TEXT NOT NULL,
    details TEXT,
    happened_at INTEGER NOT NULL DEFAULT (unixepoch()),
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
    is_deleted INTEGER NOT NULL DEFAULT 0,
    synced INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE entity_links (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    contact_id TEXT NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    target_app TEXT NOT NULL,
    target_entity_id TEXT NOT NULL,
    label TEXT NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX idx_contacts_workspace ON contacts(workspace_id, stage, is_deleted);
CREATE INDEX idx_contacts_updated ON contacts(workspace_id, updated_at);
CREATE INDEX idx_interactions_timeline ON interactions(workspace_id, contact_id, happened_at DESC);
```

---

## 4. UI/UX & Interaction Architecture

### Responsive Viewport Strategy

- **Mobile (`< 768px`):** Single-pane layout with bottom navigation (`Contacts`, `Pipeline`, `Activity`, `Settings`). Tapping a contact slides over a full-screen details view. Floating Action Button (FAB) anchored bottom-right, respecting safe-area insets (`env(safe-area-inset-bottom)`).
- **Desktop (`>= 768px`):** Split two-pane interface. Left column contains a collapsible navigation rail and scrollable contact directory. Right column serves as a persistent contact detail panel with an interaction timeline and quick-edit controls. An Extended FAB is anchored in the left sidebar.

### Material 3 (M3) Design System

- **Tonal Elevation:** Surface depth is communicated via surface-container color steps (`slate-50` through `slate-950`) rather than harsh drop shadows.
- **Expressive Shapes:** Capsule pills (`rounded-full`) for status chips, filter selectors, and FABs; rounded cards (`rounded-2xl` to `rounded-3xl`) for list items and slide-over sheets.
- **Touch Target Compliance:** All interactive buttons, action icons, and tab triggers strictly enforce a minimum touch target size of 48px × 48px.

### Avatar Resolution & Deterministic Multi-Hue Gradients

Avatars resolve through a two-tiered system:

1. **Directory Lookup:** Tries public avatars via `https://unavatar.io/{email}`.
2. **Deterministic Mesh Gradient Fallback:** When no photo is available or network loading fails (`onError`), an HSL gradient avatar is computed deterministically:

- **Primary Hue ($0^\circ - 360^\circ$):** Derived from the hash of the contact's family name initial.
- **Accent Hue:** Primary Hue + $45^\circ$ to $60^\circ$ (or first name initial).
- **Luminance Clamping:** Lightness is constrained to 30%–36% to guarantee white initials always meet WCAG AA contrast ratios ($\ge 4.5:1$).

---

## 5. State Management & Event Bus

The application separates state into three distinct layers to avoid UI thrashing and re-render cascades:

| State Layer            | Scope                                                             | Mechanism                                                 |
| ---------------------- | ----------------------------------------------------------------- | --------------------------------------------------------- |
| **Global Shell State** | Theme preference (`light`, `dark`, `system`), active workspace ID | **React Context** (`ThemeProvider`, `WorkspaceProvider`)  |
| **Domain State**       | Contacts, interactions, search indexing, sync queues              | **Dexie.js + `useLiveQuery**` directly querying IndexedDB |
| **Transient Events**   | Notifications, sync triggers, cross-app dispatch                  | Browser `window.dispatchEvent(new CustomEvent(...))`      |

### Theme Management Lifecycle

- The `ThemeProvider` manages `'light' | 'dark' | 'system'` state.
- Defaults to `'system'`, reading from and syncing to `localStorage.getItem('ilife-crm-theme')`.
- Binds an active listener to `window.matchMedia('(prefers-color-scheme: dark)')` to reactively update the `.dark` class on `document.documentElement` without page refreshes when the operating system theme shifts.
- Header button and Settings controls consume the identical context, guaranteeing bidirectional synchronization.

---

## 6. Cross-Suite Integration Contracts

To operate within the suite ecosystem, the CRM exposes and consumes standardized link interfaces:

- **Calendar Integration:** Exposes labeled dates (e.g., `birthday`, `anniversary`) to the Calendar app, enabling automatic generation of all-day recurring annual milestone events.
- **Kanban Integration:** Tasks in the Kanban app bind to `contactId`. The CRM detail sheet provides an "Associated Tasks" container linked by `entity_links`.
- **Chat Integration:** Direct message threads in the Chat application bind participant identifiers directly to CRM contact UUIDs, sharing avatar presentation and communication profiles.

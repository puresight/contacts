import Dexie, { type Table } from 'dexie';

export type Stage = 'lead' | 'prospect' | 'active' | 'personal';

export type EmailLabel = 'work' | 'home' | 'other';
export type PhoneLabel = 'mobile' | 'work' | 'home' | 'other';
export type UrlLabel = 'work' | 'website' | 'portfolio' | 'payment' | 'other';
export type AddressLabel = 'home' | 'work' | 'shipping' | 'other';
export type DateLabel = 'birthday' | 'anniversary' | 'death' | 'transaction' | 'other';

export interface LabeledEmail {
  id: string;
  label: EmailLabel;
  value: string;
}

export interface LabeledPhone {
  id: string;
  label: PhoneLabel;
  value: string;
}

export interface LabeledUrl {
  id: string;
  label: UrlLabel;
  value: string;
}

export interface LabeledAddress {
  id: string;
  label: AddressLabel;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface LabeledDate {
  id: string;
  label: DateLabel;
  date: string;
}

export interface Workspace {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  synced: 0 | 1;
}

export interface Contact {
  id: string;
  workspaceId: string;
  name: string;
  emails: LabeledEmail[];
  phones: LabeledPhone[];
  urls: LabeledUrl[];
  addresses: LabeledAddress[];
  dates: LabeledDate[];
  company: string;
  title: string;
  stage: Stage;
  tags: string[];
  notes: string;
  value: number;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  synced: 0 | 1;
}

export type InteractionKind = 'note' | 'call' | 'email' | 'meeting';

export interface Interaction {
  id: string;
  contactId: string;
  kind: InteractionKind;
  summary: string;
  occurredAt: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  synced: 0 | 1;
}

export type LinkKind = 'calendar' | 'kanban' | 'photo';

export interface EntityLink {
  id: string;
  contactId: string;
  kind: LinkKind;
  label: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  synced: 0 | 1;
}

export class CrmDatabase extends Dexie {
  workspaces!: Table<Workspace, string>;
  contacts!: Table<Contact, string>;
  interactions!: Table<Interaction, string>;
  entityLinks!: Table<EntityLink, string>;

  constructor() {
    super('crm-db');
    this.version(1).stores({
      workspaces: 'id, name',
      contacts: 'id, workspaceId, name, company, stage, updatedAt, isDeleted',
      interactions: 'id, contactId, kind, occurredAt, isDeleted',
      entityLinks: 'id, contactId, kind, isDeleted',
    });
    this.version(2)
      .stores({
        contacts: 'id, workspaceId, name, company, stage, updatedAt, isDeleted',
      })
      .upgrade((tx) => {
        return tx
          .table('contacts')
          .toCollection()
          .modify((rec: Record<string, unknown>) => {
            const legacy = rec as {
              email?: string;
              phone?: string;
            };
            if (!Array.isArray(rec.emails)) {
              rec.emails = legacy.email
                ? [{ id: uuid(), label: 'other', value: legacy.email }]
                : [];
            }
            if (!Array.isArray(rec.phones)) {
              rec.phones = legacy.phone
                ? [{ id: uuid(), label: 'mobile', value: legacy.phone }]
                : [];
            }
            if (!Array.isArray(rec.urls)) rec.urls = [];
            if (!Array.isArray(rec.addresses)) rec.addresses = [];
            if (!Array.isArray(rec.dates)) rec.dates = [];
          });
      });
  }
}

export const db = new CrmDatabase();

function uuid() {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export { uuid };

const now = () => new Date().toISOString();

export async function ensureSeeded(): Promise<void> {
  const count = await db.contacts.count();
  if (count > 0) return;

  const workspaceId = uuid();
  const contactIds = [uuid(), uuid(), uuid()];

  const workspace: Workspace = {
    id: workspaceId,
    name: 'Personal Workspace',
    color: '#6366f1',
    createdAt: now(),
    updatedAt: now(),
    isDeleted: false,
    synced: 0,
  };

  const contacts: Contact[] = [
    {
      id: contactIds[0],
      workspaceId,
      name: 'Maya Chen',
      emails: [
        { id: uuid(), label: 'work', value: 'maya.chen@brightloop.io' },
        { id: uuid(), label: 'other', value: 'maya.personal@gmail.com' },
      ],
      phones: [
        { id: uuid(), label: 'mobile', value: '+1 (415) 555-0142' },
        { id: uuid(), label: 'work', value: '+1 (415) 555-0199' },
      ],
      urls: [{ id: uuid(), label: 'website', value: 'https://brightloop.io' }],
      addresses: [
        {
          id: uuid(),
          label: 'work',
          street: '500 Howard St',
          city: 'San Francisco',
          state: 'CA',
          postalCode: '94105',
          country: 'USA',
        },
      ],
      dates: [{ id: uuid(), label: 'birthday', date: '1990-10-24' }],
      company: 'Brightloop',
      title: 'Head of Partnerships',
      stage: 'active',
      tags: ['vip', 'saas'],
      notes: 'Prefers short intro emails. Coffee meeting worked well last time.',
      value: 12000,
      createdAt: now(),
      updatedAt: now(),
      isDeleted: false,
      synced: 0,
    },
    {
      id: contactIds[1],
      workspaceId,
      name: 'Daniel Okafor',
      emails: [{ id: uuid(), label: 'work', value: 'd.okafor@northbeam.com' }],
      phones: [{ id: uuid(), label: 'mobile', value: '+1 (512) 555-0198' }],
      urls: [],
      addresses: [],
      dates: [],
      company: 'Northbeam',
      title: 'Product Director',
      stage: 'prospect',
      tags: ['warm-intro'],
      notes: 'Met at SaaS North. Wants a pricing walkthrough next month.',
      value: 8000,
      createdAt: now(),
      updatedAt: now(),
      isDeleted: false,
      synced: 0,
    },
    {
      id: contactIds[2],
      workspaceId,
      name: 'Sofia Reyes',
      emails: [{ id: uuid(), label: 'home', value: 'sofia.reyes@gmail.com' }],
      phones: [{ id: uuid(), label: 'mobile', value: '+1 (312) 555-0117' }],
      urls: [],
      addresses: [],
      dates: [{ id: uuid(), label: 'birthday', date: '1987-03-12' }],
      company: '',
      title: '',
      stage: 'personal',
      tags: ['friend'],
      notes: 'No work topics.',
      value: 0,
      createdAt: now(),
      updatedAt: now(),
      isDeleted: false,
      synced: 0,
    },
  ];

  const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString();

  const interactions: Interaction[] = [
    {
      id: uuid(),
      contactId: contactIds[0],
      kind: 'meeting',
      summary: 'Quarterly check-in over coffee. Renewal on track, asked about the new reporting add-on.',
      occurredAt: minutesAgo(60 * 26),
      createdAt: now(),
      updatedAt: now(),
      isDeleted: false,
      synced: 0,
    },
    {
      id: uuid(),
      contactId: contactIds[0],
      kind: 'email',
      summary: 'Sent the reporting add-on one-pager.',
      occurredAt: minutesAgo(60 * 4),
      createdAt: now(),
      updatedAt: now(),
      isDeleted: false,
      synced: 0,
    },
    {
      id: uuid(),
      contactId: contactIds[1],
      kind: 'note',
      summary: 'Connected by Priya at SaaS North. Follow up with pricing tiers.',
      occurredAt: minutesAgo(60 * 72),
      createdAt: now(),
      updatedAt: now(),
      isDeleted: false,
      synced: 0,
    },
    {
      id: uuid(),
      contactId: contactIds[2],
      kind: 'call',
      summary: 'Caught up for 20 minutes, planning a weekend hike.',
      occurredAt: minutesAgo(60 * 24 * 6),
      createdAt: now(),
      updatedAt: now(),
      isDeleted: false,
      synced: 0,
    },
  ];

  await db.transaction('rw', db.workspaces, db.contacts, db.interactions, async () => {
    await db.workspaces.add(workspace);
    await db.contacts.bulkAdd(contacts);
    await db.interactions.bulkAdd(interactions);
  });
}

export function newContact(partial: Partial<Contact> & { workspaceId: string }): Contact {
  const t = now();
  return {
    id: uuid(),
    name: '',
    emails: [],
    phones: [],
    urls: [],
    addresses: [],
    dates: [],
    company: '',
    title: '',
    stage: 'lead',
    tags: [],
    notes: '',
    value: 0,
    isDeleted: false,
    synced: 0,
    createdAt: t,
    updatedAt: t,
    ...partial,
  };
}

export function newInteraction(contactId: string, kind: InteractionKind, summary: string): Interaction {
  const t = now();
  return {
    id: uuid(),
    contactId,
    kind,
    summary,
    occurredAt: t,
    isDeleted: false,
    synced: 0,
    createdAt: t,
    updatedAt: t,
  };
}

export function newEntityLink(contactId: string, kind: LinkKind, label: string): EntityLink {
  const t = now();
  return {
    id: uuid(),
    contactId,
    kind,
    label,
    isDeleted: false,
    synced: 0,
    createdAt: t,
    updatedAt: t,
  };
}

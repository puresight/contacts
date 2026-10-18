import { useEffect, useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  Users,
  LayoutGrid,
  Activity as ActivityIcon,
  Settings as SettingsIcon,
  Menu,
  PanelLeftClose,
  HardDrive,
} from 'lucide-react';
import { db } from '@/db/database';
import { useDbReady } from '@/hooks/useDbReady';
import { ContactsView } from '@/views/ContactsView';
import { PipelineView } from '@/views/PipelineView';
import { ActivityView } from '@/views/ActivityView';
import { SettingsView } from '@/views/SettingsView';
import { ContactFormModal, type ContactDraft } from '@/components/ContactFormModal';
import { ContactDetailPane } from '@/components/ContactDetailPane';
import { FabPlus, TonalButton } from '@/components/ui';
import { ThemeToggle } from '@/components/ThemeToggle';
import { newContact } from '@/db/database';
import { UserPlus, Download } from 'lucide-react';
import { useInstallPrompt } from '@/context/InstallPromptContext';

type Tab = 'contacts' | 'pipeline' | 'activity' | 'settings';

const TABS: Array<{ id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: 'contacts', label: 'Contacts', icon: Users },
  { id: 'pipeline', label: 'Pipeline', icon: LayoutGrid },
  { id: 'activity', label: 'Activity', icon: ActivityIcon },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
];

const NAV_CLASSES: Record<Tab, string> = {
  contacts: 'text-indigo-600',
  pipeline: 'text-indigo-600',
  activity: 'text-indigo-600',
  settings: 'text-indigo-600',
};

export function AppShell() {
  const { ready, error } = useDbReady();
  const [tab, setTab] = useState<Tab>('contacts');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [prefillName, setPrefillName] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const { canInstall, promptInstall } = useInstallPrompt();

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('action') === 'new-contact') {
      setEditing(null);
      setFormOpen(true);
    }
  }, []);

  const contacts = useLiveQuery(() => db.contacts.filter((c) => !c.isDeleted).toArray(), [], undefined);
  const interactions = useLiveQuery(
    () => db.interactions.filter((i) => !i.isDeleted).toArray(),
    [],
    undefined,
  );
  const links = useLiveQuery(() => db.entityLinks.filter((l) => !l.isDeleted).toArray(), [], undefined);
  const workspace = useLiveQuery(async () => {
    const all = await db.workspaces.filter((w) => !w.isDeleted).toArray();
    return all.sort((a, b) => a.createdAt.localeCompare(b.createdAt))[0] ?? null;
  }, [], undefined);

  const selected = useMemo(
    () => contacts?.find((c) => c.id === selectedId) ?? null,
    [contacts, selectedId],
  );

  const openContact = (id: string) => {
    setSelectedId(id);
    setMobileDetailOpen(true);
  };

  const openNewForm = (prefill?: string) => {
    setEditing(null);
    setPrefillName(prefill?.trim() ? prefill.trim() : null);
    setFormOpen(true);
  };

  const openEditForm = (id: string) => {
    setEditing(id);
    setFormOpen(true);
  };

  const submitForm = async (draft: ContactDraft) => {
    if (editing) {
      await db.contacts.update(editing, { ...draft, updatedAt: new Date().toISOString(), synced: 0 });
    } else {
      await db.contacts.add(
        newContact({ ...draft, workspaceId: workspace?.id ?? 'default-workspace' }),
      );
    }
    setFormOpen(false);
    setEditing(null);
  };

  if (error) {
    return (
      <CenterMessage
        title="Local storage unavailable"
        body="This app stores data in your browser, but the database failed to open. Try a private window without storage restrictions or another browser."
        detail={error}
      />
    );
  }

  if (!ready || contacts === undefined || interactions === undefined || links === undefined) {
    return (
      <CenterMessage
        title="Preparing your workspace…"
        body="Opening the local database and loading sample data."
        spinner
      />
    );
  }

  const detailPane = selected ? (
    <ContactDetailPane
      contact={selected}
      interactions={interactions.filter((i) => i.contactId === selected.id)}
      links={links.filter((l) => l.contactId === selected.id)}
      onClose={() => {
        setMobileDetailOpen(false);
        setSelectedId(null);
      }}
      onEdit={(c) => openEditForm(c.id)}
      onDeleted={() => {
        setSelectedId(null);
        setMobileDetailOpen(false);
      }}
    />
  ) : (
    <div className="flex h-full flex-col items-center justify-center gap-2 bg-slate-50 p-8 text-center dark:bg-slate-950">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
        <Users className="h-6 w-6 text-slate-300 dark:text-slate-600" />
      </div>
      <p className="font-medium text-slate-600 dark:text-slate-300">Select a contact</p>
      <p className="max-w-[240px] text-sm text-slate-600 dark:text-slate-300">
        Pick someone from the list to see their profile and timeline.
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Desktop sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-slate-200 bg-white transition-all duration-200 md:flex dark:border-slate-800 dark:bg-slate-900 ${
          sidebarCollapsed ? 'w-[68px]' : 'w-60'
        }`}
      >
        <div className="flex items-center gap-2.5 px-4 py-5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white">
            <HardDrive className="h-5 w-5" />
          </div>
          {!sidebarCollapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold leading-tight">Local CRM</p>
              <p className="truncate text-xs text-slate-400">{workspace?.name ?? 'Personal'}</p>
            </div>
          )}
        </div>
        {!sidebarCollapsed && (
          <div className="px-3 pb-2">
            <TonalButton onClick={() => openNewForm()} className="w-full !justify-start">
              <UserPlus className="h-4 w-4" /> New Contact
            </TonalButton>
          </div>
        )}
        {sidebarCollapsed && (
          <div className="px-3 pb-2">
            <button
              onClick={() => openNewForm()}
              title="New Contact"
              aria-label="New Contact"
              className="flex h-11 w-full items-center justify-center rounded-full bg-indigo-100 text-indigo-700 transition hover:bg-indigo-200 active:bg-indigo-300"
            >
              <UserPlus className="h-5 w-5" />
            </button>
          </div>
        )}
        <nav className="flex-1 space-y-1 px-3">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setTab(t.id);
                if (t.id !== 'contacts') setSelectedId(null);
              }}
              title={t.label}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition dark:bg-none ${
                tab === t.id
                  ? `${NAV_CLASSES[t.id]} bg-indigo-50 dark:bg-indigo-950/60`
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              } ${sidebarCollapsed ? 'justify-center' : ''}`}
            >
              <t.icon className="h-5 w-5 shrink-0" />
              {!sidebarCollapsed && t.label}
            </button>
          ))}
        </nav>
        <div className="px-3 pb-4">
          <button
            onClick={() => setSidebarCollapsed((v) => !v)}
            className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          >
            <PanelLeftClose
              className={`h-4 w-4 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`}
            />
            {!sidebarCollapsed && 'Collapse'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div
        className={`transition-all duration-200 ${
          sidebarCollapsed ? 'md:pl-[68px]' : 'md:pl-60'
        }`}
      >
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-slate-50/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
          <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 md:px-6">
            <button
              onClick={() => setSidebarCollapsed((v) => !v)}
              className="hidden h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-200/60 md:flex dark:text-slate-400 dark:hover:bg-slate-800"
              aria-label="Toggle sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="flex-1 text-lg font-semibold capitalize md:text-xl">
              {TABS.find((t) => t.id === tab)?.label}
            </h1>
            <ThemeToggle />
            {canInstall && (
              <button
                onClick={promptInstall}
                title="Install app"
                aria-label="Install app"
                className="flex h-9 w-9 items-center justify-center rounded-full text-indigo-600 transition hover:bg-indigo-50 active:bg-indigo-100 md:hidden dark:text-indigo-400 dark:hover:bg-indigo-950/60"
              >
                <Download className="h-5 w-5" />
              </button>
            )}
            <TonalButton
              onClick={() => openNewForm()}
              className="!hidden md:!inline-flex !py-2 dark:!bg-indigo-400/20 dark:!text-indigo-300 dark:hover:!bg-indigo-400/30"
            >
              <UserPlus className="h-4 w-4" /> New Contact
            </TonalButton>
          </div>
        </header>

        {tab === 'contacts' ? (
          /* Desktop split layout for contacts */
          <main id="main-content" className="md:flex md:h-[calc(100vh-57px)]">
            <div className="mx-auto max-w-6xl px-4 py-4 pb-32 md:pb-6 md:w-[420px] md:shrink-0 md:overflow-y-auto md:border-r md:border-slate-200 dark:md:border-slate-800 md:px-4 md:py-4">
              <ContactsView contacts={contacts} onSelect={openContact} onNew={openNewForm} />
            </div>
            <div className="hidden flex-1 md:block md:overflow-hidden">{detailPane}</div>
          </main>
        ) : (
          <main id="main-content" className="mx-auto max-w-6xl px-4 py-4 pb-32 md:px-6 md:pb-10">
            {tab === 'pipeline' && (
              <PipelineView contacts={contacts} onSelect={openContact} />
            )}
            {tab === 'activity' && (
              <ActivityView
                interactions={interactions}
                contacts={contacts}
                onSelect={openContact}
              />
            )}
            {tab === 'settings' && (
              <SettingsView
                workspaceName={workspace?.name ?? 'Personal Workspace'}
                counts={{
                  contacts: contacts.length,
                  interactions: interactions.length,
                  links: links.length,
                }}
                onDangerDone={() => setSelectedId(null)}
              />
            )}
          </main>
        )}
      </div>

      {/* Mobile detail slide-over */}
      {mobileDetailOpen && selected && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-[fadeIn_.15s_ease-out] dark:bg-black/60"
            onClick={() => {
              setMobileDetailOpen(false);
            }}
          />
          <div className="absolute inset-y-0 right-0 w-full max-w-md animate-[slideIn_.2s_ease-out] shadow-2xl">
            {detailPane}
          </div>
        </div>
      )}

      <FabPlus onClick={() => openNewForm()} />

      {/* Mobile bottom nav */}
      <nav aria-label="Main Navigation" className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 pb-[max(env(safe-area-inset-bottom),0.25rem)] backdrop-blur md:hidden dark:border-slate-800 dark:bg-slate-900/95">
        <div className="grid grid-cols-4">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              aria-current={tab === t.id ? 'page' : undefined}
              className={`flex min-h-[48px] flex-col items-center justify-center gap-1 py-1.5 text-[11px] font-medium transition-colors ${
                tab === t.id
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              <t.icon className={`h-5 w-5 ${tab === t.id ? NAV_CLASSES[t.id] : ''}`} />
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      <ContactFormModal
        open={formOpen}
        contact={editing ? contacts.find((c) => c.id === editing) ?? null : null}
        prefillName={prefillName}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
          setPrefillName(null);
        }}
        onSubmit={submitForm}
      />
    </div>
  );
}

function CenterMessage({
  title,
  body,
  detail,
  spinner,
}: {
  title: string;
  body: string;
  detail?: string;
  spinner?: boolean;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 px-6 text-center dark:bg-slate-950">
      {spinner && (
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600 dark:border-slate-700 dark:border-t-indigo-400" />
      )}
      <p className="font-semibold text-slate-800 dark:text-slate-100">{title}</p>
      <p className="max-w-sm text-sm text-slate-600 dark:text-slate-300">{body}</p>
      {detail && <p className="max-w-sm text-xs text-slate-400 dark:text-slate-500">{detail}</p>}
    </div>
  );
}

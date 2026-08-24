'use client';

import { useState } from 'react';
import { adminLogout, saveContentAction } from '../actions';
import type { SiteContent } from '../lib/content';
import type { Booking, IntakeQuestion, Service, TeamMember } from '../lib/db';
import Logo from '../_components/Logo';
import BookingsPanel from './BookingsPanel';
import ContentPanel from './ContentPanel';
import HelpGuide from './HelpGuide';
import IntakePanel from './IntakePanel';
import ServicesPanel from './ServicesPanel';
import TeamPanel from './TeamPanel';

type Tab = 'bookings' | 'treatments' | 'team' | 'intake' | 'content';

const TABS: { key: Tab; label: string }[] = [
  { key: 'bookings', label: 'Bookings' },
  { key: 'treatments', label: 'Treatments' },
  { key: 'team', label: 'Team' },
  { key: 'intake', label: 'Intake form' },
  { key: 'content', label: 'Website' },
];

export default function AdminDashboard({
  content: initialContent,
  bookings,
  services,
  team,
  intakeQuestions,
  storageWarning,
}: {
  content: SiteContent;
  bookings: Booking[];
  services: Service[];
  team: TeamMember[];
  intakeQuestions: IntakeQuestion[];
  /** Set when there is no database, so nothing saved here survives a restart. */
  storageWarning: boolean;
}) {
  const [tab, setTab] = useState<Tab>('bookings');
  const [helpOpen, setHelpOpen] = useState(false);
  /* Lifted out of ContentPanel so it and the setup guide — two places that
     edit the same fields — always show each other's saves, not the page's
     original snapshot. */
  const [content, setContent] = useState(initialContent);
  const waiting = bookings.filter((b) => b.status === 'pending').length;
  const soloMode = content.practice_mode !== 'true';

  /* A standalone setting rather than part of a longer form, so it saves the
     moment it's clicked instead of waiting on a separate Save button. */
  async function handleModeChange(mode: 'team' | 'solo') {
    const value = mode === 'team' ? 'true' : 'false';
    setContent((c) => ({ ...c, practice_mode: value }));
    const formData = new FormData();
    formData.set('practice_mode', value);
    await saveContentAction({}, formData);
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="sticky top-0 z-40 border-b border-green-wash bg-cream/95 backdrop-blur">
        <div className="px-safe mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-4">
            <Logo
              mark={content.brand_mark}
              tagline=""
              className="text-[13px]"
            />
            <div>
              <p className="font-serif text-lg font-light leading-tight text-green-deep">
                {content.brand_name}
              </p>
              <p className="text-[10px] font-light uppercase tracking-[0.2em] text-ink-soft">
                Staff dashboard
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setHelpOpen(true)}
              className="text-[11px] font-light uppercase tracking-[0.18em] text-ink-soft transition-colors hover:text-gold-deep"
            >
              Help
            </button>
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] font-light uppercase tracking-[0.18em] text-ink-soft transition-colors hover:text-gold-deep"
            >
              View site ↗
            </a>
            <form action={adminLogout}>
              <button
                type="submit"
                className="text-[11px] font-light uppercase tracking-[0.18em] text-ink-soft transition-colors hover:text-gold-deep"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>

        <nav aria-label="Dashboard sections" className="px-safe mx-auto max-w-5xl">
          <ul className="-mb-px flex gap-6 overflow-x-auto">
            {TABS.map((t) => (
              <li key={t.key}>
                <button
                  type="button"
                  onClick={() => setTab(t.key)}
                  aria-current={tab === t.key ? 'page' : undefined}
                  className={`whitespace-nowrap border-b-2 pb-3 text-[11px] font-light uppercase tracking-[0.18em] transition-colors ${
                    tab === t.key
                      ? 'border-gold text-green-deep'
                      : 'border-transparent text-ink-soft hover:text-green-deep'
                  }`}
                >
                  {t.label}
                  {t.key === 'bookings' && waiting ? (
                    <span className="ml-2 rounded-full bg-gold px-2 py-0.5 text-[10px] text-cream">
                      {waiting}
                    </span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main className="px-safe pb-safe mx-auto max-w-5xl py-8 sm:py-12">
        {storageWarning ? (
          <p className="mb-8 border-l-2 border-gold bg-gold-wash/60 px-4 py-3 text-sm font-light leading-relaxed text-green-deep">
            <strong className="font-normal">No database connected.</strong> The site
            works, but bookings and any edits you make here are kept in memory only
            and will disappear when the server restarts. Connect Postgres in your
            Vercel project’s Storage tab to make them permanent.
          </p>
        ) : null}

        {tab === 'bookings' ? (
          <BookingsPanel bookings={bookings} businessName={content.brand_name} />
        ) : null}
        {tab === 'treatments' ? <ServicesPanel services={services} /> : null}
        {tab === 'team' ? (
          <TeamPanel team={team} soloMode={soloMode} onModeChange={handleModeChange} />
        ) : null}
        {tab === 'intake' ? <IntakePanel questions={intakeQuestions} /> : null}
        {tab === 'content' ? <ContentPanel content={content} onSaved={setContent} /> : null}
      </main>

      <HelpGuide
        open={helpOpen}
        onOpenChange={setHelpOpen}
        storageWarning={storageWarning}
        content={content}
        onFieldChange={(key, value) => setContent((c) => ({ ...c, [key]: value }))}
        services={services}
        team={team}
        soloMode={soloMode}
        onModeChange={handleModeChange}
        intakeQuestions={intakeQuestions}
      />
    </div>
  );
}

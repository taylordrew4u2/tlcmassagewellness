'use client';

import { useEffect, useState } from 'react';
import { saveContentAction } from '../actions';
import { CONTENT_GROUPS, type SiteContent } from '../lib/content';
import type { Service, TeamMember } from '../lib/db';
import ContentFieldInput from './ContentField';
import ServicesPanel from './ServicesPanel';
import TeamPanel from './TeamPanel';
import { ghostButton, primaryButton } from './ui';

/** Whether the floating button is shown, remembered per browser — this is a
 *  personal convenience, not site content, so it has no reason to live in
 *  the database or sync across devices. */
const STORAGE_KEY = 'tlc_admin_help_button_hidden';

/**
 * The order the guide walks through. `group` steps edit real content fields
 * in place; `panel` steps embed the real Treatments/Team editors, so adding
 * one there is exactly the same as adding one from its own tab.
 */
const STEPS: (
  | { kind: 'info'; id: 'welcome' | 'bookings' | 'wrapup' }
  | { kind: 'group'; groupId: string }
  | { kind: 'panel'; id: 'treatments' | 'team' }
)[] = [
  { kind: 'info', id: 'welcome' },
  { kind: 'group', groupId: 'brand' },
  { kind: 'group', groupId: 'hero' },
  { kind: 'group', groupId: 'about' },
  { kind: 'group', groupId: 'services' },
  { kind: 'panel', id: 'treatments' },
  { kind: 'group', groupId: 'team' },
  { kind: 'panel', id: 'team' },
  { kind: 'group', groupId: 'booking' },
  { kind: 'group', groupId: 'contact' },
  { kind: 'group', groupId: 'footer' },
  { kind: 'info', id: 'bookings' },
  { kind: 'info', id: 'wrapup' },
];

function groupById(id: string) {
  const group = CONTENT_GROUPS.find((g) => g.id === id);
  if (!group) throw new Error(`Unknown content group: ${id}`);
  return group;
}

function stepTitle(step: (typeof STEPS)[number]): string {
  switch (step.kind) {
    case 'group':
      return groupById(step.groupId).title;
    case 'panel':
      return step.id === 'treatments' ? 'Add your treatments' : 'Add your team';
    case 'info':
      if (step.id === 'welcome') return 'Let’s set up your website';
      if (step.id === 'bookings') return 'Bookings tab — requests as they arrive';
      return 'That’s everything';
  }
}

export default function HelpGuide({
  open,
  onOpenChange,
  storageWarning,
  content,
  onFieldChange,
  services,
  team,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storageWarning: boolean;
  content: SiteContent;
  onFieldChange: (key: string, value: string) => void;
  services: Service[];
  team: TeamMember[];
}) {
  /* null until the effect below reads localStorage, so the button never
     flashes on screen for someone who already hid it. */
  const [buttonHidden, setButtonHidden] = useState<boolean | null>(null);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    const readStoredValue = () =>
      setButtonHidden(window.localStorage.getItem(STORAGE_KEY) === 'true');
    readStoredValue();
  }, []);

  useEffect(() => {
    const resetToFirstStep = () => {
      setStep(0);
      setSaveError(null);
    };
    if (open) resetToFirstStep();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onOpenChange(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onOpenChange]);

  function setButtonShown(shown: boolean) {
    setButtonHidden(!shown);
    window.localStorage.setItem(STORAGE_KEY, shown ? 'false' : 'true');
  }

  function goTo(next: number) {
    setSaveError(null);
    setStep(next);
  }

  async function saveGroupAndContinue(groupId: string) {
    setSaving(true);
    setSaveError(null);
    const group = groupById(groupId);
    const formData = new FormData();
    for (const field of group.fields) {
      formData.set(field.key, content[field.key] ?? '');
    }
    const result = await saveContentAction({}, formData);
    setSaving(false);
    if (result.error) {
      setSaveError(result.error);
      return;
    }
    goTo(step + 1);
  }

  const current = STEPS[step];
  const isFirst = step === 0;
  const isLast = step === STEPS.length - 1;

  return (
    <>
      {buttonHidden === false ? (
        <button
          type="button"
          onClick={() => onOpenChange(true)}
          aria-label="Set up and edit this website"
          className="fixed z-40 flex h-14 w-14 items-center justify-center rounded-full bg-green-deep font-serif text-2xl font-light text-cream shadow-lg shadow-green-deep/30 transition-transform hover:-translate-y-0.5 hover:bg-green"
          style={{
            bottom: 'max(1.5rem, calc(var(--safe-bottom) + 0.75rem))',
            right: 'max(1.5rem, calc(var(--safe-right) + 0.75rem))',
          }}
        >
          ?
        </button>
      ) : null}

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="help-guide-title"
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 backdrop-blur-sm sm:items-center sm:p-6"
        >
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-sm border border-green-wash bg-white sm:rounded-sm">
            <div className="flex items-start justify-between gap-4 border-b border-green-wash p-6 sm:p-8 sm:pb-6">
              <div>
                <p className="text-[11px] font-light uppercase tracking-[0.24em] text-gold-deep">
                  Step {step + 1} of {STEPS.length}
                </p>
                <h2
                  id="help-guide-title"
                  className="mt-2 font-serif text-2xl font-light text-green-deep"
                >
                  {stepTitle(current)}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                aria-label="Close"
                className="-mr-1 -mt-1 shrink-0 rounded-full p-2 text-ink-soft transition-colors hover:text-gold-deep"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 sm:p-8">
              <StepBody
                step={current}
                content={content}
                onFieldChange={onFieldChange}
                services={services}
                team={team}
                storageWarning={storageWarning}
              />

              {saveError ? (
                <p
                  role="alert"
                  className="mt-4 border-l-2 border-gold bg-gold-wash/50 px-4 py-3 text-sm font-light text-green-deep"
                >
                  {saveError}
                </p>
              ) : null}
            </div>

            <div className="border-t border-green-wash p-6 sm:p-8 sm:pt-6">
              <div className="flex items-center justify-center gap-2">
                {STEPS.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 w-1.5 rounded-full ${
                      i === step ? 'bg-gold' : 'bg-green-wash'
                    }`}
                  />
                ))}
              </div>

              <div className="mt-6 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => goTo(step - 1)}
                  disabled={isFirst || saving}
                  className={ghostButton}
                >
                  Back
                </button>

                <div className="flex items-center gap-3">
                  {current.kind === 'group' ? (
                    <button
                      type="button"
                      onClick={() => goTo(step + 1)}
                      disabled={saving}
                      className={ghostButton}
                    >
                      Skip
                    </button>
                  ) : null}

                  {isLast ? (
                    <button
                      type="button"
                      onClick={() => onOpenChange(false)}
                      className={primaryButton}
                    >
                      Done
                    </button>
                  ) : current.kind === 'group' ? (
                    <button
                      type="button"
                      onClick={() => saveGroupAndContinue(current.groupId)}
                      disabled={saving}
                      className={primaryButton}
                    >
                      {saving ? 'Saving…' : 'Save & continue'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => goTo(step + 1)}
                      className={primaryButton}
                    >
                      Next
                    </button>
                  )}
                </div>
              </div>

              {isLast ? (
                <label className="mt-6 flex items-center gap-3 border-t border-green-wash pt-6">
                  <input
                    type="checkbox"
                    checked={buttonHidden === false}
                    onChange={(e) => setButtonShown(e.target.checked)}
                    className="h-4 w-4 accent-[#3f5138]"
                  />
                  <span className="text-sm font-light text-ink">
                    Show the floating help button on every page
                  </span>
                </label>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function StepBody({
  step,
  content,
  onFieldChange,
  services,
  team,
  storageWarning,
}: {
  step: (typeof STEPS)[number];
  content: SiteContent;
  onFieldChange: (key: string, value: string) => void;
  services: Service[];
  team: TeamMember[];
  storageWarning: boolean;
}) {
  if (step.kind === 'group') {
    const group = groupById(step.groupId);
    return (
      <div>
        <p className="text-sm font-light leading-relaxed text-ink-soft">{group.description}</p>
        <div className="mt-6 space-y-6">
          {group.fields.map((field) => (
            <ContentFieldInput
              key={field.key}
              field={field}
              value={content[field.key] ?? ''}
              onChange={(value) => onFieldChange(field.key, value)}
            />
          ))}
        </div>
      </div>
    );
  }

  if (step.kind === 'panel') {
    if (step.id === 'treatments') {
      return (
        <div>
          <p className="text-sm font-light leading-relaxed text-ink-soft">
            Add what you offer below — each one appears on the site and in the
            booking form the moment you save it. Add as many as you like here,
            or skip for now and come back to the Treatments tab later.
          </p>
          <div className="mt-6">
            <ServicesPanel services={services} />
          </div>
        </div>
      );
    }
    return (
      <div>
        <p className="text-sm font-light leading-relaxed text-ink-soft">
          Add a profile for yourself, or for anyone else who works with you.
          Working alone? Leave the list empty and the whole “Our team” section
          — including its link in the site’s menu — disappears on its own.
        </p>
        <div className="mt-6">
          <TeamPanel team={team} />
        </div>
      </div>
    );
  }

  // info steps
  if (step.id === 'welcome') {
    return (
      <div className="space-y-3 text-sm font-light leading-relaxed text-ink-soft">
        <p>
          This guide walks through everything a visitor sees on your site,
          section by section. At each step you can fill it in right here and
          save it, or skip it and come back later from the tab it belongs to
          — nothing here is required to move on.
        </p>
        <p>Let’s get started.</p>
      </div>
    );
  }

  if (step.id === 'bookings') {
    return (
      <div className="space-y-3 text-sm font-light leading-relaxed text-ink-soft">
        <p>
          One tab this guide can’t fill in for you: the{' '}
          <strong className="font-normal text-ink">Bookings</strong> tab, where
          requests from visitors land as they arrive — there’s nothing to set
          up ahead of time, but it’s worth knowing how it works.
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Every request lands as{' '}
            <strong className="font-normal text-ink">awaiting answer</strong>,
            and the tab shows a count of anything still waiting.
          </li>
          <li>
            <strong className="font-normal text-ink">Accept</strong> or{' '}
            <strong className="font-normal text-ink">Decline</strong> a request
            in one tap. Accepted ones can later be marked{' '}
            <strong className="font-normal text-ink">done</strong>, or reopened.
          </li>
          <li>
            <strong className="font-normal text-ink">Email them</strong> opens
            your own mail app with a reply already written — no email is sent
            from this dashboard directly.
          </li>
        </ul>
      </div>
    );
  }

  return (
    <div className="space-y-3 text-sm font-light leading-relaxed text-ink-soft">
      <p>
        This guide is always one click away from the{' '}
        <strong className="font-normal text-ink">Help</strong> link at the top
        of the page, whether or not you keep the floating button below.
      </p>
      {storageWarning ? (
        <p className="border-l-2 border-gold bg-gold-wash/50 px-4 py-3">
          One thing worth knowing right now: there’s no database connected
          yet, so anything you saved today will be forgotten the next time
          the server restarts. Connect Postgres in your Vercel project’s
          Storage tab to make changes permanent.
        </p>
      ) : null}
    </div>
  );
}

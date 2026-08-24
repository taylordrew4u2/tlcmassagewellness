'use client';

import { useEffect, useState } from 'react';
import { saveContentAction } from '../actions';
import { CONTENT_GROUPS, type SiteContent } from '../lib/content';
import type { IntakeQuestion, Service, TeamMember } from '../lib/db';
import ContentFieldInput from './ContentField';
import IntakePanel from './IntakePanel';
import ServicesPanel from './ServicesPanel';
import TeamPanel from './TeamPanel';
import { ghostButton, primaryButton } from './ui';

/** Whether the floating button is shown, remembered per browser — this is a
 *  personal convenience, not site content, so it has no reason to live in
 *  the database or sync across devices. */
const STORAGE_KEY = 'tlc_admin_help_button_hidden';

/**
 * The order the guide walks through. `group` steps edit real content fields
 * in place; `panel` steps embed the real Treatments/Team/Intake editors, so
 * adding one there is exactly the same as adding one from its own tab.
 */
const STEPS: (
  | { kind: 'info'; id: 'welcome' | 'bookings' | 'wrapup' }
  | { kind: 'group'; groupId: string }
  | { kind: 'panel'; id: 'treatments' | 'team' | 'intake' }
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
  { kind: 'group', groupId: 'intake' },
  { kind: 'panel', id: 'intake' },
  { kind: 'group', groupId: 'contact' },
  { kind: 'group', groupId: 'footer' },
  { kind: 'info', id: 'bookings' },
  { kind: 'info', id: 'wrapup' },
];

const PANEL_TITLES: Record<'treatments' | 'intake', string> = {
  treatments: 'Add what you offer',
  intake: 'Ask your clients a few questions',
};

function groupById(id: string) {
  const group = CONTENT_GROUPS.find((g) => g.id === id);
  if (!group) throw new Error(`Unknown content group: ${id}`);
  return group;
}

function stepTitle(step: (typeof STEPS)[number], soloMode: boolean): string {
  switch (step.kind) {
    case 'group':
      return groupById(step.groupId).title;
    case 'panel':
      if (step.id === 'team') return soloMode ? 'Tell us about you' : 'Add your team';
      return PANEL_TITLES[step.id];
    case 'info':
      if (step.id === 'welcome') return 'Welcome — let’s set up your website';
      if (step.id === 'bookings') return 'How booking requests reach you';
      return 'All done for now';
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
  soloMode,
  onModeChange,
  intakeQuestions,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storageWarning: boolean;
  content: SiteContent;
  onFieldChange: (key: string, value: string) => void;
  services: Service[];
  team: TeamMember[];
  soloMode: boolean;
  onModeChange: (mode: 'team' | 'solo') => void;
  intakeQuestions: IntakeQuestion[];
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
                  {stepTitle(current, soloMode)}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                aria-label="Close this guide"
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
                soloMode={soloMode}
                onModeChange={onModeChange}
                intakeQuestions={intakeQuestions}
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
                      Skip for now
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
                      {saving ? 'Saving…' : 'Save and continue'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => goTo(step + 1)}
                      className={primaryButton}
                    >
                      Continue
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
                    Keep a small Help button in the corner of every page, so
                    you can open this guide again anytime
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
  soloMode,
  onModeChange,
  intakeQuestions,
  storageWarning,
}: {
  step: (typeof STEPS)[number];
  content: SiteContent;
  onFieldChange: (key: string, value: string) => void;
  services: Service[];
  team: TeamMember[];
  soloMode: boolean;
  onModeChange: (mode: 'team' | 'solo') => void;
  intakeQuestions: IntakeQuestion[];
  storageWarning: boolean;
}) {
  if (step.kind === 'group') {
    const group = groupById(step.groupId);
    return (
      <div>
        <p className="text-base leading-relaxed text-ink-soft">{group.description}</p>
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
          <p className="text-base leading-relaxed text-ink-soft">
            This is where you list what you offer — for example, “Swedish
            massage, 60 minutes.” Fill in one below and press{' '}
            <strong className="font-normal text-ink">Save</strong>. It will
            show up on your website and in the booking form right away. Add
            as many as you like, or press{' '}
            <strong className="font-normal text-ink">Skip for now</strong> and
            come back to it later — this same list also lives on its own
            Treatments tab.
          </p>
          <div className="mt-6">
            <ServicesPanel services={services} />
          </div>
        </div>
      );
    }
    if (step.id === 'intake') {
      return (
        <div>
          <p className="text-base leading-relaxed text-ink-soft">
            Is there anything you like to ask clients before they arrive —
            for example, “Do you have any injuries I should know about?”
            Type your questions in below, then turn them on for visitors on
            the previous step. If you’d rather not ask anything extra, press{' '}
            <strong className="font-normal text-ink">Skip for now</strong> —
            the booking form will still ask for the everyday things: name,
            email, treatment, date and time.
          </p>
          <div className="mt-6">
            <IntakePanel questions={intakeQuestions} />
          </div>
        </div>
      );
    }
    return (
      <div>
        <p className="text-base leading-relaxed text-ink-soft">
          {soloMode
            ? 'This is your own profile — your name (or however you’d like to be called), a photo, and a short bio about yourself. If you actually work alongside other people, press “Team” above to switch.'
            : 'Add a short profile for everyone who works with you: a name, a photo, and a bio. If it’s really just you, press “Just me” above and this list will get out of your way.'}
        </p>
        <div className="mt-6">
          <TeamPanel team={team} soloMode={soloMode} onModeChange={onModeChange} />
        </div>
      </div>
    );
  }

  // info steps
  if (step.id === 'welcome') {
    return (
      <div className="space-y-4 text-base leading-relaxed text-ink-soft">
        <p>
          This guide will walk you through your whole website, one small,
          simple step at a time. You don’t need to know anything about
          computers for this — just read what each step asks, and type your
          answer the same way you would fill in a paper form.
        </p>
        <p>At every step you have two choices:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="font-normal text-ink">Save and continue</strong>{' '}
            — saves what you typed and moves on to the next step.
          </li>
          <li>
            <strong className="font-normal text-ink">Skip for now</strong> —
            leaves that part as it is. You can always come back to it later,
            using the tabs across the top of this page.
          </li>
        </ul>
        <p>
          There is nothing here you can break. If you ever change your mind,
          just come back and edit it again — take all the time you need.
        </p>
      </div>
    );
  }

  if (step.id === 'bookings') {
    return (
      <div className="space-y-4 text-base leading-relaxed text-ink-soft">
        <p>
          There’s one tab this guide can’t fill in for you ahead of time: the{' '}
          <strong className="font-normal text-ink">Bookings</strong> tab. This
          is where requests from clients show up as they come in. There’s
          nothing to set up now, but here’s how it works when the time comes.
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Every new request appears marked{' '}
            <strong className="font-normal text-ink">awaiting answer</strong>,
            and a number on the Bookings tab tells you how many are waiting
            for you.
          </li>
          <li>
            Press <strong className="font-normal text-ink">Accept</strong> or{' '}
            <strong className="font-normal text-ink">Decline</strong> to
            answer it. Afterwards you can mark an accepted one{' '}
            <strong className="font-normal text-ink">done</strong>, or change
            your mind and reopen it.
          </li>
          <li>
            Pressing{' '}
            <strong className="font-normal text-ink">Email them</strong> opens
            your own email program with a reply already written for you to
            check and send — this website never sends anything on its own.
          </li>
          <li>
            If you turned on your own questions earlier, each client’s
            answers will appear on their request too, right next to their
            name.
          </li>
        </ul>
      </div>
    );
  }

  return (
    <div className="space-y-4 text-base leading-relaxed text-ink-soft">
      <p>
        That’s everything for now. You can change any of this again at any
        time — there is no way to lose your website by editing it.
      </p>
      <p>
        Forgotten how to get back here? Just press{' '}
        <strong className="font-normal text-ink">Help</strong> at the top of
        the page, whenever you like.
      </p>
      {storageWarning ? (
        <p className="border-l-2 border-gold bg-gold-wash/50 px-4 py-3">
          One important thing to know: what you’ve changed today isn’t being
          saved for good just yet — it could be lost the next time the
          website restarts. This is something whoever set up your website
          can fix in a few minutes, so it’s worth letting them know.
        </p>
      ) : null}
    </div>
  );
}

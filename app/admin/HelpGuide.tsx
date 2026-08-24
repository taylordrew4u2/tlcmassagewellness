'use client';

import { useEffect, useState } from 'react';
import { ghostButton, primaryButton } from './ui';

/** Whether the floating button is shown, remembered per browser — this is a
 *  personal convenience, not site content, so it has no reason to live in
 *  the database or sync across devices. */
const STORAGE_KEY = 'tlc_admin_help_button_hidden';

interface Step {
  title: string;
  body: React.ReactNode;
}

function buildSteps(storageWarning: boolean): Step[] {
  return [
    {
      title: 'This is your website, unlocked',
      body: (
        <>
          <p>
            Everything a visitor sees on the public site — every heading, photo,
            treatment, price-free description, and the people you list — is
            editable from the four tabs above. Nothing here touches code.
          </p>
          <p>
            The short version: find the tab for the thing you want to change,
            edit it, save it, and it appears on the live site straight away.
            This guide walks through each tab in turn.
          </p>
        </>
      ),
    },
    {
      title: 'Website tab — every word and photo',
      body: (
        <>
          <p>
            This is the biggest tab. It holds every heading, paragraph, address,
            opening hour and image on the site, grouped into sections — Brand,
            Hero, About us, Our offer, Team wording, Booking, Contact, and
            Social & footer.
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>Click a section button to jump straight to it.</li>
            <li>
              Photo fields let you <strong className="font-normal text-ink">upload</strong>{' '}
              a file, or paste a link if you already have one hosted somewhere.
            </li>
            <li>
              Nothing is saved until you press{' '}
              <strong className="font-normal text-ink">Save changes</strong> at the
              bottom — switching sections first is fine, it won’t lose what you
              typed.
            </li>
          </ul>
        </>
      ),
    },
    {
      title: 'Treatments tab — what you offer',
      body: (
        <>
          <p>
            Add, edit, reorder, hide, or delete treatments here. Each one has a
            name, a short description, and a length — there’s no price field
            yet, so leave pricing out of the description if you’d rather not
            commit it to the page.
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              <strong className="font-normal text-ink">Position in the list</strong> —
              lower numbers appear first, both on the site and in the booking
              form’s dropdown.
            </li>
            <li>
              <strong className="font-normal text-ink">Show this on the website</strong>{' '}
              — untick it to hide a treatment without deleting it, useful for
              something seasonal.
            </li>
            <li>Changes here show up immediately — no separate save step.</li>
          </ul>
        </>
      ),
    },
    {
      title: 'Team tab — who people are booking with',
      body: (
        <>
          <p>
            Add a profile for yourself, or for anyone else who works with you —
            name, role, a short bio, and a photo.
          </p>
          <p>
            Working alone? Remove every entry (including the placeholder one
            you started with) and leave the list empty. The whole “Our team”
            section, and its link in the site’s menu, disappears on its own —
            there’s no separate switch to flip.
          </p>
        </>
      ),
    },
    {
      title: 'Bookings tab — requests as they arrive',
      body: (
        <>
          <p>
            Every request a visitor sends lands here as{' '}
            <strong className="font-normal text-ink">awaiting answer</strong>, and
            the tab shows a count of anything still waiting.
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              <strong className="font-normal text-ink">Accept</strong> or{' '}
              <strong className="font-normal text-ink">Decline</strong> a request
              in one tap. Accepted ones can later be marked{' '}
              <strong className="font-normal text-ink">done</strong>, or reopened
              if plans change.
            </li>
            <li>
              <strong className="font-normal text-ink">Email them</strong> opens
              your own mail app with a reply already written — no email is sent
              from this dashboard directly.
            </li>
            <li>
              Add a private note to any request — visitors never see it — and
              filter the list by status along the top.
            </li>
          </ul>
          <p className="mt-3">
            You can also switch bookings off entirely, and edit the list of
            appointment times people can request, from the{' '}
            <strong className="font-normal text-ink">Booking</strong> section of
            the Website tab.
          </p>
        </>
      ),
    },
    {
      title: 'That’s everything',
      body: (
        <>
          <p>
            This guide is always one click away from the{' '}
            <strong className="font-normal text-ink">Help</strong> link at the top
            of the page, whether or not you keep the floating button below.
          </p>
          {storageWarning ? (
            <p className="border-l-2 border-gold bg-gold-wash/50 px-4 py-3">
              One thing worth knowing right now: there’s no database connected
              yet, so anything you save today will be forgotten the next time
              the server restarts. Connect Postgres in your Vercel project’s
              Storage tab to make changes permanent.
            </p>
          ) : null}
        </>
      ),
    },
  ];
}

export default function HelpGuide({
  open,
  onOpenChange,
  storageWarning,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storageWarning: boolean;
}) {
  /* null until the effect below reads localStorage, so the button never
     flashes on screen for someone who already hid it. */
  const [buttonHidden, setButtonHidden] = useState<boolean | null>(null);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const readStoredValue = () =>
      setButtonHidden(window.localStorage.getItem(STORAGE_KEY) === 'true');
    readStoredValue();
  }, []);

  useEffect(() => {
    const resetToFirstStep = () => setStep(0);
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

  const steps = buildSteps(storageWarning);
  const isFirst = step === 0;
  const isLast = step === steps.length - 1;

  return (
    <>
      {buttonHidden === false ? (
        <button
          type="button"
          onClick={() => onOpenChange(true)}
          aria-label="How to edit this website"
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
          <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-sm border border-green-wash bg-white p-6 sm:rounded-sm sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-light uppercase tracking-[0.24em] text-gold-deep">
                  Step {step + 1} of {steps.length}
                </p>
                <h2
                  id="help-guide-title"
                  className="mt-2 font-serif text-2xl font-light text-green-deep"
                >
                  {steps[step].title}
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

            <div className="mt-6 space-y-3 text-sm font-light leading-relaxed text-ink-soft">
              {steps[step].body}
            </div>

            <div className="mt-8 flex items-center justify-center gap-2">
              {steps.map((_, i) => (
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
                onClick={() => setStep((s) => s - 1)}
                disabled={isFirst}
                className={ghostButton}
              >
                Back
              </button>
              {isLast ? (
                <button type="button" onClick={() => onOpenChange(false)} className={primaryButton}>
                  Done
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setStep((s) => s + 1)}
                  className={primaryButton}
                >
                  Next
                </button>
              )}
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
      ) : null}
    </>
  );
}

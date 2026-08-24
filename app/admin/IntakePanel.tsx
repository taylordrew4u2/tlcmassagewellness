'use client';

import { useState, useTransition } from 'react';
import { deleteIntakeQuestionAction, saveIntakeQuestionAction } from '../actions';
import type { IntakeQuestion, IntakeQuestionType } from '../lib/db';
import {
  dangerButton,
  field,
  fieldLabel,
  ghostButton,
  help,
  primaryButton,
  sectionTitle,
} from './ui';

const TYPE_LABELS: Record<IntakeQuestionType, string> = {
  short: 'Short answer',
  long: 'Long answer',
  yesno: 'Yes or no',
};

/** A row being edited: a real question, or a blank one that has no id yet. */
type Draft = Omit<IntakeQuestion, 'id'> & { id: number | null };

const BLANK: Draft = {
  id: null,
  label: '',
  type: 'short',
  required: false,
  sort_order: 0,
  is_active: true,
};

export default function IntakePanel({ questions: initial }: { questions: IntakeQuestion[] }) {
  const [questions, setQuestions] = useState(initial);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [, startTransition] = useTransition();

  function edit(question: IntakeQuestion) {
    setError(null);
    setDraft({ ...question });
  }

  function add() {
    setError(null);
    const nextOrder = questions.reduce((max, q) => Math.max(max, q.sort_order), 0) + 1;
    setDraft({ ...BLANK, sort_order: nextOrder });
  }

  async function save() {
    if (!draft) return;
    setSaving(true);
    setError(null);

    const data = new FormData();
    if (draft.id !== null) data.set('id', String(draft.id));
    data.set('label', draft.label);
    data.set('type', draft.type);
    data.set('required', draft.required ? 'true' : 'false');
    data.set('sort_order', String(draft.sort_order));
    data.set('is_active', draft.is_active ? 'true' : 'false');

    const result = await saveIntakeQuestionAction({}, data);
    setSaving(false);

    if (result.error || result.savedId === undefined) {
      setError(result.error ?? 'Failed to save the question.');
      return;
    }

    const saved: IntakeQuestion = { ...draft, id: result.savedId };
    setQuestions((rows) => {
      const next = rows.some((q) => q.id === saved.id)
        ? rows.map((q) => (q.id === saved.id ? saved : q))
        : [...rows, saved];
      return next.sort((a, b) => a.sort_order - b.sort_order || a.id - b.id);
    });
    setDraft(null);
  }

  function remove(question: IntakeQuestion) {
    if (!window.confirm(`Remove “${question.label}” from the booking form?`)) return;

    const previous = questions;
    setQuestions((rows) => rows.filter((q) => q.id !== question.id));
    setError(null);

    startTransition(async () => {
      const result = await deleteIntakeQuestionAction(question.id);
      if (result.error) {
        setQuestions(previous);
        setError(result.error);
      }
    });
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className={sectionTitle}>Intake form</h2>
          <p className="mt-1 max-w-lg text-sm font-light text-ink-soft">
            Your own questions, added to the booking form. Turn the whole thing
            on or off, and write the intro text, from the Website tab’s
            “Intake form” section.
          </p>
        </div>
        <button type="button" onClick={add} className={primaryButton}>
          Add a question
        </button>
      </div>

      {error ? (
        <p
          role="alert"
          className="mt-6 border-l-2 border-gold bg-gold-wash/50 px-4 py-3 text-sm font-light text-green-deep"
        >
          {error}
        </p>
      ) : null}

      {draft ? (
        <div className="mt-6 rounded-sm border border-gold/50 bg-white p-5 sm:p-6">
          <h3 className="font-serif text-xl font-light text-green-deep">
            {draft.id === null ? 'New question' : 'Editing question'}
          </h3>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={fieldLabel} htmlFor="intake-label">
                Question
              </label>
              <input
                id="intake-label"
                type="text"
                value={draft.label}
                maxLength={300}
                onChange={(e) => setDraft({ ...draft, label: e.target.value })}
                className={`mt-2 ${field}`}
                placeholder="Any injuries, allergies, or areas to avoid?"
              />
            </div>

            <div>
              <label className={fieldLabel} htmlFor="intake-type">
                Answer type
              </label>
              <select
                id="intake-type"
                value={draft.type}
                onChange={(e) =>
                  setDraft({ ...draft, type: e.target.value as IntakeQuestionType })
                }
                className={`mt-2 ${field}`}
              >
                {(Object.keys(TYPE_LABELS) as IntakeQuestionType[]).map((type) => (
                  <option key={type} value={type}>
                    {TYPE_LABELS[type]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={fieldLabel} htmlFor="intake-order">
                Position in the list
              </label>
              <input
                id="intake-order"
                type="number"
                value={draft.sort_order}
                onChange={(e) =>
                  setDraft({ ...draft, sort_order: parseInt(e.target.value, 10) || 0 })
                }
                className={`mt-2 ${field}`}
              />
              <p className={help}>Lower numbers come first.</p>
            </div>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={draft.required}
                onChange={(e) => setDraft({ ...draft, required: e.target.checked })}
                className="h-4 w-4 accent-[#3f5138]"
              />
              <span className="text-sm font-light text-ink">Required</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={draft.is_active}
                onChange={(e) => setDraft({ ...draft, is_active: e.target.checked })}
                className="h-4 w-4 accent-[#3f5138]"
              />
              <span className="text-sm font-light text-ink">
                Show this on the booking form
              </span>
            </label>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" onClick={save} disabled={saving} className={primaryButton}>
              {saving ? 'Saving…' : 'Save question'}
            </button>
            <button
              type="button"
              onClick={() => setDraft(null)}
              disabled={saving}
              className={ghostButton}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {questions.length === 0 ? (
        <p className="mt-8 rounded-sm border border-dashed border-green-wash px-6 py-14 text-center text-sm font-light text-ink-soft">
          No questions yet. Add one, then turn on “Ask intake questions” in the
          Website tab to show it on the booking form.
        </p>
      ) : (
        <ul className="mt-8 space-y-3">
          {questions.map((question) => (
            <li
              key={question.id}
              className="flex flex-col gap-4 rounded-sm border border-green-wash bg-white p-5 sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="font-serif text-lg font-light text-green-deep">
                    {question.label}
                  </h3>
                  {question.required ? (
                    <span className="rounded-full bg-gold-wash px-3 py-1 text-[10px] font-light uppercase tracking-[0.16em] text-gold-deep">
                      Required
                    </span>
                  ) : null}
                  {question.is_active ? null : (
                    <span className="rounded-full bg-cream-dim px-3 py-1 text-[10px] font-light uppercase tracking-[0.16em] text-ink-soft">
                      Hidden
                    </span>
                  )}
                </div>
                <p className="mt-1 text-[11px] font-light uppercase tracking-[0.16em] text-gold-deep">
                  {TYPE_LABELS[question.type]}
                </p>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                <button type="button" onClick={() => edit(question)} className={ghostButton}>
                  Edit
                </button>
                <button type="button" onClick={() => remove(question)} className={dangerButton}>
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

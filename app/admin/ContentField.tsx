'use client';

import type { ContentField } from '../lib/content';
import ImageUploadField from './ImageUploadField';
import { field as fieldClass, fieldLabel, help } from './ui';

/**
 * Renders one editable line of site content, in whichever type it is.
 *
 * Shared by the full Website tab (`ContentPanel`) and the one-group-at-a-time
 * steps in the setup guide (`HelpGuide`), so the two never drift apart.
 */
export default function ContentFieldInput({
  field,
  value,
  onChange,
}: {
  field: ContentField;
  value: string;
  onChange: (value: string) => void;
}) {
  const id = `content-${field.key}`;

  if (field.type === 'toggle') {
    const on = value === 'true';
    return (
      <div>
        {/* The real value, so an "off" toggle still posts something. */}
        <input type="hidden" name={field.key} value={on ? 'true' : 'false'} />
        <div className="flex items-start gap-4">
          <button
            type="button"
            role="switch"
            aria-checked={on}
            aria-labelledby={`${id}-label`}
            onClick={() => onChange(on ? 'false' : 'true')}
            className={`mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors ${
              on ? 'bg-green-deep' : 'bg-cream-dim'
            }`}
          >
            <span
              className={`block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                on ? 'translate-x-[1.375rem]' : 'translate-x-0.5'
              }`}
            />
          </button>
          <span>
            <span id={`${id}-label`} className={fieldLabel}>
              {field.label}
            </span>
            {field.help ? <span className={`${help} block`}>{field.help}</span> : null}
          </span>
        </div>
      </div>
    );
  }

  if (field.type === 'image') {
    return (
      <ImageUploadField
        id={id}
        label={field.label}
        help={field.help}
        value={value}
        onChange={onChange}
      />
    );
  }

  const rows = field.type === 'lines' ? 5 : field.type === 'textarea' ? 4 : 0;

  return (
    <div>
      <label className={fieldLabel} htmlFor={id}>
        {field.label}
      </label>
      {rows ? (
        <textarea
          id={id}
          rows={rows}
          value={value}
          maxLength={5000}
          onChange={(e) => onChange(e.target.value)}
          className={`mt-2 ${fieldClass} resize-y font-light leading-relaxed`}
        />
      ) : (
        <input
          id={id}
          type={field.type === 'url' ? 'url' : 'text'}
          value={value}
          maxLength={5000}
          placeholder={field.type === 'url' ? 'https://…' : undefined}
          onChange={(e) => onChange(e.target.value)}
          className={`mt-2 ${fieldClass}`}
        />
      )}
      {field.help ? <p className={help}>{field.help}</p> : null}
    </div>
  );
}

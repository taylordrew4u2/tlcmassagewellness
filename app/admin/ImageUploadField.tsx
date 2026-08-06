'use client';

import { useRef, useState } from 'react';
import { uploadImageAction } from '../actions';
import { toHttpUrl } from '../lib/normalize';
import { field as fieldClass, fieldLabel, ghostButton, help as helpClass } from './ui';

/**
 * A photo field that uploads straight to storage instead of asking for a
 * link. Pasting a URL still works underneath — some owners will already
 * have one — it is just no longer the only way in.
 */
export default function ImageUploadField({
  id,
  label,
  help,
  value,
  onChange,
  rounded = false,
}: {
  id: string;
  label: string;
  help?: string;
  value: string;
  onChange: (url: string) => void;
  rounded?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUrlField, setShowUrlField] = useState(false);

  const preview = toHttpUrl(value);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const result = await uploadImageAction(file);
      if (result.error) {
        setError(result.error);
      } else if (result.url) {
        onChange(result.url);
      }
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div>
      <label className={fieldLabel} htmlFor={id}>
        {label}
      </label>

      <div className="mt-2 flex flex-wrap items-center gap-4">
        <div
          className={`h-20 w-20 shrink-0 overflow-hidden border border-green-wash bg-cream-dim ${
            rounded ? 'rounded-full' : 'rounded-sm'
          }`}
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="h-full w-full object-cover" />
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className={ghostButton}
          >
            {uploading ? 'Uploading…' : value ? 'Replace photo' : 'Upload a photo'}
          </button>
          {value ? (
            <button
              type="button"
              onClick={() => {
                onChange('');
                setError(null);
              }}
              disabled={uploading}
              className={ghostButton}
            >
              Remove
            </button>
          ) : null}
        </div>

        <input
          ref={inputRef}
          id={id}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="sr-only"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>

      {error ? (
        <p role="alert" className="mt-2 text-xs font-light text-red-700">
          {error}
        </p>
      ) : null}

      <button
        type="button"
        onClick={() => setShowUrlField((s) => !s)}
        className="mt-2 text-xs font-light text-ink-soft underline decoration-ink-soft/40 underline-offset-2 hover:text-green-deep"
      >
        {showUrlField ? 'Hide the link field' : 'Have a link instead? Paste it here.'}
      </button>
      {showUrlField ? (
        <input
          type="url"
          value={value}
          maxLength={500}
          placeholder="https://…"
          onChange={(e) => onChange(e.target.value)}
          className={`mt-2 ${fieldClass}`}
        />
      ) : null}

      {help ? <p className={helpClass}>{help}</p> : null}
    </div>
  );
}

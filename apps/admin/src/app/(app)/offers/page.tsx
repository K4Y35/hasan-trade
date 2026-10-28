'use client';

import { useEffect, useState } from 'react';
import { LoadingState, StickySaveBar } from '@/components/admin-ui';
import { Field } from '@/components/field';
import { PageHeader } from '@/components/page-header';
import { api } from '@/lib/api';
import { mediaUrl } from '@/lib/media';

type FormState = {
  popupEnabled: boolean;
  popupTitle: string;
  popupBody: string;
  popupImageUrl: string;
  popupCtaLabel: string;
  popupCtaUrl: string;
};

function str(value: unknown) {
  return value == null ? '' : String(value);
}

function blank(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export default function OffersPage() {
  const [form, setForm] = useState<FormState | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    api<Record<string, unknown>>('/v1/settings/admin').then((row) => {
      setForm({
        popupEnabled: Boolean(row.popupEnabled),
        popupTitle: str(row.popupTitle),
        popupBody: str(row.popupBody),
        popupImageUrl: str(row.popupImageUrl),
        popupCtaLabel: str(row.popupCtaLabel),
        popupCtaUrl: str(row.popupCtaUrl),
      });
    });
  }, []);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => (current ? { ...current, [key]: value } : current));
  }

  async function upload(file: File) {
    setError('');
    setUploading(true);
    try {
      const data = new FormData();
      data.append('file', file);
      data.append('folder', 'offers');
      const asset = await api<{ url: string }>('/v1/media', { method: 'POST', body: data });
      set('popupImageUrl', asset.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not upload image');
    } finally {
      setUploading(false);
    }
  }

  if (!form) return <LoadingState label="Loading special offer…" />;

  const hasContent = Boolean(form.popupImageUrl || form.popupTitle.trim() || form.popupBody.trim());
  const previewHref = form.popupCtaUrl.trim();

  return (
    <form
      className="space-y-5 pb-28"
      onSubmit={async (e) => {
        e.preventDefault();
        setError('');
        if (form.popupEnabled && !hasContent) {
          setError('Add an image or some text before turning the popup on.');
          return;
        }
        setSaving(true);
        try {
          await api('/v1/settings', {
            method: 'PATCH',
            body: JSON.stringify({
              popupEnabled: form.popupEnabled,
              popupTitle: blank(form.popupTitle),
              popupBody: blank(form.popupBody),
              popupImageUrl: blank(form.popupImageUrl),
              popupCtaLabel: blank(form.popupCtaLabel),
              popupCtaUrl: blank(form.popupCtaUrl),
            }),
          });
          setSaved(true);
          window.setTimeout(() => setSaved(false), 2800);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Could not save');
        } finally {
          setSaving(false);
        }
      }}
    >
      <PageHeader
        kicker="Storefront"
        title="Special offer"
        lede="Upload a poster or write a short message. When this is on, visitors see it as a popup on the website."
        action={
          <a href={process.env.NEXT_PUBLIC_STOREFRONT_URL ?? 'http://localhost:3000'} target="_blank" rel="noreferrer" className="ghost">
            View storefront
          </a>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-5">
          <section className="card space-y-5 p-6">
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 shrink-0 accent-[var(--color-primary)]"
                checked={form.popupEnabled}
                onChange={(e) => set('popupEnabled', e.target.checked)}
              />
              <span>
                <span className="block text-sm font-medium text-slate-800">Show this offer as a popup</span>
                <span className="mt-0.5 block text-xs leading-relaxed text-slate-500">
                  Visitors see it once until they close it. Saving a new offer shows it again.
                </span>
              </span>
            </label>

            <Field label="Offer image" hint="Optional poster or product photo. PNG or JPG. The image is not stretched.">
              <input
                type="file"
                accept="image/*"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void upload(file);
                  e.target.value = '';
                }}
              />
              {uploading ? <span className="mt-2 block text-xs text-slate-500">Uploading image…</span> : null}
              <div className="mt-3 flex min-h-32 items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3">
                {form.popupImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={mediaUrl(form.popupImageUrl)} alt="Offer image preview" className="max-h-40 w-auto max-w-full object-contain" />
                ) : (
                  <p className="text-center text-sm text-slate-400">No image yet</p>
                )}
              </div>
              {form.popupImageUrl ? (
                <button type="button" className="ghost mt-2" onClick={() => set('popupImageUrl', '')}>
                  Remove image
                </button>
              ) : null}
            </Field>

            <Field label="Headline" hint="Optional. Shown with the popup text.">
              <input
                value={form.popupTitle}
                onChange={(e) => set('popupTitle', e.target.value)}
                maxLength={160}
                placeholder="Eid special on split ACs"
              />
            </Field>
            <Field label="Message" hint="Optional. Keep it short so people can read it quickly.">
              <textarea
                rows={4}
                value={form.popupBody}
                onChange={(e) => set('popupBody', e.target.value)}
                maxLength={2000}
                placeholder="Free delivery in Sylhet this week. Limited stock."
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Button label" hint="Optional. Example: Shop ACs.">
                <input
                  value={form.popupCtaLabel}
                  onChange={(e) => set('popupCtaLabel', e.target.value)}
                  maxLength={80}
                  placeholder="Shop now"
                />
              </Field>
              <Field label="Button link" hint="Optional. Use a store path such as /shop or a full URL.">
                <input
                  value={form.popupCtaUrl}
                  onChange={(e) => set('popupCtaUrl', e.target.value)}
                  maxLength={500}
                  placeholder="/shop"
                />
              </Field>
            </div>
          </section>

          <StickySaveBar
            saving={saving}
            saved={saved ? 'Saved. Open the storefront to see the popup.' : false}
            error={error}
            label="Save special offer"
            disabled={uploading}
          />
        </div>

        <aside className="card h-fit space-y-3 p-5">
          <p className="text-sm font-semibold text-slate-900">Website preview</p>
          <p className="text-xs leading-relaxed text-slate-500">
            {form.popupEnabled
              ? hasContent
                ? 'This is the popup customers will see.'
                : 'Add an image or text, then turn the popup on.'
              : 'The popup is off until you turn it on and save.'}
          </p>
          <div className="rounded-xl bg-slate-950/70 p-4">
            <div className="overflow-hidden rounded-xl bg-white shadow-lg">
              {form.popupImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={mediaUrl(form.popupImageUrl)} alt="" className="max-h-52 w-full object-contain bg-slate-50" />
              ) : null}
              {form.popupTitle.trim() || form.popupBody.trim() || form.popupCtaLabel.trim() ? (
                <div className="space-y-2 p-4">
                  {form.popupTitle.trim() ? <p className="font-semibold text-[var(--color-ink)]">{form.popupTitle}</p> : null}
                  {form.popupBody.trim() ? (
                    <p className="whitespace-pre-wrap text-sm text-slate-600">{form.popupBody}</p>
                  ) : null}
                  {form.popupCtaLabel.trim() ? (
                    <span className="inline-flex rounded-lg bg-[var(--color-primary)] px-3 py-2 text-xs font-semibold text-white">
                      {form.popupCtaLabel}
                      {previewHref ? ` → ${previewHref}` : ''}
                    </span>
                  ) : null}
                </div>
              ) : !form.popupImageUrl ? (
                <p className="px-4 py-8 text-center text-sm text-slate-400">Nothing to preview yet</p>
              ) : null}
            </div>
          </div>
        </aside>
      </div>
    </form>
  );
}

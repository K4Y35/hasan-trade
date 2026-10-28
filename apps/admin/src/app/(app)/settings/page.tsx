'use client';

import { useEffect, useState } from 'react';
import { LoadingState, SectionCard, StickySaveBar } from '@/components/admin-ui';
import { Field } from '@/components/field';
import { PageHeader } from '@/components/page-header';
import { api } from '@/lib/api';
import { mediaUrl } from '@/lib/media';

type FormState = {
  name: string;
  tagline: string;
  description: string;
  logoUrl: string;
  faviconUrl: string;
  ogImageUrl: string;
  logoHeight: number;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  hours: string;
  metaTitle: string;
  metaDescription: string;
  facebookUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
  themeId: string;
  colorPrimary: string;
  colorSecondary: string;
  colorAccent: string;
  footerText: string;
  copyrightText: string;
};

const defaults: FormState = {
  name: '',
  tagline: '',
  description: '',
  logoUrl: '',
  faviconUrl: '',
  ogImageUrl: '',
  logoHeight: 56,
  email: '',
  phone: '',
  whatsapp: '',
  address: '',
  hours: '',
  metaTitle: '',
  metaDescription: '',
  facebookUrl: '',
  instagramUrl: '',
  youtubeUrl: '',
  themeId: 'CLASSIC',
  colorPrimary: '#1E40AF',
  colorSecondary: '#EA580C',
  colorAccent: '#06B6D4',
  footerText: '',
  copyrightText: '',
};

function str(value: unknown) {
  return value == null ? '' : String(value);
}

function blank(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export default function SettingsPage() {
  const [form, setForm] = useState<FormState | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState('');

  useEffect(() => {
    api<Record<string, unknown>>('/v1/settings/admin').then((row) => {
      setForm({
        ...defaults,
        name: str(row.name),
        tagline: str(row.tagline),
        description: str(row.description),
        logoUrl: str(row.logoUrl),
        faviconUrl: str(row.faviconUrl),
        ogImageUrl: str(row.ogImageUrl),
        logoHeight: Number(row.logoHeight) || 56,
        email: str(row.email),
        phone: str(row.phone),
        whatsapp: str(row.whatsapp),
        address: str(row.address),
        hours: str(row.hours) || 'Saturday to Thursday: 9.00am to 10.00pm',
        metaTitle: str(row.metaTitle),
        metaDescription: str(row.metaDescription),
        facebookUrl: str(row.facebookUrl),
        instagramUrl: str(row.instagramUrl),
        youtubeUrl: str(row.youtubeUrl),
        themeId: str(row.themeId) || 'CLASSIC',
        colorPrimary: str(row.colorPrimary) || defaults.colorPrimary,
        colorSecondary: str(row.colorSecondary) || defaults.colorSecondary,
        colorAccent: str(row.colorAccent) || defaults.colorAccent,
        footerText: str(row.footerText),
        copyrightText: str(row.copyrightText),
      });
    });
  }, []);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => (current ? { ...current, [key]: value } : current));
  }

  async function upload(field: 'logoUrl' | 'faviconUrl' | 'ogImageUrl', file: File) {
    setError('');
    setUploading(field);
    try {
      const data = new FormData();
      data.append('file', file);
      data.append('folder', 'branding');
      const asset = await api<{ url: string }>('/v1/media', { method: 'POST', body: data });
      set(field, asset.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not upload image');
    } finally {
      setUploading('');
    }
  }

  if (!form) return <LoadingState label="Loading website settings…" />;

  return (
    <form
      className="max-w-3xl space-y-5 pb-28"
      onSubmit={async (e) => {
        e.preventDefault();
        setError('');
        setSaving(true);
        try {
          await api('/v1/settings', {
            method: 'PATCH',
            body: JSON.stringify({
              name: form.name.trim(),
              tagline: blank(form.tagline),
              description: blank(form.description),
              logoUrl: blank(form.logoUrl),
              faviconUrl: blank(form.faviconUrl),
              ogImageUrl: blank(form.ogImageUrl),
              logoHeight: form.logoHeight,
              email: blank(form.email),
              phone: blank(form.phone),
              whatsapp: blank(form.whatsapp),
              address: blank(form.address),
              hours: blank(form.hours),
              metaTitle: blank(form.metaTitle),
              metaDescription: blank(form.metaDescription),
              facebookUrl: blank(form.facebookUrl),
              instagramUrl: blank(form.instagramUrl),
              youtubeUrl: blank(form.youtubeUrl),
              themeId: form.themeId,
              colorPrimary: form.colorPrimary,
              colorSecondary: form.colorSecondary,
              colorAccent: form.colorAccent,
              footerText: blank(form.footerText),
              copyrightText: blank(form.copyrightText),
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
        kicker="Website"
        title="Store"
        lede="Change the logo, contact details, and search-engine text that customers see on the live store."
        action={
          <a href={process.env.NEXT_PUBLIC_STOREFRONT_URL ?? 'http://localhost:3000'} target="_blank" rel="noreferrer" className="ghost">
            View storefront
          </a>
        }
      />

      <nav className="flex flex-wrap gap-2 text-sm" aria-label="Settings sections">
        {[
          ['identity', 'Identity'],
          ['contact', 'Contact'],
          ['seo', 'Search engines'],
          ['social', 'Social'],
          ['appearance', 'Appearance'],
          ['footer', 'Footer'],
        ].map(([id, label]) => (
          <a key={id} href={`#${id}`} className="rounded-full bg-white px-3 py-1.5 text-slate-600 ring-1 ring-slate-200 hover:text-[var(--color-primary)]">
            {label}
          </a>
        ))}
      </nav>

      <SectionCard id="identity" title="Identity" hint="Store name and logo used in the header, footer, and browser tab.">
        <Field label="Store name" hint="Required. Shown in the header and search results.">
          <input value={form.name} onChange={(e) => set('name', e.target.value)} required maxLength={120} />
        </Field>
        <Field label="Tagline" hint="Optional short line under the brand.">
          <input value={form.tagline} onChange={(e) => set('tagline', e.target.value)} maxLength={200} />
        </Field>
        <Field label="About this store" hint="Optional. Used on the about page when set.">
          <textarea rows={4} value={form.description} onChange={(e) => set('description', e.target.value)} maxLength={5000} />
        </Field>

        <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_16rem]">
          <Field label="Logo" hint="PNG or SVG with a transparent background works best.">
            <input
              type="file"
              accept="image/*"
              disabled={uploading === 'logoUrl'}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void upload('logoUrl', file);
                e.target.value = '';
              }}
            />
            {uploading === 'logoUrl' ? <span className="mt-2 block text-xs text-slate-500">Uploading logo…</span> : null}
          </Field>
          <div className="flex items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4">
            {form.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={mediaUrl(form.logoUrl)}
                alt={`${form.name || 'Store'} logo preview`}
                style={{ height: form.logoHeight }}
                className="w-auto max-w-full object-contain"
              />
            ) : (
              <p className="text-sm text-slate-400">No logo yet</p>
            )}
          </div>
        </div>

        <Field
          label={`Logo size · ${form.logoHeight}px`}
          hint="Height in the storefront header. Width scales automatically so the logo is not stretched."
        >
          <span className="flex items-center gap-3">
            <input
              type="range"
              min={32}
              max={88}
              step={2}
              value={form.logoHeight}
              onChange={(e) => set('logoHeight', Number(e.target.value))}
              aria-valuemin={32}
              aria-valuemax={88}
              aria-valuenow={form.logoHeight}
            />
            <input
              type="number"
              min={32}
              max={88}
              step={2}
              value={form.logoHeight}
              onChange={(e) => set('logoHeight', Math.min(88, Math.max(32, Number(e.target.value) || 56)))}
              aria-label="Logo height in pixels"
              className="w-20 shrink-0"
            />
          </span>
        </Field>

        <Field label="Favicon" hint="Optional small icon for the browser tab. Square PNG, 32×32 or 64×64.">
          <input
            type="file"
            accept="image/*"
            disabled={uploading === 'faviconUrl'}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void upload('faviconUrl', file);
              e.target.value = '';
            }}
          />
          {form.faviconUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={mediaUrl(form.faviconUrl)} alt="Favicon preview" className="mt-2 h-8 w-8 object-contain" />
          ) : null}
        </Field>
      </SectionCard>

      <SectionCard id="contact" title="Contact" hint="Phone, WhatsApp, and address shown in the header, footer, and contact page.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Phone" hint="Include country code, for example +8801711166522.">
            <input type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} autoComplete="tel" />
          </Field>
          <Field label="WhatsApp" hint="Same as phone, or a full https://wa.me/ link.">
            <input value={form.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} />
          </Field>
        </div>
        <Field label="Email">
          <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} autoComplete="email" />
        </Field>
        <Field label="Showroom address">
          <textarea rows={2} value={form.address} onChange={(e) => set('address', e.target.value)} />
        </Field>
        <Field label="Opening hours">
          <input value={form.hours} onChange={(e) => set('hours', e.target.value)} placeholder="Saturday to Thursday: 9.00am to 10.00pm" />
        </Field>
      </SectionCard>

      <SectionCard id="seo" title="Search engines" hint="Title and description used when this website is shared or listed in Google.">
        <Field label="SEO title" hint={`${form.metaTitle.length}/70 characters. Keep it under 60 if you can.`}>
          <input value={form.metaTitle} onChange={(e) => set('metaTitle', e.target.value)} maxLength={70} />
        </Field>
        <Field label="SEO description" hint={`${form.metaDescription.length}/180 characters.`}>
          <textarea rows={3} value={form.metaDescription} onChange={(e) => set('metaDescription', e.target.value)} maxLength={180} />
        </Field>
        <Field label="Share image" hint="Optional image shown when the homepage is shared on Facebook or WhatsApp.">
          <input
            type="file"
            accept="image/*"
            disabled={uploading === 'ogImageUrl'}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void upload('ogImageUrl', file);
              e.target.value = '';
            }}
          />
          {form.ogImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={mediaUrl(form.ogImageUrl)} alt="Share image preview" className="mt-2 h-24 w-auto rounded-lg object-cover" />
          ) : null}
        </Field>
      </SectionCard>

      <SectionCard id="social" title="Social links" hint="Optional. Empty fields keep the current storefront defaults.">
        <Field label="Facebook URL">
          <input type="url" value={form.facebookUrl} onChange={(e) => set('facebookUrl', e.target.value)} placeholder="https://" />
        </Field>
        <Field label="Instagram URL">
          <input type="url" value={form.instagramUrl} onChange={(e) => set('instagramUrl', e.target.value)} placeholder="https://" />
        </Field>
        <Field label="YouTube URL">
          <input type="url" value={form.youtubeUrl} onChange={(e) => set('youtubeUrl', e.target.value)} placeholder="https://" />
        </Field>
      </SectionCard>

      <SectionCard id="appearance" title="Appearance" hint="Colors used for buttons, links, and highlights on the storefront.">
        <div className="grid gap-4 sm:grid-cols-3">
          <ColorField label="Primary" value={form.colorPrimary} onChange={(value) => set('colorPrimary', value)} />
          <ColorField label="Secondary" value={form.colorSecondary} onChange={(value) => set('colorSecondary', value)} />
          <ColorField label="Accent" value={form.colorAccent} onChange={(value) => set('colorAccent', value)} />
        </div>
        <Field label="Theme">
          <select value={form.themeId} onChange={(e) => set('themeId', e.target.value)}>
            <option value="CLASSIC">Classic</option>
            <option value="MODERN">Modern</option>
            <option value="BOLD">Bold</option>
          </select>
        </Field>
      </SectionCard>

      <SectionCard id="footer" title="Footer" hint="Short about text and copyright line at the bottom of every page.">
        <Field label="Footer text">
          <textarea rows={3} value={form.footerText} onChange={(e) => set('footerText', e.target.value)} />
        </Field>
        <Field label="Copyright">
          <input value={form.copyrightText} onChange={(e) => set('copyrightText', e.target.value)} />
        </Field>
      </SectionCard>

      <StickySaveBar
        saving={saving}
        saved={saved ? 'Saved. Refresh the storefront to see the change.' : false}
        error={error}
        label="Save website settings"
        disabled={Boolean(uploading)}
      />
    </form>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <Field label={label}>
      <span className="flex gap-2">
        <input type="color" className="h-11 w-14 shrink-0 p-1" value={value || '#1E40AF'} onChange={(e) => onChange(e.target.value)} aria-label={`${label} color swatch`} />
        <input value={value} onChange={(e) => onChange(e.target.value)} />
      </span>
    </Field>
  );
}

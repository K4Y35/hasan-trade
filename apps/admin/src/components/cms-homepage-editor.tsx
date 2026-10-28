'use client';

import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { Field } from '@/components/field';
import { api } from '@/lib/api';
import {
  blankSection,
  isProductRow,
  moveItem,
  sectionLabel,
  uid,
  type BannerItem,
  type CategoryOption,
  type HeroSlide,
  type HomeSection,
} from '@/lib/cms';
import { mediaUrl } from '@/lib/media';

async function uploadImage(file: File, folder: string) {
  const data = new FormData();
  data.append('file', file);
  data.append('folder', folder);
  return api<{ url: string }>('/v1/media', { method: 'POST', body: data });
}

function ImageField({
  label,
  hint,
  value,
  onChange,
  folder,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (url: string) => void;
  folder: string;
}) {
  return (
    <Field label={label} hint={hint}>
      <input
        type="file"
        accept="image/*"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          try {
            const asset = await uploadImage(file, folder);
            onChange(asset.url);
          } finally {
            e.target.value = '';
          }
        }}
      />
      <div className="mt-3 flex min-h-24 items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={mediaUrl(value)} alt="" className="max-h-32 w-auto max-w-full object-contain" />
        ) : (
          <p className="text-sm text-slate-400">No image yet</p>
        )}
      </div>
      {value ? (
        <button type="button" className="ghost mt-2" onClick={() => onChange('')}>
          Remove image
        </button>
      ) : null}
    </Field>
  );
}

function HeroEditor({
  section,
  categories,
  onChange,
}: {
  section: HomeSection;
  categories: CategoryOption[];
  onChange: (section: HomeSection) => void;
}) {
  const parents = categories.filter((category) => !category.parentId);
  const setPayload = (payload: Partial<HomeSection['payload']>) =>
    onChange({ ...section, payload: { ...section.payload, ...payload } });

  return (
    <div className="space-y-4">
      <Field label="Heading" hint="Shown if you use uploaded images. Product slides keep each collection name.">
        <input value={section.payload.heading} onChange={(e) => setPayload({ heading: e.target.value })} maxLength={160} />
      </Field>
      <Field label="Supporting text">
        <textarea rows={3} value={section.payload.subheading} onChange={(e) => setPayload({ subheading: e.target.value })} maxLength={400} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Button label">
          <input value={section.payload.ctaLabel} onChange={(e) => setPayload({ ctaLabel: e.target.value })} maxLength={80} />
        </Field>
        <Field label="Button link">
          <input value={section.payload.ctaHref} onChange={(e) => setPayload({ ctaHref: e.target.value })} maxLength={500} />
        </Field>
      </div>
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-slate-700">Slider photos</legend>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name={`slide-${section.key}`}
            checked={section.payload.slideSource === 'products'}
            onChange={() => setPayload({ slideSource: 'products' })}
          />
          Product photos from categories
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name={`slide-${section.key}`}
            checked={section.payload.slideSource === 'images'}
            onChange={() => setPayload({ slideSource: 'images' })}
          />
          Uploaded images
        </label>
      </fieldset>
      {section.payload.slideSource === 'products' ? (
        <fieldset>
          <legend className="text-sm font-medium text-slate-700">Categories in the slider</legend>
          <p className="mt-0.5 text-xs text-slate-500">Leave none selected to include every collection. Order is the order you tick them.</p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {parents.map((category) => {
              const checked = section.payload.categorySlugs.includes(category.slug);
              return (
                <li key={category.id}>
                  <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm">
                    <input
                      type="checkbox"
                      className="accent-[var(--color-primary)]"
                      checked={checked}
                      onChange={() =>
                        setPayload({
                          categorySlugs: checked
                            ? section.payload.categorySlugs.filter((slug) => slug !== category.slug)
                            : [...section.payload.categorySlugs, category.slug],
                        })
                      }
                    />
                    {category.name}
                  </label>
                </li>
              );
            })}
          </ul>
        </fieldset>
      ) : (
        <div className="space-y-3">
          {section.payload.slides.map((slide, index) => (
            <div key={slide.key} className="rounded-xl border border-slate-200 p-4">
              <ImageField
                label={`Slide ${index + 1}`}
                value={slide.image}
                folder="hero"
                onChange={(image) =>
                  setPayload({
                    slides: section.payload.slides.map((row) => (row.key === slide.key ? { ...row, image } : row)),
                  })
                }
              />
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Field label="Title">
                  <input
                    value={slide.heading}
                    onChange={(e) =>
                      setPayload({
                        slides: section.payload.slides.map((row) =>
                          row.key === slide.key ? { ...row, heading: e.target.value } : row,
                        ),
                      })
                    }
                  />
                </Field>
                <Field label="Link">
                  <input
                    value={slide.href}
                    onChange={(e) =>
                      setPayload({
                        slides: section.payload.slides.map((row) =>
                          row.key === slide.key ? { ...row, href: e.target.value } : row,
                        ),
                      })
                    }
                  />
                </Field>
              </div>
              <button
                type="button"
                className="ghost mt-3 text-red-600"
                onClick={() => setPayload({ slides: section.payload.slides.filter((row) => row.key !== slide.key) })}
              >
                Remove slide
              </button>
            </div>
          ))}
          <button
            type="button"
            className="ghost"
            onClick={() =>
              setPayload({
                slides: [
                  ...section.payload.slides,
                  { key: uid(), image: '', href: '/shop', alt: '', heading: '', subheading: '' } satisfies HeroSlide,
                ],
              })
            }
          >
            <Plus size={16} /> Add slide
          </button>
        </div>
      )}
    </div>
  );
}

function BannersEditor({ section, onChange }: { section: HomeSection; onChange: (section: HomeSection) => void }) {
  const setItems = (items: BannerItem[]) => onChange({ ...section, payload: { ...section.payload, items } });
  return (
    <div className="space-y-3">
      {section.payload.items.map((item, index) => (
        <div key={item.key} className="rounded-xl border border-slate-200 p-4">
          <ImageField
            label={`Banner ${index + 1}`}
            hint="Not stretched. Use a wide photo."
            value={item.image}
            folder="banners"
            onChange={(image) => setItems(section.payload.items.map((row) => (row.key === item.key ? { ...row, image } : row)))}
          />
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Field label="Link">
              <input
                value={item.href}
                onChange={(e) =>
                  setItems(section.payload.items.map((row) => (row.key === item.key ? { ...row, href: e.target.value } : row)))
                }
                placeholder="/shop?category=air-conditioner"
              />
            </Field>
            <Field label="Caption">
              <input
                value={item.alt}
                onChange={(e) =>
                  setItems(section.payload.items.map((row) => (row.key === item.key ? { ...row, alt: e.target.value } : row)))
                }
              />
            </Field>
          </div>
          <button type="button" className="ghost mt-3 text-red-600" onClick={() => setItems(section.payload.items.filter((row) => row.key !== item.key))}>
            Remove banner
          </button>
        </div>
      ))}
      <button
        type="button"
        className="ghost"
        onClick={() => setItems([...section.payload.items, { key: uid(), image: '', href: '/shop', alt: '' }])}
      >
        <Plus size={16} /> Add banner
      </button>
    </div>
  );
}

function SectionBody({
  section,
  categories,
  onChange,
}: {
  section: HomeSection;
  categories: CategoryOption[];
  onChange: (section: HomeSection) => void;
}) {
  const parents = categories.filter((category) => !category.parentId);
  if (section.type === 'HERO') return <HeroEditor section={section} categories={categories} onChange={onChange} />;
  if (section.type === 'BANNERS') return <BannersEditor section={section} onChange={onChange} />;
  if (section.type === 'CUSTOM_HTML') {
    return (
      <Field label="Text" hint="Shown as a simple text block on the homepage.">
        <textarea
          rows={5}
          value={section.payload.body}
          onChange={(e) => onChange({ ...section, payload: { ...section.payload, body: e.target.value } })}
          maxLength={8000}
        />
      </Field>
    );
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {isProductRow(section) || section.type === 'FEATURED_PRODUCTS' ? (
        <Field label="Category" hint={isProductRow(section) ? 'Products from this collection.' : 'Leave empty for latest products across the shop.'}>
          <select
            value={section.payload.categorySlug}
            onChange={(e) => {
              const category = parents.find((row) => row.slug === e.target.value);
              onChange({
                ...section,
                title: section.title.trim() && !isProductRow(section) ? section.title : category?.name || section.title,
                payload: { ...section.payload, categorySlug: e.target.value },
              });
            }}
          >
            <option value="">Latest products</option>
            {parents.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </Field>
      ) : null}
      {section.type === 'FEATURED_CATEGORIES' || section.type === 'FEATURED_PRODUCTS' ? (
        <Field
          label="How many to show"
          hint="Leave blank to show everything we have. A number is only the collapsed preview — the homepage still starts fully open."
        >
          <input
            type="number"
            min={0}
            max={500}
            placeholder="All"
            value={section.payload.limit}
            onChange={(e) => onChange({ ...section, payload: { ...section.payload, limit: e.target.value } })}
          />
        </Field>
      ) : null}
    </div>
  );
}

const ADD_OPTIONS: { value: string; label: string }[] = [
  { value: 'FEATURED_CATEGORIES', label: 'Category grid' },
  { value: 'BANNERS', label: 'Promo banners' },
  { value: 'PRODUCT_ROW', label: 'Product row' },
  { value: 'FEATURED_PRODUCTS', label: 'New arrivals' },
  { value: 'BRANDS', label: 'Brand logos' },
  { value: 'CUSTOM_HTML', label: 'Text block' },
  { value: 'HERO', label: 'Hero slider' },
];

export function HomepageEditor({
  sections,
  categories,
  onChange,
}: {
  sections: HomeSection[];
  categories: CategoryOption[];
  onChange: (sections: HomeSection[]) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-slate-500">Add a block</span>
          <select
            defaultValue=""
            className="w-56"
            onChange={(e) => {
              const value = e.target.value;
              e.currentTarget.value = '';
              if (!value) return;
              if (value === 'HERO' && sections.some((section) => section.type === 'HERO')) return;
              if (value === 'PRODUCT_ROW') {
                const first = categories.find((category) => !category.parentId);
                onChange([
                  ...sections,
                  blankSection('FEATURED_PRODUCTS', {
                    title: first?.name || 'Product row',
                    payload: {
                      heading: '',
                      subheading: '',
                      ctaLabel: '',
                      ctaHref: '',
                      limit: '',
                      categorySlug: first?.slug || '',
                      categorySlugs: [],
                      slideSource: 'products',
                      body: '',
                      slides: [],
                      items: [],
                    },
                  }),
                ]);
                return;
              }
              onChange([...sections, blankSection(value as HomeSection['type'])]);
            }}
          >
            <option value="">Choose…</option>
            {ADD_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      {sections.length ? (
        <ul className="space-y-4">
          {sections.map((section, index) => (
            <li key={section.key} className={`card overflow-hidden ${section.isVisible ? '' : 'opacity-70'}`}>
              <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">{sectionLabel(section)}</p>
                  <input
                    className="mt-1 max-w-md"
                    value={section.title}
                    onChange={(e) => onChange(sections.map((row) => (row.key === section.key ? { ...row, title: e.target.value } : row)))}
                    aria-label="Section title"
                  />
                </div>
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-[var(--color-primary)]"
                    checked={section.isVisible}
                    onChange={(e) =>
                      onChange(sections.map((row) => (row.key === section.key ? { ...row, isVisible: e.target.checked } : row)))
                    }
                  />
                  Visible
                </label>
                <button type="button" className="ghost px-2" onClick={() => onChange(moveItem(sections, index, -1))} disabled={index === 0} aria-label="Move up">
                  <ChevronUp size={16} />
                </button>
                <button
                  type="button"
                  className="ghost px-2"
                  onClick={() => onChange(moveItem(sections, index, 1))}
                  disabled={index === sections.length - 1}
                  aria-label="Move down"
                >
                  <ChevronDown size={16} />
                </button>
                <button
                  type="button"
                  className="ghost px-2 text-red-600"
                  onClick={() => onChange(sections.filter((row) => row.key !== section.key))}
                  aria-label="Remove section"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="p-4">
                <SectionBody
                  section={section}
                  categories={categories}
                  onChange={(next) => onChange(sections.map((row) => (row.key === next.key ? next : row)))}
                />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500">
          No homepage blocks yet. Add a category grid or product row to get started.
        </p>
      )}
    </div>
  );
}

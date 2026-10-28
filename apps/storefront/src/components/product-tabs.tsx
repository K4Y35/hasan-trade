'use client';

import { Star } from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { parseProductCopy } from '@/lib/product-copy';
import { addReview, readReviews } from '@/lib/reviews';
import type { Product, ProductReview } from '@/lib/types';

const TABS = [
  { id: 'description', label: 'Description' },
  { id: 'specs', label: 'Additional information' },
  { id: 'reviews', label: 'Reviews' },
] as const;

function looksLikeHtml(text: string) {
  return /<[a-z][\s\S]*?>/i.test(text) && !/^\s*[^<]{0,80}<\s*\//.test(text);
}

function sanitizeHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/javascript:/gi, '');
}

export function ProductTabs({ product }: { product: Product }) {
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('description');
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  useEffect(() => {
    setReviews(readReviews(product.slug));
  }, [product.slug]);
  const [rating, setRating] = useState(5);
  const [submitted, setSubmitted] = useState(false);
  const blocks = useMemo(
    () => parseProductCopy(product.description || product.shortDescription),
    [product.description, product.shortDescription],
  );
  const extra = [
    product.sku ? { name: 'SKU', value: product.sku } : null,
    product.brand ? { name: 'Brand', value: product.brand.name } : null,
    product.warrantyMonths ? { name: 'Warranty', value: `${product.warrantyMonths} months` } : null,
    ...product.specs.map((spec) => ({
      name: spec.name,
      value: `${spec.value}${spec.unit ? ` ${spec.unit}` : ''}`,
    })),
  ].filter(Boolean) as { name: string; value: string }[];

  function onReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get('name') ?? '').trim();
    const comment = String(data.get('comment') ?? '').trim();
    if (!name || !comment) return;
    addReview(product.slug, { name, rating, comment });
    setReviews(readReviews(product.slug));
    setSubmitted(true);
    event.currentTarget.reset();
    setRating(5);
  }

  return (
    <section className="mt-14">
      <div role="tablist" aria-label="Product details" className="flex gap-1 overflow-x-auto border-b border-slate-200">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            id={`tab-${item.id}`}
            aria-selected={tab === item.id}
            aria-controls={`panel-${item.id}`}
            className={`shrink-0 rounded-t-xl px-4 py-3 text-sm font-semibold transition ${
              tab === item.id ? 'bg-white text-[var(--color-primary)] shadow-[0_-1px_0_#fff]' : 'text-slate-500 hover:text-slate-800'
            }`}
            onClick={() => setTab(item.id)}
          >
            {item.id === 'reviews' ? `Reviews (${reviews.length})` : item.label}
          </button>
        ))}
      </div>

      <div className="rounded-b-3xl rounded-tr-3xl border border-t-0 border-slate-100 bg-white p-6 shadow-card md:p-8">
        {tab === 'description' ? (
          <div id="panel-description" role="tabpanel" aria-labelledby="tab-description" className="space-y-8">
            {looksLikeHtml(product.description || product.shortDescription || '') ? (
              <div
                className="product-copy"
                dangerouslySetInnerHTML={{
                  __html: sanitizeHtml(product.description || product.shortDescription || ''),
                }}
              />
            ) : blocks.length ? (
              blocks.filter((block) => block.items.length).map((block) => (
                <div key={block.heading ?? block.items[0]}>
                  {block.heading ? (
                    <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--color-secondary)]">{block.heading}</h2>
                  ) : (
                    <h2 className="sr-only">Description</h2>
                  )}
                  {block.items.length > 2 || block.heading ? (
                    <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                      {block.items.map((item) => (
                        <li key={item} className="flex gap-2 text-slate-700">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary)]" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-3 max-w-3xl leading-relaxed text-slate-600">{block.items.join(' ')}</p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-slate-600">Ask the showroom team for the full specification sheet for this model.</p>
            )}
          </div>
        ) : null}

        {tab === 'specs' ? (
          <div id="panel-specs" role="tabpanel" aria-labelledby="tab-specs">
            {extra.length ? (
              <table className="w-full max-w-3xl text-sm">
                <tbody>
                  {extra.map((row) => (
                    <tr key={row.name} className="border-b border-slate-100">
                      <th className="w-1/3 py-3 pr-4 text-left font-medium text-slate-500">{row.name}</th>
                      <td className="py-3 font-medium text-slate-800">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-slate-600">Additional specifications are available on request.</p>
            )}
          </div>
        ) : null}

        {tab === 'reviews' ? (
          <div id="panel-reviews" role="tabpanel" aria-labelledby="tab-reviews" className="grid gap-10 md:grid-cols-2">
            <div>
              <h2 className="text-lg font-semibold">Reviews</h2>
              {reviews.length === 0 ? (
                <p className="mt-3 text-slate-600">There are no reviews yet. Be the first to review “{product.name}”.</p>
              ) : (
                <ul className="mt-4 space-y-4">
                  {reviews.map((review) => (
                    <li key={review.id} className="rounded-2xl border border-slate-100 p-4">
                      <p className="flex items-center gap-2 font-medium">
                        {review.name}
                        <span className="flex text-[var(--color-accent)]" aria-label={`${review.rating} out of 5`}>
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star key={i} size={14} fill={i < review.rating ? 'currentColor' : 'none'} />
                          ))}
                        </span>
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">{review.comment}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <form onSubmit={onReview} className="rounded-2xl bg-slate-50 p-5">
              <h3 className="font-semibold">Write a review</h3>
              <p className="mt-1 text-sm text-slate-500">Your email address will not be published. Required fields are marked *</p>
              <fieldset className="mt-4">
                <legend className="mb-2 text-sm font-medium">Your rating *</legend>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      aria-label={`${value} star${value === 1 ? '' : 's'}`}
                      aria-pressed={rating === value}
                      className="text-[var(--color-accent)]"
                      onClick={() => setRating(value)}
                    >
                      <Star size={20} fill={value <= rating ? 'currentColor' : 'none'} />
                    </button>
                  ))}
                </div>
              </fieldset>
              <label className="mt-4 block text-sm font-medium" htmlFor="review-comment">
                Your review *
              </label>
              <textarea id="review-comment" name="comment" required rows={4} className="field mt-1" />
              <label className="mt-4 block text-sm font-medium" htmlFor="review-name">
                Name *
              </label>
              <input id="review-name" name="name" required className="field mt-1" autoComplete="name" />
              <label className="mt-4 block text-sm font-medium" htmlFor="review-email">
                Email
              </label>
              <input id="review-email" name="email" type="email" className="field mt-1" autoComplete="email" />
              <button type="submit" className="btn-primary mt-5">
                Submit
              </button>
              {submitted ? <p className="mt-3 text-sm text-emerald-700">Thank you. Your review is now visible on this device.</p> : null}
            </form>
          </div>
        ) : null}
      </div>
    </section>
  );
}

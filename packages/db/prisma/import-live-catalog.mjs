import { createWriteStream } from 'node:fs';
import { mkdir, writeFile, access } from 'node:fs/promises';
import { dirname, extname, join } from 'node:path';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const REPO = join(ROOT, '../../..');
const OUT_JSON = join(ROOT, 'demo-catalog.json');
const IMAGE_DIR = join(REPO, 'apps/storefront/public/samples/products');
const BASE = 'https://hasantrade.com.bd';
const UA = 'ShopStackCatalogImport/1.0 (Hasan Trade replacement)';

const TOP_CATEGORY_MAP = [
  { match: /air-?conditioner-spare|spare-parts/i, name: 'AC Spare Parts', slug: 'ac-spare-parts' },
  { match: /air-?conditioner|air-conditioner/i, name: 'Air Conditioner', slug: 'air-conditioner' },
  { match: /refrigerator|freezer/i, name: 'Refrigerator & Freezer', slug: 'refrigerator-and-freezer' },
  { match: /television|^tv$/i, name: 'Television', slug: 'television' },
  { match: /camera|cctv|nvr|dvr/i, name: 'Camera', slug: 'camera' },
  { match: /kitchen/i, name: 'Kitchen Appliances', slug: 'kitchen-appliances' },
  { match: /washing/i, name: 'Washing Machine', slug: 'washing-machine' },
  { match: /fan|cooler|curtain/i, name: 'Fan & Cooler', slug: 'fan-and-cooler' },
  { match: /small-appliance|purifier|dehumidifier|iron|stabilizer/i, name: 'Small Appliances', slug: 'small-appliances' },
  { match: /generator/i, name: 'Generator', slug: 'generator' },
  { match: /transformer/i, name: 'Transformer', slug: 'transformer' },
  { match: /accessor/i, name: 'Accessories', slug: 'accessories' },
  { match: /servic|install/i, name: 'AC Servicing', slug: 'ac-servicing' },
];

const BRANDS = [
  'Gree',
  'Haier',
  'Haiko',
  'Konka',
  'Midea',
  'General',
  'Elite',
  'Viomi',
  'Green Aire',
  'Safe',
  'Xiaomi',
  'Dahua',
  'Imou',
  'Perkins',
  'Ricardo',
  'Cummins',
  'Value',
  'Hongsen',
  'DSZH',
  'Qunda',
  'AGG',
  'Saintshine',
  'Green Power',
  'PS Power',
];

function decodeEntities(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)));
}

function stripHtml(html) {
  return decodeEntities(
    String(html ?? '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/(p|div|h\d|li|tr)>/gi, '\n')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim(),
  );
}

function sanitizeHtml(html) {
  return String(html ?? '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/javascript:/gi, '')
    .trim();
}

function slugify(value) {
  return decodeEntities(value)
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

function money(prices, key) {
  const raw = Number(prices?.[key] ?? 0);
  const minor = Number(prices?.currency_minor_unit ?? 2);
  if (!Number.isFinite(raw)) return 0;
  return raw / 10 ** minor;
}

function mapTopCategory(categories) {
  const ordered = [...categories].reverse();
  for (const cat of ordered) {
    const hit = TOP_CATEGORY_MAP.find((row) => row.match.test(`${cat.slug} ${cat.name}`));
    if (hit) return hit;
  }
  return { name: 'Accessories', slug: 'accessories' };
}

function inferBrand(name, categories) {
  const hay = `${name} ${(categories ?? []).map((c) => c.name).join(' ')}`;
  const hit = BRANDS.find((brand) => new RegExp(`\\b${brand.replace(/\s+/g, '\\s+')}\\b`, 'i').test(hay));
  return hit ?? null;
}

function warrantyMonths(text) {
  const hay = text.toLowerCase();
  const years = hay.match(/(\d+)\s*(?:years?|yrs?)\s*(?:compressor|warranty|panel|parts)?/);
  if (years) return Number(years[1]) * 12;
  const months = hay.match(/(\d+)\s*months?\s*warranty/);
  if (months) return Number(months[1]);
  return 12;
}

function skuFrom(product, index) {
  const given = String(product.sku ?? '').trim();
  if (given) return given.slice(0, 32);
  const fromName = slugify(product.name).replace(/-/g, '').toUpperCase().slice(0, 16);
  return `${fromName || 'HT'}-${product.id || index + 1}`.slice(0, 32);
}

async function fetchJson(url, attempt = 1) {
  try {
    const res = await fetch(url, {
      headers: { Accept: 'application/json', 'User-Agent': UA },
      signal: AbortSignal.timeout(45000),
    });
    if (!res.ok) throw new Error(`${res.status} ${url}`);
    const total = Number(res.headers.get('x-wp-total') ?? 0);
    const pages = Number(res.headers.get('x-wp-totalpages') ?? 0);
    return { data: await res.json(), total, pages };
  } catch (error) {
    if (attempt >= 5) throw error;
    const wait = attempt * 2000;
    console.warn(`retry ${attempt} ${url}: ${error.message}`);
    await new Promise((resolve) => setTimeout(resolve, wait));
    return fetchJson(url, attempt + 1);
  }
}

async function fetchAllProducts() {
  const first = await fetchJson(`${BASE}/wp-json/wc/store/v1/products?per_page=100&page=1`);
  const pages = Math.max(1, first.pages || Math.ceil((first.total || first.data.length) / 100));
  console.log(`Live catalog: ${first.total || first.data.length} products across ${pages} pages`);
  const all = [...first.data];
  for (let page = 2; page <= pages; page += 1) {
    const next = await fetchJson(`${BASE}/wp-json/wc/store/v1/products?per_page=100&page=${page}`);
    all.push(...next.data);
    console.log(`  fetched page ${page}/${pages} (${all.length})`);
  }
  return all;
}

async function fetchCategories() {
  const all = [];
  for (let page = 1; page <= 20; page += 1) {
    const { data } = await fetchJson(`${BASE}/wp-json/wp/v2/product_cat?per_page=100&page=${page}`);
    if (!Array.isArray(data) || !data.length) break;
    all.push(...data);
    if (data.length < 100) break;
  }
  return all;
}

function uniqueImages(images) {
  const seen = new Set();
  const out = [];
  for (const image of images ?? []) {
    const src = String(image.src ?? '').split('?')[0];
    if (!src || seen.has(src)) continue;
    seen.add(src);
    out.push(src);
    if (out.length >= 4) break;
  }
  return out;
}

function extFromUrl(url) {
  const ext = extname(new URL(url).pathname).toLowerCase();
  return ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'].includes(ext) ? ext : '.jpg';
}

async function download(url, dest) {
  try {
    await access(dest);
    return true;
  } catch {
    // continue
  }
  await mkdir(dirname(dest), { recursive: true });
  const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(45000) });
  if (!res.ok || !res.body) return false;
  await pipeline(res.body, createWriteStream(dest));
  return true;
}

async function withLimit(items, limit, worker) {
  const out = [];
  let i = 0;
  async function run() {
    while (i < items.length) {
      const idx = i;
      i += 1;
      out[idx] = await worker(items[idx], idx);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
  return out;
}

const SKIP_CATS = /about|contact|uncategorized/i;

async function main() {
  await mkdir(IMAGE_DIR, { recursive: true });
  const [products, wooCategories] = await Promise.all([fetchAllProducts(), fetchCategories()]);
  const usedSlugs = new Set();
  const catalog = [];
  const imageJobs = [];

  for (const [index, product] of products.entries()) {
    const cats = (product.categories ?? []).filter((c) => !SKIP_CATS.test(c.slug) && !SKIP_CATS.test(c.name));
    const top = mapTopCategory(cats);
    let slug = slugify(product.name) || slugify(product.slug) || `product-${product.id}`;
    if (usedSlugs.has(slug)) slug = `${slug}-${product.id}`;
    usedSlugs.add(slug);
    const remoteImages = uniqueImages(product.images);
    const localImages = [];
    remoteImages.forEach((src, imageIndex) => {
      const file = `${slug}-${imageIndex + 1}${extFromUrl(src)}`;
      const dest = join(IMAGE_DIR, file);
      localImages.push(`/samples/products/${file}`);
      imageJobs.push({ src, dest });
    });
    const short = stripHtml(product.short_description || product.description).slice(0, 600) || null;
    const description = sanitizeHtml(product.description || product.short_description) || null;
    catalog.push({
      wooId: product.id,
      name: decodeEntities(product.name),
      slug,
      wooSlug: product.slug,
      sku: skuFrom(product, index),
      price: money(product.prices, 'price'),
      compareAtPrice: product.on_sale ? money(product.prices, 'regular_price') : null,
      inStock: Boolean(product.is_in_stock),
      shortDescription: short,
      description,
      category: top.name,
      categorySlug: top.slug,
      categories: cats.map((c) => c.name),
      brand: inferBrand(product.name, cats),
      images: localImages,
      image: localImages[0] ?? '',
      warrantyMonths: warrantyMonths(`${short ?? ''} ${stripHtml(product.description ?? '')}`),
    });
  }

  console.log(`Downloading ${imageJobs.length} images…`);
  let ok = 0;
  let fail = 0;
  await withLimit(imageJobs, 6, async (job) => {
    try {
      const saved = await download(job.src, job.dest);
      if (saved) ok += 1;
      else fail += 1;
    } catch {
      fail += 1;
    }
  });

  const categories = wooCategories
    .filter((c) => c.slug && !SKIP_CATS.test(c.slug) && !SKIP_CATS.test(c.name))
    .map((c) => ({
      wooId: c.id,
      parentWooId: c.parent || 0,
      name: decodeEntities(c.name),
      slug: c.slug,
      count: c.count ?? 0,
    }));

  const payload = catalog;
  await writeFile(OUT_JSON, `${JSON.stringify(payload, null, 2)}\n`);
  await writeFile(
    join(ROOT, 'live-categories.json'),
    `${JSON.stringify(categories, null, 2)}\n`,
  );
  console.log(
    JSON.stringify(
      {
        products: catalog.length,
        withImages: catalog.filter((p) => p.images.length).length,
        imagesOk: ok,
        imagesFail: fail,
        categories: categories.length,
        byCategory: catalog.reduce((acc, p) => {
          acc[p.category] = (acc[p.category] ?? 0) + 1;
          return acc;
        }, {}),
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

const HEADINGS = [
  'COMFORTABLE AND USER-FRIENDLY',
  'SAFE AND RELIABLE',
  'CLEAN AND HEALTHY',
  'INTELLIGENT MAINTENANCE',
  'CLEAN BREATHING',
  'METICULOUS CARE',
  'TECHNICAL SPECIFICATION',
  'TECHNICAL DATA SHEET',
  'PRODUCT INFORMATION',
  'PRODUCT FEATURES',
  'KEY FEATURES',
  'WARRANTY FOR SMART INVERTER AC',
  'WARRANTY',
  'DETAILS',
];

export type CopyBlock = { heading?: string; items: string[] };

const FEATURES = [
  'Comfortable Sleeping Mode',
  'Cold Air Prevention',
  'Washable Air Purify Filters',
  'Intelligent Auto Restart',
  'Healthy Top-Mounted Filter',
  'Intelligent Defrosting',
  'Low Voltage Start Up',
  'Low Voltage Startup',
  'Automatic Operation',
  'G-10 Inverter Technology',
  'Energy Saving',
  'Cold Plasma',
  'Auto Clean',
  'Auto Restart',
  'Self-Diagnosis',
  'LED Display',
  'Clock Display',
  'Turbo Button',
  'Child Lock',
  'Compact Design',
  '3D Airflow',
  'I-Feel',
  'I Feel',
  'Timer',
  'Lock',
  'Dehumidifying',
  'R32A',
  'R-32A',
  '1 W Standby',
  '1W Standby',
];

function splitFeatures(text: string) {
  const dict = [...FEATURES].sort((a, b) => b.length - a.length);
  let rest = text.replace(/\s+/g, ' ').trim();
  const items: string[] = [];
  let guard = 0;
  while (rest && guard++ < 80) {
    const hit = dict.find((feature) => rest.toLowerCase().startsWith(feature.toLowerCase()));
    if (hit) {
      items.push(hit);
      rest = rest.slice(hit.length).trim();
      continue;
    }
    const nextAt = dict.reduce((min, feature) => {
      const index = rest.toLowerCase().indexOf(` ${feature.toLowerCase()}`);
      return index >= 0 && index < min ? index : min;
    }, rest.length);
    const chunk = rest.slice(0, nextAt).trim();
    if (chunk) items.push(chunk);
    rest = rest.slice(nextAt).trim();
  }
  return items;
}

export function parseProductCopy(text: string | null | undefined): CopyBlock[] {
  if (!text?.trim()) return [];
  let marked = ` ${text.trim()} `;
  const sorted = [...HEADINGS].sort((a, b) => b.length - a.length);
  for (const heading of sorted) {
    marked = marked.replace(new RegExp(`\\s${heading}\\s`, 'gi'), `\n@@${heading}@@\n`);
  }
  const chunks = marked
    .split('\n')
    .map((chunk) => chunk.trim())
    .filter(Boolean);
  const blocks: CopyBlock[] = [];
  let current: CopyBlock = { items: [] };
  for (const chunk of chunks) {
    const headingMatch = chunk.match(/^@@(.+)@@$/);
    if (headingMatch) {
      if (current.heading || current.items.length) blocks.push(current);
      current = { heading: headingMatch[1], items: [] };
      continue;
    }
    current.items.push(...splitFeatures(chunk));
  }
  if (current.heading || current.items.length) blocks.push(current);
  return blocks;
}

export function warrantyLabel(months: number) {
  if (!months) return null;
  if (months % 12 === 0) {
    const years = months / 12;
    return `${years} year${years === 1 ? '' : 's'} warranty`;
  }
  return `${months} months warranty`;
}

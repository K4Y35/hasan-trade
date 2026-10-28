import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import PDFDocument from 'pdfkit';
import { env } from '../env';

type Address = {
  line1?: string;
  line2?: string;
  thana?: string;
  district?: string;
  division?: string;
  postalCode?: string;
};

export type ReceiptOrder = {
  orderNumber: string;
  name: string;
  phone: string;
  email: string | null;
  status: string;
  channel: string;
  placedAt: Date;
  subtotal: { toString(): string } | number;
  discount: { toString(): string } | number;
  tax: { toString(): string } | number;
  shipping: { toString(): string } | number;
  total: { toString(): string } | number;
  customerNotes: string | null;
  shippingAddress: unknown;
  items: { name: string; sku: string; quantity: number; unitPrice: { toString(): string } | number; total: { toString(): string } | number }[];
  payments: { provider: string; status: string; amount: { toString(): string } | number }[];
  coupon?: { code: string } | null;
};

export type ReceiptStore = {
  name: string;
  legalName: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  logoUrl: string | null;
  invoiceLogoUrl: string | null;
  invoiceFooter: string | null;
  copyrightText: string | null;
  currencySymbol: string;
};

const NAVY = '#1E40AF';
const INK = '#0F2942';
const MUTED = '#64748B';
const LINE = '#E2E8F0';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const uploadsRoot = path.isAbsolute(env.uploadsDir) ? env.uploadsDir : path.resolve(repoRoot, env.uploadsDir);
const fallbackLogo = path.join(repoRoot, 'apps/storefront/public/samples/logo.png');

function money(value: { toString(): string } | number) {
  const amount = Number(value);
  return `Tk ${amount.toLocaleString('en-BD', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function addressLines(address: unknown) {
  if (!address || typeof address !== 'object') return [];
  const row = address as Address;
  return [row.line1, row.line2, [row.thana, row.district, row.division].filter(Boolean).join(', '), row.postalCode].filter(
    (part): part is string => Boolean(part && String(part).trim()),
  );
}

async function loadLogo(url?: string | null): Promise<Buffer | null> {
  const files: string[] = [];
  if (url) {
    if (/^https?:\/\//i.test(url)) {
      try {
        const res = await fetch(url);
        if (res.ok) {
          const buf = Buffer.from(await res.arrayBuffer());
          if (buf.length > 80) return buf;
        }
      } catch {
        // fall through to local files
      }
    } else if (url.startsWith('/uploads/')) {
      files.push(path.join(uploadsRoot, url.replace(/^\/uploads\/?/, '')));
    } else if (url.startsWith('/')) {
      files.push(path.join(repoRoot, 'apps/storefront/public', url));
    }
  }
  files.push(fallbackLogo);
  for (const file of files) {
    try {
      const buf = await readFile(file);
      if (buf.length > 80) return buf;
    } catch {
      // try next candidate
    }
  }
  return null;
}

export async function buildReceiptPdf(order: ReceiptOrder, store: ReceiptStore) {
  const logo = await loadLogo(store.invoiceLogoUrl || store.logoUrl);

  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const pageW = doc.page.width;
    const left = 40;
    const right = pageW - 40;
    const contentW = right - left;

    doc.rect(0, 0, pageW, 108).fill(NAVY);

    let textX = left;
    if (logo) {
      try {
        doc.image(logo, left, 28, { fit: [150, 52], valign: 'center' });
        textX = left + 166;
      } catch {
        textX = left;
      }
    }

    doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(16).text(store.name, textX, 32, { width: right - textX });
    doc.font('Helvetica').fontSize(9).fillColor('#DBEAFE');
    const storeBits = [store.address, store.phone ? `Tel ${store.phone}` : null, store.email].filter(Boolean).join('  ·  ');
    doc.text(storeBits || 'Sylhet, Bangladesh', textX, 54, { width: right - textX });

    let y = 128;
    doc.fillColor(INK).font('Helvetica-Bold').fontSize(18).text('Sales receipt', left, y);
    doc.font('Helvetica').fontSize(10).fillColor(MUTED);
    doc.text(`Order ${order.orderNumber}`, left, y + 24);
    doc.text(new Date(order.placedAt).toLocaleString('en-BD'), left, y + 38);
    doc.font('Helvetica-Bold').fontSize(10).fillColor(NAVY).text(order.status.replace(/_/g, ' '), right - 160, y + 24, {
      width: 160,
      align: 'right',
    });
    doc.font('Helvetica').fillColor(MUTED).text(order.channel === 'WEB' ? 'Website order' : order.channel, right - 160, y + 38, {
      width: 160,
      align: 'right',
    });

    y = 188;
    doc.moveTo(left, y).lineTo(right, y).strokeColor(LINE).lineWidth(1).stroke();
    y += 16;

    doc.font('Helvetica-Bold').fontSize(9).fillColor(MUTED).text('BILL TO', left, y);
    y += 14;
    doc.font('Helvetica-Bold').fontSize(11).fillColor(INK).text(order.name, left, y);
    y += 16;
    doc.font('Helvetica').fontSize(10).fillColor(INK);
    doc.text(order.phone, left, y);
    y += 14;
    if (order.email) {
      doc.text(order.email, left, y);
      y += 14;
    }
    for (const line of addressLines(order.shippingAddress)) {
      doc.fillColor(MUTED).text(line, left, y, { width: contentW });
      y += 13;
    }

    y += 12;
    const cols = { qty: left, item: left + 40, sku: left + 278, unit: left + 360, total: left + 430 };
    doc.rect(left, y, contentW, 22).fill('#F1F5F9');
    doc.fillColor(INK).font('Helvetica-Bold').fontSize(8);
    doc.text('QTY', cols.qty + 6, y + 7, { width: 28 });
    doc.text('ITEM', cols.item, y + 7, { width: 230 });
    doc.text('SKU', cols.sku, y + 7, { width: 70 });
    doc.text('UNIT', cols.unit, y + 7, { width: 64, align: 'right' });
    doc.text('TOTAL', cols.total, y + 7, { width: 68, align: 'right' });
    y += 28;

    doc.font('Helvetica').fontSize(9).fillColor(INK);
    for (const item of order.items) {
      const itemHeight = Math.max(18, doc.heightOfString(item.name, { width: 230 }) + 6);
      if (y + itemHeight > doc.page.height - 80) {
        doc.addPage();
        y = 48;
      }
      doc.text(String(item.quantity), cols.qty + 6, y, { width: 28 });
      doc.text(item.name, cols.item, y, { width: 230 });
      doc.fillColor(MUTED).text(item.sku, cols.sku, y, { width: 70 });
      doc.fillColor(INK).text(money(item.unitPrice), cols.unit, y, { width: 64, align: 'right' });
      doc.font('Helvetica-Bold').text(money(item.total), cols.total, y, { width: 68, align: 'right' });
      doc.font('Helvetica');
      y += itemHeight;
      doc.moveTo(left, y - 4).lineTo(right, y - 4).strokeColor(LINE).lineWidth(0.5).stroke();
    }

    y += 10;
    const totalsX = left + 300;
    const row = (label: string, value: string, bold = false) => {
      doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(10).fillColor(bold ? INK : MUTED);
      doc.text(label, totalsX, y, { width: 90 });
      doc.fillColor(INK).text(value, totalsX + 90, y, { width: 108, align: 'right' });
      y += 16;
    };
    row('Subtotal', money(order.subtotal));
    if (Number(order.discount) > 0) {
      row(order.coupon?.code ? `Discount (${order.coupon.code})` : 'Discount', `-${money(order.discount)}`);
    }
    if (Number(order.tax) > 0) row('Tax', money(order.tax));
    if (Number(order.shipping) > 0) row('Shipping', money(order.shipping));
    doc.moveTo(totalsX, y - 4).lineTo(right, y - 4).strokeColor(NAVY).lineWidth(1).stroke();
    row('Total', money(order.total), true);

    y += 8;
    if (order.payments.length) {
      doc.font('Helvetica').fontSize(9).fillColor(MUTED);
      for (const payment of order.payments) {
        doc.text(`${payment.provider} · ${payment.status} · ${money(payment.amount)}`, left, y);
        y += 13;
      }
    }
    if (order.customerNotes) {
      y += 6;
      doc.font('Helvetica-Oblique').fontSize(9).fillColor(MUTED).text(`Note: ${order.customerNotes}`, left, y, { width: contentW });
      y += 16;
    }

    const footer = store.invoiceFooter || store.copyrightText || 'Thank you for shopping with Hasan Trade Electronics.';
    doc.font('Helvetica').fontSize(8).fillColor(MUTED).text(footer, left, doc.page.height - 52, {
      width: contentW,
      align: 'center',
    });

    doc.end();
  });
}

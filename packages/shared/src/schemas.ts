import { z } from 'zod';
import { THEME_IDS } from './constants';

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(20),
});

const emptyToNull = (schema: z.ZodTypeAny) =>
  z.preprocess((value) => (typeof value === 'string' && value.trim() === '' ? null : value), schema);

export const storeSettingsUpdateSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  legalName: emptyToNull(z.string().max(160).nullable()).optional(),
  tagline: emptyToNull(z.string().max(200).nullable()).optional(),
  description: emptyToNull(z.string().max(5000).nullable()).optional(),
  logoUrl: emptyToNull(z.string().max(500).nullable()).optional(),
  logoDarkUrl: emptyToNull(z.string().max(500).nullable()).optional(),
  faviconUrl: emptyToNull(z.string().max(500).nullable()).optional(),
  ogImageUrl: emptyToNull(z.string().max(500).nullable()).optional(),
  invoiceLogoUrl: emptyToNull(z.string().max(500).nullable()).optional(),
  logoHeight: z.coerce.number().int().min(28).max(120).optional(),
  email: emptyToNull(z.string().email().nullable()).optional(),
  phone: emptyToNull(z.string().max(30).nullable()).optional(),
  whatsapp: emptyToNull(z.string().max(80).nullable()).optional(),
  address: emptyToNull(z.string().max(500).nullable()).optional(),
  hours: emptyToNull(z.string().max(200).nullable()).optional(),
  city: emptyToNull(z.string().max(80).nullable()).optional(),
  currency: z.string().length(3).optional(),
  currencySymbol: z.string().max(8).optional(),
  timezone: z.string().max(60).optional(),
  language: z.enum(['EN', 'BN']).optional(),
  themeId: z.enum(THEME_IDS).optional(),
  colorPrimary: z.string().max(20).optional(),
  colorSecondary: z.string().max(20).optional(),
  colorAccent: z.string().max(20).optional(),
  colorBackground: z.string().max(20).optional(),
  colorForeground: z.string().max(20).optional(),
  colorMuted: z.string().max(20).optional(),
  fontSans: z.string().max(80).optional(),
  fontHeading: z.string().max(80).optional(),
  radius: z.string().max(20).optional(),
  buttonStyle: z.enum(['SOLID', 'OUTLINE', 'SOFT']).optional(),
  cardStyle: z.enum(['FLAT', 'ELEVATED', 'OUTLINED']).optional(),
  footerText: emptyToNull(z.string().max(2000).nullable()).optional(),
  copyrightText: emptyToNull(z.string().max(200).nullable()).optional(),
  invoiceFooter: emptyToNull(z.string().max(2000).nullable()).optional(),
  posReceiptFooter: emptyToNull(z.string().max(2000).nullable()).optional(),
  taxRate: z.number().min(0).max(100).optional(),
  taxInclusive: z.boolean().optional(),
  allowGuestCheckout: z.boolean().optional(),
  allowCod: z.boolean().optional(),
  metaTitle: emptyToNull(z.string().max(70).nullable()).optional(),
  metaDescription: emptyToNull(z.string().max(180).nullable()).optional(),
  facebookUrl: emptyToNull(z.string().max(500).nullable()).optional(),
  instagramUrl: emptyToNull(z.string().max(500).nullable()).optional(),
  youtubeUrl: emptyToNull(z.string().max(500).nullable()).optional(),
  popupEnabled: z.boolean().optional(),
  popupTitle: emptyToNull(z.string().max(160).nullable()).optional(),
  popupBody: emptyToNull(z.string().max(2000).nullable()).optional(),
  popupImageUrl: emptyToNull(z.string().max(500).nullable()).optional(),
  popupCtaLabel: emptyToNull(z.string().max(80).nullable()).optional(),
  popupCtaUrl: emptyToNull(z.string().max(500).nullable()).optional(),
});

const emailField = z.string().min(3).max(160);

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(8),
});

export const registerSchema = z.object({
  name: z.string().min(1).max(120),
  email: emailField,
  phone: z.string().min(8).max(20).optional(),
  password: z.string().min(8).max(72),
});

export const productWriteSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).optional(),
  sku: z.string().max(80).optional(),
  brandId: z.string().nullable().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).optional(),
  shortDescription: z.string().max(2000).nullable().optional(),
  description: z.string().max(20000).nullable().optional(),
  warrantyMonths: z.number().int().min(0).max(120).optional(),
  isSerialized: z.boolean().optional(),
  categoryIds: z.array(z.string()).optional(),
  variants: z
    .array(
      z.object({
        id: z.string().optional(),
        name: z.string().max(120).nullable().optional(),
        sku: z.string().min(1).max(80),
        barcode: z.string().max(80).nullable().optional(),
        price: z.number().min(0),
        compareAtPrice: z.number().min(0).nullable().optional(),
        costPrice: z.number().min(0).nullable().optional(),
        isDefault: z.boolean().optional(),
      }),
    )
    .min(1),
});

export const categoryWriteSchema = z.object({
  name: z.string().min(1).max(120),
  slug: z.string().min(1).max(160).optional(),
  parentId: z.string().nullable().optional(),
  description: z.string().max(2000).nullable().optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export const brandWriteSchema = z.object({
  name: z.string().min(1).max(120),
  slug: z.string().min(1).max(160).optional(),
  description: z.string().max(2000).nullable().optional(),
  website: z.string().url().nullable().optional(),
  isActive: z.boolean().optional(),
});

export const addressSchema = z.object({
  label: z.string().max(40).optional(),
  name: z.string().min(1).max(120),
  phone: z.string().min(8).max(20),
  line1: z.string().min(1).max(200),
  line2: z.string().max(200).optional(),
  thana: z.string().max(80).optional(),
  district: z.string().min(1).max(80),
  division: z.string().min(1).max(80),
  postalCode: z.string().max(20).optional(),
  country: z.string().length(2).default('BD'),
});

const checkoutItemSchema = z.object({
  variantId: z.string(),
  quantity: z.number().int().min(1).max(99),
});

export const couponPreviewSchema = z.object({
  code: z.string().min(1).max(40),
  items: z.array(checkoutItemSchema).min(1),
});

export const couponWriteSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(2)
      .max(40)
      .transform((value) => value.toUpperCase().replace(/\s+/g, '')),
    type: z.enum(['PERCENT', 'FIXED']),
    value: z.number().positive().max(1_000_000),
    minSubtotal: z.number().min(0).nullable().optional(),
    maxUses: z.number().int().min(1).nullable().optional(),
    startsAt: emptyToNull(z.string().max(40).nullable()).optional(),
    endsAt: emptyToNull(z.string().max(40).nullable()).optional(),
    isActive: z.boolean().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.type === 'PERCENT' && value.value > 100) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Percent off cannot be more than 100', path: ['value'] });
    }
  });

export const couponPatchSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(2)
      .max(40)
      .transform((value) => value.toUpperCase().replace(/\s+/g, ''))
      .optional(),
    type: z.enum(['PERCENT', 'FIXED']).optional(),
    value: z.number().positive().max(1_000_000).optional(),
    minSubtotal: z.number().min(0).nullable().optional(),
    maxUses: z.number().int().min(1).nullable().optional(),
    startsAt: emptyToNull(z.string().max(40).nullable()).optional(),
    endsAt: emptyToNull(z.string().max(40).nullable()).optional(),
    isActive: z.boolean().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.type === 'PERCENT' && value.value != null && value.value > 100) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Percent off cannot be more than 100', path: ['value'] });
    }
  });

export const checkoutSchema = z.object({
  name: z.string().min(1).max(120),
  phone: z.string().min(8).max(20),
  email: z.string().email().optional(),
  notes: z.string().max(1000).optional(),
  payment: z.enum(['COD', 'BKASH', 'NAGAD']).default('COD'),
  couponCode: z.string().max(40).optional(),
  shippingAddress: addressSchema,
  items: z.array(checkoutItemSchema).min(1),
});

export const warrantyRegisterSchema = z.object({
  serial: z.string().trim().min(3).max(80),
  productId: z.string().min(1),
  variantId: z.string().optional(),
  customerName: z.string().trim().min(1).max(120),
  phone: z.string().trim().min(8).max(20),
  purchaseDate: z.string().max(40).optional(),
  months: z.number().int().min(1).max(120).optional(),
  invoiceRef: emptyToNull(z.string().max(80).nullable()).optional(),
  notes: emptyToNull(z.string().max(2000).nullable()).optional(),
});

export const warrantyLookupSchema = z.object({
  serial: z.string().trim().min(3).max(80),
  phone: z.string().trim().min(8).max(20),
});

export const warrantyClaimCreateSchema = warrantyLookupSchema.extend({
  description: z.string().trim().min(10).max(4000),
});

export const warrantyClaimUpdateSchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'REJECTED']),
  resolution: z.string().trim().max(4000).optional(),
});

const menuLocationSchema = z.enum(['HEADER', 'FOOTER', 'MOBILE', 'ACCOUNT']);

type CmsMenuItem = {
  id?: string;
  label: string;
  url?: string | null;
  categoryId?: string | null;
  isActive?: boolean;
  children?: CmsMenuItem[];
};

export const cmsMenuItemSchema: z.ZodType<CmsMenuItem> = z.lazy(() =>
  z.object({
    id: z.string().max(40).optional(),
    label: z.string().min(1).max(120),
    url: z.string().max(500).nullable().optional(),
    categoryId: z.string().max(40).nullable().optional(),
    isActive: z.boolean().optional(),
    children: z.array(cmsMenuItemSchema).max(40).optional(),
  }),
);

export const cmsMenuWriteSchema = z.object({
  location: menuLocationSchema.optional(),
  items: z.array(cmsMenuItemSchema).max(80),
});

const heroSlideSchema = z.object({
  image: z.string().min(1).max(500),
  href: z.string().max(500).optional(),
  alt: z.string().max(160).optional(),
  heading: z.string().max(120).optional(),
  subheading: z.string().max(240).optional(),
});

const bannerItemSchema = z.object({
  image: z.string().min(1).max(500),
  href: z.string().max(500).optional(),
  alt: z.string().max(160).optional(),
});

export const homepageSectionTypeSchema = z.enum([
  'HERO',
  'FEATURED_CATEGORIES',
  'FEATURED_PRODUCTS',
  'BANNERS',
  'BRANDS',
  'CUSTOM_HTML',
]);

export const homepageSectionWriteSchema = z.object({
  id: z.string().max(40).optional(),
  type: homepageSectionTypeSchema,
  title: emptyToNull(z.string().max(160).nullable()).optional(),
  isVisible: z.boolean().optional(),
  payload: z
    .object({
      heading: z.string().max(160).optional(),
      subheading: z.string().max(400).optional(),
      ctaLabel: z.string().max(80).optional(),
      ctaHref: z.string().max(500).optional(),
      limit: z.number().int().min(0).max(500).optional(),
      categorySlug: z.string().max(160).optional(),
      categorySlugs: z.array(z.string().max(160)).max(40).optional(),
      slideSource: z.enum(['products', 'images']).optional(),
      body: z.string().max(8000).optional(),
      slides: z.array(heroSlideSchema).max(12).optional(),
      items: z.array(bannerItemSchema).max(8).optional(),
    })
    .passthrough()
    .default({}),
});

export const homepageWriteSchema = z.object({
  sections: z.array(homepageSectionWriteSchema).max(50),
});

export const posSaleSchema = z.object({
  customerId: z.string().optional(),
  customerName: z.string().max(120).optional(),
  customerPhone: z.string().max(20).optional(),
  notes: z.string().max(500).optional(),
  discount: z.number().min(0).default(0),
  items: z
    .array(
      z.object({
        variantId: z.string(),
        quantity: z.number().int().min(1),
        unitPrice: z.number().min(0).optional(),
      }),
    )
    .min(1),
  payments: z
    .array(
      z.object({
        provider: z.enum(['CASH', 'BKASH', 'NAGAD', 'CARD', 'BANK_TRANSFER', 'DUE']),
        amount: z.number().min(0.01),
        reference: z.string().max(80).optional(),
      }),
    )
    .min(1),
});

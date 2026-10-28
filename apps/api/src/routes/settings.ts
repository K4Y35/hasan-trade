import { prisma } from '@shopstack/db';
import { storeSettingsUpdateSchema } from '@shopstack/shared';
import { getTheme } from '@shopstack/themes';
import { Router } from 'express';
import { requireStaff } from '../lib/auth';
import { asyncHandler, HttpError } from '../lib/http';
import { publicMediaUrl } from '../lib/serialize';

export const settingsRouter = Router();

function publicSettings(settings: NonNullable<Awaited<ReturnType<typeof prisma.storeSettings.findUnique>>>) {
  const theme = getTheme(settings.themeId);
  return {
    store: {
      name: settings.name,
      slug: settings.slug,
      tagline: settings.tagline,
      description: settings.description,
      logoUrl: publicMediaUrl(settings.logoUrl) || settings.logoUrl,
      faviconUrl: publicMediaUrl(settings.faviconUrl) || settings.faviconUrl,
      ogImageUrl: publicMediaUrl(settings.ogImageUrl) || settings.ogImageUrl,
      logoHeight: settings.logoHeight,
      email: settings.email,
      phone: settings.phone,
      whatsapp: settings.whatsapp,
      address: settings.address,
      hours: settings.hours,
      currency: settings.currency,
      currencySymbol: settings.currencySymbol,
      language: settings.language,
      themeId: settings.themeId,
      footerText: settings.footerText,
      copyrightText: settings.copyrightText,
      allowCod: settings.allowCod,
      allowGuestCheckout: settings.allowGuestCheckout,
      metaTitle: settings.metaTitle,
      metaDescription: settings.metaDescription,
      facebookUrl: settings.facebookUrl,
      instagramUrl: settings.instagramUrl,
      youtubeUrl: settings.youtubeUrl,
      popup: {
        enabled: Boolean(settings.popupEnabled),
        title: settings.popupTitle,
        body: settings.popupBody,
        imageUrl: publicMediaUrl(settings.popupImageUrl) || settings.popupImageUrl,
        ctaLabel: settings.popupCtaLabel,
        ctaUrl: settings.popupCtaUrl,
        version: settings.popupUpdatedAt?.toISOString() ?? '',
      },
      tokens: {
        colorPrimary: settings.colorPrimary,
        colorSecondary: settings.colorSecondary,
        colorAccent: settings.colorAccent,
        colorBackground: settings.colorBackground,
        colorForeground: settings.colorForeground,
        colorMuted: settings.colorMuted,
        fontSans: settings.fontSans,
        fontHeading: settings.fontHeading,
        radius: settings.radius,
        buttonStyle: settings.buttonStyle,
        cardStyle: settings.cardStyle,
      },
    },
    theme: { id: theme.id, name: theme.name, description: theme.description },
  };
}

settingsRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const settings = await prisma.storeSettings.findUnique({ where: { id: 'default' } });
    if (!settings) throw new HttpError(404, 'Store is not initialized. Run pnpm db:seed.');
    res.json(publicSettings(settings));
  }),
);

settingsRouter.get(
  '/admin',
  requireStaff('settings.read'),
  asyncHandler(async (_req, res) => {
    const settings = await prisma.storeSettings.findUnique({ where: { id: 'default' } });
    if (!settings) throw new HttpError(404, 'Store is not initialized');
    res.json(settings);
  }),
);

settingsRouter.patch(
  '/',
  requireStaff('settings.write'),
  asyncHandler(async (req, res) => {
    const body = storeSettingsUpdateSchema.parse(req.body);
    const popupKeys = ['popupEnabled', 'popupTitle', 'popupBody', 'popupImageUrl', 'popupCtaLabel', 'popupCtaUrl'] as const;
    const touchesPopup = popupKeys.some((key) => Object.prototype.hasOwnProperty.call(body, key));
    const settings = await prisma.storeSettings.update({
      where: { id: 'default' },
      data: {
        ...body,
        ...(touchesPopup ? { popupUpdatedAt: new Date() } : {}),
      },
    });
    res.json(publicSettings(settings));
  }),
);

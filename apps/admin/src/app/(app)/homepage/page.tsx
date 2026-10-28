'use client';

import { useEffect, useState } from 'react';
import { FilterTabs, LoadingState, StickySaveBar } from '@/components/admin-ui';
import { FooterMenuEditor, HeaderMenuEditor } from '@/components/cms-menu-editor';
import { HomepageEditor } from '@/components/cms-homepage-editor';
import { PageHeader } from '@/components/page-header';
import { api } from '@/lib/api';
import {
  footerFromMenu,
  footerToMenu,
  fromApiMenu,
  fromApiSection,
  toApiMenu,
  toApiSection,
  type CategoryOption,
  type FooterColumn,
  type HomeSection,
  type MenuNode,
} from '@/lib/cms';

type Tab = 'header' | 'footer' | 'homepage';

const STOREFRONT_URL = process.env.NEXT_PUBLIC_STOREFRONT_URL ?? 'http://localhost:3000';

export default function HomepageCmsPage() {
  const [tab, setTab] = useState<Tab>('header');
  const [header, setHeader] = useState<MenuNode[] | null>(null);
  const [footer, setFooter] = useState<FooterColumn[] | null>(null);
  const [sections, setSections] = useState<HomeSection[] | null>(null);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [saving, setSaving] = useState('');
  const [saved, setSaved] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api<{ menus: { location: string; items: Parameters<typeof fromApiMenu>[0][] }[] }>('/v1/admin/cms/menus'),
      api<{ sections: Parameters<typeof fromApiSection>[0][] }>('/v1/admin/cms/homepage'),
      api<CategoryOption[]>('/v1/admin/catalog/categories'),
    ])
      .then(([menus, homepage, cats]) => {
        const headerMenu = menus.menus.find((menu) => menu.location === 'HEADER');
        const footerMenu = menus.menus.find((menu) => menu.location === 'FOOTER');
        setHeader((headerMenu?.items ?? []).map(fromApiMenu));
        setFooter(footerFromMenu((footerMenu?.items ?? []).map(fromApiMenu)));
        setSections(homepage.sections.map(fromApiSection));
        setCategories(cats);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load website content'));
  }, []);

  function flash(message: string) {
    setSaved(message);
    window.setTimeout(() => setSaved(''), 2800);
  }

  async function saveHeader() {
    if (!header) return;
    setError('');
    setSaving('header');
    try {
      await api('/v1/admin/cms/menus/HEADER', {
        method: 'PUT',
        body: JSON.stringify({ items: header.filter((item) => item.label.trim()).map(toApiMenu) }),
      });
      flash('Header menu saved. Refresh the storefront to see it.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the header menu');
    } finally {
      setSaving('');
    }
  }

  async function saveFooter() {
    if (!footer) return;
    setError('');
    setSaving('footer');
    try {
      await api('/v1/admin/cms/menus/FOOTER', {
        method: 'PUT',
        body: JSON.stringify({ items: footerToMenu(footer).map(toApiMenu) }),
      });
      flash('Footer saved. Refresh the storefront to see it.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the footer');
    } finally {
      setSaving('');
    }
  }

  async function saveHomepage() {
    if (!sections) return;
    setError('');
    setSaving('homepage');
    try {
      await api('/v1/admin/cms/homepage', {
        method: 'PUT',
        body: JSON.stringify({ sections: sections.map(toApiSection) }),
      });
      flash('Homepage saved. Refresh the storefront to see it.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the homepage');
    } finally {
      setSaving('');
    }
  }

  const ready = header && footer && sections;

  return (
    <div className="space-y-6 pb-28">
      <PageHeader
        kicker="Website"
        title="Homepage"
        lede="Change the header, footer, hero, category rows and banners. The shop, products and pages stay as they are."
        action={
          <a href={STOREFRONT_URL} target="_blank" rel="noreferrer" className="ghost">
            View storefront
          </a>
        }
      />

      <FilterTabs
        label="Website content"
        size="lg"
        value={tab}
        onChange={setTab}
        options={[
          { id: 'header', label: 'Header menu' },
          { id: 'footer', label: 'Footer' },
          { id: 'homepage', label: 'Homepage' },
        ]}
      />

      {!ready ? <LoadingState label="Loading website content…" /> : null}

      {tab === 'header' && header ? (
        <section className="space-y-4">
          <p className="max-w-2xl text-sm text-slate-500">
            The navy strip is the bar at the top of the shop. Names under each item appear in its dropdown. Click a name to edit it.
          </p>
          <HeaderMenuEditor items={header} categories={categories} onChange={setHeader} />
          <StickySaveBar saving={saving === 'header'} saved={saved} error={error} onSave={saveHeader} label="Save header menu" />
        </section>
      ) : null}

      {tab === 'footer' && footer ? (
        <section className="space-y-4">
          <p className="max-w-2xl text-sm text-slate-500">
            Each column is a heading with links under it. The store name, address and social links still come from Store settings.
          </p>
          <FooterMenuEditor columns={footer} onChange={setFooter} />
          <StickySaveBar saving={saving === 'footer'} saved={saved} error={error} onSave={saveFooter} label="Save footer" />
        </section>
      ) : null}

      {tab === 'homepage' && sections ? (
        <section className="space-y-4">
          <p className="max-w-2xl text-sm text-slate-500">
            Blocks appear in this order under the hero. Trust, showroom and service copy stay on the page and are not edited here.
          </p>
          <HomepageEditor sections={sections} categories={categories} onChange={setSections} />
          <StickySaveBar saving={saving === 'homepage'} saved={saved} error={error} onSave={saveHomepage} label="Save homepage" />
        </section>
      ) : null}
    </div>
  );
}


'use client';

import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Eye,
  EyeOff,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Field } from '@/components/field';
import {
  blankMenu,
  moveItem,
  type CategoryOption,
  type FooterColumn,
  type MenuNode,
  uid,
} from '@/lib/cms';

const PAGE_NAMES: Record<string, string> = {
  '/': 'Home',
  '/shop': 'All products',
  '/about': 'About',
  '/contact': 'Contact',
  '/services': 'Services',
  '/returns': 'Returns',
  '/terms': 'Terms',
};

const DEPTH_HINT = ['Menu bar', 'Dropdown group', 'Dropdown link'] as const;

function categoryPath(categories: CategoryOption[], id: string) {
  const map = new Map(categories.map((category) => [category.id, category]));
  const current = map.get(id);
  if (!current) return '';
  const parent = current.parentId ? map.get(current.parentId) : null;
  return parent ? `${parent.name} / ${current.name}` : current.name;
}

function countNodes(items: MenuNode[]): number {
  return items.reduce((total, item) => total + 1 + countNodes(item.children), 0);
}

function allKeys(items: MenuNode[]): string[] {
  return items.flatMap((item) => [item.key, ...allKeys(item.children)]);
}

function selfMatches(item: MenuNode, query: string) {
  if (!query) return true;
  return `${item.label} ${item.url}`.toLowerCase().includes(query);
}

function nodeMatches(item: MenuNode, query: string): boolean {
  return selfMatches(item, query) || item.children.some((child) => nodeMatches(child, query));
}

function linkedCategory(item: MenuNode, categories: CategoryOption[]) {
  if (item.categoryId) return categories.find((row) => row.id === item.categoryId) ?? null;
  const match = item.url.trim().match(/^\/shop\?category=([^&]+)$/);
  if (!match?.[1]) return null;
  const slug = decodeURIComponent(match[1]);
  return categories.find((row) => row.slug === slug) ?? null;
}

function destinationLabel(item: MenuNode, categories: CategoryOption[]) {
  if (item.categoryId) return categoryPath(categories, item.categoryId) || 'Category';
  const url = item.url.trim();
  if (!url) return 'No page yet';
  if (PAGE_NAMES[url]) return PAGE_NAMES[url];
  if (url.startsWith('/shop?category=')) {
    const slug = decodeURIComponent(url.slice('/shop?category='.length).split('&')[0] ?? '');
    const category = categories.find((row) => row.slug === slug);
    return category ? categoryPath(categories, category.id) : slug.replace(/-/g, ' ');
  }
  return url;
}

function CategoryPicker({
  categories,
  value,
  onPick,
  placeholder,
  labelledBy,
}: {
  categories: CategoryOption[];
  value?: string;
  onPick: (category: CategoryOption) => void;
  placeholder: string;
  labelledBy?: string;
}) {
  const listId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const selected = categories.find((category) => category.id === value);
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const list = needle
      ? categories.filter((category) => {
          const path = categoryPath(categories, category.id).toLowerCase();
          return path.includes(needle) || category.slug.includes(needle);
        })
      : categories;
    return list;
  }, [categories, query]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    return () => document.removeEventListener('mousedown', onPointer);
  }, [open]);

  useEffect(() => {
    setActive(0);
  }, [query, open]);

  const shown = open ? query : selected ? categoryPath(categories, selected.id) : query;

  return (
    <div ref={wrapRef} className="relative">
      <div className="relative">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={open && filtered[active] ? `${listId}-${filtered[active].id}` : undefined}
          aria-labelledby={labelledBy}
          value={shown}
          placeholder={placeholder}
          onFocus={() => {
            setOpen(true);
            setQuery('');
          }}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setOpen(true);
              setActive((index) => Math.min(filtered.length - 1, index + 1));
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setActive((index) => Math.max(0, index - 1));
            } else if (e.key === 'Enter') {
              const pick = filtered[active];
              if (open && pick) {
                e.preventDefault();
                onPick(pick);
                setQuery('');
                setOpen(false);
              }
            } else if (e.key === 'Escape') {
              setOpen(false);
            }
          }}
          className="pl-9"
        />
      </div>
      {open ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-50 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
        >
          {filtered.length ? (
            filtered.map((category, index) => (
              <li key={category.id} role="presentation">
                <button
                  type="button"
                  id={`${listId}-${category.id}`}
                  role="option"
                  aria-selected={index === active}
                  className={`flex w-full px-3 py-2 text-left text-sm ${
                    index === active ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                  onMouseEnter={() => setActive(index)}
                  onClick={() => {
                    onPick(category);
                    setQuery('');
                    setOpen(false);
                  }}
                >
                  {categoryPath(categories, category.id)}
                </button>
              </li>
            ))
          ) : (
            <li className="px-3 py-2 text-sm text-slate-500">No category matches “{query}”.</li>
          )}
        </ul>
      ) : null}
    </div>
  );
}

function MenuInspector({
  item,
  depth,
  categories,
  onChange,
}: {
  item: MenuNode;
  depth: number;
  categories: CategoryOption[];
  onChange: (item: MenuNode) => void;
}) {
  const category = linkedCategory(item, categories);
  const [opensCategory, setOpensCategory] = useState(Boolean(category));
  useEffect(() => {
    setOpensCategory(Boolean(linkedCategory(item, categories)));
    // Re-sync only when moving to another link.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- item.key is the selection
  }, [item.key]);
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-primary)]">{DEPTH_HINT[depth] ?? 'Link'}</p>
        <h2 className="mt-1 text-lg font-semibold text-slate-900">{item.label.trim() || 'Untitled link'}</h2>
      </div>
      <Field label="Name on the menu" hint="This is the word shoppers tap.">
        <input
          value={item.label}
          onChange={(e) => onChange({ ...item, label: e.target.value })}
          maxLength={120}
          placeholder="Air Conditioner"
          autoComplete="off"
        />
      </Field>
      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-slate-700">Opens</legend>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name={`dest-${item.key}`}
              checked={opensCategory}
              onChange={() => setOpensCategory(true)}
            />
            A product category
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name={`dest-${item.key}`}
              checked={!opensCategory}
              onChange={() => {
                setOpensCategory(false);
                onChange({ ...item, categoryId: '' });
              }}
            />
            A page or custom link
          </label>
        </div>
        {opensCategory ? (
          <CategoryPicker
            categories={categories}
            value={category?.id}
            placeholder="Search categories"
            onPick={(category) =>
              onChange({
                ...item,
                categoryId: category.id,
                url: `/shop?category=${category.slug}`,
                label: item.label.trim() ? item.label : category.name,
              })
            }
          />
        ) : (
          <Field label="Page link" hint="Examples: /about, /contact, /shop, /services">
            <input
              value={item.url}
              onChange={(e) => onChange({ ...item, url: e.target.value, categoryId: '' })}
              maxLength={500}
              placeholder="/about"
            />
          </Field>
        )}
      </fieldset>
      <label className="flex items-start gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 accent-[var(--color-primary)]"
          checked={item.isActive}
          onChange={(e) => onChange({ ...item, isActive: e.target.checked })}
        />
        <span>
          Show on the website
          <span className="mt-0.5 block text-xs text-slate-500">Off keeps it in this list without putting it on the shop.</span>
        </span>
      </label>
    </div>
  );
}

function MenuTreeRow({
  item,
  index,
  total,
  depth,
  query,
  openKeys,
  selectedKey,
  categories,
  onSelect,
  onToggle,
  onReveal,
  onChange,
  onMove,
  onRemove,
}: {
  item: MenuNode;
  index: number;
  total: number;
  depth: number;
  query: string;
  openKeys: Set<string>;
  selectedKey: string | null;
  categories: CategoryOption[];
  onSelect: (key: string) => void;
  onToggle: (key: string) => void;
  onReveal: (key: string) => void;
  onChange: (item: MenuNode) => void;
  onMove: (delta: number) => void;
  onRemove: () => void;
}) {
  const hasChildren = item.children.length > 0;
  const expanded = openKeys.has(item.key);
  const selected = selectedKey === item.key;
  const parentHit = selfMatches(item, query);
  const visibleChildren =
    query && !parentHit ? item.children.filter((child) => nodeMatches(child, query)) : item.children;
  const nestedCount = countNodes(item.children);

  return (
    <li>
      <div
        data-menu-key={item.key}
        className={`group flex scroll-mb-28 items-center gap-1 rounded-lg border px-1.5 py-1.5 ${
          selected
            ? 'border-[var(--color-primary)]/25 bg-[var(--color-primary)]/5'
            : 'border-transparent hover:bg-slate-50'
        } ${item.isActive ? '' : 'opacity-70'}`}
        style={{ paddingLeft: 6 + depth * 18 }}
      >
        {hasChildren ? (
          <button
            type="button"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-slate-500 hover:bg-white hover:text-slate-800"
            aria-expanded={expanded}
            aria-label={expanded ? `Collapse ${item.label || 'link'}` : `Expand ${item.label || 'link'}`}
            onClick={() => onToggle(item.key)}
          >
            {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        ) : (
          <span className="w-8 shrink-0" aria-hidden />
        )}
        <button
          type="button"
          className="min-w-0 flex-1 rounded-md px-1 py-0.5 text-left"
          onClick={() => {
            if (hasChildren) onReveal(item.key);
            onSelect(item.key);
          }}
        >
          <span className="flex items-center gap-2">
            <span className={`truncate text-sm ${depth === 0 ? 'font-semibold text-slate-900' : 'font-medium text-slate-800'}`}>
              {item.label.trim() || 'Untitled link'}
            </span>
            {!item.isActive ? <span className="badge badge-muted">Hidden</span> : null}
          </span>
          <span className="mt-0.5 block truncate text-xs text-slate-500">
            {(() => {
              const dest = destinationLabel(item, categories);
              const same = dest.toLowerCase() === item.label.trim().toLowerCase();
              const parts = [
                !same ? dest : null,
                nestedCount ? `${nestedCount} inside` : null,
              ].filter(Boolean);
              return parts.join(' · ') || DEPTH_HINT[depth] || 'Link';
            })()}
          </span>
        </button>
        <div className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            className="ghost px-2 py-1.5"
            onClick={() => onChange({ ...item, isActive: !item.isActive })}
            aria-pressed={item.isActive}
            aria-label={item.isActive ? 'Hide from website' : 'Show on website'}
            title={item.isActive ? 'Hide from website' : 'Show on website'}
          >
            {item.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
          <button
            type="button"
            className="ghost px-2 py-1.5"
            onClick={() => onMove(-1)}
            disabled={index === 0}
            aria-label="Move up"
            title="Move up"
          >
            <ChevronUp size={16} />
          </button>
          <button
            type="button"
            className="ghost px-2 py-1.5"
            onClick={() => onMove(1)}
            disabled={index === total - 1}
            aria-label="Move down"
            title="Move down"
          >
            <ChevronDown size={16} />
          </button>
          {depth < 2 ? (
            <button
              type="button"
              className="ghost px-2 py-1.5"
              onClick={() => {
                const child = blankMenu({ label: '' });
                onChange({ ...item, children: [...item.children, child] });
                onReveal(item.key);
                onSelect(child.key);
              }}
              aria-label="Add a link inside this one"
              title="Add a link inside this one"
            >
              <Plus size={16} />
            </button>
          ) : null}
          <button
            type="button"
            className="ghost px-2 py-1.5 text-red-600"
            onClick={onRemove}
            aria-label={`Remove ${item.label || 'link'}`}
            title="Remove"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      {selected ? (
        <div className="mb-3 ml-4 scroll-mb-28 rounded-xl border border-slate-200 bg-slate-50 p-4 md:ml-12">
          <MenuInspector item={item} depth={depth} categories={categories} onChange={onChange} />
        </div>
      ) : null}
      {hasChildren && expanded ? (
        <ul className="mt-0.5">
          {visibleChildren.map((child) => {
            const childIndex = item.children.findIndex((row) => row.key === child.key);
            return (
              <MenuTreeRow
                key={child.key}
                item={child}
                index={childIndex}
                total={item.children.length}
                depth={depth + 1}
                query={query}
                openKeys={openKeys}
                selectedKey={selectedKey}
                categories={categories}
                onSelect={onSelect}
                onToggle={onToggle}
                onReveal={onReveal}
                onChange={(next) =>
                  onChange({ ...item, children: item.children.map((row) => (row.key === next.key ? next : row)) })
                }
                onMove={(delta) => onChange({ ...item, children: moveItem(item.children, childIndex, delta) })}
                onRemove={() => {
                  onChange({ ...item, children: item.children.filter((row) => row.key !== child.key) });
                }}
              />
            );
          })}
        </ul>
      ) : null}
    </li>
  );
}

export function HeaderMenuEditor({
  items,
  categories,
  onChange,
}: {
  items: MenuNode[];
  categories: CategoryOption[];
  onChange: (items: MenuNode[]) => void;
}) {
  const searchId = useId();
  const [query, setQuery] = useState('');
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [openKeys, setOpenKeys] = useState<Set<string>>(() => new Set(items.map((item) => item.key)));
  const seeded = useRef(items.length > 0);
  const needle = query.trim().toLowerCase();
  const visibleItems = needle ? items.filter((item) => nodeMatches(item, needle)) : items;

  useEffect(() => {
    if (seeded.current || !items.length) return;
    seeded.current = true;
    setOpenKeys(new Set(items.map((item) => item.key)));
  }, [items]);

  useEffect(() => {
    if (!needle) return;
    const keys = new Set<string>();
    const collect = (nodes: MenuNode[]) => {
      for (const node of nodes) {
        if (node.children.some((child) => nodeMatches(child, needle))) keys.add(node.key);
        collect(node.children);
      }
    };
    collect(items);
    setOpenKeys((prev) => new Set([...prev, ...keys]));
  }, [needle, items]);

  function selectKey(key: string) {
    setSelectedKey(key);
    window.requestAnimationFrame(() => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      document.querySelector(`[data-menu-key="${key}"]`)?.scrollIntoView({
        block: 'center',
        behavior: reduce ? 'auto' : 'smooth',
      });
    });
  }

  function addCategory(category: CategoryOption) {
    const next = blankMenu({
      label: category.name,
      url: `/shop?category=${category.slug}`,
      categoryId: category.id,
    });
    onChange([...items, next]);
    selectKey(next.key);
  }

  function addCustom() {
    const next = blankMenu({ label: '', url: '/' });
    onChange([...items, next]);
    selectKey(next.key);
  }

  function toggleOpen(key: string) {
    setOpenKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function reveal(key: string) {
    setOpenKeys((prev) => new Set(prev).add(key));
  }

  const nestedCount = Math.max(0, countNodes(items) - items.length);

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl bg-[var(--color-primary)]">
        <p className="px-4 pt-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">Menu bar on the shop</p>
        <ul className="flex gap-1 overflow-x-auto px-3 pb-3 pt-2">
          {items.length ? (
            items.map((item) => (
              <li key={item.key} className="shrink-0">
                <button
                  type="button"
                  className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${
                    selectedKey === item.key ? 'bg-white text-[var(--color-primary)]' : 'text-white/90 hover:bg-white/10'
                  } ${item.isActive ? '' : 'opacity-40'}`}
                  onClick={() => {
                    setOpenKeys((prev) => new Set(prev).add(item.key));
                    selectKey(item.key);
                  }}
                >
                  {item.label.trim() || 'Untitled'}
                </button>
              </li>
            ))
          ) : (
            <li className="px-1 pb-1 text-sm text-white/70">Nothing on the bar yet</li>
          )}
        </ul>
      </div>

      <div className="card p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-slate-900">Menu links</p>
            <p className="text-xs text-slate-500">
              {items.length} on the bar
              {nestedCount ? ` · ${nestedCount} in dropdowns` : ''}
            </p>
          </div>
          <div className="flex flex-wrap gap-1">
            <button type="button" className="ghost px-2 py-1.5 text-xs" onClick={() => setOpenKeys(new Set(allKeys(items)))}>
              Expand all
            </button>
            <button type="button" className="ghost px-2 py-1.5 text-xs" onClick={() => setOpenKeys(new Set())}>
              Collapse all
            </button>
          </div>
        </div>

        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <div className="min-w-0 flex-1">
            <label id={searchId} className="sr-only">
              Search a category to add to the menu bar
            </label>
            <CategoryPicker
              categories={categories}
              labelledBy={searchId}
              placeholder="Search a category to add to the bar…"
              onPick={addCategory}
            />
          </div>
          <button type="button" className="ghost shrink-0" onClick={addCustom}>
            <Plus size={16} /> Add a page
          </button>
        </div>

        <div className="relative mt-3">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find a link in this menu…"
            aria-label="Find a link in this menu"
            className="pl-9"
          />
        </div>

        {visibleItems.length ? (
          <ul className="mt-3 pr-1">
            {visibleItems.map((item) => (
              <MenuTreeRow
                key={item.key}
                item={item}
                index={items.indexOf(item)}
                total={items.length}
                depth={0}
                query={needle}
                openKeys={openKeys}
                selectedKey={selectedKey}
                categories={categories}
                onSelect={selectKey}
                onToggle={toggleOpen}
                onReveal={reveal}
                onChange={(next) => onChange(items.map((row) => (row.key === next.key ? next : row)))}
                onMove={(delta) => onChange(moveItem(items, items.indexOf(item), delta))}
                onRemove={() => {
                  const next = items.filter((row) => row.key !== item.key);
                  onChange(next);
                  if (selectedKey === item.key) setSelectedKey(next[0]?.key ?? null);
                }}
              />
            ))}
          </ul>
        ) : (
          <p className="mt-6 rounded-xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500">
            {needle
              ? `No links match “${query}”.`
              : 'No header links yet. Search a category or add a page such as About or Contact.'}
          </p>
        )}
      </div>
    </div>
  );
}

export function FooterMenuEditor({
  columns,
  onChange,
}: {
  columns: FooterColumn[];
  onChange: (columns: FooterColumn[]) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          type="button"
          className="ghost"
          onClick={() => onChange([...columns, { key: uid(), title: 'New column', links: [] }])}
        >
          <Plus size={16} /> Add column
        </button>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {columns.map((column, index) => (
          <section key={column.key} className="card space-y-3 p-4">
            <div className="flex items-center gap-2">
              <input
                value={column.title}
                onChange={(e) =>
                  onChange(columns.map((row) => (row.key === column.key ? { ...row, title: e.target.value } : row)))
                }
                aria-label="Column title"
                placeholder="Column title"
              />
              <button type="button" className="ghost px-2" onClick={() => onChange(moveItem(columns, index, -1))} disabled={index === 0} aria-label="Move column left">
                <ChevronUp size={16} />
              </button>
              <button type="button" className="ghost px-2" onClick={() => onChange(moveItem(columns, index, 1))} disabled={index === columns.length - 1} aria-label="Move column right">
                <ChevronDown size={16} />
              </button>
              <button
                type="button"
                className="ghost px-2 text-red-600"
                onClick={() => onChange(columns.filter((row) => row.key !== column.key))}
                aria-label="Remove column"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <ul className="space-y-3">
              {column.links.map((link, linkIndex) => (
                <li key={link.key} className="space-y-2 rounded-lg border border-slate-100 p-3">
                  <input
                    value={link.label}
                    onChange={(e) =>
                      onChange(
                        columns.map((row) =>
                          row.key === column.key
                            ? {
                                ...row,
                                links: row.links.map((item) => (item.key === link.key ? { ...item, label: e.target.value } : item)),
                              }
                            : row,
                        ),
                      )
                    }
                    aria-label="Link label"
                    placeholder="Label"
                  />
                  <input
                    value={link.url}
                    onChange={(e) =>
                      onChange(
                        columns.map((row) =>
                          row.key === column.key
                            ? {
                                ...row,
                                links: row.links.map((item) => (item.key === link.key ? { ...item, url: e.target.value } : item)),
                              }
                            : row,
                        ),
                      )
                    }
                    aria-label="Link URL"
                    placeholder="/shop"
                  />
                  <div className="flex justify-end gap-1">
                    <button
                      type="button"
                      className="ghost px-2 py-1 text-xs"
                      onClick={() =>
                        onChange(
                          columns.map((row) =>
                            row.key === column.key ? { ...row, links: moveItem(row.links, linkIndex, -1) } : row,
                          ),
                        )
                      }
                      disabled={linkIndex === 0}
                    >
                      Up
                    </button>
                    <button
                      type="button"
                      className="ghost px-2 py-1 text-xs"
                      onClick={() =>
                        onChange(
                          columns.map((row) =>
                            row.key === column.key ? { ...row, links: moveItem(row.links, linkIndex, 1) } : row,
                          ),
                        )
                      }
                      disabled={linkIndex === column.links.length - 1}
                    >
                      Down
                    </button>
                    <button
                      type="button"
                      className="ghost px-2 py-1 text-xs text-red-600"
                      onClick={() =>
                        onChange(
                          columns.map((row) =>
                            row.key === column.key ? { ...row, links: row.links.filter((item) => item.key !== link.key) } : row,
                          ),
                        )
                      }
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="ghost w-full"
              onClick={() =>
                onChange(
                  columns.map((row) =>
                    row.key === column.key
                      ? { ...row, links: [...row.links, { key: uid(), label: '', url: '', isActive: true }] }
                      : row,
                  ),
                )
              }
            >
              <Plus size={14} /> Add link
            </button>
          </section>
        ))}
      </div>
    </div>
  );
}

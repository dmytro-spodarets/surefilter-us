"use client";

import { useMemo, useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Input from '@/components/ui/Input';
import Icon from '@/components/ui/Icon';
import Image from 'next/image';
import Link from 'next/link';
import Pagination from '@/components/ui/Pagination';
import CompactHero from '@/components/sections/CompactHero';

// Mock dataset
interface CatalogItem {
  code: string;
  name: string;
  type: 'Oil' | 'Air' | 'Fuel' | 'Hydraulic' | 'Cabin' | 'Coolant' | 'Blow-by';
  industry: 'On-Highway' | 'Agriculture' | 'Construction' | 'Mining' | 'Marine' | 'Industrial';
  make: 'HYUNDAI' | 'CAT' | 'VOLVO' | 'FORD' | 'KOMATSU' | 'CUMMINS';
  heightMm: number;
  image: string;
}

const DATA: CatalogItem[] = [
  { code: 'SFO241', name: 'Engine Oil Filter', type: 'Oil', industry: 'On-Highway', make: 'HYUNDAI', heightMm: 77, image: '/images/image.jpg' },
  { code: 'SFG84801E', name: 'Blow-by Gas Filter', type: 'Blow-by', industry: 'On-Highway', make: 'HYUNDAI', heightMm: 152, image: '/images/image-3.jpg' },
  { code: 'SFA100', name: 'Primary Air Filter', type: 'Air', industry: 'Construction', make: 'CAT', heightMm: 260, image: '/images/image-2.jpg' },
  { code: 'SFF320', name: 'Fuel Filter', type: 'Fuel', industry: 'Industrial', make: 'CUMMINS', heightMm: 135, image: '/images/image-4.jpg' },
  { code: 'SFH700', name: 'Hydraulic Return Filter', type: 'Hydraulic', industry: 'Construction', make: 'KOMATSU', heightMm: 210, image: '/images/image.jpg' },
  { code: 'SFC200', name: 'Cabin Air Filter', type: 'Cabin', industry: 'On-Highway', make: 'VOLVO', heightMm: 30, image: '/images/image-2.jpg' },
  { code: 'SFC900', name: 'Coolant Filter', type: 'Coolant', industry: 'Mining', make: 'CAT', heightMm: 110, image: '/images/image-3.jpg' },
  { code: 'SFA210', name: 'Secondary Air Filter', type: 'Air', industry: 'Agriculture', make: 'FORD', heightMm: 185, image: '/images/image-4.jpg' },
  { code: 'SFO310', name: 'High Efficiency Oil Filter', type: 'Oil', industry: 'Industrial', make: 'CUMMINS', heightMm: 95, image: '/images/image.jpg' },
  { code: 'SFF450', name: 'Water Separator', type: 'Fuel', industry: 'Marine', make: 'VOLVO', heightMm: 165, image: '/images/image-2.jpg' },
  { code: 'SFH820', name: 'Hydraulic Suction Filter', type: 'Hydraulic', industry: 'Mining', make: 'CAT', heightMm: 190, image: '/images/image-3.jpg' },
  { code: 'SFO500', name: 'Extended Life Oil Filter', type: 'Oil', industry: 'Construction', make: 'KOMATSU', heightMm: 120, image: '/images/image-4.jpg' },
];

const ALL_TYPES = ['Oil', 'Air', 'Fuel', 'Hydraulic', 'Cabin', 'Coolant', 'Blow-by'] as const;
const ALL_INDUSTRIES = ['On-Highway', 'Agriculture', 'Construction', 'Mining', 'Marine', 'Industrial'] as const;
const ALL_MAKES = ['HYUNDAI', 'CAT', 'VOLVO', 'FORD', 'KOMATSU', 'CUMMINS'] as const;

type ViewMode = 'gallery' | 'list';

type CollapsibleProps = {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
};

function Collapsible({ title, children, defaultOpen = false }: CollapsibleProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 rounded-lg">
      <button className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold text-gray-900" onClick={() => setOpen(o => !o)}>
        <span>{title}</span>
        <Icon name={open ? 'ChevronUpIcon' : 'ChevronDownIcon'} className="w-4 h-4" />
      </button>
      {open && <div className="px-3 pb-3">{children}</div>}
    </div>
  );
}

export default function CatalogPage() {
  // Filters state
  const [query, setQuery] = useState('');
  const [types, setTypes] = useState<string[]>([]);
  const [industries, setIndustries] = useState<string[]>([]);
  const [makes, setMakes] = useState<string[]>([]);
  const [minHeight, setMinHeight] = useState<string>('');
  const [maxHeight, setMaxHeight] = useState<string>('');

  // UI state
  const [view, setView] = useState<ViewMode>('gallery');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  // Derived list
  const filtered = useMemo(() => {
    let items = DATA;

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      items = items.filter(i => i.name.toLowerCase().includes(q) || i.code.toLowerCase().includes(q));
    }

    if (types.length) items = items.filter(i => types.includes(i.type));
    if (industries.length) items = items.filter(i => industries.includes(i.industry));
    if (makes.length) items = items.filter(i => makes.includes(i.make));

    const min = Number(minHeight);
    const max = Number(maxHeight);
    if (!Number.isNaN(min)) items = items.filter(i => minHeight === '' || i.heightMm >= min);
    if (!Number.isNaN(max)) items = items.filter(i => maxHeight === '' || i.heightMm <= max);

    return items;
  }, [query, types, industries, makes, minHeight, maxHeight]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleInArray = (arr: string[], value: string, setter: (v: string[]) => void) => {
    setter(arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value]);
    setPage(1);
  };

  const clearAll = () => {
    setQuery('');
    setTypes([]);
    setIndustries([]);
    setMakes([]);
    setMinHeight('');
    setMaxHeight('');
    setPage(1);
  };

  const GalleryCard = ({ item }: { item: CatalogItem }) => (
    <Link href={`/filters/${item.code}`} className="group block bg-white rounded-lg border border-gray-200 hover:border-sure-blue-300 transition-all overflow-hidden">
      <div className="relative aspect-[4/3] bg-gray-50">
        <Image src={item.image} alt={`${item.code}`} fill className="object-cover group-hover:scale-105 transition-transform" />
        <span className="absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium bg-black/60 text-white">{item.type}</span>
      </div>
      <div className="p-4">
        <h3 className="text-base font-semibold text-gray-900 group-hover:text-sure-blue-600 mb-1">{item.code}</h3>
        <div className="text-xs text-gray-500 flex items-center gap-2 flex-wrap">
          <span>{item.type}</span>
          <span>•</span>
          <span>{item.industry}</span>
        </div>
      </div>
    </Link>
  );

  const ListRow = ({ item }: { item: CatalogItem }) => (
    <Link href={`/filters/${item.code}`} className="group flex items-center gap-4 bg-white rounded-lg border border-gray-200 p-3 hover:border-sure-blue-300 transition-all">
      <div className="relative w-24 h-16 bg-gray-50 rounded overflow-hidden">
        <Image src={item.image} alt={`${item.code}`} fill className="object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900 group-hover:text-sure-blue-600 truncate">{item.code}</h3>
        </div>
        <div className="mt-1 text-xs text-gray-500 flex items-center gap-2 flex-wrap">
          <span>{item.type}</span>
          <span>•</span>
          <span>{item.industry}</span>
        </div>
      </div>
    </Link>
  );

  return (
    <main>
      <Header />

      <CompactHero
        title="Filters Catalog"
        description="Browse Sure Filter® products by type, industry, and vehicle make. Use filters to quickly find the right part."
        backgroundImage="https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
      />

      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Sidebar */}
          <aside className="md:col-span-3 lg:col-span-3">
            <div className="sticky top-28 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                <button className="text-sm text-sure-blue-600 hover:underline" onClick={clearAll}>Clear all</button>
              </div>

              {/* Search */}
              <Collapsible title="Search" defaultOpen>
                <Input
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                  placeholder="Search by code or name..."
                  className="w-full"
                />
              </Collapsible>

              {/* Type */}
              <Collapsible title="Type">
                <div className="space-y-2 max-h-48 overflow-auto pr-1">
                  {ALL_TYPES.map(t => (
                    <label key={t} className="flex items-center gap-2 text-sm text-gray-700">
                      <input type="checkbox" checked={types.includes(t)} onChange={() => toggleInArray(types, t, setTypes)} />
                      <span>{t}</span>
                    </label>
                  ))}
                </div>
              </Collapsible>

              {/* Industry */}
              <Collapsible title="Industry">
                <div className="space-y-2 max-h-48 overflow-auto pr-1">
                  {ALL_INDUSTRIES.map(t => (
                    <label key={t} className="flex items-center gap-2 text-sm text-gray-700">
                      <input type="checkbox" checked={industries.includes(t)} onChange={() => toggleInArray(industries, t, setIndustries)} />
                      <span>{t}</span>
                    </label>
                  ))}
                </div>
              </Collapsible>

              {/* Make */}
              <Collapsible title="Make">
                <div className="space-y-2 max-h-48 overflow-auto pr-1">
                  {ALL_MAKES.map(t => (
                    <label key={t} className="flex items-center gap-2 text-sm text-gray-700">
                      <input type="checkbox" checked={makes.includes(t)} onChange={() => toggleInArray(makes, t, setMakes)} />
                      <span>{t}</span>
                    </label>
                  ))}
                </div>
              </Collapsible>

              {/* Height */}
              <Collapsible title="Height (mm)">
                <div className="flex items-center gap-3">
                  <Input type="number" placeholder="Min" value={minHeight} onChange={(e) => { setMinHeight(e.target.value); setPage(1); }} className="w-full" />
                  <span className="text-gray-400">—</span>
                  <Input type="number" placeholder="Max" value={maxHeight} onChange={(e) => { setMaxHeight(e.target.value); setPage(1); }} className="w-full" />
                </div>
              </Collapsible>
            </div>
          </aside>

          {/* Content */}
          <section className="md:col-span-9 lg:col-span-9">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
              <div className="text-sm text-gray-500">{filtered.length} results</div>
              <div className="flex items-center gap-2">
                <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
                  <button onClick={() => setView('gallery')} aria-pressed={view === 'gallery'} className={`px-3 py-2 text-sm font-medium flex items-center gap-2 ${view === 'gallery' ? 'bg-sure-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
                    <Icon name="Squares2X2Icon" className="w-4 h-4" /> Gallery
                  </button>
                  <button onClick={() => setView('list')} aria-pressed={view === 'list'} className={`px-3 py-2 text-sm font-medium flex items-center gap-2 border-l border-gray-200 ${view === 'list' ? 'bg-sure-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
                    <Icon name="Bars3Icon" className="w-4 h-4" /> List
                  </button>
                </div>
                <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} className="text-sm border border-gray-200 rounded-lg px-2 py-2 bg-white">
                  <option value={12}>12 / page</option>
                  <option value={24}>24 / page</option>
                  <option value={48}>48 / page</option>
                </select>
              </div>
            </div>

            {/* Results */}
            {view === 'gallery' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {pageItems.map(item => <GalleryCard key={item.code} item={item} />)}
              </div>
            ) : (
              <div className="space-y-3">
                {pageItems.map(item => <ListRow key={item.code} item={item} />)}
              </div>
            )}

            {/* Pagination */}
            <Pagination currentPage={currentPage} totalPages={totalPages} onChange={setPage} className="mt-8" />
          </section>
        </div>
      </section>

      <Footer />
    </main>
  );
}

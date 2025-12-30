"use client";

import { useMemo, useState } from 'react';
import Input from '@/components/ui/Input';
import Icon from '@/components/ui/Icon';
import { ManagedImage } from '@/components/ui/ManagedImage';
import Link from 'next/link';
import Pagination from '@/components/ui/Pagination';

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
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors">
        <span className="font-medium text-gray-900">{title}</span>
        <Icon name={open ? 'ChevronUpIcon' : 'ChevronDownIcon'} className="w-5 h-5 text-gray-500" />
      </button>
      {open && <div className="p-3 bg-white">{children}</div>}
    </div>
  );
}

export default function CatalogClient() {
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

    const min = parseInt(minHeight, 10);
    const max = parseInt(maxHeight, 10);
    if (!isNaN(min)) items = items.filter(i => i.heightMm >= min);
    if (!isNaN(max)) items = items.filter(i => i.heightMm <= max);

    return items;
  }, [query, types, industries, makes, minHeight, maxHeight]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const currentPage = Math.min(page, totalPages || 1);
  const pageItems = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleFilter = (arr: string[], setter: (v: string[]) => void, val: string) => {
    setter(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);
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
        <ManagedImage src={item.image} alt={`${item.code}`} fill className="object-cover group-hover:scale-105 transition-transform" />
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
        <ManagedImage src={item.image} alt={`${item.code}`} fill className="object-cover" />
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
            <Collapsible title="Type" defaultOpen>
              <div className="space-y-2">
                {ALL_TYPES.map(t => (
                  <label key={t} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={types.includes(t)} onChange={() => toggleFilter(types, setTypes, t)} className="rounded" />
                    <span className="text-sm text-gray-700">{t}</span>
                  </label>
                ))}
              </div>
            </Collapsible>

            {/* Industry */}
            <Collapsible title="Industry">
              <div className="space-y-2">
                {ALL_INDUSTRIES.map(ind => (
                  <label key={ind} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={industries.includes(ind)} onChange={() => toggleFilter(industries, setIndustries, ind)} className="rounded" />
                    <span className="text-sm text-gray-700">{ind}</span>
                  </label>
                ))}
              </div>
            </Collapsible>

            {/* Make */}
            <Collapsible title="Make">
              <div className="space-y-2">
                {ALL_MAKES.map(m => (
                  <label key={m} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={makes.includes(m)} onChange={() => toggleFilter(makes, setMakes, m)} className="rounded" />
                    <span className="text-sm text-gray-700">{m}</span>
                  </label>
                ))}
              </div>
            </Collapsible>

            {/* Height */}
            <Collapsible title="Height (mm)">
              <div className="space-y-2">
                <Input value={minHeight} onChange={(e) => { setMinHeight(e.target.value); setPage(1); }} placeholder="Min" type="number" className="w-full" />
                <Input value={maxHeight} onChange={(e) => { setMaxHeight(e.target.value); setPage(1); }} placeholder="Max" type="number" className="w-full" />
              </div>
            </Collapsible>
          </div>
        </aside>

        {/* Main content */}
        <section className="md:col-span-9 lg:col-span-9">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-600">{filtered.length} results</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setView('gallery')} className={`p-2 rounded ${view === 'gallery' ? 'bg-sure-blue-100 text-sure-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}>
                <Icon name="Squares2X2Icon" className="w-5 h-5" />
              </button>
              <button onClick={() => setView('list')} className={`p-2 rounded ${view === 'list' ? 'bg-sure-blue-100 text-sure-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}>
                <Icon name="ListBulletIcon" className="w-5 h-5" />
              </button>
            </div>
          </div>

          {view === 'gallery' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
  );
}

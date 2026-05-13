'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  DocumentTextIcon,
  PlayIcon,
  BookOpenIcon,
  AcademicCapIcon,
  WrenchScrewdriverIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  Squares2X2Icon,
  Bars3Icon,
  FolderIcon,
} from '@heroicons/react/24/outline';
import { ManagedImage } from '@/components/ui/ManagedImage';
import { getAssetUrl } from '@/lib/assets';

const ResourcePreviewModal = dynamic(
  () => import('@/components/ResourcePreviewModal'),
  { ssr: false },
);

const iconMap: Record<string, any> = {
  DocumentTextIcon,
  PlayIcon,
  BookOpenIcon,
  AcademicCapIcon,
  WrenchScrewdriverIcon,
};

export interface TopCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  color?: string | null;
  _count: { resources: number };
}

export interface SubcategoryTileData {
  id: string;
  name: string;
  slug: string;
  parentSlug: string;
  image?: string | null;
  description?: string | null;
  resourceCount: number;
}

export interface ResourceTileData {
  id: string;
  title: string;
  slug: string;
  shortDescription?: string | null;
  thumbnailImage?: string | null;
  file: string;
  fileType: string;
  fileSize?: string | null;
  fileMeta?: string | null;
  allowDirectDownload: boolean;
  allowPreview: boolean;
  publishedAt: string;
  category: {
    id: string;
    name: string;
    slug: string;
    icon?: string | null;
    color?: string | null;
    parent?: { id: string; name: string; slug: string } | null;
  };
}

export type Tile =
  | { kind: 'subcategory'; data: SubcategoryTileData }
  | { kind: 'resource'; data: ResourceTileData };

interface SubcategoryNav {
  parentSlug: string;
  parentName: string;
  activeSubSlug: string; // '' = "All <parent>"
  items: { id: string; name: string; slug: string; resourceCount: number }[];
}

interface ResourcesShellProps {
  topCategories: TopCategory[];
  activeTopSlug: string;
  subcategoryNav?: SubcategoryNav | null;
  tiles: Tile[];
  heading?: string;
  headingDescription?: string;
  emptyMessage?: string;
}

function resourceHref(r: ResourceTileData) {
  return r.category.parent
    ? `/resources/${r.category.parent.slug}/${r.category.slug}/${r.slug}`
    : `/resources/${r.category.slug}/${r.slug}`;
}


export default function ResourcesShell({
  topCategories,
  activeTopSlug,
  subcategoryNav,
  tiles,
  heading,
  headingDescription,
  emptyMessage = 'Nothing here yet',
}: ResourcesShellProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'gallery' | 'list'>('gallery');
  const [previewResource, setPreviewResource] = useState<ResourceTileData | null>(null);

  const handleTopChange = (slug: string) => {
    router.push(slug ? `/resources/${slug}` : '/resources');
  };

  const handleSubChange = (slug: string) => {
    if (!subcategoryNav) return;
    router.push(
      slug
        ? `/resources/${subcategoryNav.parentSlug}/${slug}`
        : `/resources/${subcategoryNav.parentSlug}`,
    );
  };

  return (
    <section className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Top-level pills (always visible) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6 md:mb-8">
          <TopPill
            label="All Resources"
            icon={DocumentTextIcon}
            active={activeTopSlug === ''}
            onClick={() => handleTopChange('')}
          />
          {topCategories.map((c) => {
            const IconComp = (c.icon && iconMap[c.icon]) || DocumentTextIcon;
            return (
              <TopPill
                key={c.id}
                label={c.name}
                icon={IconComp}
                iconColorClass={c.color || undefined}
                active={activeTopSlug === c.slug}
                onClick={() => handleTopChange(c.slug)}
              />
            );
          })}
        </div>

        {/* Secondary subcategory chips */}
        {subcategoryNav && subcategoryNav.items.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6 md:mb-8">
            <SubChip
              label={`All ${subcategoryNav.parentName}`}
              active={subcategoryNav.activeSubSlug === ''}
              onClick={() => handleSubChange('')}
            />
            {subcategoryNav.items.map((s) => (
              <SubChip
                key={s.id}
                label={s.name}
                count={s.resourceCount}
                active={subcategoryNav.activeSubSlug === s.slug}
                onClick={() => handleSubChange(s.slug)}
              />
            ))}
          </div>
        )}

        {/* Heading */}
        {heading && (
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{heading}</h1>
            {headingDescription && (
              <p className="text-gray-600 mt-2 max-w-3xl">{headingDescription}</p>
            )}
          </div>
        )}

        {/* Count + view toggle */}
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <div className="text-sm text-gray-500">
            {tiles.length} {tiles.length === 1 ? 'item' : 'items'} • View:
          </div>
          <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
            <button
              onClick={() => setViewMode('gallery')}
              aria-pressed={viewMode === 'gallery'}
              className={`px-3 py-2 text-sm font-medium flex items-center gap-2 transition-colors ${
                viewMode === 'gallery'
                  ? 'bg-sure-blue-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Squares2X2Icon className="w-4 h-4" />
              Gallery
            </button>
            <button
              onClick={() => setViewMode('list')}
              aria-pressed={viewMode === 'list'}
              className={`px-3 py-2 text-sm font-medium flex items-center gap-2 transition-colors border-l border-gray-200 ${
                viewMode === 'list'
                  ? 'bg-sure-blue-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Bars3Icon className="w-4 h-4" />
              List
            </button>
          </div>
        </div>

        {/* Tiles */}
        {tiles.length === 0 ? (
          <EmptyState message={emptyMessage} />
        ) : viewMode === 'gallery' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {tiles.map((tile) =>
              tile.kind === 'subcategory' ? (
                <SubcategoryGalleryCard key={`s-${tile.data.id}`} sub={tile.data} />
              ) : (
                <ResourceGalleryCard
                  key={`r-${tile.data.id}`}
                  resource={tile.data}
                  onPreview={setPreviewResource}
                />
              ),
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {tiles.map((tile) =>
              tile.kind === 'subcategory' ? (
                <SubcategoryListRow key={`s-${tile.data.id}`} sub={tile.data} />
              ) : (
                <ResourceListRow
                  key={`r-${tile.data.id}`}
                  resource={tile.data}
                  onPreview={setPreviewResource}
                />
              ),
            )}
          </div>
        )}
      </div>

      {previewResource && (
        <ResourcePreviewModal
          isOpen={!!previewResource}
          onClose={() => setPreviewResource(null)}
          fileUrl={getAssetUrl(previewResource.file)}
          fileName={previewResource.title}
          fileType={previewResource.fileType}
          mimeType={
            previewResource.file.includes('.pdf')
              ? 'application/pdf'
              : previewResource.file.includes('.mp4')
                ? 'video/mp4'
                : undefined
          }
        />
      )}
    </section>
  );
}

function TopPill({
  label,
  icon: Icon,
  iconColorClass,
  active,
  onClick,
}: {
  label: string;
  icon: any;
  iconColorClass?: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
        active
          ? 'border-sure-blue-500 bg-sure-blue-50'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex flex-col items-center text-center">
        <div
          className={`p-3 rounded-full mb-2 ${
            active ? 'bg-sure-blue-500 text-white' : iconColorClass || 'bg-gray-100 text-gray-700'
          }`}
        >
          <Icon className="h-6 w-6" />
        </div>
        <span
          className={`text-sm font-medium ${active ? 'text-sure-blue-700' : 'text-gray-700'}`}
        >
          {label}
        </span>
      </div>
    </button>
  );
}

function SubChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
        active
          ? 'bg-sure-blue-500 text-white border-sure-blue-500'
          : 'bg-white text-gray-700 border-gray-200 hover:border-sure-blue-300 hover:text-sure-blue-700'
      }`}
    >
      <span>{label}</span>
      {typeof count === 'number' && (
        <span
          className={`text-xs px-2 py-0.5 rounded-full ${
            active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-12 bg-gray-50 rounded-lg">
      <DocumentTextIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
      <p className="text-gray-600 text-lg">{message}</p>
    </div>
  );
}

/* ------------------------------- Card variants ----------------------------- */

function CardImage({
  src,
  alt,
  fallbackIcon: FallbackIcon,
}: {
  src?: string | null;
  alt: string;
  fallbackIcon: any;
}) {
  if (src) {
    return (
      <div className="relative aspect-[826/1168] bg-gray-100 overflow-hidden">
        <ManagedImage src={src} alt={alt} fill className="object-cover" />
      </div>
    );
  }
  return (
    <div className="relative aspect-[826/1168] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
      <FallbackIcon className="h-20 w-20 text-gray-400" aria-label={alt} />
    </div>
  );
}

function SubcategoryGalleryCard({ sub }: { sub: SubcategoryTileData }) {
  const href = `/resources/${sub.parentSlug}/${sub.slug}`;
  return (
    <Link
      href={href}
      className="group relative block bg-white rounded-lg overflow-hidden border border-gray-200 hover:border-sure-blue-300 hover:bg-gray-50 transition-all"
    >
      <CardImage src={sub.image} alt={sub.name} fallbackIcon={FolderIcon} />
      <div
        aria-hidden="true"
        className="absolute top-3 right-3 inline-flex items-center justify-center w-7 h-7 rounded-full bg-sure-blue-600 text-white shadow-sm"
      >
        <FolderIcon className="h-4 w-4" />
      </div>
      <div className="p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[2.5rem] group-hover:text-sure-blue-600 transition-colors">
          {sub.name}
        </h3>
        <div className="text-xs text-gray-500 flex items-center gap-2 mb-3">
          <span>
            {sub.resourceCount} {sub.resourceCount === 1 ? 'catalog' : 'catalogs'}
          </span>
        </div>
        <div className="text-sure-blue-600 group-hover:text-sure-blue-700 text-sm font-medium">
          Browse →
        </div>
      </div>
    </Link>
  );
}

function ResourceGalleryCard({
  resource,
  onPreview,
}: {
  resource: ResourceTileData;
  onPreview: (r: ResourceTileData) => void;
}) {
  const detailHref = resourceHref(resource);
  const hasInlineAction = resource.allowPreview || resource.allowDirectDownload;

  const inner = (
    <>
      <CardImage src={resource.thumbnailImage} alt={resource.title} fallbackIcon={DocumentTextIcon} />
      <div className="p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[2.5rem] group-hover:text-sure-blue-600 transition-colors">
          {resource.title}
        </h3>
        <div className="text-xs text-gray-500 flex items-center gap-2 mb-3">
          <span>{resource.fileType}</span>
          {resource.fileSize && (
            <>
              <span>•</span>
              <span>{resource.fileSize}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {resource.allowPreview && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onPreview(resource);
              }}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white text-sure-blue-600 text-sm font-semibold rounded-lg border border-sure-blue-300 hover:bg-sure-blue-50 hover:border-sure-blue-400 transition-all"
            >
              <EyeIcon className="w-4 h-4" />
              Preview
            </button>
          )}
          {resource.allowDirectDownload && (
            <a
              href={getAssetUrl(resource.file)}
              download
              onClick={(e) => e.stopPropagation()}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white text-sure-blue-600 text-sm font-semibold rounded-lg border border-sure-blue-300 hover:bg-sure-blue-50 hover:border-sure-blue-400 transition-all"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              Download
            </a>
          )}
          {!hasInlineAction && (
            <div className="text-sure-blue-600 group-hover:text-sure-blue-700 text-sm font-medium">
              View Details →
            </div>
          )}
        </div>
      </div>
    </>
  );

  return hasInlineAction ? (
    <div className="group bg-white rounded-lg overflow-hidden border border-gray-200 hover:border-sure-blue-300 hover:bg-gray-50 transition-all">
      {inner}
    </div>
  ) : (
    <Link
      href={detailHref}
      className="group block bg-white rounded-lg overflow-hidden border border-gray-200 hover:border-sure-blue-300 hover:bg-gray-50 transition-all"
    >
      {inner}
    </Link>
  );
}

function SubcategoryListRow({ sub }: { sub: SubcategoryTileData }) {
  const href = `/resources/${sub.parentSlug}/${sub.slug}`;
  return (
    <Link
      href={href}
      className="group flex items-start gap-6 bg-white rounded-lg p-6 border border-gray-200 hover:border-sure-blue-300 hover:bg-gray-50 transition-all"
    >
      <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
        {sub.image ? (
          <ManagedImage src={sub.image} alt={sub.name} fill className="object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-sure-blue-500 to-sure-blue-700 flex items-center justify-center">
            <FolderIcon className="h-8 w-8 text-white/70" />
          </div>
        )}
      </div>
      <div className="flex-1">
        <h3 className="text-xl font-bold text-gray-900 group-hover:text-sure-blue-600 transition-colors">
          {sub.name}
        </h3>
        <div className="text-sm text-gray-500 mt-1">
          {sub.resourceCount} {sub.resourceCount === 1 ? 'catalog' : 'catalogs'}
        </div>
        {sub.description && (
          <p className="text-gray-600 mt-2 leading-relaxed line-clamp-2">{sub.description}</p>
        )}
      </div>
      <div className="text-sure-blue-600 font-semibold self-center">Browse →</div>
    </Link>
  );
}

function ResourceListRow({
  resource,
  onPreview,
}: {
  resource: ResourceTileData;
  onPreview: (r: ResourceTileData) => void;
}) {
  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200 hover:border-sure-blue-300 hover:bg-gray-50 transition-all">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sure-blue-100 text-sure-blue-800">
              {resource.category.name}
            </span>
            <span className="ml-3 text-sm text-gray-500">{resource.fileType}</span>
            {resource.fileSize && (
              <span className="ml-3 text-sm text-gray-500">{resource.fileSize}</span>
            )}
            {resource.fileMeta && (
              <span className="ml-3 text-sm text-gray-500">{resource.fileMeta}</span>
            )}
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{resource.title}</h3>
          {resource.shortDescription && (
            <p className="text-gray-600 mb-3 leading-relaxed">{resource.shortDescription}</p>
          )}
        </div>

        <div className="flex items-center gap-3 ml-4 flex-shrink-0">
          {resource.allowPreview && (
            <button
              onClick={() => onPreview(resource)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-sure-blue-600 font-semibold rounded-lg border border-sure-blue-300 hover:bg-sure-blue-50 hover:border-sure-blue-400 transition-all"
            >
              <EyeIcon className="w-5 h-5" />
              Preview
            </button>
          )}
          {resource.allowDirectDownload && (
            <a
              href={getAssetUrl(resource.file)}
              download
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-sure-blue-600 font-semibold rounded-lg border border-sure-blue-300 hover:bg-sure-blue-50 hover:border-sure-blue-400 transition-all"
            >
              <ArrowDownTrayIcon className="w-5 h-5" />
              Download
            </a>
          )}
          {!resource.allowDirectDownload && !resource.allowPreview && (
            <Link
              href={resourceHref(resource)}
              className="text-sure-blue-600 font-semibold hover:text-sure-blue-700 transition-colors"
            >
              View Details →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

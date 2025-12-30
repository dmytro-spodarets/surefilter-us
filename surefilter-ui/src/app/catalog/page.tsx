import CompactHero from '@/components/sections/CompactHero';
import CatalogClient from './CatalogClient';

export default function CatalogPage() {
  return (
    <>
      <CompactHero
        title="Filters Catalog"
        description="Browse Sure Filter® products by type, industry, and vehicle make. Use filters to quickly find the right part."
        backgroundImage="https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
      />
      <CatalogClient />
    </>
  );
}

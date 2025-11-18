import CompactHero from './CompactHero';
import { getResourcesPageSettings } from '@/lib/site-settings';
import { getAssetUrl } from '@/lib/assets';

// Server Component - данные в HTML при первом рендере (SEO ✅)
export default async function DynamicResourcesHero() {
  const settings = await getResourcesPageSettings();
  
  const backgroundImage = settings.heroImage 
    ? getAssetUrl(settings.heroImage)
    : 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80';

  return (
    <CompactHero
      title={settings.title}
      description={settings.description}
      backgroundImage={backgroundImage}
    />
  );
}


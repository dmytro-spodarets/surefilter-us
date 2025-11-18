import CompactHero from './CompactHero';
import { getNewsroomPageSettings } from '@/lib/site-settings';
import { getAssetUrl } from '@/lib/assets';

// Server Component - данные в HTML при первом рендере (SEO ✅)
export default async function DynamicNewsroomHero() {
  const settings = await getNewsroomPageSettings();
  
  const backgroundImage = settings.heroImage 
    ? getAssetUrl(settings.heroImage)
    : 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80';

  return (
    <CompactHero
      title={settings.title}
      description={settings.description}
      backgroundImage={backgroundImage}
    />
  );
}


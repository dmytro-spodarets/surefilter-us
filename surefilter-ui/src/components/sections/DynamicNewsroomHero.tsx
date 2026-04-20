import ColorHero from './ColorHero';
import { getNewsroomPageSettings } from '@/lib/site-settings';

// Server Component - данные в HTML при первом рендере (SEO ✅)
export default async function DynamicNewsroomHero() {
  const settings = await getNewsroomPageSettings();

  return (
    <ColorHero
      title={settings.title}
      description={settings.description}
      backgroundColor={settings.heroColor}
    />
  );
}


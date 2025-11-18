import Link from 'next/link';
import Logo from '@/components/ui/Logo';
import Icon from '@/components/ui/Icon';
import { getHeaderNavigation } from '@/lib/site-settings';
import MobileMenu from './MobileMenu';
import HeaderNav from './HeaderNav';
import ScrollHeader from './ScrollHeader';

const LOGO_SIZE = 64; // px, всегда одинаковый размер

// Server Component - загружает данные из БД
export default async function Header() {
  const navigation = await getHeaderNavigation();

  return (
    <ScrollHeader logoSize={LOGO_SIZE}>
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center h-full select-none" tabIndex={-1}>
          <span className="logo-container flex items-center justify-center">
            <Logo size="xl" />
          </span>
        </Link>

        {/* Desktop Navigation */}
        <HeaderNav navigation={navigation} />

        {/* Right Side Actions */}
        <div className="flex items-center space-x-4">
          {/* Browse Catalog Button */}
          <a
            href="/catalog"
            className="hidden md:flex items-center px-4 py-2 bg-sure-red-500 text-white font-medium rounded-lg hover:bg-sure-red-700 transition-colors duration-200"
          >
            <Icon name="MagnifyingGlassIcon" size="sm" color="white" className="mr-2" />
            Browse Catalog
          </a>

          {/* Mobile Menu */}
          <MobileMenu navigation={navigation} />
        </div>
      </div>
    </ScrollHeader>
  );
}

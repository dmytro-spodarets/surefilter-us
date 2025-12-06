import Link from 'next/link';
import Logo from '@/components/ui/Logo';
import { 
  FaLinkedin, 
  FaFacebook, 
  FaTwitter, 
  FaInstagram, 
  FaYoutube, 
  FaTiktok,
  FaApple, 
  FaGooglePlay 
} from 'react-icons/fa';
import { getFooterContent } from '@/lib/site-settings';

const iconMap: Record<string, any> = {
  LinkedIn: FaLinkedin,
  Facebook: FaFacebook,
  Twitter: FaTwitter,
  Instagram: FaInstagram,
  YouTube: FaYoutube,
  TikTok: FaTiktok,
};

export default async function Footer() {
  const footerData = await getFooterContent();

  // Use data from settings (fallbacks are handled in getFooterContent)
  const description = footerData.description || '';
  const address = footerData.address || [];
  const phone = footerData.phone || '';
  const fax = footerData.fax || '';
  const phoneTollFree = footerData.phoneTollFree || '';
  const aiAgent = footerData.aiAgent || '';
  const email = footerData.email || '';
  const companyLinks = footerData.companyLinks || [];
  const socialLinks = footerData.socialLinks || [];
  const appLinks = footerData.appLinks || { appStore: '', googlePlay: '' };
  const copyright = footerData.copyright || '';
  const legalLinks = footerData.legalLinks || [];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Логотип и описание */}
          <div className="md:col-span-2">
            <div className="mb-6">
              <Logo size="lg" />
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              {description}
            </p>
            
            {/* Контактная информация */}
            <div className="space-y-2 text-sm text-gray-300">
              {address.map((line, index) => (
                <p key={index}>{line}</p>
              ))}
              <p className="mt-4">
                <span className="font-medium">Phone:</span> {phone}
              </p>
              <p>
                <span className="font-medium">Fax:</span> {fax}
              </p>
              <p>
                {phoneTollFree}
              </p>
              <p>
                <span className="font-medium">{aiAgent.split(':')[0]}:</span> {aiAgent.split(':')[1]}
              </p>
              <p>
                <span className="font-medium">Email:</span> {email}
              </p>
            </div>
          </div>

          {/* Навигация по компании */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <nav className="space-y-2">
              {companyLinks.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block text-gray-300 hover:text-white transition-colors duration-200"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Социальные сети и приложения */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
            <div className="flex space-x-4 mb-6">
              {socialLinks.map((social) => {
                const IconComponent = iconMap[social.name] || FaLinkedin;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    className="text-gray-300 hover:text-white transition-colors duration-200 p-2 rounded-lg hover:bg-gray-800"
                    aria-label={social.name}
                  >
                    <IconComponent className="w-6 h-6" />
                  </a>
                );
              })}
            </div>
            
            <div>
              <h4 className="text-base font-semibold mb-3">Get our app</h4>
              <div className="flex items-center space-x-3">
                {appLinks.appStore && appLinks.appStore !== '#' && (
                  <a
                    href={appLinks.appStore}
                    className="inline-flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 transition-colors rounded-lg px-3 py-2"
                    aria-label="Download on the App Store"
                  >
                    <FaApple className="w-5 h-5" />
                    <span className="text-sm">App Store</span>
                  </a>
                )}
                {appLinks.googlePlay && appLinks.googlePlay !== '#' && (
                  <a
                    href={appLinks.googlePlay}
                    className="inline-flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 transition-colors rounded-lg px-3 py-2"
                    aria-label="Get it on Google Play"
                  >
                    <FaGooglePlay className="w-5 h-5" />
                    <span className="text-sm">Google Play</span>
                  </a>
                )}
                {(!appLinks.appStore || appLinks.appStore === '#') && (!appLinks.googlePlay || appLinks.googlePlay === '#') && (
                  <>
                    <a
                      href="#"
                      className="inline-flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 transition-colors rounded-lg px-3 py-2"
                      aria-label="Download on the App Store"
                    >
                      <FaApple className="w-5 h-5" />
                      <span className="text-sm">App Store</span>
                    </a>
                    <a
                      href="#"
                      className="inline-flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 transition-colors rounded-lg px-3 py-2"
                      aria-label="Get it on Google Play"
                    >
                      <FaGooglePlay className="w-5 h-5" />
                      <span className="text-sm">Google Play</span>
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Нижняя часть */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              {copyright}
            </p>
            
            {legalLinks.length > 0 && (
              <div className="flex space-x-6 mt-4 md:mt-0">
                {legalLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="text-gray-400 hover:text-white text-sm transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}

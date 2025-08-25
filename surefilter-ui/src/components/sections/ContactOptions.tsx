import Icon from '@/components/ui/Icon';

interface ContactOptionItem { icon?: string; title: string; description?: string; href?: string; cta?: string }
interface ContactOptionsProps {
  items?: ContactOptionItem[];
  phone?: string; // legacy
  chatHref?: string; // legacy
  askHref?: string; // legacy
  className?: string;
}

export default function ContactOptions({ items, phone = '+1 (555) 123-4567', chatHref = '#', askHref = '#contact-form', className = '' }: ContactOptionsProps) {
  const legacyItems: ContactOptionItem[] = [
    { icon: 'PhoneIcon', title: 'Call Us', description: phone, href: `tel:${phone.replace(/[^+\d]/g, '')}`, cta: 'Call Now' },
    { icon: 'ChatBubbleLeftRightIcon', title: 'Chat Live', description: "We're available Sun 7:00pm EST – Friday 7:00pm EST", href: chatHref, cta: 'Chat Now' },
    { icon: 'EnvelopeIcon', title: 'Ask a Question', description: "Fill out our form and we'll get back to you in 24 hours.", href: askHref, cta: 'Get Started' },
  ];
  const list = items && items.length > 0 ? items : legacyItems;

  return (
    <section className={`pt-24 pb-20 bg-white ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {list.map((item, idx) => (
            <a
              key={`${item.title}-${idx}`}
              href={(item.href ?? '#') + ''}
              className="group relative rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-sure-blue-500"
            >
              <div className="absolute -top-6 left-6 w-16 h-16 rounded-full bg-sure-blue-600 flex items-center justify-center text-white shadow-md z-10">
                <Icon name={item.icon || 'PhoneIcon'} className="w-7 h-7" />
              </div>
              <div className="px-6 pt-12 pb-12">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 mb-4 min-h-[2rem]">{item.description || ''}</p>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-sure-blue-600 group-hover:text-sure-blue-700">
                  {(item.cta || 'Learn more')} <Icon name="ChevronRightIcon" className="w-4 h-4" />
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

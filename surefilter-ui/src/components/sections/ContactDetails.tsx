import ContactOptions from '@/components/sections/ContactOptions';
import ContactInfo from '@/components/sections/ContactInfo';

export default function ContactDetails({ options, info }: { options: { phone?: string; chatHref?: string; askHref?: string }; info: any }) {
  return (
    <>
      <ContactOptions phone={options?.phone || ''} chatHref={options?.chatHref || '#'} askHref={options?.askHref || '#contact-form'} />
      <ContactInfo title={info?.title} general={info?.general} support={info?.support} address={info?.address} />
    </>
  );
}



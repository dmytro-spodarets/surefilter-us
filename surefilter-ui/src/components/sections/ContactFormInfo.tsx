import ContactForm from '@/components/sections/ContactForm';
import ContactInfo from '@/components/sections/ContactInfo';

export default function ContactFormInfo({ form, info }: { form: any; info: any }) {
  return (
    <section className="pt-0 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid md:grid-cols-3 gap-12">
          <div className="md:col-span-2">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{form?.title || 'Send Us a Message'}</h2>
            {form?.description ? <p className="text-sm text-gray-500 mb-6">{form.description}</p> : null}
            <ContactForm title={undefined} description={undefined} subjects={form?.subjects || []} bare={true} className="pt-0 pb-0" />
          </div>
          <div className="md:col-span-1">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">{info?.title || 'Get in Touch'}</h2>
            <ContactInfo title={undefined} general={info?.general} support={info?.support} address={info?.address} bare={true} />
          </div>
        </div>
      </div>
    </section>
  );
}



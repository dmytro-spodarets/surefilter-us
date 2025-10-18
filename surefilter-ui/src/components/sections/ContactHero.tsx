import Image from 'next/image';
import { getAssetUrl } from '@/lib/assets';

export default function ContactHero({ title, description, image }: { title: string; description?: string; image?: string }) {
  const defaultImage = 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?auto=format&fit=crop&w=1000&q=80';
  const img = image ? getAssetUrl(image) : defaultImage;
  return (
    <section className="relative h-[60vh] min-h-[500px] max-h-[700px] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <div className="text-center lg:text-left">
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-gray-900 leading-tight mb-4 lg:mb-6">{title}</h1>
            {description ? (
              <p className="text-base lg:text-xl text-gray-600 leading-relaxed">{description}</p>
            ) : null}
          </div>
          <div className="relative w-full flex justify-center lg:justify-end">
            <div className="aspect-[4/3] w-full max-w-lg lg:max-w-xl rounded-2xl overflow-hidden shadow-xl relative">
              <Image 
                src={img} 
                alt="Outer space view showing global connectivity and limitless reach" 
                fill 
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover" 
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}



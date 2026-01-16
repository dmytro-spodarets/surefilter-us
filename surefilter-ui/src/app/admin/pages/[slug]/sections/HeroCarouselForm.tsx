'use client';

import { useState } from 'react';

interface HeroSlide {
  badge?: string;
  titlePrefix?: string;
  titleHighlight?: string;
  subtitle?: string;
  image?: string;
  ctaText?: string;
  ctaHref?: string;
}

interface HeroCarouselFormData {
  slides: HeroSlide[];
  autoplayDelay?: number;
  showNavigation?: boolean;
  showPagination?: boolean;
}

export default function HeroCarouselForm({ sectionId, initialData }: { sectionId: string; initialData: HeroCarouselFormData }) {
  const [form, setForm] = useState<HeroCarouselFormData>({
    slides: Array.isArray(initialData?.slides) && initialData.slides.length > 0 
      ? initialData.slides 
      : [{ badge: '', titlePrefix: '', titleHighlight: '', subtitle: '', image: '', ctaText: '', ctaHref: '' }],
    autoplayDelay: initialData?.autoplayDelay || 3000,
    showNavigation: initialData?.showNavigation !== false,
    showPagination: initialData?.showPagination !== false,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const updateSlide = (idx: number, key: keyof HeroSlide, value: string) => {
    setForm((f) => {
      const slides = [...f.slides];
      slides[idx] = { ...slides[idx], [key]: value };
      return { ...f, slides };
    });
  };

  const addSlide = () => setForm((f) => ({ 
    ...f, 
    slides: [...f.slides, { badge: '', titlePrefix: '', titleHighlight: '', subtitle: '', image: '', ctaText: '', ctaHref: '' }] 
  }));

  const removeSlide = (idx: number) => setForm((f) => ({ 
    ...f, 
    slides: f.slides.filter((_, i) => i !== idx) 
  }));

  const moveSlideUp = (idx: number) => {
    if (idx === 0) return;
    setForm((f) => {
      const slides = [...f.slides];
      [slides[idx - 1], slides[idx]] = [slides[idx], slides[idx - 1]];
      return { ...f, slides };
    });
  };

  const moveSlideDown = (idx: number) => {
    if (idx === form.slides.length - 1) return;
    setForm((f) => {
      const slides = [...f.slides];
      [slides[idx], slides[idx + 1]] = [slides[idx + 1], slides[idx]];
      return { ...f, slides };
    });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    
    const response = await fetch(`/api/admin/sections/${sectionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'hero_carousel', data: form }),
    });
    
    if (!response.ok) {
      console.error('Failed to save Hero Carousel:', await response.json());
    }
    
    setSaving(false);
    setSaved(true);
  };

  return (
    <section className="border border-gray-200 rounded-lg p-5">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Hero Carousel</h2>
      {saved && <p className="text-sm text-green-700 mb-3">Saved</p>}
      <form onSubmit={onSubmit} className="grid gap-6">
        
        {/* Settings */}
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <h3 className="font-medium text-gray-900 mb-3">Carousel Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Autoplay Delay (ms)</label>
              <input 
                type="number" 
                className="w-full border border-gray-300 rounded-lg px-3 py-2" 
                value={form.autoplayDelay} 
                onChange={(e) => setForm({ ...form, autoplayDelay: parseInt(e.target.value) || 3000 })} 
                min="1000"
                step="1000"
              />
              <p className="text-xs text-gray-500 mt-1">Default: 3000ms (3 seconds)</p>
            </div>
            <div className="flex items-center">
              <label className="flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={form.showNavigation} 
                  onChange={(e) => setForm({ ...form, showNavigation: e.target.checked })}
                  className="w-4 h-4 text-sure-blue-600 border-gray-300 rounded focus:ring-sure-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Show Navigation Arrows</span>
              </label>
            </div>
            <div className="flex items-center">
              <label className="flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={form.showPagination} 
                  onChange={(e) => setForm({ ...form, showPagination: e.target.checked })}
                  className="w-4 h-4 text-sure-blue-600 border-gray-300 rounded focus:ring-sure-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Show Pagination Dots</span>
              </label>
            </div>
          </div>
        </div>

        {/* Slides */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">Slides ({form.slides.length})</h3>
            <button type="button" onClick={addSlide} className="text-sure-blue-600 hover:underline text-sm">
              + Add Slide
            </button>
          </div>
          
          {form.slides.map((slide, idx) => (
            <div key={idx} className="border border-gray-200 rounded-lg p-4 bg-white">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-700">Slide {idx + 1}</h4>
                <div className="flex items-center gap-2">
                  <button 
                    type="button" 
                    onClick={() => moveSlideUp(idx)} 
                    disabled={idx === 0}
                    className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move up"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button 
                    type="button" 
                    onClick={() => moveSlideDown(idx)} 
                    disabled={idx === form.slides.length - 1}
                    className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move down"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <button 
                    type="button" 
                    onClick={() => removeSlide(idx)} 
                    className="p-1 text-red-600 hover:text-red-900"
                    title="Remove slide"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="grid gap-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Badge (optional)</label>
                  <input 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2" 
                    value={slide.badge || ''} 
                    onChange={(e) => updateSlide(idx, 'badge', e.target.value)}
                    placeholder="e.g., Industry Leader"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Title Prefix</label>
                    <input 
                      className="w-full border border-gray-300 rounded-lg px-3 py-2" 
                      value={slide.titlePrefix || ''} 
                      onChange={(e) => updateSlide(idx, 'titlePrefix', e.target.value)}
                      placeholder="e.g., Premium Quality"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Title Highlight (red text)</label>
                    <input 
                      className="w-full border border-gray-300 rounded-lg px-3 py-2" 
                      value={slide.titleHighlight || ''} 
                      onChange={(e) => updateSlide(idx, 'titleHighlight', e.target.value)}
                      placeholder="e.g., Filtration Solutions"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Subtitle</label>
                  <textarea 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2" 
                    rows={3} 
                    value={slide.subtitle || ''} 
                    onChange={(e) => updateSlide(idx, 'subtitle', e.target.value)}
                    placeholder="Enter slide description..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Image URL</label>
                  <input 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2" 
                    value={slide.image || ''} 
                    onChange={(e) => updateSlide(idx, 'image', e.target.value)}
                    placeholder="/images/hero-1.jpg or CDN URL"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use File Manager to upload and copy CDN URL, or use /images/* path
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      CTA Button Text
                      <span className="text-gray-400 font-normal ml-2">(Optional)</span>
                    </label>
                    <input 
                      className="w-full border border-gray-300 rounded-lg px-3 py-2" 
                      value={slide.ctaText || ''} 
                      onChange={(e) => updateSlide(idx, 'ctaText', e.target.value)}
                      placeholder="e.g., Browse our complete catalog"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      CTA Link URL
                      <span className="text-gray-400 font-normal ml-2">(Optional)</span>
                    </label>
                    <input 
                      className="w-full border border-gray-300 rounded-lg px-3 py-2" 
                      value={slide.ctaHref || ''} 
                      onChange={(e) => updateSlide(idx, 'ctaHref', e.target.value)}
                      placeholder="e.g., /catalog or #products"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Default: "Browse our complete catalog" → "#products"
                </p>
              </div>
            </div>
          ))}
          
          {form.slides.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No slides yet. Click "Add Slide" to get started.</p>
            </div>
          )}
        </div>

        <div>
          <button 
            type="submit" 
            className="bg-sure-orange-500 text-white rounded-lg px-6 py-2 hover:bg-sure-orange-600 transition-colors" 
            disabled={saving}
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </section>
  );
}


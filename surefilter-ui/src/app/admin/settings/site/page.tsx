'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import MediaPickerModal from '@/components/admin/MediaPickerModal';
import { getAssetUrl } from '@/lib/assets';

interface MenuChildItem {
  label: string;
  url: string;
  order: number;
  isActive: boolean;
}

interface MenuItem {
  label: string;
  url: string;
  order: number;
  isActive: boolean;
  children?: MenuChildItem[];
}

interface FooterContent {
  description?: string;
  address?: string[];  // Multiple lines for address
  phone?: string;
  fax?: string;
  phoneTollFree?: string; // +1 8448 BE SURE
  aiAgent?: string; // Phil, our AI Service Agent
  email?: string;
  
  companyLinks?: { name: string; href: string }[];
  
  socialLinks?: { name: string; href: string }[];
  
  appLinks?: {
    appStore?: string;
    googlePlay?: string;
  };
  
  copyright?: string;
  legalLinks?: { name: string; href: string }[];
}

interface RedirectRule {
  id: string;
  source: string;
  destination: string;
  statusCode: 301 | 302;
  isActive: boolean;
  comment?: string;
}

interface SiteSettingsData {
  newsroomTitle?: string;
  newsroomDescription?: string;
  newsroomHeroImage?: string;
  newsroomMetaTitle?: string;
  newsroomMetaDesc?: string;
  newsroomOgImage?: string;
  newsArticleTitle?: string;
  newsArticleDescription?: string;
  newsArticleHeroImage?: string;
  eventArticleTitle?: string;
  eventArticleDescription?: string;
  eventArticleHeroImage?: string;
  resourcesTitle?: string;
  resourcesDescription?: string;
  resourcesHeroImage?: string;
  resourcesMetaTitle?: string;
  resourcesMetaDesc?: string;
  resourcesOgImage?: string;
  redirects?: RedirectRule[];
  headerNavigation?: MenuItem[];
  footerContent?: FooterContent;
  catalogPassword?: string;
  catalogPasswordEnabled?: boolean;
  gaMeasurementId?: string;
  gtmId?: string;
  seoRobotsBlock?: boolean;
  llmsSiteDescription?: string;
}

export default function SiteSettingsPage() {
  const [settings, setSettings] = useState<SiteSettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'specialPages' | 'headerNav' | 'footer' | 'security' | 'redirects'>('specialPages');
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [bulkImportText, setBulkImportText] = useState('');

  const [showNewsroomHeroPicker, setShowNewsroomHeroPicker] = useState(false);
  const [showNewsroomOgImagePicker, setShowNewsroomOgImagePicker] = useState(false);
  const [showNewsArticleHeroPicker, setShowNewsArticleHeroPicker] = useState(false);
  const [showEventArticleHeroPicker, setShowEventArticleHeroPicker] = useState(false);
  const [showResourcesHeroPicker, setShowResourcesHeroPicker] = useState(false);
  const [showResourcesOgImagePicker, setShowResourcesOgImagePicker] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/site-settings');
      if (response.ok) {
        const data = await response.json();
        // Initialize default structures if empty
        if (!data.redirects) {
          data.redirects = [];
        }
        if (!data.headerNavigation) {
          data.headerNavigation = [];
        }
        if (!data.footerContent) {
          data.footerContent = {
            description: '',
            address: [''],
            phone: '',
            fax: '',
            phoneTollFree: '',
            aiAgent: '',
            email: '',
            companyLinks: [],
            socialLinks: [],
            appLinks: { appStore: '', googlePlay: '' },
            copyright: '',
            legalLinks: []
          };
        }
        setSettings(data);
      } else {
        console.error('Failed to fetch settings');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSpecialPages = async () => {
    try {
      setSaving(true);
      const dataToSave = {
        newsroomTitle: settings?.newsroomTitle,
        newsroomDescription: settings?.newsroomDescription,
        newsroomHeroImage: settings?.newsroomHeroImage,
        newsroomMetaTitle: settings?.newsroomMetaTitle,
        newsroomMetaDesc: settings?.newsroomMetaDesc,
        newsroomOgImage: settings?.newsroomOgImage,
        newsArticleTitle: settings?.newsArticleTitle,
        newsArticleDescription: settings?.newsArticleDescription,
        newsArticleHeroImage: settings?.newsArticleHeroImage,
        eventArticleTitle: settings?.eventArticleTitle,
        eventArticleDescription: settings?.eventArticleDescription,
        eventArticleHeroImage: settings?.eventArticleHeroImage,
        resourcesTitle: settings?.resourcesTitle,
        resourcesDescription: settings?.resourcesDescription,
        resourcesHeroImage: settings?.resourcesHeroImage,
        resourcesMetaTitle: settings?.resourcesMetaTitle,
        resourcesMetaDesc: settings?.resourcesMetaDesc,
        resourcesOgImage: settings?.resourcesOgImage,
        catalogPassword: settings?.catalogPassword,
        catalogPasswordEnabled: settings?.catalogPasswordEnabled,
        gaMeasurementId: settings?.gaMeasurementId,
        gtmId: settings?.gtmId,
        seoRobotsBlock: settings?.seoRobotsBlock,
        llmsSiteDescription: settings?.llmsSiteDescription,
      };

      const response = await fetch('/api/admin/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave),
      });

      if (response.ok) {
        const updatedSettings = await response.json();
        setSettings(updatedSettings);
        alert('Special Pages settings saved successfully!');
      } else {
        const errorData = await response.json();
        alert(`Failed to save settings: ${errorData.error || response.statusText}`);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('An unexpected error occurred while saving settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNavigation = async () => {
    try {
      setSaving(true);
      const dataToSave = {
        headerNavigation: settings?.headerNavigation,
      };

      const response = await fetch('/api/admin/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave),
      });

      if (response.ok) {
        const updatedSettings = await response.json();
        setSettings(updatedSettings);
        alert('Header Navigation saved successfully!');
      } else {
        const errorData = await response.json();
        alert(`Failed to save navigation: ${errorData.error || response.statusText}`);
      }
    } catch (error) {
      console.error('Error saving navigation:', error);
      alert('An unexpected error occurred while saving navigation.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveFooter = async () => {
    try {
      setSaving(true);
      const dataToSave = {
        footerContent: settings?.footerContent,
      };

      const response = await fetch('/api/admin/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave),
      });

      if (response.ok) {
        const updatedSettings = await response.json();
        setSettings(updatedSettings);
        alert('Footer settings saved successfully!');
      } else {
        const errorData = await response.json();
        alert(`Failed to save footer: ${errorData.error || response.statusText}`);
      }
    } catch (error) {
      console.error('Error saving footer:', error);
      alert('An unexpected error occurred while saving footer.');
    } finally {
      setSaving(false);
    }
  };

  const handleFieldChange = (field: keyof SiteSettingsData, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const updateFooter = (updates: Partial<FooterContent>) => {
    setSettings(prev => ({
      ...prev,
      footerContent: { ...prev?.footerContent, ...updates }
    }));
  };

  // Header Navigation helpers
  const addMenuItem = () => {
    const newItem: MenuItem = {
      label: 'New Item',
      url: '/',
      order: settings?.headerNavigation?.length || 0,
      isActive: true,
    };
    handleFieldChange('headerNavigation', [...(settings?.headerNavigation || []), newItem]);
  };

  const updateMenuItem = (index: number, updates: Partial<MenuItem>) => {
    const items = [...(settings?.headerNavigation || [])];
    items[index] = { ...items[index], ...updates };
    handleFieldChange('headerNavigation', items);
  };

  const removeMenuItem = (index: number) => {
    const items = [...(settings?.headerNavigation || [])];
    items.splice(index, 1);
    handleFieldChange('headerNavigation', items);
  };

  const moveMenuItem = (index: number, direction: 'up' | 'down') => {
    const items = [...(settings?.headerNavigation || [])];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= items.length) return;
    [items[index], items[newIndex]] = [items[newIndex], items[index]];
    items.forEach((item, idx) => item.order = idx);
    handleFieldChange('headerNavigation', items);
  };

  // Child item helpers
  const addChildItem = (parentIndex: number) => {
    const items = [...(settings?.headerNavigation || [])];
    const parent = items[parentIndex];
    const children = [...(parent.children || [])];
    children.push({
      label: 'New Sub-item',
      url: '/',
      order: children.length,
      isActive: true,
    });
    items[parentIndex] = { ...parent, children };
    handleFieldChange('headerNavigation', items);
  };

  const updateChildItem = (parentIndex: number, childIndex: number, updates: Partial<MenuChildItem>) => {
    const items = [...(settings?.headerNavigation || [])];
    const parent = items[parentIndex];
    const children = [...(parent.children || [])];
    children[childIndex] = { ...children[childIndex], ...updates };
    items[parentIndex] = { ...parent, children };
    handleFieldChange('headerNavigation', items);
  };

  const removeChildItem = (parentIndex: number, childIndex: number) => {
    const items = [...(settings?.headerNavigation || [])];
    const parent = items[parentIndex];
    const children = [...(parent.children || [])];
    children.splice(childIndex, 1);
    children.forEach((c, i) => c.order = i);
    items[parentIndex] = { ...parent, children };
    handleFieldChange('headerNavigation', items);
  };

  const moveChildItem = (parentIndex: number, childIndex: number, direction: 'up' | 'down') => {
    const items = [...(settings?.headerNavigation || [])];
    const parent = items[parentIndex];
    const children = [...(parent.children || [])];
    const newIndex = direction === 'up' ? childIndex - 1 : childIndex + 1;
    if (newIndex < 0 || newIndex >= children.length) return;
    [children[childIndex], children[newIndex]] = [children[newIndex], children[childIndex]];
    children.forEach((c, i) => c.order = i);
    items[parentIndex] = { ...parent, children };
    handleFieldChange('headerNavigation', items);
  };

  // Footer helpers
  const addAddressLine = () => {
    const footer = settings?.footerContent || {};
    const address = [...(footer.address || []), ''];
    updateFooter({ address });
  };

  const updateAddressLine = (index: number, value: string) => {
    const footer = settings?.footerContent || {};
    const address = [...(footer.address || [])];
    address[index] = value;
    updateFooter({ address });
  };

  const removeAddressLine = (index: number) => {
    const footer = settings?.footerContent || {};
    const address = [...(footer.address || [])];
    address.splice(index, 1);
    updateFooter({ address });
  };

  const addCompanyLink = () => {
    const footer = settings?.footerContent || {};
    const companyLinks = [...(footer.companyLinks || []), { name: 'New Link', href: '/' }];
    updateFooter({ companyLinks });
  };

  const updateCompanyLink = (index: number, updates: { name?: string; href?: string }) => {
    const footer = settings?.footerContent || {};
    const companyLinks = [...(footer.companyLinks || [])];
    companyLinks[index] = { ...companyLinks[index], ...updates };
    updateFooter({ companyLinks });
  };

  const removeCompanyLink = (index: number) => {
    const footer = settings?.footerContent || {};
    const companyLinks = [...(footer.companyLinks || [])];
    companyLinks.splice(index, 1);
    updateFooter({ companyLinks });
  };

  const addSocialLink = () => {
    const footer = settings?.footerContent || {};
    const socialLinks = [...(footer.socialLinks || []), { name: 'LinkedIn', href: '#' }];
    updateFooter({ socialLinks });
  };

  const updateSocialLink = (index: number, updates: { name?: string; href?: string }) => {
    const footer = settings?.footerContent || {};
    const socialLinks = [...(footer.socialLinks || [])];
    socialLinks[index] = { ...socialLinks[index], ...updates };
    updateFooter({ socialLinks });
  };

  const removeSocialLink = (index: number) => {
    const footer = settings?.footerContent || {};
    const socialLinks = [...(footer.socialLinks || [])];
    socialLinks.splice(index, 1);
    updateFooter({ socialLinks });
  };

  const addLegalLink = () => {
    const footer = settings?.footerContent || {};
    const legalLinks = [...(footer.legalLinks || []), { name: 'Privacy Policy', href: '/privacy' }];
    updateFooter({ legalLinks });
  };

  const updateLegalLink = (index: number, updates: { name?: string; href?: string }) => {
    const footer = settings?.footerContent || {};
    const legalLinks = [...(footer.legalLinks || [])];
    legalLinks[index] = { ...legalLinks[index], ...updates };
    updateFooter({ legalLinks });
  };

  const removeLegalLink = (index: number) => {
    const footer = settings?.footerContent || {};
    const legalLinks = [...(footer.legalLinks || [])];
    legalLinks.splice(index, 1);
    updateFooter({ legalLinks });
  };

  // Redirect helpers
  const addRedirect = () => {
    const newRedirect: RedirectRule = {
      id: crypto.randomUUID(),
      source: '/',
      destination: '/',
      statusCode: 301,
      isActive: true,
      comment: '',
    };
    handleFieldChange('redirects', [...(settings?.redirects || []), newRedirect]);
  };

  const updateRedirect = (index: number, updates: Partial<RedirectRule>) => {
    const items = [...(settings?.redirects || [])];
    items[index] = { ...items[index], ...updates };
    handleFieldChange('redirects', items);
  };

  const removeRedirect = (index: number) => {
    const items = [...(settings?.redirects || [])];
    items.splice(index, 1);
    handleFieldChange('redirects', items);
  };

  const parseBulkImport = (text: string): RedirectRule[] => {
    return text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'))
      .map(line => {
        // Support separators: →, ->, tab, multiple spaces
        const parts = line.split(/\s*(?:→|->)\s*|\t+|\s{2,}/);
        if (parts.length >= 2) {
          const source = parts[0].trim();
          const destination = parts[1].trim();
          if (source && destination) {
            return {
              id: crypto.randomUUID(),
              source: source.startsWith('/') ? source : `/${source}`,
              destination: destination.startsWith('/') || destination.startsWith('http') ? destination : `/${destination}`,
              statusCode: 301 as const,
              isActive: true,
              comment: 'Bulk import',
            };
          }
        }
        return null;
      })
      .filter((r): r is RedirectRule => r !== null);
  };

  const handleBulkImport = () => {
    const parsed = parseBulkImport(bulkImportText);
    if (parsed.length === 0) {
      alert('No valid redirects found. Use format: /old-path -> /new-path (one per line)');
      return;
    }
    handleFieldChange('redirects', [...(settings?.redirects || []), ...parsed]);
    setBulkImportText('');
    setShowBulkImport(false);
  };

  const handleSaveRedirects = async () => {
    // Validate no self-redirects
    const selfRedirects = (settings?.redirects || []).filter(r => r.source === r.destination);
    if (selfRedirects.length > 0) {
      alert(`Cannot save: ${selfRedirects.length} redirect(s) have the same source and destination, which would cause an infinite loop.`);
      return;
    }

    try {
      setSaving(true);
      const response = await fetch('/api/admin/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ redirects: settings?.redirects }),
      });

      if (response.ok) {
        const updatedSettings = await response.json();
        setSettings(updatedSettings);
        alert('Redirects saved successfully!');
      } else {
        const errorData = await response.json();
        alert(`Failed to save redirects: ${errorData.error || response.statusText}`);
      }
    } catch (error) {
      console.error('Error saving redirects:', error);
      alert('An unexpected error occurred while saving redirects.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-sure-blue-600"></div>
        <p className="mt-2 text-gray-600">Loading settings...</p>
      </div>
    );
  }

  if (!settings) {
    return <div className="text-center py-12 text-red-600">Failed to load settings.</div>;
  }

  return (
    <div>
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              type="button"
              onClick={() => setActiveTab('specialPages')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'specialPages'
                  ? 'border-sure-blue-600 text-sure-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Special Pages
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('headerNav')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'headerNav'
                  ? 'border-sure-blue-600 text-sure-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Header Navigation
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('footer')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'footer'
                  ? 'border-sure-blue-600 text-sure-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Footer
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('security')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'security'
                  ? 'border-sure-blue-600 text-sure-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Security
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('redirects')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'redirects'
                  ? 'border-sure-blue-600 text-sure-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Redirects
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'specialPages' && (
            <div className="space-y-8">
              {/* Newsroom Page Settings */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Newsroom Page Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={settings.newsroomTitle || ''}
                      onChange={(e) => handleFieldChange('newsroomTitle', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={settings.newsroomDescription || ''}
                      onChange={(e) => handleFieldChange('newsroomDescription', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hero Image</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={settings.newsroomHeroImage || ''}
                        onChange={(e) => handleFieldChange('newsroomHeroImage', e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500"
                        placeholder="S3 key or URL"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewsroomHeroPicker(true)}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                      >
                        Browse
                      </button>
                    </div>
                    {settings.newsroomHeroImage && (
                      <div className="mt-2 w-32 h-20 relative border border-gray-200 rounded-lg overflow-hidden">
                        <Image src={getAssetUrl(settings.newsroomHeroImage)} alt="Hero Preview" fill className="object-cover" />
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mt-6 mb-2">SEO</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
                    <input
                      type="text"
                      value={settings.newsroomMetaTitle || ''}
                      onChange={(e) => handleFieldChange('newsroomMetaTitle', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                    <textarea
                      value={settings.newsroomMetaDesc || ''}
                      onChange={(e) => handleFieldChange('newsroomMetaDesc', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">OG Image</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={settings.newsroomOgImage || ''}
                        onChange={(e) => handleFieldChange('newsroomOgImage', e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500"
                        placeholder="S3 key or URL"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewsroomOgImagePicker(true)}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                      >
                        Browse
                      </button>
                    </div>
                    {settings.newsroomOgImage && (
                      <div className="mt-2 w-32 h-20 relative border border-gray-200 rounded-lg overflow-hidden">
                        <Image src={getAssetUrl(settings.newsroomOgImage)} alt="OG Image Preview" fill className="object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* News Article Page Settings */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-2">News Article Page Settings</h2>
                <p className="text-sm text-gray-500 mb-4">Configure the hero section for individual news articles and events at /newsroom/[slug]</p>
                <div className="space-y-6">
                  {/* News Articles */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">News Articles</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hero Title</label>
                        <input
                          type="text"
                          value={settings.newsArticleTitle || ''}
                          onChange={(e) => handleFieldChange('newsArticleTitle', e.target.value)}
                          placeholder="News Article"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hero Description</label>
                        <textarea
                          value={settings.newsArticleDescription || ''}
                          onChange={(e) => handleFieldChange('newsArticleDescription', e.target.value)}
                          placeholder="Stay updated with the latest news from Sure Filter®"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500"
                          rows={2}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hero Image</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={settings.newsArticleHeroImage || ''}
                            onChange={(e) => handleFieldChange('newsArticleHeroImage', e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500"
                            placeholder="S3 key or URL"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewsArticleHeroPicker(true)}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                          >
                            Browse
                          </button>
                        </div>
                        {settings.newsArticleHeroImage && (
                          <div className="mt-2 w-32 h-20 relative border border-gray-200 rounded-lg overflow-hidden">
                            <Image src={getAssetUrl(settings.newsArticleHeroImage)} alt="News Hero Preview" fill className="object-cover" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Events */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">Events</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hero Title</label>
                        <input
                          type="text"
                          value={settings.eventArticleTitle || ''}
                          onChange={(e) => handleFieldChange('eventArticleTitle', e.target.value)}
                          placeholder="Event Details"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hero Description</label>
                        <textarea
                          value={settings.eventArticleDescription || ''}
                          onChange={(e) => handleFieldChange('eventArticleDescription', e.target.value)}
                          placeholder="Join us at our upcoming event"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500"
                          rows={2}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hero Image</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={settings.eventArticleHeroImage || ''}
                            onChange={(e) => handleFieldChange('eventArticleHeroImage', e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500"
                            placeholder="S3 key or URL"
                          />
                          <button
                            type="button"
                            onClick={() => setShowEventArticleHeroPicker(true)}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                          >
                            Browse
                          </button>
                        </div>
                        {settings.eventArticleHeroImage && (
                          <div className="mt-2 w-32 h-20 relative border border-gray-200 rounded-lg overflow-hidden">
                            <Image src={getAssetUrl(settings.eventArticleHeroImage)} alt="Event Hero Preview" fill className="object-cover" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resources Page Settings */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Resources Page Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={settings.resourcesTitle || ''}
                      onChange={(e) => handleFieldChange('resourcesTitle', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={settings.resourcesDescription || ''}
                      onChange={(e) => handleFieldChange('resourcesDescription', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hero Image</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={settings.resourcesHeroImage || ''}
                        onChange={(e) => handleFieldChange('resourcesHeroImage', e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500"
                        placeholder="S3 key or URL"
                      />
                      <button
                        type="button"
                        onClick={() => setShowResourcesHeroPicker(true)}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                      >
                        Browse
                      </button>
                    </div>
                    {settings.resourcesHeroImage && (
                      <div className="mt-2 w-32 h-20 relative border border-gray-200 rounded-lg overflow-hidden">
                        <Image src={getAssetUrl(settings.resourcesHeroImage)} alt="Hero Preview" fill className="object-cover" />
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mt-6 mb-2">SEO</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
                    <input
                      type="text"
                      value={settings.resourcesMetaTitle || ''}
                      onChange={(e) => handleFieldChange('resourcesMetaTitle', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                    <textarea
                      value={settings.resourcesMetaDesc || ''}
                      onChange={(e) => handleFieldChange('resourcesMetaDesc', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">OG Image</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={settings.resourcesOgImage || ''}
                        onChange={(e) => handleFieldChange('resourcesOgImage', e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500"
                        placeholder="S3 key or URL"
                      />
                      <button
                        type="button"
                        onClick={() => setShowResourcesOgImagePicker(true)}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                      >
                        Browse
                      </button>
                    </div>
                    {settings.resourcesOgImage && (
                      <div className="mt-2 w-32 h-20 relative border border-gray-200 rounded-lg overflow-hidden">
                        <Image src={getAssetUrl(settings.resourcesOgImage)} alt="OG Image Preview" fill className="object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Analytics Settings */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Analytics &amp; Tag Manager</h2>
                <p className="text-sm text-gray-500 mb-4">Google Analytics 4 and Tag Manager integration. Applies only to public pages (not admin panel).</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GA Measurement ID</label>
                    <input
                      type="text"
                      value={settings.gaMeasurementId || ''}
                      onChange={(e) => handleFieldChange('gaMeasurementId', e.target.value)}
                      placeholder="G-XXXXXXXXXX"
                      className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500 font-mono"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Google Analytics 4 Measurement ID. Found in GA4 Admin &rarr; Data Streams &rarr; Web. Leave empty to disable.
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GTM Container ID</label>
                    <input
                      type="text"
                      value={settings.gtmId || ''}
                      onChange={(e) => handleFieldChange('gtmId', e.target.value)}
                      placeholder="GTM-XXXXXXX"
                      className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500 font-mono"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Google Tag Manager Container ID. Found in GTM &rarr; Admin &rarr; Container Settings. Leave empty to disable.
                    </p>
                  </div>
                  {settings.gaMeasurementId && settings.gtmId && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        If you configure GA inside GTM, you can leave the GA Measurement ID empty here to avoid duplicate tracking.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* SEO & LLM Settings */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-2">SEO &amp; LLM</h2>
                <p className="text-sm text-gray-500 mb-4">Search engine and LLM crawler configuration. Controls robots.txt and llms.txt output.</p>
                <div className="space-y-4">
                  {/* Block Search Engines Toggle */}
                  <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        Block All Search Engines
                      </label>
                      <p className="text-xs text-gray-500">
                        Sets robots.txt to Disallow: / for all crawlers. Use for staging environments.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings?.seoRobotsBlock || false}
                        onChange={(e) => handleFieldChange('seoRobotsBlock', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sure-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                    </label>
                  </div>

                  {settings?.seoRobotsBlock && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-800">
                        All search engines and crawlers are currently blocked. Your site will not appear in search results. Disable this for production.
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Site Description for LLMs</label>
                    <textarea
                      value={settings?.llmsSiteDescription || ''}
                      onChange={(e) => handleFieldChange('llmsSiteDescription', e.target.value)}
                      placeholder="Sure Filter US is a manufacturer of premium aftermarket automotive and industrial filtration products..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500"
                      rows={4}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Used in llms.txt as the site description for LLM crawlers (ChatGPT, Claude, Perplexity, etc.). Markdown supported.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  onClick={handleSaveSpecialPages}
                  disabled={saving}
                  className="px-6 py-2 bg-sure-blue-600 hover:bg-sure-blue-700 text-white rounded-lg font-medium disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Saving...' : '💾 Save Special Pages'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'headerNav' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Header Navigation</h2>
                <button
                  type="button"
                  onClick={addMenuItem}
                  className="px-4 py-2 bg-sure-blue-600 hover:bg-sure-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  + Add Menu Item
                </button>
              </div>

              {settings.headerNavigation && settings.headerNavigation.length > 0 ? (
                <div className="space-y-3">
                  {settings.headerNavigation.map((item, index) => (
                    <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
                          <input
                            type="text"
                            value={item.label}
                            onChange={(e) => updateMenuItem(index, { label: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                          <input
                            type="text"
                            value={item.url}
                            onChange={(e) => updateMenuItem(index, { url: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={item.isActive}
                              onChange={(e) => updateMenuItem(index, { isActive: e.target.checked })}
                              className="rounded border-gray-300"
                            />
                            <span className="text-sm text-gray-700">Active</span>
                          </label>
                          <span className="text-sm text-gray-500">Order: {item.order}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => moveMenuItem(index, 'up')}
                            disabled={index === 0}
                            className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            onClick={() => moveMenuItem(index, 'down')}
                            disabled={index === settings.headerNavigation!.length - 1}
                            className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            ↓
                          </button>
                          <button
                            type="button"
                            onClick={() => removeMenuItem(index)}
                            className="px-3 py-1 bg-red-50 text-red-600 border border-red-300 rounded hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      {/* Sub-items section */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-sm font-medium text-gray-700">
                            Sub-items ({item.children?.length || 0})
                          </span>
                          <button
                            type="button"
                            onClick={() => addChildItem(index)}
                            className="text-xs px-2 py-1 bg-sure-blue-100 text-sure-blue-700 rounded hover:bg-sure-blue-200 transition-colors"
                          >
                            + Add Sub-item
                          </button>
                        </div>

                        {item.children && item.children.length > 0 && (
                          <div className="space-y-2 ml-4 border-l-2 border-sure-blue-200 pl-4">
                            {item.children.map((child, childIndex) => (
                              <div key={childIndex} className="bg-white border border-gray-200 rounded-lg p-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                                  <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Label</label>
                                    <input
                                      type="text"
                                      value={child.label}
                                      onChange={(e) => updateChildItem(index, childIndex, { label: e.target.value })}
                                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">URL</label>
                                    <input
                                      type="text"
                                      value={child.url}
                                      onChange={(e) => updateChildItem(index, childIndex, { url: e.target.value })}
                                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500"
                                    />
                                  </div>
                                </div>
                                <div className="flex items-center justify-between">
                                  <label className="flex items-center gap-1.5">
                                    <input
                                      type="checkbox"
                                      checked={child.isActive}
                                      onChange={(e) => updateChildItem(index, childIndex, { isActive: e.target.checked })}
                                      className="rounded border-gray-300"
                                    />
                                    <span className="text-xs text-gray-600">Active</span>
                                  </label>
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => moveChildItem(index, childIndex, 'up')}
                                      disabled={childIndex === 0}
                                      className="px-1.5 py-0.5 text-xs border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      ↑
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => moveChildItem(index, childIndex, 'down')}
                                      disabled={childIndex === (item.children?.length || 0) - 1}
                                      className="px-1.5 py-0.5 text-xs border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      ↓
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => removeChildItem(index, childIndex)}
                                      className="px-2 py-0.5 text-xs bg-red-50 text-red-600 border border-red-300 rounded hover:bg-red-100"
                                    >
                                      ×
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
                  No menu items yet. Click "Add Menu Item" to get started.
                </div>
              )}

              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  onClick={handleSaveNavigation}
                  disabled={saving}
                  className="px-6 py-2 bg-sure-blue-600 hover:bg-sure-blue-700 text-white rounded-lg font-medium disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Saving...' : '💾 Save Navigation'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'footer' && (
            <div className="space-y-6">
              {/* Company Description */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Company Description</h3>
                <textarea
                  value={settings.footerContent?.description || ''}
                  onChange={(e) => updateFooter({ description: e.target.value })}
                  placeholder="Your trusted partner for superior filtration solutions..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500"
                  rows={3}
                />
              </div>

              {/* Contact Information */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">Address Lines</label>
                      <button
                        type="button"
                        onClick={addAddressLine}
                        className="text-xs px-2 py-1 bg-sure-blue-100 text-sure-blue-700 rounded hover:bg-sure-blue-200"
                      >
                        + Add Line
                      </button>
                    </div>
                    <div className="space-y-2">
                      {settings.footerContent?.address?.map((line, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={line}
                            onChange={(e) => updateAddressLine(index, e.target.value)}
                            placeholder={index === 0 ? "1470 Civic Dr. STE 309" : "Address line"}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500"
                          />
                          <button
                            type="button"
                            onClick={() => removeAddressLine(index)}
                            className="px-3 py-2 text-red-600 hover:text-red-800"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="text"
                        value={settings.footerContent?.phone || ''}
                        onChange={(e) => updateFooter({ phone: e.target.value })}
                        placeholder="+1 (925) 566-8863/73"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fax</label>
                      <input
                        type="text"
                        value={settings.footerContent?.fax || ''}
                        onChange={(e) => updateFooter({ fax: e.target.value })}
                        placeholder="+1 (925) 566-8893"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Toll-Free Number</label>
                      <input
                        type="text"
                        value={settings.footerContent?.phoneTollFree || ''}
                        onChange={(e) => updateFooter({ phoneTollFree: e.target.value })}
                        placeholder="+1 8448 BE SURE"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={settings.footerContent?.email || ''}
                        onChange={(e) => updateFooter({ email: e.target.value })}
                        placeholder="order@surefilter.us"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">AI Service Agent</label>
                    <input
                      type="text"
                      value={settings.footerContent?.aiAgent || ''}
                      onChange={(e) => updateFooter({ aiAgent: e.target.value })}
                      placeholder="Phil, our AI Service Agent: +1-651-273-9232"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Company Links */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Company Links</h3>
                  <button
                    type="button"
                    onClick={addCompanyLink}
                    className="px-3 py-1 bg-sure-blue-600 hover:bg-sure-blue-700 text-white rounded text-sm"
                  >
                    + Add Link
                  </button>
                </div>

                {settings.footerContent?.companyLinks && settings.footerContent.companyLinks.length > 0 ? (
                  <div className="space-y-2">
                    {settings.footerContent.companyLinks.map((link, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={link.name}
                          onChange={(e) => updateCompanyLink(index, { name: e.target.value })}
                          placeholder="About Us"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500"
                        />
                        <input
                          type="text"
                          value={link.href}
                          onChange={(e) => updateCompanyLink(index, { href: e.target.value })}
                          placeholder="/about-us"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => removeCompanyLink(index)}
                          className="px-3 py-2 bg-red-50 text-red-600 border border-red-300 rounded hover:bg-red-100"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm">No company links yet.</div>
                )}
              </div>

              {/* Social Links */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Social Links</h3>
                  <button
                    type="button"
                    onClick={addSocialLink}
                    className="px-3 py-1 bg-sure-blue-600 hover:bg-sure-blue-700 text-white rounded text-sm"
                  >
                    + Add Social Link
                  </button>
                </div>

                {settings.footerContent?.socialLinks && settings.footerContent.socialLinks.length > 0 ? (
                  <div className="space-y-2">
                    {settings.footerContent.socialLinks.map((social, index) => (
                      <div key={index} className="flex gap-2">
                        <select
                          value={social.name}
                          onChange={(e) => updateSocialLink(index, { name: e.target.value })}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500"
                        >
                          <option value="LinkedIn">LinkedIn</option>
                          <option value="Facebook">Facebook</option>
                          <option value="Twitter">Twitter</option>
                          <option value="Instagram">Instagram</option>
                          <option value="YouTube">YouTube</option>
                          <option value="TikTok">TikTok</option>
                        </select>
                        <input
                          type="text"
                          value={social.href}
                          onChange={(e) => updateSocialLink(index, { href: e.target.value })}
                          placeholder="https://..."
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => removeSocialLink(index)}
                          className="px-3 py-2 bg-red-50 text-red-600 border border-red-300 rounded hover:bg-red-100"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm">No social links yet.</div>
                )}
              </div>

              {/* App Links */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Mobile App Links</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">App Store URL</label>
                    <input
                      type="text"
                      value={settings.footerContent?.appLinks?.appStore || ''}
                      onChange={(e) => updateFooter({ 
                        appLinks: { 
                          ...settings.footerContent?.appLinks, 
                          appStore: e.target.value 
                        } 
                      })}
                      placeholder="https://apps.apple.com/..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Google Play URL</label>
                    <input
                      type="text"
                      value={settings.footerContent?.appLinks?.googlePlay || ''}
                      onChange={(e) => updateFooter({ 
                        appLinks: { 
                          ...settings.footerContent?.appLinks, 
                          googlePlay: e.target.value 
                        } 
                      })}
                      placeholder="https://play.google.com/..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Copyright */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Copyright Text</h3>
                <input
                  type="text"
                  value={settings.footerContent?.copyright || ''}
                  onChange={(e) => updateFooter({ copyright: e.target.value })}
                  placeholder="© 2025 Sure Filter®. All rights reserved."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500"
                />
              </div>

              {/* Legal Links */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Legal Links</h3>
                  <button
                    type="button"
                    onClick={addLegalLink}
                    className="px-3 py-1 bg-sure-blue-600 hover:bg-sure-blue-700 text-white rounded text-sm"
                  >
                    + Add Legal Link
                  </button>
                </div>

                {settings.footerContent?.legalLinks && settings.footerContent.legalLinks.length > 0 ? (
                  <div className="space-y-2">
                    {settings.footerContent.legalLinks.map((link, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={link.name}
                          onChange={(e) => updateLegalLink(index, { name: e.target.value })}
                          placeholder="Privacy Policy"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500"
                        />
                        <input
                          type="text"
                          value={link.href}
                          onChange={(e) => updateLegalLink(index, { href: e.target.value })}
                          placeholder="/privacy"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => removeLegalLink(index)}
                          className="px-3 py-2 bg-red-50 text-red-600 border border-red-300 rounded hover:bg-red-100"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm">No legal links yet.</div>
                )}
              </div>

              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  onClick={handleSaveFooter}
                  disabled={saving}
                  className="px-6 py-2 bg-sure-blue-600 hover:bg-sure-blue-700 text-white rounded-lg font-medium disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Saving...' : '💾 Save Footer'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-8">
              {/* Catalog Password Protection */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Catalog Password Protection</h2>
                <p className="text-sm text-gray-600 mb-6">
                  Protect your catalog page with a password. When enabled, visitors will need to enter the password to access the catalog.
                </p>

                <div className="space-y-4">
                  {/* Enable/Disable Toggle */}
                  <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        Enable Password Protection
                      </label>
                      <p className="text-xs text-gray-500">
                        Require password to access /catalog page
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings?.catalogPasswordEnabled || false}
                        onChange={(e) => handleFieldChange('catalogPasswordEnabled', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sure-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sure-blue-600"></div>
                    </label>
                  </div>

                  {/* Password Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <input
                      type="text"
                      value={settings?.catalogPassword || ''}
                      onChange={(e) => handleFieldChange('catalogPassword', e.target.value)}
                      placeholder="Enter password"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500"
                      disabled={!settings?.catalogPasswordEnabled}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      This password will be required to access the catalog page
                    </p>
                  </div>

                  {/* Warning */}
                  {settings?.catalogPasswordEnabled && !settings?.catalogPassword && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        ⚠️ Password protection is enabled but no password is set. Please set a password before saving.
                      </p>
                    </div>
                  )}
                </div>

                {/* Save Button */}
                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveSpecialPages}
                    disabled={saving}
                    className="px-6 py-2 bg-sure-blue-600 hover:bg-sure-blue-700 text-white rounded-lg font-medium disabled:opacity-50 transition-colors"
                  >
                    {saving ? 'Saving...' : '🔒 Save Security Settings'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'redirects' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">URL Redirects</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Manage 301/302 redirects for SEO migration and URL cleanup. Changes take effect within 1 minute.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowBulkImport(!showBulkImport)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                  >
                    Import Bulk
                  </button>
                  <button
                    type="button"
                    onClick={addRedirect}
                    className="px-4 py-2 bg-sure-blue-600 hover:bg-sure-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    + Add Redirect
                  </button>
                </div>
              </div>

              {/* Bulk Import Panel */}
              {showBulkImport && (
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Bulk Import</h3>
                  <p className="text-sm text-gray-500 mb-3">
                    Paste redirects, one per line. Format: <code className="bg-gray-200 px-1 rounded">/old-path -&gt; /new-path</code> or <code className="bg-gray-200 px-1 rounded">/old-path → /new-path</code>. Tab-separated also works. Lines starting with # are ignored.
                  </p>
                  <textarea
                    value={bulkImportText}
                    onChange={(e) => setBulkImportText(e.target.value)}
                    placeholder={"/products-automotive -> /automotive\n/about -> /about-us\n/old-page -> /new-page"}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500 font-mono text-sm"
                    rows={6}
                  />
                  {bulkImportText.trim() && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-700 mb-2">
                        Preview: <strong>{parseBulkImport(bulkImportText).length}</strong> redirect(s) will be added as 301 Permanent, Active.
                      </p>
                    </div>
                  )}
                  <div className="flex gap-2 mt-3">
                    <button
                      type="button"
                      onClick={handleBulkImport}
                      disabled={!bulkImportText.trim()}
                      className="px-4 py-2 bg-sure-blue-600 hover:bg-sure-blue-700 text-white rounded-lg font-medium disabled:opacity-50 transition-colors"
                    >
                      Import
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowBulkImport(false); setBulkImportText(''); }}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Redirect Chain Warning */}
              {(() => {
                const redirects = settings?.redirects || [];
                const activeSources = new Set(redirects.filter(r => r.isActive).map(r => r.source.toLowerCase().replace(/\/+$/, '')));
                const chains = redirects.filter(r => r.isActive && activeSources.has(r.destination.toLowerCase().replace(/\/+$/, '')));
                if (chains.length > 0) {
                  return (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        Warning: {chains.length} redirect(s) point to a destination that is itself a redirect source.
                        This creates redirect chains which harm SEO. Update them to point directly to the final destination.
                      </p>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Redirect List */}
              {settings?.redirects && settings.redirects.length > 0 ? (
                <div className="space-y-3">
                  {settings.redirects.map((redirect, index) => (
                    <div key={redirect.id} className={`bg-gray-50 border rounded-lg p-4 ${redirect.isActive ? 'border-gray-200' : 'border-gray-200 opacity-60'}`}>
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-3">
                        <div className="md:col-span-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Source Path</label>
                          <input
                            type="text"
                            value={redirect.source}
                            onChange={(e) => updateRedirect(index, { source: e.target.value })}
                            placeholder="/old-path"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500 font-mono text-sm"
                          />
                        </div>
                        <div className="md:col-span-1 flex items-end justify-center pb-2">
                          <span className="text-gray-400 text-lg">&rarr;</span>
                        </div>
                        <div className="md:col-span-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
                          <input
                            type="text"
                            value={redirect.destination}
                            onChange={(e) => updateRedirect(index, { destination: e.target.value })}
                            placeholder="/new-path"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500 font-mono text-sm"
                          />
                        </div>
                        <div className="md:col-span-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                          <select
                            value={redirect.statusCode}
                            onChange={(e) => updateRedirect(index, { statusCode: Number(e.target.value) as 301 | 302 })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500"
                          >
                            <option value={301}>301 Permanent</option>
                            <option value={302}>302 Temporary</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={redirect.isActive}
                              onChange={(e) => updateRedirect(index, { isActive: e.target.checked })}
                              className="rounded border-gray-300"
                            />
                            <span className="text-sm text-gray-700">Active</span>
                          </label>
                          <input
                            type="text"
                            value={redirect.comment || ''}
                            onChange={(e) => updateRedirect(index, { comment: e.target.value })}
                            placeholder="Comment (optional)"
                            className="px-3 py-1 border border-gray-300 rounded-lg text-sm text-gray-600 focus:ring-2 focus:ring-sure-blue-500"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeRedirect(index)}
                          className="px-3 py-1 bg-red-50 text-red-600 border border-red-300 rounded hover:bg-red-100"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
                  No redirects configured. Click &quot;Add Redirect&quot; or &quot;Import Bulk&quot; to get started.
                </div>
              )}

              {/* SEO Info Box */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-sm font-medium text-blue-900 mb-2">SEO Best Practices</h3>
                <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                  <li><strong>301 Permanent</strong> &mdash; transfers link equity (SEO value) to the new URL. Use for site migrations.</li>
                  <li><strong>302 Temporary</strong> &mdash; tells search engines the original URL may return. Use for A/B tests or temporary moves.</li>
                  <li>Avoid redirect chains (A &rarr; B &rarr; C). Point directly to the final destination.</li>
                  <li>Query parameters from the original URL are preserved on redirect.</li>
                </ul>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  onClick={handleSaveRedirects}
                  disabled={saving}
                  className="px-6 py-2 bg-sure-blue-600 hover:bg-sure-blue-700 text-white rounded-lg font-medium disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Saving...' : 'Save Redirects'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Media Pickers */}
      {showNewsroomHeroPicker && (
        <MediaPickerModal
          isOpen={showNewsroomHeroPicker}
          onSelect={(url) => {
            handleFieldChange('newsroomHeroImage', url);
            setShowNewsroomHeroPicker(false);
          }}
          onClose={() => setShowNewsroomHeroPicker(false)}
        />
      )}
      {showNewsroomOgImagePicker && (
        <MediaPickerModal
          isOpen={showNewsroomOgImagePicker}
          onSelect={(url) => {
            handleFieldChange('newsroomOgImage', url);
            setShowNewsroomOgImagePicker(false);
          }}
          onClose={() => setShowNewsroomOgImagePicker(false)}
        />
      )}
      {showNewsArticleHeroPicker && (
        <MediaPickerModal
          isOpen={showNewsArticleHeroPicker}
          onSelect={(url) => {
            handleFieldChange('newsArticleHeroImage', url);
            setShowNewsArticleHeroPicker(false);
          }}
          onClose={() => setShowNewsArticleHeroPicker(false)}
        />
      )}
      {showEventArticleHeroPicker && (
        <MediaPickerModal
          isOpen={showEventArticleHeroPicker}
          onSelect={(url) => {
            handleFieldChange('eventArticleHeroImage', url);
            setShowEventArticleHeroPicker(false);
          }}
          onClose={() => setShowEventArticleHeroPicker(false)}
        />
      )}
      {showResourcesHeroPicker && (
        <MediaPickerModal
          isOpen={showResourcesHeroPicker}
          onSelect={(url) => {
            handleFieldChange('resourcesHeroImage', url);
            setShowResourcesHeroPicker(false);
          }}
          onClose={() => setShowResourcesHeroPicker(false)}
        />
      )}
      {showResourcesOgImagePicker && (
        <MediaPickerModal
          isOpen={showResourcesOgImagePicker}
          onSelect={(url) => {
            handleFieldChange('resourcesOgImage', url);
            setShowResourcesOgImagePicker(false);
          }}
          onClose={() => setShowResourcesOgImagePicker(false)}
        />
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import MediaPickerModal from '@/components/admin/MediaPickerModal';
import { getAssetUrl } from '@/lib/assets';

interface MenuItem {
  label: string;
  url: string;
  order: number;
  isActive: boolean;
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

interface SiteSettingsData {
  newsroomTitle?: string;
  newsroomDescription?: string;
  newsroomHeroImage?: string;
  newsroomMetaTitle?: string;
  newsroomMetaDesc?: string;
  newsroomOgImage?: string;
  resourcesTitle?: string;
  resourcesDescription?: string;
  resourcesHeroImage?: string;
  resourcesMetaTitle?: string;
  resourcesMetaDesc?: string;
  resourcesOgImage?: string;
  headerNavigation?: MenuItem[];
  footerContent?: FooterContent;
}

export default function SiteSettingsPage() {
  const [settings, setSettings] = useState<SiteSettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'specialPages' | 'headerNav' | 'footer'>('specialPages');

  const [showNewsroomHeroPicker, setShowNewsroomHeroPicker] = useState(false);
  const [showNewsroomOgImagePicker, setShowNewsroomOgImagePicker] = useState(false);
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
        resourcesTitle: settings?.resourcesTitle,
        resourcesDescription: settings?.resourcesDescription,
        resourcesHeroImage: settings?.resourcesHeroImage,
        resourcesMetaTitle: settings?.resourcesMetaTitle,
        resourcesMetaDesc: settings?.resourcesMetaDesc,
        resourcesOgImage: settings?.resourcesOgImage,
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

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MediaPickerModal from './MediaPickerModal';
import BannerLayoutGallery from './BannerLayoutGallery';
import BannerLivePreview from './BannerLivePreview';
import { UtmRuleEditor, RefererRuleEditor } from './BannerTargetingEditor';
import type { PublicBanner, BannerType, UtmRule, RefererRule } from '@/types/banners';
import { DEFAULT_LAYOUT_ID } from '@/components/banners/layouts';

type Tab = 'layout' | 'content' | 'targeting' | 'triggers' | 'schedule' | 'lead';

interface BannerFormProps {
  bannerId?: string;
  initialData?: any;
}

const emptyForm = {
  name: '',
  slug: '',
  type: 'CTA' as BannerType,
  status: 'DRAFT' as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED',

  layout: DEFAULT_LAYOUT_ID,
  accentColor: '',
  backgroundColor: '',
  textColor: '',

  title: '',
  body: '',
  imageUrl: '',
  imageAlt: '',

  ctaLabel: '',
  ctaUrl: '',
  ctaOpenInNewTab: false,

  emailPlaceholder: 'Enter your email',
  submitLabel: 'Subscribe',
  successTitle: 'Thanks!',
  successMessage: '',
  notifyEmail: '',

  targetAllPages: true,
  targetSlugsText: '',
  excludeSlugsText: '',

  delayMs: 5000,
  utmRules: [] as UtmRule[],
  refererRules: [] as RefererRule[],

  dismissMode: 'DAYS' as 'SESSION' | 'DAYS' | 'FOREVER',
  dismissTtlDays: 30 as number | null,

  publishedAt: '',
  expiresAt: '',
  priority: 0,
  campaignId: '' as string,
};

export default function BannerForm({ bannerId, initialData }: BannerFormProps) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('layout');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!initialData) return;
    setForm({
      name: initialData.name || '',
      slug: initialData.slug || '',
      type: initialData.type || 'CTA',
      status: initialData.status || 'DRAFT',
      layout: initialData.layout || DEFAULT_LAYOUT_ID,
      accentColor: initialData.accentColor || '',
      backgroundColor: initialData.backgroundColor || '',
      textColor: initialData.textColor || '',
      title: initialData.title || '',
      body: initialData.body || '',
      imageUrl: initialData.imageUrl || '',
      imageAlt: initialData.imageAlt || '',
      ctaLabel: initialData.ctaLabel || '',
      ctaUrl: initialData.ctaUrl || '',
      ctaOpenInNewTab: !!initialData.ctaOpenInNewTab,
      emailPlaceholder: initialData.emailPlaceholder || 'Enter your email',
      submitLabel: initialData.submitLabel || 'Subscribe',
      successTitle: initialData.successTitle || 'Thanks!',
      successMessage: initialData.successMessage || '',
      notifyEmail: initialData.notifyEmail || '',
      targetAllPages: initialData.targetAllPages ?? true,
      targetSlugsText: (initialData.targetSlugs || []).join('\n'),
      excludeSlugsText: (initialData.excludeSlugs || []).join('\n'),
      delayMs: initialData.delayMs ?? 5000,
      utmRules: Array.isArray(initialData.utmRules) ? initialData.utmRules : [],
      refererRules: Array.isArray(initialData.refererRules) ? initialData.refererRules : [],
      dismissMode: initialData.dismissMode || 'DAYS',
      dismissTtlDays: initialData.dismissTtlDays ?? 30,
      publishedAt: initialData.publishedAt ? initialData.publishedAt.slice(0, 16) : '',
      expiresAt: initialData.expiresAt ? initialData.expiresAt.slice(0, 16) : '',
      priority: initialData.priority ?? 0,
      campaignId: initialData.campaignId || '',
    });
  }, [initialData]);

  // Load campaigns for selector
  const [campaigns, setCampaigns] = useState<Array<{ id: string; name: string; status: string }>>([]);
  useEffect(() => {
    fetch('/api/admin/banner-campaigns')
      .then((r) => r.json())
      .then((d) => setCampaigns(Array.isArray(d) ? d : []))
      .catch(() => undefined);
  }, []);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => setForm((f) => ({ ...f, [key]: value }));

  const previewBanner: PublicBanner = {
    id: 'preview',
    slug: form.slug || 'preview',
    type: form.type,
    layout: form.layout,
    accentColor: form.accentColor || null,
    backgroundColor: form.backgroundColor || null,
    textColor: form.textColor || null,
    title: form.title || 'Banner title',
    body: form.body || 'This is the body text of the banner. Customize it in the Content tab.',
    imageUrl: form.imageUrl || null,
    imageAlt: form.imageAlt || null,
    ctaLabel: form.ctaLabel || 'Learn more',
    ctaUrl: form.ctaUrl || null,
    ctaOpenInNewTab: form.ctaOpenInNewTab,
    emailPlaceholder: form.emailPlaceholder,
    submitLabel: form.submitLabel,
    successTitle: form.successTitle,
    successMessage: form.successMessage,
    targetAllPages: form.targetAllPages,
    targetSlugs: [],
    excludeSlugs: [],
    delayMs: form.delayMs,
    utmRules: form.utmRules,
    refererRules: form.refererRules,
    dismissMode: form.dismissMode,
    dismissTtlDays: form.dismissTtlDays,
    priority: form.priority,
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const targetSlugs = form.targetSlugsText.split('\n').map((s) => s.trim()).filter(Boolean);
    const excludeSlugs = form.excludeSlugsText.split('\n').map((s) => s.trim()).filter(Boolean);

    const payload: Record<string, unknown> = {
      name: form.name,
      slug: form.slug,
      type: form.type,
      status: form.status,
      layout: form.layout,
      accentColor: form.accentColor || null,
      backgroundColor: form.backgroundColor || null,
      textColor: form.textColor || null,
      title: form.title,
      body: form.body || null,
      imageUrl: form.imageUrl || null,
      imageAlt: form.imageAlt || null,
      ctaLabel: form.ctaLabel || null,
      ctaUrl: form.ctaUrl || null,
      ctaOpenInNewTab: form.ctaOpenInNewTab,
      emailPlaceholder: form.emailPlaceholder || null,
      submitLabel: form.submitLabel || null,
      successTitle: form.successTitle || null,
      successMessage: form.successMessage || null,
      notifyEmail: form.notifyEmail || null,
      targetAllPages: form.targetAllPages,
      targetSlugs,
      excludeSlugs,
      delayMs: form.delayMs,
      utmRules: form.utmRules.length > 0 ? form.utmRules : null,
      refererRules: form.refererRules.length > 0 ? form.refererRules : null,
      dismissMode: form.dismissMode,
      dismissTtlDays: form.dismissMode === 'DAYS' ? form.dismissTtlDays : null,
      publishedAt: form.publishedAt ? new Date(form.publishedAt).toISOString() : null,
      expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
      priority: form.priority,
      campaignId: form.campaignId || null,
    };

    try {
      const url = bannerId ? `/api/admin/banners/${bannerId}` : '/api/admin/banners';
      const method = bannerId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error || 'Failed to save banner');
        return;
      }
      const saved = await res.json();
      if (!bannerId) {
        router.push(`/admin/banners/${saved.id}/edit`);
      } else {
        router.push('/admin/banners');
      }
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  const tabBtn = (id: Tab, label: string) => (
    <button
      type="button"
      onClick={() => setTab(id)}
      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
        tab === id ? 'border-sure-blue-600 text-sure-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900'
      }`}
    >
      {label}
    </button>
  );

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2 space-y-6">
        {/* Top row: name/slug/type/status */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Internal name *</label>
            <input
              required
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              placeholder="Summer Promo Q3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
            <input
              required
              value={form.slug}
              onChange={(e) => set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono"
              placeholder="summer-promo-q3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={form.type}
              onChange={(e) => set('type', e.target.value as BannerType)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="CTA">CTA (button)</option>
              <option value="LEAD_CAPTURE">Lead Capture (email)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => set('status', e.target.value as any)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Campaign</label>
            <select
              value={form.campaignId}
              onChange={(e) => set('campaignId', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">— No campaign —</option>
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>{c.name} ({c.status})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="border-b border-gray-200 flex flex-wrap px-2">
            {tabBtn('layout', 'Layout')}
            {tabBtn('content', 'Content')}
            {tabBtn('targeting', 'Targeting')}
            {tabBtn('triggers', 'Triggers')}
            {tabBtn('schedule', 'Schedule')}
            {form.type === 'LEAD_CAPTURE' && tabBtn('lead', 'Lead Capture')}
          </div>

          <div className="p-6">
            {tab === 'layout' && (
              <BannerLayoutGallery selectedId={form.layout} onSelect={(id) => set('layout', id)} filterType={form.type} />
            )}

            {tab === 'content' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    required
                    value={form.title}
                    onChange={(e) => set('title', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Body</label>
                  <textarea
                    value={form.body}
                    onChange={(e) => set('body', e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                  <div className="flex gap-2">
                    <input
                      value={form.imageUrl}
                      onChange={(e) => set('imageUrl', e.target.value)}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      placeholder="S3 key, e.g. images/banner.jpg"
                    />
                    <button
                      type="button"
                      onClick={() => setShowMediaPicker(true)}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
                    >
                      Browse
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image alt text</label>
                  <input
                    value={form.imageAlt}
                    onChange={(e) => set('imageAlt', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>

                {form.type === 'CTA' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CTA label</label>
                        <input
                          value={form.ctaLabel}
                          onChange={(e) => set('ctaLabel', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                          placeholder="Learn more"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CTA URL</label>
                        <input
                          value={form.ctaUrl}
                          onChange={(e) => set('ctaUrl', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                          placeholder="/contact-us or https://..."
                        />
                      </div>
                    </div>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={form.ctaOpenInNewTab}
                        onChange={(e) => set('ctaOpenInNewTab', e.target.checked)}
                      />
                      Open in new tab
                    </label>
                  </>
                )}

                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Accent color</label>
                    <input
                      type="color"
                      value={form.accentColor || '#1D2475'}
                      onChange={(e) => set('accentColor', e.target.value)}
                      className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Background</label>
                    <input
                      type="color"
                      value={form.backgroundColor || '#ffffff'}
                      onChange={(e) => set('backgroundColor', e.target.value)}
                      className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Text</label>
                    <input
                      type="color"
                      value={form.textColor || '#0f172a'}
                      onChange={(e) => set('textColor', e.target.value)}
                      className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {tab === 'targeting' && (
              <div className="space-y-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.targetAllPages}
                    onChange={(e) => set('targetAllPages', e.target.checked)}
                  />
                  Show on all pages
                </label>

                {!form.targetAllPages && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target page slugs (one per line)</label>
                    <textarea
                      value={form.targetSlugsText}
                      onChange={(e) => set('targetSlugsText', e.target.value)}
                      rows={5}
                      placeholder={'/\nnewsroom\nproducts/air-filters'}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono"
                    />
                    <p className="text-xs text-gray-500 mt-1">Use "/" for homepage. Slugs without leading slash. Wildcards: <code className="font-mono bg-gray-100 px-1 rounded">products/*</code> matches any nested slug.</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Exclude page slugs (one per line)</label>
                  <textarea
                    value={form.excludeSlugsText}
                    onChange={(e) => set('excludeSlugsText', e.target.value)}
                    rows={3}
                    placeholder={'admin\ncatalog'}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono"
                  />
                </div>
              </div>
            )}

            {tab === 'triggers' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delay before showing (ms)</label>
                  <input
                    type="number"
                    min={0}
                    step={500}
                    value={form.delayMs}
                    onChange={(e) => set('delayMs', parseInt(e.target.value, 10) || 0)}
                    className="w-32 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dismiss mode</label>
                  <select
                    value={form.dismissMode}
                    onChange={(e) => set('dismissMode', e.target.value as any)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="SESSION">Session — re-show in next session</option>
                    <option value="DAYS">Days — re-show after N days</option>
                    <option value="FOREVER">Forever — never show again</option>
                  </select>
                </div>

                {form.dismissMode === 'DAYS' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Re-show after (days)</label>
                    <input
                      type="number"
                      min={1}
                      value={form.dismissTtlDays ?? 30}
                      onChange={(e) => set('dismissTtlDays', parseInt(e.target.value, 10) || 1)}
                      className="w-32 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">UTM rules</h3>
                  <UtmRuleEditor rules={form.utmRules} onChange={(r) => set('utmRules', r)} />
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Referer rules</h3>
                  <RefererRuleEditor rules={form.refererRules} onChange={(r) => set('refererRules', r)} />
                </div>
              </div>
            )}

            {tab === 'schedule' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Published at</label>
                    <input
                      type="datetime-local"
                      value={form.publishedAt}
                      onChange={(e) => set('publishedAt', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">Banner becomes eligible at this time. Leave empty for immediate.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expires at</label>
                    <input
                      type="datetime-local"
                      value={form.expiresAt}
                      onChange={(e) => set('expiresAt', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <input
                    type="number"
                    value={form.priority}
                    onChange={(e) => set('priority', parseInt(e.target.value, 10) || 0)}
                    className="w-32 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">Higher priority wins when multiple banners match.</p>
                </div>
              </div>
            )}

            {tab === 'lead' && form.type === 'LEAD_CAPTURE' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email placeholder</label>
                  <input
                    value={form.emailPlaceholder}
                    onChange={(e) => set('emailPlaceholder', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Submit button label</label>
                  <input
                    value={form.submitLabel}
                    onChange={(e) => set('submitLabel', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Success title</label>
                  <input
                    value={form.successTitle}
                    onChange={(e) => set('successTitle', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Success message</label>
                  <textarea
                    value={form.successMessage}
                    onChange={(e) => set('successMessage', e.target.value)}
                    rows={2}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notify email (admin)</label>
                  <input
                    type="email"
                    value={form.notifyEmail}
                    onChange={(e) => set('notifyEmail', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    placeholder="leads@yourcompany.com"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email submission flow is implemented in Phase 2. Configure here for future activation.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-sure-blue-600 text-white rounded-lg font-medium disabled:opacity-60"
          >
            {saving ? 'Saving…' : bannerId ? 'Save changes' : 'Create banner'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/banners')}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
          >
            Cancel
          </button>
        </div>
      </div>

      <div className="xl:col-span-1">
        <div className="sticky top-4">
          <BannerLivePreview banner={previewBanner} />
        </div>
      </div>

      {showMediaPicker && (
        <MediaPickerModal
          isOpen={showMediaPicker}
          onSelect={(url) => {
            set('imageUrl', url);
            setShowMediaPicker(false);
          }}
          onClose={() => setShowMediaPicker(false)}
        />
      )}
    </form>
  );
}

'use client';

import type { UtmRule, RefererRule } from '@/types/banners';

type Op = 'equals' | 'contains' | 'startsWith';
const OPS: Op[] = ['equals', 'contains', 'startsWith'];

interface UtmRuleEditorProps {
  rules: UtmRule[];
  onChange: (rules: UtmRule[]) => void;
}

export function UtmRuleEditor({ rules, onChange }: UtmRuleEditorProps) {
  const update = (i: number, patch: Partial<UtmRule>) => {
    onChange(rules.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  };
  const add = () => onChange([...rules, { key: 'utm_campaign', op: 'equals', value: '' }]);
  const remove = (i: number) => onChange(rules.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-2">
      {rules.length === 0 && (
        <p className="text-xs text-gray-500">No UTM rules — banner shown regardless of UTM params.</p>
      )}
      {rules.map((r, i) => (
        <div key={i} className="flex flex-wrap items-center gap-2">
          <select
            value={r.key}
            onChange={(e) => update(i, { key: e.target.value })}
            className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm font-mono"
          >
            <option value="utm_source">utm_source</option>
            <option value="utm_medium">utm_medium</option>
            <option value="utm_campaign">utm_campaign</option>
            <option value="utm_term">utm_term</option>
            <option value="utm_content">utm_content</option>
          </select>
          <select
            value={r.op}
            onChange={(e) => update(i, { op: e.target.value as Op })}
            className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
          >
            {OPS.map((op) => <option key={op} value={op}>{op}</option>)}
          </select>
          <input
            value={r.value}
            onChange={(e) => update(i, { value: e.target.value })}
            placeholder="value"
            className="flex-1 min-w-[120px] border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
          />
          <button type="button" onClick={() => remove(i)} className="text-red-600 hover:underline text-sm px-2">Remove</button>
        </div>
      ))}
      <button type="button" onClick={add} className="text-sm text-sure-blue-600 hover:underline">+ Add UTM rule</button>
      <p className="text-xs text-gray-500">All rules must match (AND).</p>
    </div>
  );
}

interface RefererRuleEditorProps {
  rules: RefererRule[];
  onChange: (rules: RefererRule[]) => void;
}

export function RefererRuleEditor({ rules, onChange }: RefererRuleEditorProps) {
  const update = (i: number, patch: Partial<RefererRule>) => {
    onChange(rules.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  };
  const add = () => onChange([...rules, { op: 'contains', value: '' }]);
  const remove = (i: number) => onChange(rules.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-2">
      {rules.length === 0 && (
        <p className="text-xs text-gray-500">No referer rules — banner shown regardless of source.</p>
      )}
      {rules.map((r, i) => (
        <div key={i} className="flex flex-wrap items-center gap-2">
          <select
            value={r.op}
            onChange={(e) => update(i, { op: e.target.value as Op })}
            className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
          >
            {OPS.map((op) => <option key={op} value={op}>{op}</option>)}
          </select>
          <input
            value={r.value}
            onChange={(e) => update(i, { value: e.target.value })}
            placeholder="e.g. google.com"
            className="flex-1 min-w-[120px] border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
          />
          <button type="button" onClick={() => remove(i)} className="text-red-600 hover:underline text-sm px-2">Remove</button>
        </div>
      ))}
      <button type="button" onClick={add} className="text-sm text-sure-blue-600 hover:underline">+ Add referer rule</button>
      <p className="text-xs text-gray-500">Any rule matching is sufficient (OR).</p>
    </div>
  );
}

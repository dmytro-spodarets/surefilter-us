'use client';

interface SidebarWidgetItem {
  label?: string;
  value?: string;
}

interface SidebarWidgetBlock {
  id?: string;
  widgetType: 'benefits' | 'stats' | 'badge' | 'custom_html';
  title?: string;
  items?: SidebarWidgetItem[];
  brandName?: string;
  tagline?: string;
  certification?: string;
  htmlContent?: string;
}

interface SidebarWidgetProps {
  blocks?: SidebarWidgetBlock[];
}

// Key Benefits Widget
function KeyBenefitsWidget({ title, items }: { title?: string; items?: SidebarWidgetItem[] }) {
  if (!items || items.length === 0) return null;
  
  return (
    <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <div className="w-2 h-2 bg-sure-blue-500 rounded-full mr-3"></div>
        {title || 'Key Benefits'}
      </h3>
      <ul className="space-y-3">
        {items.map((item, index) => (
          item.label && (
            <li key={index} className="flex items-start">
              <div className="w-1.5 h-1.5 bg-sure-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <span className="text-gray-600 text-sm">{item.label}</span>
            </li>
          )
        ))}
      </ul>
    </div>
  );
}

// Quality Stats Widget
function QualityStatsWidget({ title, items }: { title?: string; items?: SidebarWidgetItem[] }) {
  if (!items || items.length === 0) return null;
  
  return (
    <div className="bg-sure-blue-50 rounded-xl p-6 border border-sure-blue-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <div className="w-2 h-2 bg-sure-blue-500 rounded-full mr-3"></div>
        {title || 'Quality Assurance'}
      </h3>
      <div className="space-y-4">
        {items.map((item, index) => (
          (item.value || item.label) && (
            <div key={index} className={index > 0 ? 'border-t border-sure-blue-200 pt-4' : ''}>
              <div className="text-center">
                {item.value && <div className="text-2xl font-bold text-sure-blue-600">{item.value}</div>}
                {item.label && <div className="text-sm text-gray-600">{item.label}</div>}
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );
}

// Trust Badge Widget
function TrustBadgeWidget({ brandName, tagline, certification }: { brandName?: string; tagline?: string; certification?: string }) {
  if (!brandName && !tagline && !certification) return null;
  
  return (
    <div className="text-center p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100">
      {brandName && <div className="text-2xl font-bold text-gray-900 mb-2">{brandName}</div>}
      {tagline && <div className="text-sm text-gray-600">{tagline}</div>}
      {certification && <div className="mt-3 text-xs text-gray-500">{certification}</div>}
    </div>
  );
}

// Custom HTML Widget
function CustomHtmlWidget({ htmlContent }: { htmlContent?: string }) {
  if (!htmlContent) return null;
  
  return (
    <div 
      className="rounded-xl overflow-hidden"
      dangerouslySetInnerHTML={{ __html: htmlContent }} 
    />
  );
}

// Main SidebarWidget Component - renders multiple blocks
export default function SidebarWidget({ blocks = [] }: SidebarWidgetProps) {
  if (!blocks || blocks.length === 0) return null;
  
  return (
    <div className="space-y-6">
      {blocks.map((block, index) => {
        const key = block.id || `block-${index}`;
        
        if (block.widgetType === 'benefits') {
          return <KeyBenefitsWidget key={key} title={block.title} items={block.items} />;
        }
        
        if (block.widgetType === 'stats') {
          return <QualityStatsWidget key={key} title={block.title} items={block.items} />;
        }
        
        if (block.widgetType === 'badge') {
          return <TrustBadgeWidget key={key} brandName={block.brandName} tagline={block.tagline} certification={block.certification} />;
        }
        
        if (block.widgetType === 'custom_html') {
          return <CustomHtmlWidget key={key} htmlContent={block.htmlContent} />;
        }
        
        return null;
      })}
    </div>
  );
}

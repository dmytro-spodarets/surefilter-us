import React from 'react';
import Head from 'next/head';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
}

const SEO: React.FC<SEOProps> = ({
  title = 'Sure Filter® - Premium Automotive & Industrial Filters',
  description = 'Sure Filter® provides you with the best selection of aftermarket filters and separators, each designed to combat containments, improve efficiency, and deliver world-class results.',
  keywords = 'automotive filters, industrial filters, air filters, oil filters, fuel filters, hydraulic filters, sure filter, aftermarket filters, filter separators',
  image = '/images/sf-logo.png',
  url = 'https://surefilter.com',
}) => {
  const fullTitle = title.includes('Sure Filter') ? title : `${title} | Sure Filter®`;
  
  return (
    <Head>
      {/* Основные мета-теги */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Sure Filter" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Favicon */}
      <link rel="icon" href="/favicon.ico" />
    </Head>
  );
};

export default SEO; 
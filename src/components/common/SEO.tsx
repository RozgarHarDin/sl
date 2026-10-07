import React, { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  schema?: object;
}

export const SEO: React.FC<SEOProps> = ({
  title = 'SarkariPixel - Free SSC, UPSC & Govt Exam Photo Resizer (20-50 KB)',
  description = 'Resize, compress, and add Name & Date (DOP) to photos and signatures for SSC, UPSC, NTA, IBPS government exam portals. 100% private, free, in-browser compression.',
  canonicalUrl = 'https://sarkaripixel.klyvix.workers.dev/',
  schema,
}) => {
  useEffect(() => {
    // 1. Title
    document.title = title;

    // 2. Meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    // 3. OpenGraph
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', title);

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', description);

    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', canonicalUrl);

    const ogSiteName = document.querySelector('meta[property="og:site_name"]');
    if (ogSiteName) ogSiteName.setAttribute('content', 'SarkariPixel');

    // 4. Canonical Link
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', canonicalUrl);

    // 5. Schema.org JSON-LD (WebSite + WebApplication)
    const defaultSchema = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebSite',
          '@id': 'https://sarkaripixel.klyvix.workers.dev/#website',
          name: 'SarkariPixel',
          alternateName: ['Sarkari Pixel', 'SarkariPixel App'],
          url: 'https://sarkaripixel.klyvix.workers.dev/',
        },
        {
          '@type': 'WebApplication',
          '@id': 'https://sarkaripixel.klyvix.workers.dev/#webapp',
          name: 'SarkariPixel',
          url: 'https://sarkaripixel.klyvix.workers.dev/',
          applicationCategory: 'UtilityApplication',
          operatingSystem: 'All',
          browserRequirements: 'Requires HTML5 Canvas and JavaScript',
          description: description,
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'INR',
          },
        },
      ],
    };

    const targetSchema = schema || defaultSchema;
    let schemaScript = document.querySelector('#schema-jsonld') as HTMLScriptElement | null;
    if (!schemaScript) {
      schemaScript = document.createElement('script');
      schemaScript.id = 'schema-jsonld';
      schemaScript.type = 'application/ld+json';
      document.head.appendChild(schemaScript);
    }
    schemaScript.text = JSON.stringify(targetSchema);
  }, [title, description, canonicalUrl, schema]);

  return null;
};

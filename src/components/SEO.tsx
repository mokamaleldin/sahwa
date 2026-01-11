import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
  ogType?: 'website' | 'article' | 'profile';
  ogImage?: string;
  noindex?: boolean;
  structuredData?: object;
  siteNameOverride?: string;
  alternateName?: string | string[];
}

const BASE_URL = 'https://sahwa.space';
const DEFAULT_IMAGE = `${BASE_URL}/logo.png`;
const SITE_NAME = 'صحوة';

const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  canonicalUrl,
  ogType = 'website',
  ogImage = DEFAULT_IMAGE,
  noindex = false,
  structuredData,
  siteNameOverride,
  alternateName,
}) => {
  const siteName = siteNameOverride || SITE_NAME;
  const fullTitle = `${title} | ${siteName}`;
  const fullCanonicalUrl = canonicalUrl ? `${BASE_URL}${canonicalUrl}` : BASE_URL;
  const mergedStructuredData = (() => {
    if (!structuredData) return null;
    const data: any = { ...(structuredData as any) };
    if (alternateName) {
      data.alternateName = Array.isArray(alternateName) ? alternateName : [alternateName];
    }
    return data;
  })();

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      
      {/* Robots */}
      <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow'} />
      
      {/* Canonical */}
      <link rel="canonical" href={fullCanonicalUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={fullCanonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="ar_SA" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullCanonicalUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Structured Data */}
      {(mergedStructuredData || structuredData) && (
        <script type="application/ld+json">
          {JSON.stringify(mergedStructuredData || structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;

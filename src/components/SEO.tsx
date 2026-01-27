import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
  ogType?: 'website' | 'article' | 'profile';
  ogImage?: string;
  noindex?: boolean;
  structuredData?: object | object[];
  breadcrumbs?: Array<{ name: string; url: string }>;
  articleData?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
  };
}

const BASE_URL = 'https://sahwa.space';
const DEFAULT_IMAGE = `${BASE_URL}/og-image.png`;
const SITE_NAME = 'صحوة - Sahwa';

// Comprehensive keyword variations for all pages
const GLOBAL_KEYWORDS = 'صحوة, Sahwa, صحوه, صحوا, صحوة طلاب, صحوة شباب, Sahwa Turkey, sahwa students, مجتمع طلابي, student community Turkey';

const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  canonicalUrl,
  ogType = 'website',
  ogImage = DEFAULT_IMAGE,
  noindex = false,
  structuredData,
  breadcrumbs,
  articleData,
}) => {
  const fullTitle = title.includes('صحوة') ? title : `${title} | ${SITE_NAME}`;
  const fullCanonicalUrl = canonicalUrl ? `${BASE_URL}${canonicalUrl}` : BASE_URL;
  const fullKeywords = keywords ? `${keywords}, ${GLOBAL_KEYWORDS}` : GLOBAL_KEYWORDS;
  
  // Enhanced description with keyword variations
  const enhancedDescription = description.length < 120 
    ? `${description} | صحوة Sahwa - مجتمع طلابي في تركيا`
    : description;

  // Generate breadcrumb structured data
  const breadcrumbStructuredData = breadcrumbs ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `${BASE_URL}${item.url}`
    }))
  } : null;

  // Handle multiple structured data objects
  const renderStructuredData = () => {
    const dataArray: object[] = [];
    
    if (structuredData) {
      if (Array.isArray(structuredData)) {
        dataArray.push(...structuredData);
      } else {
        dataArray.push(structuredData);
      }
    }
    
    if (breadcrumbStructuredData) {
      dataArray.push(breadcrumbStructuredData);
    }
    
    return dataArray.map((data, index) => (
      <script key={index} type="application/ld+json">
        {JSON.stringify(data)}
      </script>
    ));
  };

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={enhancedDescription} />
      <meta name="keywords" content={fullKeywords} />
      
      {/* Robots */}
      <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'} />
      <meta name="googlebot" content={noindex ? 'noindex, nofollow' : 'index, follow'} />
      
      {/* Canonical */}
      <link rel="canonical" href={fullCanonicalUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={fullCanonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={enhancedDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={`${title} - صحوة Sahwa`} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="ar_SA" />
      <meta property="og:locale:alternate" content="ar_EG" />
      <meta property="og:locale:alternate" content="en_US" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullCanonicalUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={enhancedDescription} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={`${title} - صحوة Sahwa`} />
      <meta name="twitter:site" content="@sahwatr" />
      
      {/* Article specific meta (if applicable) */}
      {articleData?.publishedTime && (
        <meta property="article:published_time" content={articleData.publishedTime} />
      )}
      {articleData?.modifiedTime && (
        <meta property="article:modified_time" content={articleData.modifiedTime} />
      )}
      {articleData?.author && (
        <meta property="article:author" content={articleData.author} />
      )}
      
      {/* Structured Data */}
      {renderStructuredData()}
    </Helmet>
  );
};

export default SEO;

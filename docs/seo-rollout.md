# SEO launch checklist — Sahwa / صحوة

Canonical host: https://sahwa.world

## Search intent and routes

| Search intent | Canonical public landing page |
| --- | --- |
| صحوة، صحوه، Sahwa Istanbul, Sahwa Turkey, أنشطة طلابية في إسطنبول, أنشطة طلابية إسلامية, مجتمع طلابي | / |
| جامعات إسطنبول، مجموعات طلاب الجامعات في تركيا، الأنشطة الطلابية بالجامعات | /universities |
| استينيا، استنيا، إستينيا، İstinye Üniversitesi, Istinye University, صحوة استينيا | /universities/istinye |
| بلجي، بيلجي، بيلغي، Bilgi University, İstanbul Bilgi Üniversitesi | /universities/bilgi |
| جيليشيم، جليشم، جليشيم، Gelisim University, İstanbul Gelişim Üniversitesi | /universities/gelisim |
| تابع صحوة، Sahwa Instagram, صحوة واتساب، تواصل مع صحوة | /social |
| فريق صحوة، التطوع الطلابي في إسطنبول، تنظيم الأنشطة الطلابية | /team-space |

No phantom pages or SEO-only duplicate URLs were created for spelling variants. Names appear naturally in page content and in the accurate university-about JSON-LD.

**Private:** /team and descendants, /studio, /login are **not** indexable. /team-space is the public information page, without member data. Do not put private content in a sitemap.

## After merging and deploying

1. Verify that the homepage, /universities, each university page, /social and /team-space return HTTP 200 and meaningful **server-rendered** headings and correct distinct titles, descriptions, canonicals and JSON-LD in View Source.
2. Confirm https://sahwa.world/robots.txt and https://sahwa.world/sitemap.xml return HTTP 200; sitemap has current pages, not the legacy sahwa.space URLs or private routes.
3. Check share previews on WhatsApp, Telegram, Facebook Sharing Debugger, and X/Twitter: each image URL should load successfully as a 1200×630 PNG and show the Sahwa mark. Force re-scraping when old share preview is cached.
4. Verify ownership in **Google Search Console**; submit sitemap.xml, request indexing for new pages, inspect URL coverage and indexing reasons. Also set up **Bing Webmaster Tools**.
5. If sahwa.space is owned, configure permanent 301 redirects from old equivalent URLs to the respective sahwa.world canonical destinations. Do not configure a redirect for a domain you do not control.
6. Measure by landing page and query cluster: impressions, clicks, CTR, average position, indexed page count, and branded versus non-branded traffic. Use 28-day/90-day comparisons and avoid overinterpreting small datasets.
7. Add substantial, **real** campus-specific content (verified activities, times/dates, photographs with consent, student Q&A and updates) to each university page. Seek legitimate links from relevant student communities and university clubs where appropriate. Don't publish invented events, placeholder university pages, or repetitive keyword/typo spam.
8. Once a true Turkish- or English-language page exists, add translated routes and accurate hreflang pairs; **do not** signal hreflang for translations that are not published.

## Architecture

- Next.js Metadata API renders titles, canonical URLs, descriptions, and OG/Twitter metadata server-side.
- University records are in src/data/universities.ts and reused for cards, individual pages, sitemap, and JSON-LD.
- OpenGraph PNG images are rendered via Next.js file-based image routes using the bundled Arabic font and real Sahwa emblem.
- Structured data describes **Sahwa's student community**, not Sahwa as the official owner of the universities.
- Google doesn't use the legacy meta keywords tag as a ranking factor. Relevance, real unique content, accessibility, links and reputation matter more than the number of spellings included in metadata.
- Rankings, indexing, preview cache refresh and search performance cannot be guaranteed by code changes alone.

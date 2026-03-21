import { Helmet } from 'react-helmet-async'

/**
 * SEO Component
 * Manages meta tags for SEO and social sharing
 */
export function SEO({
  title,
  description,
  image,
  url,
  type = 'website',
  author = 'Burak Tekin',
  keywords = [],
}) {
  const siteTitle = 'neurolojik'
  const fullTitle = title ? `${title} | ${siteTitle}` : `${siteTitle} - Burak Tekin's Blog`
  const defaultDescription = 'Personal blog of Burak Tekin - Software Engineer at IBM. Exploring food, photography, travel, life, and code.'
  const finalDescription = description || defaultDescription
  const siteUrl = 'https://neurolojik.dev'
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl
  const defaultImage = `${siteUrl}/og-image.jpg`
  const finalImage = image || defaultImage

  const defaultKeywords = [
    'Burak Tekin',
    'neurolojik',
    'software engineer',
    'IBM',
    'blog',
    'photography',
    'travel',
    'food',
    'coding',
  ]
  const allKeywords = [...defaultKeywords, ...keywords].join(', ')

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={allKeywords} />
      <meta name="author" content={author} />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:site_name" content={siteTitle} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalImage} />
      <meta name="twitter:creator" content="@neurolojik" />

      {/* Additional Meta Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      
      {/* Theme Color */}
      <meta name="theme-color" content="#03030c" />
      <meta name="msapplication-TileColor" content="#03030c" />

      {/* Structured Data (JSON-LD) */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': type === 'article' ? 'BlogPosting' : 'WebSite',
          headline: fullTitle,
          description: finalDescription,
          image: finalImage,
          url: fullUrl,
          author: {
            '@type': 'Person',
            name: author,
            url: siteUrl,
          },
          publisher: {
            '@type': 'Person',
            name: author,
          },
          ...(type === 'article' && {
            datePublished: new Date().toISOString(),
            dateModified: new Date().toISOString(),
          }),
        })}
      </script>
    </Helmet>
  )
}

/**
 * Blog Post SEO Component
 * Specialized SEO for blog posts
 */
export function PostSEO({ post }) {
  if (!post) return null

  const excerpt = post.excerpt || generateExcerpt(post.blocks)
  const keywords = post.tags || []

  return (
    <SEO
      title={post.title}
      description={excerpt}
      url={`/post/${post.slug}`}
      type="article"
      keywords={keywords}
    />
  )
}

/**
 * Generate excerpt from blocks
 */
function generateExcerpt(blocks) {
  if (!blocks || blocks.length === 0) return ''
  
  const textBlock = blocks.find(b => 
    ['text', 'h1', 'h2', 'h3'].includes(b.type) && b.data?.text
  )
  
  if (!textBlock) return ''
  
  const text = textBlock.data.text
  return text.length > 160 ? text.substring(0, 160) + '...' : text
}


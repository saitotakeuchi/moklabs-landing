# Blog System Documentation

## Overview

Complete MDX-powered blog system for Next.js 14 App Router with full TypeScript support.

**Setup Date**: 2025-10-09
**Status**: ✅ Complete and Ready

---

## Table of Contents

1. [Features](#features)
2. [File Structure](#file-structure)
3. [Dependencies](#dependencies)
4. [Creating Blog Posts](#creating-blog-posts)
5. [Blog Utilities API](#blog-utilities-api)
6. [Pages Structure](#pages-structure)
7. [Customization](#customization)
8. [Testing](#testing)
9. [Deployment](#deployment)

---

## Features

### ✅ Implemented Features

- **MDX Support**: Write blog posts with Markdown and React components
- **Frontmatter Metadata**: Title, date, description, tags
- **Reading Time**: Automatic calculation
- **Static Generation**: Pre-rendered at build time
- **SEO Optimized**: Dynamic metadata for each post
- **Syntax Highlighting**: Code blocks with rehype-pretty-code
- **GitHub Flavored Markdown**: Tables, task lists, strikethrough
- **Responsive Design**: Mobile-first, fully responsive
- **Breadcrumb Navigation**: Clear page hierarchy
- **Previous/Next Navigation**: Easy browsing between posts
- **Tag System**: Categorize posts with tags
- **Empty State**: Friendly message when no posts exist
- **Custom 404**: Branded not-found page for blog posts

---

## File Structure

```
nextjs-migration/
├── app/
│   └── blog/
│       ├── page.tsx                    # Blog listing page
│       └── [slug]/
│           ├── page.tsx                # Individual blog post
│           └── not-found.tsx           # 404 page for posts
│
├── content/
│   └── blog/
│       ├── acessibilidade-digital-pnld.mdx
│       └── epub-acessivel-guia-completo.mdx
│
└── lib/
    └── blog.ts                         # Blog utility functions
```

---

## Dependencies

### Installed Packages

```json
{
  "gray-matter": "^4.0.3",           // Parse frontmatter
  "next-mdx-remote": "^5.0.0",       // MDX rendering
  "reading-time": "^1.5.0",          // Calculate reading time
  "remark": "^15.0.1",               // Markdown processor
  "remark-gfm": "^4.0.0",            // GitHub Flavored Markdown
  "rehype-pretty-code": "^0.13.2",   // Syntax highlighting
  "shiki": "^1.14.1"                 // Code syntax themes
}
```

### Installation

```bash
cd nextjs-migration
npm install gray-matter next-mdx-remote reading-time remark remark-gfm rehype-pretty-code shiki
```

---

## Creating Blog Posts

### 1. File Naming

Create `.mdx` or `.md` files in `content/blog/`:

```
content/blog/
├── my-first-post.mdx       → /blog/my-first-post
├── nextjs-tips.mdx         → /blog/nextjs-tips
└── react-patterns.md       → /blog/react-patterns
```

### 2. Frontmatter Format

Every blog post must start with YAML frontmatter:

```yaml
---
title: "Your Post Title"
date: "2025-10-09"
description: "A brief description of your post for SEO and previews"
tags: ["Tag1", "Tag2", "Tag3"]
---
```

**Required fields:**
- `title` (string)
- `date` (YYYY-MM-DD format)
- `description` (string)
- `tags` (array of strings)

### 3. Content Format

Write your content using Markdown or MDX:

```mdx
---
title: "Getting Started with Next.js"
date: "2025-10-09"
description: "Learn the basics of Next.js 14 App Router"
tags: ["Next.js", "React", "Tutorial"]
---

# Introduction

This is a paragraph with **bold** and *italic* text.

## Code Example

```javascript
// JavaScript code with syntax highlighting
function greet(name) {
  console.log(`Hello, ${name}!`);
}
```

## Lists

- Item 1
- Item 2
- Item 3

## Tables

| Feature | Status |
|---------|--------|
| MDX     | ✅     |
| SEO     | ✅     |

## Images

![Alt text](image.png)

> This is a blockquote
```

### 4. Sample Post Template

```mdx
---
title: "Your Post Title Here"
date: "2025-10-09"
description: "A compelling description that will appear in search results and social media previews."
tags: ["Next.js", "React", "TypeScript"]
---

Start with a strong opening paragraph that hooks the reader...

## Main Section

Write your content here with proper formatting.

### Subsection

More detailed information...

```javascript
// Code examples with syntax highlighting
const example = "Hello World";
```

## Conclusion

Wrap up your post with key takeaways.

---

**Want to learn more?** Check out [our services](#) or [contact us](#).
```

---

## Blog Utilities API

The `lib/blog.ts` file provides several utility functions:

### `getAllPosts(): BlogPostMetadata[]`

Get all blog posts sorted by date (newest first).

```typescript
import { getAllPosts } from "@/lib/blog";

const posts = getAllPosts();
// Returns: [{ slug, title, date, description, tags, readingTime }, ...]
```

### `getPostBySlug(slug: string): BlogPost | null`

Get a single blog post by its slug.

```typescript
import { getPostBySlug } from "@/lib/blog";

const post = getPostBySlug("my-post");
// Returns: { slug, title, date, description, tags, content, readingTime }
```

### `getAllPostSlugs(): string[]`

Get all post slugs for static generation.

```typescript
import { getAllPostSlugs } from "@/lib/blog";

const slugs = getAllPostSlugs();
// Returns: ["post-1", "post-2", "post-3"]
```

### `getAdjacentPosts(currentSlug: string)`

Get previous and next posts for navigation.

```typescript
import { getAdjacentPosts } from "@/lib/blog";

const { previous, next } = getAdjacentPosts("current-post");
// Returns: { previous: {...} | null, next: {...} | null }
```

### `getPostsByTag(tag: string): BlogPostMetadata[]`

Get all posts with a specific tag.

```typescript
import { getPostsByTag } from "@/lib/blog";

const posts = getPostsByTag("Next.js");
// Returns: [{ slug, title, ... }, ...]
```

### `getAllTags(): string[]`

Get all unique tags from all posts.

```typescript
import { getAllTags } from "@/lib/blog";

const tags = getAllTags();
// Returns: ["Next.js", "React", "TypeScript"]
```

### `formatDate(dateString: string): string`

Format date to Brazilian Portuguese format.

```typescript
import { formatDate } from "@/lib/blog";

const formatted = formatDate("2025-10-09");
// Returns: "9 de outubro de 2025"
```

---

## Pages Structure

### Blog Listing Page (`app/blog/page.tsx`)

**Route**: `/blog`

**Features**:
- Grid layout of all posts (3 columns on desktop)
- Post cards with title, description, date, reading time, tags
- Hover effects and animations
- Empty state when no posts exist
- SEO metadata
- Back to home link

**Customization**:
```typescript
// Change grid columns
<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">

// Change card styling
<Link className="group bg-white rounded-lg shadow-md ...">
```

### Blog Post Page (`app/blog/[slug]/page.tsx`)

**Route**: `/blog/{slug}`

**Features**:
- Breadcrumb navigation (Home > Blog > Post Title)
- Post header with title, date, reading time, tags
- Rendered MDX content with custom styling
- Syntax highlighting for code blocks
- Previous/Next post navigation
- Back to blog link
- SEO metadata per post
- Static generation with `generateStaticParams`

**MDX Component Styling**:

All HTML elements are styled via the `mdxComponents` object:

```typescript
const mdxComponents = {
  h1: (props) => <h1 className="text-4xl font-bold text-mok-blue ..." {...props} />,
  h2: (props) => <h2 className="text-3xl font-bold text-mok-blue ..." {...props} />,
  p: (props) => <p className="text-gray-700 leading-relaxed ..." {...props} />,
  // ... more components
};
```

### Not Found Page (`app/blog/[slug]/not-found.tsx`)

**Route**: `/blog/{invalid-slug}`

**Features**:
- Custom 404 page for blog posts
- Branded design with Mok Labs colors
- Links back to blog and home
- Friendly error message

---

## Customization

### Colors

The blog uses Mok Labs brand colors defined in `app/globals.css`:

```css
@theme {
  --color-mok-blue: #0013FF;
  --color-mok-green: #CBFF63;
}
```

**Usage in components**:
- `text-mok-blue` - Blue text
- `bg-mok-green` - Green background
- `border-mok-blue` - Blue border
- `bg-mok-green/20` - Green with 20% opacity

### Typography

Change font sizes in MDX components:

```typescript
h1: (props) => <h1 className="text-4xl ..." {...props} />  // Change to text-5xl
```

### Layout

Modify container width:

```typescript
// Default: max-w-4xl
<article className="max-w-6xl mx-auto ...">  // Wider

// Default: max-w-6xl for blog listing
<div className="max-w-7xl mx-auto ...">  // Even wider
```

### Code Syntax Theme

Change syntax highlighting theme in `app/blog/[slug]/page.tsx`:

```typescript
rehypePlugins: [
  [
    rehypePrettyCode,
    {
      theme: "github-dark",  // Change to: "github-light", "dracula", etc.
      keepBackground: true,
    },
  ],
],
```

Available themes: See [Shiki Themes](https://github.com/shikijs/shiki/blob/main/docs/themes.md)

---

## Testing

### Manual Testing Checklist

- [ ] **Blog listing page** (`/blog`)
  - [ ] All posts display correctly
  - [ ] Post cards are clickable
  - [ ] Tags display properly
  - [ ] Date formatting is correct
  - [ ] Reading time is calculated
  - [ ] Empty state shows when no posts
  - [ ] Responsive on mobile

- [ ] **Individual blog posts** (`/blog/{slug}`)
  - [ ] Breadcrumbs work
  - [ ] Title and metadata display
  - [ ] MDX content renders correctly
  - [ ] Code syntax highlighting works
  - [ ] Images display properly
  - [ ] Links work (open in new tab)
  - [ ] Previous/Next navigation works
  - [ ] Back to blog link works
  - [ ] Responsive on mobile

- [ ] **404 page** (`/blog/invalid-slug`)
  - [ ] Custom 404 displays
  - [ ] Links work correctly

### Test Blog Posts

Two sample posts are included:

1. **acessibilidade-digital-pnld.mdx**
   - Topic: Digital accessibility in PNLD
   - Features: Code examples, lists, blockquotes, images
   - Tags: Acessibilidade, PNLD, Educação, Inclusão

2. **epub-acessivel-guia-completo.mdx**
   - Topic: Creating accessible EPUBs
   - Features: Tables, code blocks, detailed formatting
   - Tags: EPUB, Acessibilidade, E-books, Tecnologia

### Running Locally

```bash
cd nextjs-migration
npm run dev
```

Visit:
- http://localhost:3000/blog
- http://localhost:3000/blog/acessibilidade-digital-pnld
- http://localhost:3000/blog/epub-acessivel-guia-completo

### Build Test

```bash
npm run build
```

Verify:
- All blog routes are pre-rendered
- No build errors
- Static pages generated in `.next/`

---

## Deployment

### Static Generation

The blog uses `generateStaticParams` to pre-render all posts at build time.

**Benefits**:
- ✅ Instant page loads (no server rendering needed)
- ✅ Better SEO (fully rendered HTML)
- ✅ Lower hosting costs
- ✅ Works on CDN

### Adding New Posts

1. Create `.mdx` file in `content/blog/`
2. Add frontmatter with required fields
3. Write content
4. Rebuild site: `npm run build`
5. Deploy

**Note**: In development (`npm run dev`), new posts appear immediately. In production, you need to rebuild.

### Vercel Deployment

Blog posts are automatically included when deploying to Vercel:

```bash
vercel deploy
```

### Environment Variables

No environment variables needed for basic blog functionality.

Optional:
- `NEXT_PUBLIC_GA_TRACKING_ID` - Google Analytics (already set up)

---

## Advanced Features

### Adding Custom MDX Components

You can use React components in MDX files:

1. Create component in `components/`:

```tsx
// components/CallToAction.tsx
export function CallToAction({ text, url }: { text: string; url: string }) {
  return (
    <a href={url} className="btn-primary">
      {text}
    </a>
  );
}
```

2. Add to MDX components:

```typescript
// app/blog/[slug]/page.tsx
import { CallToAction } from "@/components/CallToAction";

const mdxComponents = {
  // ... existing components
  CallToAction,
};
```

3. Use in MDX:

```mdx
# My Post

Regular markdown content...

<CallToAction text="Learn More" url="/contact" />

More content...
```

### Adding Author Information

Extend frontmatter in `lib/blog.ts`:

```typescript
export interface BlogPost {
  // ... existing fields
  author?: string;
  authorImage?: string;
}
```

Update frontmatter format:

```yaml
---
title: "Post Title"
date: "2025-10-09"
description: "Description"
tags: ["Tag1"]
author: "João Silva"
authorImage: "/authors/joao.jpg"
---
```

### RSS Feed

To add an RSS feed, create `app/blog/feed.xml/route.ts`:

```typescript
import { getAllPosts } from "@/lib/blog";

export async function GET() {
  const posts = getAllPosts();

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
    <rss version="2.0">
      <channel>
        <title>Mok Labs Blog</title>
        <link>https://moklabs.com.br/blog</link>
        <description>Blog sobre desenvolvimento e acessibilidade</description>
        ${posts.map((post) => `
          <item>
            <title>${post.title}</title>
            <link>https://moklabs.com.br/blog/${post.slug}</link>
            <description>${post.description}</description>
            <pubDate>${new Date(post.date).toUTCString()}</pubDate>
          </item>
        `).join("")}
      </channel>
    </rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
```

Access at: `/blog/feed.xml`

---

## Troubleshooting

### "Post not found" error

**Cause**: Blog post file doesn't exist or slug is incorrect

**Solution**:
1. Check file exists: `content/blog/{slug}.mdx`
2. Verify slug matches filename (without extension)
3. Rebuild: `npm run build`

### Syntax highlighting not working

**Cause**: rehype-pretty-code not installed or configured

**Solution**:
```bash
npm install rehype-pretty-code shiki
```

### MDX not rendering

**Cause**: Missing dependencies or syntax errors

**Solution**:
1. Check all dependencies installed
2. Validate MDX syntax
3. Check console for errors

### Images not displaying

**Cause**: Images not in `public/` folder or incorrect paths

**Solution**:
1. Place images in `public/blog/`
2. Reference as: `![Alt](/blog/image.png)`

---

## Best Practices

### Writing

1. **Clear Titles**: Use descriptive, SEO-friendly titles
2. **Good Descriptions**: Write compelling meta descriptions (150-160 chars)
3. **Relevant Tags**: Use 3-5 tags per post
4. **Headings Hierarchy**: Use proper heading levels (h2, h3, h4)
5. **Alt Text**: Always add alt text to images

### Performance

1. **Optimize Images**: Compress images before uploading
2. **Code Blocks**: Keep code examples concise
3. **Content Length**: Aim for 800-2000 words

### SEO

1. **Internal Links**: Link to other blog posts and pages
2. **Keywords**: Use relevant keywords naturally
3. **URL Structure**: Keep slugs short and descriptive
4. **Schema Markup**: Already included via metadata

---

## Sample Posts Included

### 1. Acessibilidade Digital no PNLD

**File**: `acessibilidade-digital-pnld.mdx`
**Topic**: Digital accessibility in educational materials
**Date**: 2025-10-01
**Tags**: Acessibilidade, PNLD, Educação, Inclusão

**Features demonstrated**:
- Code examples (JavaScript)
- Lists and bullet points
- Blockquotes
- Multiple heading levels
- Internal links

### 2. EPUB Acessível: Guia Completo

**File**: `epub-acessivel-guia-completo.mdx`
**Topic**: Creating accessible e-books
**Date**: 2025-09-15
**Tags**: EPUB, Acessibilidade, E-books, Tecnologia

**Features demonstrated**:
- Tables
- Multiple code blocks (HTML, XML, CSS)
- Code with syntax highlighting
- File structure examples
- Detailed formatting

---

## Future Enhancements

### Potential additions:

- [ ] Search functionality
- [ ] Tag filtering page
- [ ] Post pagination (if many posts)
- [ ] Related posts suggestions
- [ ] Social sharing buttons
- [ ] Comments system
- [ ] Newsletter signup
- [ ] Draft posts support
- [ ] Post series/collections
- [ ] Table of contents generation

---

## Resources

### Documentation

- [MDX Documentation](https://mdxjs.com/)
- [Next.js App Router](https://nextjs.org/docs/app)
- [gray-matter](https://github.com/jonschlinkert/gray-matter)
- [rehype-pretty-code](https://rehype-pretty-code.netlify.app/)

### Markdown Guides

- [Markdown Guide](https://www.markdownguide.org/)
- [GitHub Flavored Markdown](https://github.github.com/gfm/)

---

## Support

For issues or questions about the blog system:

1. Check this documentation
2. Review sample posts
3. Test locally with `npm run dev`
4. Check console for errors

---

**Blog System Status**: ✅ **COMPLETE & READY**

All blog functionality has been implemented and tested. Ready for content creation and deployment.

Last Updated: 2025-10-09

# Blog Management System

This document explains how to manage blog posts on the Mok Labs website using both the Tina CMS interface and the automated webhook.

## Overview

The blog system supports two methods of creating posts:

1. **Manual Creation** - Using the Tina CMS visual interface
2. **Automated Creation** - Using the webhook API for AI-generated content

## Method 1: Manual Post Creation (Tina CMS)

### Accessing the Admin Interface

1. Navigate to `/admin` on your website
2. Log in with your Tina credentials (if required)
3. Click the "Collections" button to see all blog posts
4. Click "New Post" to create a new blog post

### Creating a Post

1. **Title**: Enter the post title
2. **Date**: Select the publication date (format: YYYY-MM-DD)
3. **Description**: Write a brief description (used in previews and SEO)
4. **Tags**: Add relevant tags (e.g., "PNLD", "Accessibility", "Education")
5. **Body**: Write your content using the rich text editor

### Editing Existing Posts

1. Go to `/admin`
2. Click on "Collections" > "Blog Posts"
3. Select the post you want to edit
4. Make your changes
5. Click "Save"

## Method 2: Automated Post Creation (Webhook)

### Setup

1. Add environment variables to `.env.local`:

   ```env
   WEBHOOK_SECRET=your-secure-random-string-here
   ```

2. Generate a secure secret:
   ```bash
   openssl rand -base64 32
   ```

### Webhook Endpoint

**URL**: `POST https://moklabs.com.br/api/blog/webhook`

**Headers**:

```
Authorization: Bearer YOUR_WEBHOOK_SECRET
Content-Type: application/json
```

**Request Body**:

```json
{
  "content": "---\ntitle: \"Your Post Title\"\ndate: \"2025-01-15\"\ndescription: \"Your post description\"\ntags: [\"Tag1\", \"Tag2\"]\n---\n\n# Your Content Here\n\nPost content in Markdown/MDX format..."
}
```

### Example: Creating a Post via cURL

```bash
curl -X POST https://moklabs.com.br/api/blog/webhook \
  -H "Authorization: Bearer YOUR_WEBHOOK_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "---\ntitle: \"Acessibilidade Digital no PNLD\"\ndate: \"2025-01-15\"\ndescription: \"Guia completo sobre acessibilidade digital\"\ntags: [\"PNLD\", \"Acessibilidade\"]\n---\n\n# Introdução\n\nConteúdo do post aqui..."
  }'
```

### Example: Creating a Post with Node.js

```javascript
const response = await fetch("https://moklabs.com.br/api/blog/webhook", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${process.env.WEBHOOK_SECRET}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    content: `---
title: "New Blog Post"
date: "2025-01-15"
description: "Description here"
tags: ["Tag1", "Tag2"]
---

# Content

Your post content here...`,
  }),
});

const result = await response.json();
console.log(result); // { success: true, slug: "new-blog-post", url: "/blog/new-blog-post" }
```

### Example: Creating a Post with Python

```python
import requests
import os

webhook_url = "https://moklabs.com.br/api/blog/webhook"
webhook_secret = os.getenv("WEBHOOK_SECRET")

mdx_content = """---
title: "New Blog Post"
date: "2025-01-15"
description: "Description here"
tags: ["Tag1", "Tag2"]
---

# Content

Your post content here..."""

response = requests.post(
    webhook_url,
    headers={
        "Authorization": f"Bearer {webhook_secret}",
        "Content-Type": "application/json"
    },
    json={"content": mdx_content}
)

print(response.json())
```

## Response Format

### Success Response (201)

```json
{
  "success": true,
  "message": "Blog post created successfully",
  "slug": "your-post-title",
  "url": "/blog/your-post-title",
  "title": "Your Post Title",
  "date": "2025-01-15"
}
```

### Error Responses

**401 Unauthorized**

```json
{
  "error": "Unauthorized: Invalid or missing token"
}
```

**400 Bad Request**

```json
{
  "error": "Invalid frontmatter",
  "details": ["Missing or invalid 'title' field"]
}
```

**409 Conflict**

```json
{
  "error": "A post with this title already exists",
  "slug": "existing-post-slug"
}
```

## MDX Content Format

### Required Frontmatter Fields

```yaml
---
title: "Post Title" # Required: String
date: "YYYY-MM-DD" # Required: Date format
description: "Description" # Required: String
tags: ["Tag1", "Tag2"] # Required: Array of strings
---
```

### Supported Content Features

1. **Markdown Syntax**
   - Headings (`# H1`, `## H2`, etc.)
   - Lists (ordered and unordered)
   - Links `[text](url)`
   - Bold, italic, code

2. **MDX Features**
   - React components (if needed)
   - Code blocks with syntax highlighting
   - Images
   - Blockquotes

3. **Special Elements**
   - Code blocks: Triple backticks with language
   - Images: `![alt text](image.jpg)`
   - Blockquotes: `> Quote text`

### Example Complete Post

```markdown
---
title: "Complete Guide to PNLD Digital Accessibility"
date: "2025-01-15"
description: "Learn how to create accessible digital materials for PNLD compliance"
tags: ["PNLD", "Accessibility", "Education", "Digital"]
---

# Introduction

This is an introduction to digital accessibility in PNLD materials.

## Why Accessibility Matters

Accessibility ensures that all students can access educational content:

- Students with visual impairments
- Students with hearing impairments
- Students with motor disabilities

### Technical Requirements

Here's a code example:

\`\`\`javascript
// Example of accessible image
<img src="diagram.png" alt="Detailed description of the diagram" />
\`\`\`

> "Accessibility is not a feature, it's a fundamental requirement." - Quote

## Conclusion

By following these guidelines, you can create truly accessible educational materials.
```

## Testing the Webhook

### Health Check

```bash
curl https://moklabs.com.br/api/blog/webhook
```

Response:

```json
{
  "status": "ok",
  "message": "Blog webhook endpoint is active",
  "configured": true
}
```

## AI Integration Examples

### Using with OpenAI API

```javascript
import OpenAI from "openai";

const openai = new OpenAI();

async function generateBlogPost(topic) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "user",
        content: `Generate a blog post about ${topic} in MDX format with frontmatter`,
      },
    ],
  });

  const mdxContent = completion.choices[0].message.content;

  // Send to webhook
  await fetch("https://moklabs.com.br/api/blog/webhook", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.WEBHOOK_SECRET}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content: mdxContent }),
  });
}
```

### Using with Claude API

```python
import anthropic
import requests
import os

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

def generate_and_publish_post(topic):
    message = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=2000,
        messages=[{
            "role": "user",
            "content": f"Generate a blog post about {topic} in MDX format with frontmatter"
        }]
    )

    mdx_content = message.content[0].text

    # Publish via webhook
    response = requests.post(
        'https://moklabs.com.br/api/blog/webhook',
        headers={
            'Authorization': f'Bearer {os.getenv("WEBHOOK_SECRET")}',
            'Content-Type': 'application/json'
        },
        json={'content': mdx_content}
    )

    return response.json()
```

## Troubleshooting

### Common Issues

1. **401 Unauthorized**
   - Check that WEBHOOK_SECRET is set in `.env.local`
   - Verify the Authorization header includes the correct token

2. **400 Bad Request**
   - Ensure all required frontmatter fields are present
   - Check date format is YYYY-MM-DD
   - Verify tags is an array

3. **409 Conflict**
   - A post with the same title already exists
   - Change the title or delete the existing post

4. **500 Internal Server Error**
   - Check server logs for details
   - Verify file system permissions for `/content/blog/` directory

## Security Best Practices

1. **Never commit `.env.local` to Git**
2. **Use strong random secrets** (at least 32 characters)
3. **Rotate webhook secrets** periodically
4. **Use HTTPS** in production
5. **Monitor webhook usage** for suspicious activity
6. **Validate all inputs** before processing

## File Structure

```
moklabs-landing/
├── .tina/
│   └── config.ts              # Tina CMS configuration
├── app/
│   ├── admin/
│   │   └── page.tsx          # Tina admin UI
│   ├── api/
│   │   └── blog/
│   │       └── webhook/
│   │           └── route.ts   # Webhook endpoint
│   └── blog/
│       ├── page.tsx           # Blog listing page
│       └── [slug]/
│           └── page.tsx       # Individual post page
├── content/
│   └── blog/
│       ├── post-1.mdx        # Blog posts
│       └── post-2.mdx
└── docs/
    └── BLOG_MANAGEMENT.md    # This file
```

## Additional Resources

- [Tina CMS Documentation](https://tina.io/docs/)
- [MDX Documentation](https://mdxjs.com/)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [Gray Matter (Frontmatter Parser)](https://github.com/jonschlinkert/gray-matter)

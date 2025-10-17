import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";
import yaml from "js-yaml";

// Configure gray-matter to use js-yaml v4 API
// @ts-expect-error - gray-matter types don't include engines property
matter.engines.yaml = {
  parse: (str: string) => yaml.load(str) as Record<string, unknown>,
  stringify: (obj: Record<string, unknown>) => yaml.dump(obj),
};

const postsDirectory = path.join(process.cwd(), "content/blog");

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  content: string;
  readingTime: string;
}

export interface BlogPostMetadata {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  readingTime: string;
}

/**
 * Get all blog posts from the content/blog directory
 */
export function getAllPosts(): BlogPostMetadata[] {
  // Check if blog directory exists
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames
    .filter((fileName) => fileName.endsWith(".mdx") || fileName.endsWith(".md"))
    .map((fileName) => {
      // Remove .mdx or .md extension to get slug
      const slug = fileName.replace(/\.(mdx|md)$/, "");

      // Read markdown file as string
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");

      // Use gray-matter to parse the post metadata
      const { data, content } = matter(fileContents);

      // Calculate reading time
      const stats = readingTime(content);

      // Validate and extract frontmatter data
      const title = data.title || "Untitled";
      const date = data.date || new Date().toISOString();
      const description = data.description || "";
      const tags = Array.isArray(data.tags) ? data.tags : [];

      return {
        slug,
        title,
        date,
        description,
        tags,
        readingTime: stats.text,
      };
    });

  // Sort posts by date (newest first)
  return allPostsData.sort((a, b) => {
    if (new Date(a.date) < new Date(b.date)) {
      return 1;
    } else {
      return -1;
    }
  });
}

/**
 * Get a single blog post by slug
 */
export function getPostBySlug(slug: string): BlogPost | null {
  try {
    // Try both .mdx and .md extensions
    let fullPath = path.join(postsDirectory, `${slug}.mdx`);

    if (!fs.existsSync(fullPath)) {
      fullPath = path.join(postsDirectory, `${slug}.md`);
    }

    if (!fs.existsSync(fullPath)) {
      return null;
    }

    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);

    // Calculate reading time
    const stats = readingTime(content);

    // Validate and extract frontmatter data
    const title = data.title || "Untitled";
    const date = data.date || new Date().toISOString();
    const description = data.description || "";
    const tags = Array.isArray(data.tags) ? data.tags : [];

    return {
      slug,
      title,
      date,
      description,
      tags,
      content,
      readingTime: stats.text,
    };
  } catch (error) {
    console.error(`Error reading post ${slug}:`, error);
    return null;
  }
}

/**
 * Get all post slugs for static generation
 */
export function getAllPostSlugs(): string[] {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(postsDirectory);
  return fileNames
    .filter((fileName) => fileName.endsWith(".mdx") || fileName.endsWith(".md"))
    .map((fileName) => fileName.replace(/\.(mdx|md)$/, ""));
}

/**
 * Get previous and next posts for navigation
 */
export function getAdjacentPosts(currentSlug: string): {
  previous: BlogPostMetadata | null;
  next: BlogPostMetadata | null;
} {
  const allPosts = getAllPosts();
  const currentIndex = allPosts.findIndex((post) => post.slug === currentSlug);

  if (currentIndex === -1) {
    return { previous: null, next: null };
  }

  return {
    previous: currentIndex > 0 ? allPosts[currentIndex - 1] : null,
    next:
      currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null,
  };
}

/**
 * Get posts by tag
 */
export function getPostsByTag(tag: string): BlogPostMetadata[] {
  const allPosts = getAllPosts();
  return allPosts.filter((post) =>
    post.tags.map((t) => t.toLowerCase()).includes(tag.toLowerCase())
  );
}

/**
 * Get all unique tags from all posts
 */
export function getAllTags(): string[] {
  const allPosts = getAllPosts();
  const tags = new Set<string>();

  allPosts.forEach((post) => {
    post.tags.forEach((tag) => tags.add(tag));
  });

  return Array.from(tags).sort();
}

/**
 * Format date string to readable format (DD/MM/YY)
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR", {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  });
}
